import { Op } from "sequelize";
import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import { uploadMedia } from "../utills/cloudinary.js";

// Upload media
export const sendMedia = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    if (!["image/", "video/"].some((t) => req.file.mimetype.startsWith(t))) {
      return res.status(400).json({ message: "Only images/videos allowed" });
    }

    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ message: "File too large (max 10 MB)" });
    }

    const uploaded = await uploadMedia(req.file.path);

    res.json({ url: uploaded.secure_url, public_id: uploaded.public_id });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

// Fetch chat between logged-in user and a specific receiver
export const fetchChat = async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res.status(401).json({
      message: "User not authenticated",
      success: false,
    });
  }

  try {
    const { receiverId } = req.params;
    if (!receiverId) {
      return res.status(400).json({
        message: "Receiver ID is required",
        success: false,
      });
    }

    const chats = await Chat.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: receiverId },
          { senderId: receiverId, receiverId: userId },
        ],
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username", "firstName", "lastName", "email"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["id", "username", "firstName", "lastName", "email"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    console.error("❌ Error fetching chat:", error);
    return res.status(500).json({
      message: "Something went wrong in fetching chat",
      success: false,
      error: error.message,
    });
  }
};

// Fetch all chat history for the logged-in user
export const fetchChatHistory = async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  try {
    const chats = await Chat.findAll({
      where: {
        [Op.or]: [{ senderId: userId }, { receiverId: userId }],
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username", "firstName", "lastName", "email","profilePicture"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["id", "username", "firstName", "lastName", "email","profilePicture"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    console.error("❌ Error fetching chat history:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chat history",
      error: error.message,
    });
  }
};
