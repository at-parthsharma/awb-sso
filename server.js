const express = require("express");
const cors = require("cors");
const { configDotenv } = require("dotenv");
require('dotenv').config();
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/authRoutes");
const connectDB = require("./config/mongodb");
const app = express();
const PORT = 4000;

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials: true}));
// api endpoints

app.use("/api/auth", authRouter)

app.get("/", (req, res) => {
    console.log("server started");
    res.send("API working")
})
app.listen(PORT, () => {
    console.log(`server started on PORT: ${PORT}`);
});
 
