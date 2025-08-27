const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require("../config/nodemailer");



const { userModel, auditLogModel } = require("../models/userModels.js");

const createAuditLog = async (userId, action) => {
    try {
         // Create a new audit log document with user ID and action
        const newLog = new auditLogModel({
            userId: userId,
            action: action,
        });

        // Save the log to the database

        await newLog.save();
    } catch (error) {
        console.error(`Failed to create audit log for action [${action}] and user [${userId}]:`, error);
    }
};

const signup = async (req, res) => {
    
    // Basic input validation
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Missing details" });
    }

    try {
                // Check if user already exists
        const exisitingUser = await userModel.findOne({ email });
        if (exisitingUser) {
            return res.status(409).json({ success: false, message: "User already exists." });
        }
        // Hash the password securely
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create and save new user
        const user = new userModel({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        await createAuditLog(user._id, 'SIGNUP');
        // Generate JWT token
        const token = jwt.sign({ id: user._id },
            process.env.JWT_SECRET, { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

                // Send welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome to the Automatically Website",
            text: `Welcome to Automatically website your account with Email: ${email} has successfully being created.`
        }
        await transporter.sendMail(mailOptions);

        return res.status(201).json({ success: true, message: "User registered successfully." });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const login = async (req, res) => {
        // Validate input
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required." })
    }

    try {
                // Find user by email
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User doesn't exist." })
        }
        // Compare password
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            // You might not want to log failed attempts, but if you do, this is where it would go.
            return res.status(401).json({ success: false, message: "Invalid credentials." })
        }
        await createAuditLog(user._id, 'LOGIN');

        const token = jwt.sign({ id: user._id },
            process.env.JWT_SECRET, { expiresIn: "7d" }
        );
        // Set cookie with token
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.status(200).json({ success: true, message: "Logged in successfully." });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

const logout = async (req, res) => {
    try {

        // Extract user ID from request (assumes authentication middleware has set req.user)
        const userId = req.user?.id;
        if (userId) {
            await createAuditLog(userId, 'LOGOUT');
        }
        // Clear the authentication cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });

        return res.status(200).json({ success: true, message: 'Logged Out' });
    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

const sendVerifyOtp = async (req, res) => {
    try {
                // Find user by ID
        const { userId } = req.body;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        // Check if account is already verified
        if (user.isAccountVerified) {
            return res.json({ success: false, message: "Account already verified" });
        }
        // Generate 6-digit OTP
        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpiredAt = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();


        await createAuditLog(user._id, 'OTP_SENT');
        // Email the OTP
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Account verification Otp",
            text: `Your OTP generated is: ${otp}, verify your account using this.`
        }
        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: "Verification otp sent on email." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const verifiyEmail = async (req, res) => {
    
    // Validate input
    const { userId, otp } = req.body;
    if (!userId || !otp) {
        return res.json({ success: false, message: 'Missing details.' })
    }

    try {
                // Find user by ID
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found.' })
        }
                // Validate OTP
        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        }
                // Check OTP expiration
        if (user.verifyOtpExpiredAt < Date.now()) {
            return res.json({ success: false, message: "OTP EXPIRED." });
        }
        // Update verification status
        user.isAccountVerified = true;
        user.verifyOtp = otp; // Clear the OTP after successful verification
        user.verifyOtpExpiredAt = 0;
        await user.save();

        await createAuditLog(user._id, 'VERIFY_EMAIL');

        // FIX: Removed the second user.save() which was after the return
        return res.json({ success: true, message: "Email Verified." });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    signup,
    login,
    logout,
    sendVerifyOtp,
    verifiyEmail
};
