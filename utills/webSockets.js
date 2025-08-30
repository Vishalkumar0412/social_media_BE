import { WebSocketServer } from "ws";
import Chat from "../models/chat.model.js";

const onlineUsers = new Map();

const initWebSocket = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("✅ New client connected");

    ws.on("message", async (msg) => {
      try {
        const data = JSON.parse(msg);

        if (data.type === "join") {
          // store userId with websocket
          ws.userId = data.userId;
          onlineUsers.set(data.userId, ws);
          console.log(`✅ User ${data.userId} joined`);
        }

        if (data.type === "chat") {
          const senderId = ws.userId; // ✅ take from socket (not undefined)
          //   console.log(ws);

          const { receiverId, message, msgType } = data;

          if (!senderId || !receiverId) {
            console.error("❌ Missing sender or receiver ID");
            return;
          }

          // save in DB
          const chat = await Chat.create({
            senderId,
            receiverId,
            message, // ✅ correct field name
            type: msgType || "text",
            status: "sent",
          });

          // send to receiver if online
          const receiverSocket = onlineUsers.get(receiverId);
          if (receiverSocket) {
            receiverSocket.send(JSON.stringify(chat));
          }
        }
      } catch (err) {
        console.error("❌ Error handling message:", err);
      }
    });

    ws.on("close", () => {
      if (ws.userId) {
        onlineUsers.delete(ws.userId);
        console.log(`👋 User ${ws.userId} disconnected`);
      }
    });
  });

  return wss;
};

export default initWebSocket;
