const express = require("express");
const userAuth = require("../middleware/userAuth"); // Middleware to protect routes requiring authentication
const { signup, login, logout, sendVerifyOtp, verifiyEmail } = require("../controllers/authController.js");
const { verify } = require("../config/nodemailer.js");

const authRouter = express.Router(); // Create a new router instance

// Assign the correct controller function to each route
authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/send-verify-otp", userAuth, sendVerifyOtp) // Send OTP for email verification
authRouter.post("/verify-account", userAuth, verifiyEmail) // Verify account using OTP

module.exports = authRouter;
