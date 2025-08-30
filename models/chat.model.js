import { DataTypes } from "sequelize";
import sequelize from "./index.js";
const Chat = sequelize.define(
  "Chat",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    receiverId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("text", "image"), // ✅ text or image
      allowNull: false,
      defaultValue: "text",
    },
    message: {
      type: DataTypes.TEXT, // ✅ for text OR image URL
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("sent", "delivered", "seen"),
      defaultValue: "sent",
    },
  },
  {
    timestamps: true,
  }
);
export default Chat;
