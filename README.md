# User Authentication API (Node.js + Express + MongoDB)

User authentication system built using Node.js, Express, MongoDB, JWT, and Nodemailer.  
It provides endpoints for user registration, login, logout, email verification with OTP, and audit logging of authentication events.

---

## Features
- User Registration with password hashing (bcrypt)
- Login & Logout with JWT authentication (stored in HTTP-only cookies)
- Email verification using OTP
- Nodemailer email integration (SMTP)
- Audit logging of key actions: `SIGNUP`, `LOGIN`, `LOGOUT`, `VERIFY_EMAIL`, `OTP_SENT`
- MongoDB for data 

---

## Tech Stack
- Backend Framework: Express.js
- Database: MongoDB with Mongoose ODM
- Authentication: JWT 
- Password Hashing: bcryptjs
- Email Service: Nodemailer with Brevo SMTP
- Environment Management: dotenv
- Server Utilities: cookie-parser,nodemon

---

## Project Structure
project/
config/
mongodb.js # MongoDB connection
nodemailer.js # Nodemailer config

controllers/
authController.js # Auth logic (register, login, OTP, etc.)

middleware/
userAuth.js # JWT auth middleware

models/
userModels.js # User & AuditLog schema/models

routes/
authRoutes.js # Auth API routes

.env # Environment variables
package.json # Dependencies & scripts
server.js # App entry pointt



---

## Installation & Setup

### 1️⃣ Clone Repository
```bash
git clone https://github.com/your-repo/user-auth.git
cd user-auth
2️⃣ Install Dependencies
bash
Copy code
npm install
3️⃣ Configure Environment Variables
Create a .env file in the root directory.

MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/dbname
JWT_SECRET=your_jwt_secret
NODE_ENV=development
SMTP_USER=your_brevo_user
SMTP_PASSWORD=your_brevo_password
SENDER_EMAIL=your_email@gmail.com

4️⃣ Start Server
bash
Copy code
npm run devStart
The server will start at:
http://localhost:4000

API Endpoints
Auth Routes (/api/auth)
Method	Endpoint	Description
POST	/signup->	Register a new user
POST	/login->	Login user and set JWT cookie
POST	/logout->	Logout user and clear cookie
POST	/send-verify-otp->	Send OTP for email verification (protected)
POST	/verify-account->	Verify email using OTP (protected)

