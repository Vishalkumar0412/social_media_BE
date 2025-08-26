import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./db/db.js";
import routes from "./routes/index.js";

// Import models and associations
import "./models/associations.js";

dotenv.config({});

// Initialize database connection
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Default middleware
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: process.env.FRONT_END_URL,
    credentials: true
}));
 
// APIs
app.use('/api/v1', routes);
 
app.listen(PORT, () => {
    console.log(`Server listening at port ${PORT}`);
});