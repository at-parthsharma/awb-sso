const express = require("express");
const userAuth = require("../middleware/userAuth");
const { register, login, logout, sendVerifyOtp, verifiyEmail } = require("../controllers/authController.js");
const { verify } = require("../config/nodemailer.js");

const authRouter = express.Router();

// Assign the correct controller function to each route
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/send-verify-otp", userAuth, sendVerifyOtp)
authRouter.post("/verify-account", userAuth, verifiyEmail)

module.exports = authRouter;
