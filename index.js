import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./db/db.js";
import routes from "./routes/index.js";
import {createServer} from 'http'



// Import models and associations
import "./models/associations.js";

import Chat from "./models/chat.model.js";
import initWebSocket from "./utills/webSockets.js";

dotenv.config({});

// Initialize database connection
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;
const server=createServer(app);

// Default middleware
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: process.env.FRONT_END_URL,
    credentials: true
}));
 
// APIs
app.use('/api/v1', routes);
initWebSocket(server)
 
server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🔌 WebSocket listening on ws://localhost:${PORT}`);
});
