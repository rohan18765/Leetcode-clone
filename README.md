
# 🚀 LeetCode Clone Platform

A full-stack algorithmic coding platform built with the MERN stack. This application allows users to solve coding challenges, execute code remotely in real-time, get AI-powered coding assistance, and manage their profiles securely.

**[🔴 Live Demo: View the Platform Here](https://leetcode-clone-rho-three.vercel.app/)**

---

### 🔑 Demo Credentials
For recruiters or guests who want to bypass the signup process to test the code execution engine:
* **Email:** `test@test.com`
* **Password:** `123456`
*(Alternatively, secure Google OAuth login is fully supported).*

---

## 📸 Platform Previews

*(Replace the links below with actual screenshots of your project. You can drag and drop images directly into the GitHub text editor to generate links).*

<div align="center">
  <img src="https://github.com/user-attachments/assets/06771041-f9f0-49f5-bcb7-535941fe65ac" alt="Dashboard View" width="800"/>
  <p><i>The main coding arena featuring real-time execution and AI chat support.</i></p>
</div>

<div align="center">
  <img src="link_to_your_admin_screenshot.png" alt="Admin View" width="800"/>
  <p><i>Admin dashboard for managing problem sets.</i></p>
</div>

---

## ✨ Key Features

* **🤖 Integrated AI Assistant:** Built-in AI chat support to help users debug code, understand complex algorithms, and get hints without leaving the coding arena.
* **⚡ Real-Time Code Execution:** Integrated with the Judge0 API to safely compile and run user submissions against test cases.
* **🔒 Robust Authentication:** Secure JWT-based custom authentication alongside third-party Google OAuth integration.
* **🛡️ Production-Grade Security:** Implemented strict Cross-Origin Resource Sharing (CORS) and `httpOnly` cross-site cookies for secure session management.
* **☁️ Split Architecture:** Decoupled client and server applications seamlessly communicating across distinct cloud environments (Vercel & Render).
* **⚙️ Admin Dashboard:** Role-based access control allowing administrators to create, read, update, and delete coding problems.

---

## 🛠️ Tech Stack

**Frontend:**
* React.js (Vite)
* Tailwind CSS
* Axios (Custom configured for cross-domain cookies)

**Backend:**
* Node.js & Express.js
* MongoDB & Mongoose
* JSON Web Tokens (JWT) & Google Auth Library

**Infrastructure & APIs:**
* **Frontend Hosting:** Vercel
* **Backend Hosting:** Render
* **Database:** MongoDB Atlas
* **Compiler API:** Judge0 (via RapidAPI)
* **AI Integration:** OpenAI API / Gemini API *(Update this to match whichever AI provider you used)*

---

## 💻 Local Installation & Setup

If you wish to run this project locally, follow these steps:

### 1. Clone the repository
```bash
git clone [https://github.com/rohan18765/Leetcode-clone.git](https://github.com/rohan18765/Leetcode-clone.git)
cd Leetcode-clone
2. Setup the Backend
Open a terminal and navigate to the backend folder:

Bash
cd Backend
npm install
Create a .env file in the Backend directory with the following variables:

PORT=4000
DB_CONNECT_STRING=your_database_connection_string
JWT_KEY=your_jwt_secret_key
JUDGE0_API_KEY=your_judge0_api_key
REDIS_HOST=your_redis_host
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_USERNAME=your_redis_username
RAPID_API_KEY=your_rapidapi_key
GEMINI_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GOOGLE_CLIENT_ID=your_google_client_id

Start the backend server:

Bash
npm run dev
3. Setup the Frontend
Open a new, separate terminal and navigate to the frontend folder:

Bash
cd frontend
npm install
Create a .env file in the frontend directory with the following variables:

Plaintext
VITE_BACKEND_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_cloud_client_id
Start the frontend development server:

Bash
npm run dev
👨‍💻 Author
Rohan Majumder

GitHub: @rohan18765
