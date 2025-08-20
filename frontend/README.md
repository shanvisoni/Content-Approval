 Authentication & Authorization
JWT-based authentication with secure password hashing

Role-based access control (User & Admin roles)

Protected routes with automatic redirects

Session persistence with localStorage

👤 User Dashboard
Submit new content with title and description

View personal content submission history

Filter content by status (Pending, Approved, Rejected)

Search through submitted content

Visual analytics with interactive charts

Delete own content functionality

👑 Admin Dashboard
Comprehensive view of all user submissions

Approve/Reject content with single click

Advanced filtering and search capabilities

Content statistics and analytics

Recent activity feed

Status modification for existing content

📊 Advanced Features
Real-time content status updates

Responsive design for mobile and desktop

Interactive charts and data visualization

Pagination support

Comprehensive error handling

Input validation on both client and server

🛠️ Tech Stack
Frontend
React.js - UI framework

Material-UI - Component library

Recharts - Data visualization

Axios - HTTP client

React Router - Navigation

Framer Motion - Animations

Backend
Node.js - Runtime environment

Express.js - Web framework

MongoDB - Database

Mongoose - ODM

JWT - Authentication

bcryptjs - Password hashing

CORS - Cross-origin requests

📦 Installation
Prerequisites
Node.js (v14 or higher)

MongoDB (local or Atlas)

Git

Backend Setup
Clone the repository:

bash
git clone <repository-url>
cd content-approval-system/backend
Install dependencies:

bash
npm install
Create environment file:

bash
cp .env.example .env
Edit .env with your configuration:

text
PORT=5000
MONGODB_URI=mongodb://Yours/content-approval
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
CLIENT_URL=http://localhost:5173
Start the server:

bash
npm run dev
Frontend Setup
Navigate to frontend directory:

bash
cd ../frontend
Install dependencies:

bash
npm install
Create environment file:

bash
cp .env.example .env
Edit .env with your configuration:

text
VITE_API_BASE_URL=http://localhost:5000
Start the development server:

bash
npm run dev
🗄️ Database Schema
User Model
javascript
{
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
}
Content Model
javascript
{
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectionNotes: { type: String }
}
📡 API Endpoints
Authentication
POST /api/auth/signup - Register new user

POST /api/auth/login - User login

GET /api/auth/me - Get current user info

Content Management
POST /api/content - Create new content (User only)

GET /api/content - Get content (Admin: all, User: own)

PUT /api/content/:id/approve - Approve content (Admin only)

PUT /api/content/:id/reject - Reject content (Admin only)

DELETE /api/content/:id - Delete content

Advanced Features
GET /api/content/stats - Get content statistics

GET /api/content/recent - Get recent activity

GET /api/content/search - Search and filter content

🚀 Usage
For Users
Register an account or login

Navigate to the Dashboard

Click "New Content" to submit content

View your submission history and status

Use search and filters to find specific content

For Admins
Login with admin credentials

Access the Admin Panel from navigation

Review pending content submissions

Approve or reject content with optional notes

View analytics and recent activity

Modify status of existing content if needed


bash
# Backend tests
cd backend
npm test

# Frontend tests  
cd ../frontend
npm test
🚀 Deployment
Frontend Deployment Netlify
Connect your GitHub repository to Netlify

Set build command: npm run build

Set output directory: dist

Add environment variables in Vercel dashboard

Backend Deployment (Render)
Connect your GitHub repository to Render

Set build command: npm install

Set start command: npm start

Add environment variables in Render dashboard

Database (MongoDB Atlas)
Create a free cluster on MongoDB Atlas

Get connection string

Update MONGODB_URI in environment variables