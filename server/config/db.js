const mongoose = require("mongoose");

let backupConnection;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Primary MongoDB connected");
  } catch (error) {
    console.error("Primary MongoDB failed:", error);
  }

  try {
    backupConnection = await mongoose.createConnection(process.env.BACKUP_URI);
    console.log("Backup MongoDB connected");
  } catch (error) {
    console.error("Backup MongoDB failed:", error);
  }
};

module.exports = {
  connectDB,
  getPrimaryDB: () => mongoose.connection,
  getBackupDB: () => backupConnection
};