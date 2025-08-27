const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, trim: true },
    verifyOtp: { type: String, default: "" },
    verifyOtpExpiredAt: { type: Number, default: 0 },
    isAccountVerified: { type: Boolean, default: false }
});

const auditLogSchema = new mongoose.Schema({
    
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['SIGNUP', 'LOGIN', 'LOGOUT', 'VERIFY_EMAIL', 'OTP_SENT']
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
});


const auditLogModel = mongoose.model("auditLog", auditLogSchema);
const userModel = mongoose.model("user", userSchema);

module.exports = {
    userModel,
    auditLogModel
};
