
# 🚀 Interactive Coding Platform API (LeetCode Clone)

A scalable backend system for a coding platform that allows users to solve problems, submit code, and track their performance.

## ✨ Features
* **User Authentication:** Secure signup/login using JWT (JSON Web Tokens) and bcrypt password hashing.
* **Problem Management:** CRUD operations for coding challenges, test cases, and difficulty levels.
* **Submission Tracking:** Endpoints to record user code submissions and track success/failure states.

## 🛠️ Tech Stack
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB & Mongoose
* **Tools:** Postman (API Testing)

## 📁 Project Structure
   Backend/
│── src/
│ ├── config/ # Database & app configuration
│ ├── controllers/ # Business logic
│ ├── middleware/ # Auth & error handling
│ ├── models/ # Mongoose schemas
│ ├── routes/ # API routes
│ ├── utils/ # Helper functions
│ └── index.js # Entry point
│
│── .env # Environment variables (not pushed)
│── package.json
│── README.md

## 💻 Local Setup & Installation

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/your-repo-name.git

cd Backend

2️⃣ Install dependencies
npm install
3️⃣ Setup environment variables

Create a .env file in root:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
4️⃣ Run the server
npm start



📡 API Overview

🔑 Auth Routes

POST /api/auth/register → Register user
POST /api/auth/login → Login user



📚 Problem Routes

GET /api/problems → Get all problems
POST /api/problems → Create problem
PUT /api/problems/:id → Update problem
DELETE /api/problems/:id → Delete problem

🧪 Submission Routes

POST /api/submissions → Submit solution
GET /api/submissions/:userId → Get user submissions

🔒 Security Features

Password hashing using bcrypt
JWT-based protected routes
Middleware-based authentication

🚀 Future Improvements

Code execution engine integration
Frontend (React) integration
Real-time submission feedback
Leaderboard system

👨‍💻 Author

Rohan Majumder 
