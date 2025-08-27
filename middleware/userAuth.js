const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require('dotenv').config();

const userAuth = async (req, res, next) => {
    const {token} = req.cookies;

    // Check for token presence
    if(!token){
        return res.json({success: true, message: "Not authorized login again."})
    }

    try {
                // Verify and decode token
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        // Attach user ID to request for downstream use
        if(tokenDecode.id){
            req.body.userId = tokenDecode.id;
        } else{
            return res.json({success: true, message: "Not authorized login again."})
        }

        next();

    } catch (error) {
        res.json({success: true, message: error.message})
    }
};

module.exports = userAuth;

