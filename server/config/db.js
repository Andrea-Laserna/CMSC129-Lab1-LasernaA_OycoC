const mongoose = require("mongoose");

let backupConnection;          // Holds the separate connection to the backup MongoDB
let isPrimaryActive = false;   // Tracks whether the primary DB is currently healthy
let isFailbackSyncing = false;  // Prevents overlapping failback sync runs
const HEALTH_CHECK_MS = Number(process.env.DB_HEALTH_CHECK_MS || 1000); // Check every 1s for near-immediate failback

const connectPrimary = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 1500, // Fail fast so retries can happen quickly
  }); // Connect/reconnect to the primary DB
};

const isPrimaryReachable = async () => {
  try {
    if (mongoose.connection.readyState !== 1) return false; // Must be connected first
    await mongoose.connection.db.admin().ping();            // Verify DB responds
    return true;
  } catch {
    return false;
  }
};

const connectDB = async () => {
  try {
    await connectPrimary();                          // Attempt to connect to the primary DB
    isPrimaryActive = true;                          // Mark primary as healthy on success
    console.log("Primary MongoDB connected");
  } catch (error) {
    isPrimaryActive = false;                         // Primary failed; backup will serve as active
    console.error("Primary MongoDB failed:", error.message);
    console.log("Starting in backup-active mode");
  }

  try {
    // Create an independent connection to the backup DB (separate from the default mongoose connection)
    backupConnection = await mongoose.createConnection(process.env.BACKUP_URI).asPromise();
    console.log("Backup MongoDB connected");
  } catch (error) {
    console.error("Backup MongoDB failed:", error.message);
  }

  // Reconcile on startup: if primary is online and backup exists, restore any missing failover writes
  if (isPrimaryActive && backupConnection) {
    try {
      console.log("Startup reconciliation: syncing backup data to primary...");
      await syncBackupToPrimary();
      console.log("Startup reconciliation complete.");
    } catch (error) {
      console.error("Startup reconciliation failed:", error.message);
    }
  }

  startHealthCheck(); // Begin periodic monitoring of the primary DB
};

// On failback: copy all backup documents into primary (upsert to avoid data loss)
const syncBackupToPrimary = async () => {
  if (!backupConnection) throw new Error("Backup connection is not available"); // Nothing to sync if backup was never connected

  const docs = await backupConnection.collection("pets").find({}).toArray(); // Fetch all records from backup
  const primaryColl = mongoose.connection.collection("pets");                // Reference to the primary collection
  const backupIds = docs.map((doc) => doc._id);                               // Track all IDs that currently exist in backup

  for (const doc of docs) {
    // Upsert each document: insert if missing, replace if exists — preserves writes made during failover
    await primaryColl.replaceOne({ _id: doc._id }, doc, { upsert: true });
  }

  // Remove records from primary that no longer exist in backup (captures hard deletes during failover)
  await primaryColl.deleteMany({ _id: { $nin: backupIds } });
  console.log(`Failback sync complete: ${docs.length} records restored to primary`);
};

// Try to restore primary immediately when it becomes reachable, then switch traffic back
const tryImmediateFailback = async () => {
  if (isPrimaryActive || isFailbackSyncing) return false;

  isFailbackSyncing = true;
  try {
    let reachableNow = await isPrimaryReachable();

    if (!reachableNow) {
      try {
        if (mongoose.connection.readyState !== 0) {
          await mongoose.disconnect(); // Clear stale connection before reconnect
        }
        await connectPrimary();
      } catch {
        return false;
      }
      reachableNow = await isPrimaryReachable();
      if (!reachableNow) return false;
    }

    console.log("Primary DB recovered. Syncing backup data to primary...");
    await syncBackupToPrimary();

    const reachableAfterSync = await isPrimaryReachable();
    if (!reachableAfterSync) return false;

    isPrimaryActive = true;
    console.log("Failback complete. Primary is now active.");
    return true;
  } catch (error) {
    console.error("Failback sync failed, staying on backup:", error.message);
    return false;
  } finally {
    isFailbackSyncing = false;
  }
};

const startHealthCheck = () => {
  // Poll the primary DB connection state frequently for near-immediate failover/failback
  setInterval(async () => {
    const reachableNow = await isPrimaryReachable(); // True only when primary answers ping

    if (isPrimaryActive && !reachableNow) {
      // Primary was active and just became unreachable
      isPrimaryActive = false;
      console.log("Primary DB unavailable. Backup is now active.");
      return;
    }

    if (!isPrimaryActive) {
      await tryImmediateFailback(); // Keep retrying until primary is restored and synced
    }
  }, HEALTH_CHECK_MS);
};

module.exports = {
  connectDB,
  tryImmediateFailback,
  isPrimaryAlive: () => isPrimaryActive,    // Used by petController to decide which DB to query
  getPrimaryDB: () => mongoose.connection,  // Returns the default mongoose connection (primary)
  getBackupDB: () => backupConnection,      // Returns the backup connection
};