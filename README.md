# CMSC129-Lab1-LasernaA_OycoC
Pet Health Passport: An app for pet owners and vets to track a pet's health records, including vaccinations, medical history, and medication schedules. This involves managing relational data between pets, owners, and veterinary professionals.

Minimum Requirements

To get the passing score in the Features rubrics, your application must implement the following CRUD operations:

    Create: Add new records to the database
    Read: Display/retrieve records from the database
    Update: Modify existing records
    Delete: Remove records from the database (could be soft or hard delete)

Non-Functional Requirements:

    API Keys Visibility: Your API Keys should not be exposed in the frontend code or GitHub. Use environment variables or backend proxy to secure them. You can use "secret manager" packages like dotenv for Node.js applications. Whichever method you use, make sure that your API keys are not visible in the browser's developer tools, nor in your GitHub repository.
    Readme.md: A comprehensive README file with installation instructions, usage guide, and documentation of your API endpoints. This should be seen in your GitHub repository.
    UX/UI: Since you're done with CMSC134, I will hold your UX/UI design to a higher standard. (Will only affect your Design Rubrics score)

NOTE: Testing or written tests is not required for this lab. But it can help you ensure that your application works as expected before the demo.
Expanded Requirements

To get the perfect score in the Features Rubrics, your application must have the following:

    Soft Delete: data is still in the database (can still be restored)
    Hard Delete: data is purged/permanently deleted from the database
    Database Redundancy: data should be backed up on a secondary database; during the demo, we disable your primary database and then we'll check if it retrieves data from your backup database.

        Example:

        Primary database -> normal read/write

        Backup database -> copy of data, used for recovery

        In MERN, this usually means:

        MongoDB Atlas cluster#1 -> Primary

        MongoDB Atlas cluster#2 -> Backup

        Then your Node/Express backend connects to both, writes/updates to primary, and syncs to backup (either during every CRUD operation or timed)

        You can also try MongoDB (Primary) + Firebase (Backup) to learn the best practices in DB redundancy but this is not required

# Pet Health Record App - MERN Stack

## Tech Stack
- **M**ongoDB - Database
- **E**xpress - Backend framework
- **R**eact - Frontend framework
- **N**ode.js - Runtime environment

## Project Flow

### Create Pet (POST /api/pets)
```
1. User fills out AddPet form in React
2. Form submits via axios to http://localhost:5000/api/pets
3. Express Router receives POST request → directs to /pets endpoint
4. Middleware (petController) processes the request:
   - Extracts form data from req.body
   - Validates all required fields
   - Creates new Pet document
   - Saves to MongoDB
5. Response sent back to React with success/error message
6. Form clears on successful creation
```

### Request → Response Flow
```
React (Client) 
  ↓ sends POST request with pet data
Express Router (/api/pets endpoint)
  ↓ directs to middleware
petController (Middleware)
  ↓ validates & processes
MongoDB (Database)
  ↓ saves pet record
Response sent back to React
  ↓ displays success/error message
```

## Getting Started

### Backend Setup
```bash
cd server
npm install
npm start  # Runs on http://localhost:5000
```

### Frontend Setup
```bash
cd client
npm install
npm run dev  # Runs on http://localhost:5173
```

### Environment Variables
Create a `.env` file in the `server/` directory:
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

---

## Detailed Implementation Guide

### Step 1: Project Setup

#### 1.1 Clone and Navigate
```sh
cd CMSC129-Lab1-LasernaA_OycoC
```

#### 1.2 Install Dependencies

**Backend:**
```sh
cd server
npm install
```

**Frontend:**
```sh
cd client
npm install
npm install axios  # Ensure axios is installed for API calls
```

### Step 2: Database Configuration

#### 2.1 MongoDB Setup
1. The `server/.env` file contains your MongoDB connection string
2. Ensure your MongoDB Atlas cluster is running and accessible
3. The connection is established through the `connectDB` function in `server/config/db.js`
4. Whitelist your IP address in MongoDB Atlas network access settings

### Step 3: Backend Implementation Flow

#### 3.1 Database Connection (`server/config/db.js`)
- Establishes MongoDB connection using Mongoose
- Exports `connectDB()` function that's called in `server/server.js`
- Handles connection errors and success messages

#### 3.2 Data Model (`server/models/Pet.js`)
Defines the Pet schema with the following fields:
- `name` (String, required)
- `species` (String, required)
- `breed` (String, required)
- `age` (Number, required)
- `weight` (Number, required)
- `dateOfBirth` (Date, required)
- `notes` (String, optional)
- Includes automatic `timestamps` (createdAt, updatedAt)

#### 3.3 Controller Logic (`server/middleware/petController.js`)
The `createPet` function handles the business logic:
1. Extracts form data from `req.body`
2. Validates all required fields
3. Creates new Pet document using the Pet model
4. Saves to MongoDB database
5. Returns JSON response with success message and pet data
6. Catches and returns errors with appropriate status codes

#### 3.4 API Routes (`server/routes/route.js`)
- Defines POST endpoint `/pets` that maps to `createPet` controller
- Routes are connected in `server/server.js` under `/api` prefix
- **Final endpoint URL:** `POST http://localhost:5000/api/pets`

#### 3.5 Server Setup (`server/server.js`)
Configures the Express application:
- **Middleware:**
  - `cors()` - Enables Cross-Origin Resource Sharing
  - `express.json()` - Parses incoming JSON requests
- **Database:** Calls `connectDB()` to establish MongoDB connection
- **Routes:** Mounts API routes under `/api` prefix
- **Server:** Listens on port 5000

### Step 4: Frontend Implementation Flow

#### 4.1 Entry Point (`client/src/main.jsx`)
- Renders the React application into the DOM
- Finds the `<div id="root">` element in `client/index.html`
- Wraps App component with React.StrictMode

#### 4.2 Main App Component (`client/src/App.jsx`)
- Root component that renders the `AddPet` form component
- Applies global styling from `App.css`

#### 4.3 Form Component (`client/src/components/AddPet.jsx`)

**State Management:**
- `formData` - Object storing all pet input fields (name, species, breed, etc.)
- `loading` - Boolean tracking submission state
- `message` - Object containing success/error feedback messages

**Event Handlers:**
- `handleChange(e)` - Updates `formData` state when user types in input fields
- `handleSubmit(e)` - Processes form submission:
  1. Prevents default form behavior
  2. Sets loading state to true
  3. Sends POST request to backend via axios
  4. Handles success: resets form, displays success message
  5. Handles errors: displays error message
  6. Sets loading state to false

**Form Submission Flow:**
1. User fills out form fields
2. User clicks "Add Pet" button
3. `handleSubmit` function is triggered
4. Axios makes POST request to `http://localhost:5000/api/pets`
5. Backend processes the request (see Step 3.3)
6. **Success:** Form resets, success message displays in green
7. **Error:** Error message displays in red

#### 4.4 Styling
- `client/src/components/AddPet.css` - Form-specific styles
- `client/src/index.css` - Global CSS reset and base styles
- `client/src/App.css` - App component styles

### Step 5: Running the Application

#### 5.1 Start Backend Server
```sh
cd server
npm start
```

**Expected output:**
```
Server running on port 5000
MongoDB Atlas connected
```

#### 5.2 Start Frontend Development Server
```sh
cd client
npm run dev
```

**Expected output:**
```
VITE v7.3.1  ready in XXX ms
➜  Local:   http://localhost:5173/
```

### Step 6: Testing the Complete Flow

1. **Open Browser:** Navigate to `http://localhost:5173`

2. **Fill Form:** Enter pet details:
   - Pet Name (e.g., "Buddy")
   - Species (e.g., "Dog")
   - Breed (e.g., "Golden Retriever")
   - Age (e.g., 3)
   - Weight (e.g., 30)
   - Date of Birth (e.g., 2021-05-15)
   - Notes (optional)

3. **Submit:** Click "Add Pet" button

4. **Backend Processing:**
   - Request hits `server/routes/route.js` → `/api/pets` endpoint
   - Routed to `createPet` function in `server/middleware/petController.js`
   - Pet document created and saved to MongoDB via `Pet` model
   - Success response sent back to frontend

5. **Frontend Response:**
   - Success message appears: "Pet added successfully!"
   - Form fields clear automatically
   - Ready for next pet entry

### Step 7: Verify in Database

**Option 1: MongoDB Atlas Dashboard**
1. Log into MongoDB Atlas
2. Navigate to your cluster
3. Click "Browse Collections"
4. Find your database and `pets` collection
5. Verify the new pet record appears with all fields

**Option 2: Using MongoDB Compass**
1. Connect to your MongoDB URI
2. Navigate to your database
3. Open the `pets` collection
4. View the newly created documents

### Step 8: Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                          │
│  Browser (http://localhost:5173) - AddPet Form              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ 1. User fills form & clicks submit
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│  • AddPet.jsx captures form data                            │
│  • handleSubmit() sends POST request via axios              │
│  • URL: http://localhost:5000/api/pets                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ 2. HTTP POST with JSON payload
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Express)                          │
│  server/server.js                                            │
│  • CORS middleware allows request                           │
│  • express.json() parses request body                       │
│  • Routes to /api/pets endpoint                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ 3. Route matches POST /pets
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   ROUTING LAYER                              │
│  server/routes/route.js                                      │
│  • POST /pets endpoint matched                              │
│  • Calls createPet controller function                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ 4. Executes controller logic
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  CONTROLLER LAYER                            │
│  server/middleware/petController.js                          │
│  • Validates request data                                   │
│  • Creates new Pet instance                                 │
│  • Calls .save() method                                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ 5. Mongoose saves document
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   MODEL LAYER                                │
│  server/models/Pet.js                                        │
│  • Mongoose schema validates data types                     │
│  • Adds timestamps (createdAt, updatedAt)                   │
│  • Prepares document for database                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ 6. Database operation
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                DATABASE (MongoDB Atlas)                      │
│  • Document inserted into 'pets' collection                 │
│  • Returns inserted document with _id                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ 7. Success response flows back
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               RESPONSE TO FRONTEND                           │
│  • Status 201 Created                                        │
│  • JSON: { message: "...", pet: {...} }                     │
│  • AddPet.jsx displays success message                      │
│  • Form resets for next entry                               │
└─────────────────────────────────────────────────────────────┘
```

## Common Issues & Solutions

### Issue 1: Missing Dependencies
**Problem:** `Module not found: axios`
**Solution:**
```sh
cd client
npm install axios
```

### Issue 2: CORS Errors
**Problem:** `Access to XMLHttpRequest blocked by CORS policy`
**Solution:** Already handled in `server/server.js` with `app.use(cors())`

### Issue 3: MongoDB Connection Fails
**Problem:** `MongoServerError: connection refused`
**Solutions:**
- Verify MongoDB Atlas cluster is running
- Check connection string in `.env` file
- Whitelist your IP address in MongoDB Atlas
- Ensure network connectivity

### Issue 4: Port Already in Use
**Problem:** `Error: listen EADDRINUSE: address already in use :::5000`
**Solutions:**
```sh
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Or change port in server/.env
PORT=5001
```

### Issue 5: Form Not Submitting
**Problem:** Button click doesn't trigger submission
**Solutions:**
- Check browser console for JavaScript errors
- Verify axios is installed
- Ensure backend is running
- Check network tab in DevTools for failed requests

## File Structure Explained

```
CMSC129-Lab1-LasernaA_OycoC/
│
├── client/                          # Frontend React Application
│   ├── src/
│   │   ├── main.jsx                # Entry point - renders App
│   │   ├── App.jsx                 # Root component - renders AddPet
│   │   ├── components/
│   │   │   ├── AddPet.jsx          # Form component with state & handlers
│   │   │   └── AddPet.css          # Form styling
│   │   ├── index.css               # Global styles
│   │   └── App.css                 # App component styles
│   ├── index.html                  # HTML template with root div
│   ├── package.json                # Frontend dependencies
│   └── vite.config.js              # Vite build configuration
│
├── server/                          # Backend Express Application
│   ├── server.js                   # Main server file - entry point
│   ├── config/
│   │   └── db.js                   # MongoDB connection logic
│   ├── models/
│   │   └── Pet.js                  # Mongoose schema for Pet
│   ├── middleware/
│   │   └── petController.js        # Business logic for pet operations
│   ├── routes/
│   │   └── route.js                # API endpoint definitions
│   ├── .env                        # Environment variables (MongoDB URI)
│   └── package.json                # Backend dependencies
│
└── README.md                        # This file
```

## Code Execution Order

### Backend Startup (`npm start` in server/)
1. **server.js** runs
2. Imports dependencies (express, cors, mongoose, etc.)
3. Creates Express app instance
4. Calls `connectDB()` from **config/db.js**
5. MongoDB connection established
6. Middleware registered (cors, json parser)
7. Routes registered from **routes/route.js**
8. Server starts listening on port 5000

### Frontend Startup (`npm run dev` in client/)
1. Vite dev server starts
2. **index.html** loaded
3. **main.jsx** executes
4. React renders **App.jsx**
5. **AddPet.jsx** component rendered
6. CSS files loaded and applied
7. Application ready at http://localhost:5173

### Form Submission Execution
1. User types in form → `handleChange` updates state
2. User clicks "Add Pet" → `handleSubmit` called
3. `e.preventDefault()` stops page reload
4. `setLoading(true)` shows loading state
5. `axios.post()` sends request to backend
6. **Backend receives request:**
   - Express routes to `/api/pets`
   - Calls `createPet` controller
   - Validates data
   - Creates Pet instance
   - Saves to MongoDB
   - Returns response
7. **Frontend receives response:**
   - Success: Shows green message, resets form
   - Error: Shows red error message
8. `setLoading(false)` removes loading state

## Next Steps: Complete CRUD Implementation

Currently, only **CREATE** is implemented. To meet lab requirements:

### 1. Read (GET)
- **Backend:** Add GET endpoint in `route.js` and controller in `petController.js`
- **Frontend:** Create component to display list of pets

### 2. Update (PUT/PATCH)
- **Backend:** Add PUT endpoint to modify existing pet records
- **Frontend:** Add edit form/modal with pre-filled data

### 3. Delete (DELETE)
- **Backend:** Add DELETE endpoint (soft delete recommended)
- **Frontend:** Add delete button with confirmation dialog

### 4. For Perfect Score
- Implement **soft delete** (add `isDeleted` field to schema)
- Implement **hard delete** option
- Set up **database redundancy** with backup MongoDB cluster