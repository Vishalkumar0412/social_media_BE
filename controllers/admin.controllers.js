import User from "../models/user.model.js";
import bcrypt from 'bcrypt'
import { generateToken } from "../utills/generateToken.js";

export const fetchUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: "USER" },
      attributes: ["id", "username", "email", "firstName", "lastName", "profilePicture", "role"]
    });

    if (users.length === 0) {
      return res.status(404).json({
        message: "No users found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Users fetched successfully",
      success: true,
      users,
    });
  } catch (error) {
    console.error("fetchUsers error:", error);
    return res.status(500).json({
      message: "Failed to fetch users",
      success: false,
    });
  }
};

export const fetchAdmins = async (req, res) => {
  try {
    const admins = await User.findAll({
      where: { role: "ADMIN" },
      attributes: ["id", "username", "email", "firstName", "lastName", "profilePicture", "role"]
    });

    if (admins.length === 0) {
      return res.status(404).json({
        message: "No admins found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Admins fetched successfully",
      success: true,
      admins,
    });
  } catch (error) {
    console.error("fetchAdmins error:", error);
    return res.status(500).json({
      message: "Failed to fetch admins",
      success: false,
    });
  }
};



export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  // ✅ Input validation
  if (!username || !password) {
    return res.status(400).json({
      message: "All fields are required",
      success: false,
    });
  }

  try {
    // ✅ User find
    const user = await User.findOne({
      where: { username },
    });

    if (!user) {
      return res.status(400).json({
        message: "Username or password wrong",
        success: false,
      });
    }

    // ✅ Role check
    if (user.role !== "ADMIN") {
      return res.status(403).json({
        message: "You are not admin",
        success: false,
      });
    }

    // ✅ Password check
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Username or password wrong",
        success: false,
      });
    }

    // ✅ JWT token generate
   generateToken(res,user,"Admin loggin successfully")

   
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // ✅ Delete user
    if(user.role==="ADMIN"){
        return res.status(400).json({
            message:"Admin can't delete admin",
            success:false
        })
    }
    await user.destroy();

    return res.status(200).json({
      message: "User deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("deleteUser error:", error);
    return res.status(500).json({
      message: "Failed to delete user",
      success: false,
    });
  }
};
const createAdmin = async (req, res) => {
  const { username, password, email, firstName, lastName } = req.body;

  // 🛑 Input validation
  if (!username || !password || !email || !firstName || !lastName) {
    return res.status(400).json({
      message: "All fields are required",
      success: false,
    });
  }

  try {
    // ✅ Check if username/email already exists
    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Admin with this email already exists",
        success: false,
      });
    }

    // ✅ Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: "ADMIN",
    });

    return res.status(201).json({
      message: "Admin created successfully",
      success: true,
      data: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("createAdmin error:", error);
    return res.status(500).json({
      message: "Failed to create admin",
      success: false,
    });
  }
};