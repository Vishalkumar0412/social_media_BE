import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../utills/generateToken.js';
import { Op } from 'sequelize';
import { uploadMedia } from '../utills/cloudinary.js';

export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, username } = req.body;
    
    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required."
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email or username."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await User.create({
      firstName,
      username,
      lastName,
      email,
      password: hashedPassword
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully."
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to register"
    });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required."
      });
    }

    const user = await User.findOne({ where: { username } });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Incorrect username or password"
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect username or password"
      });
    }

    generateToken(res, user, `Welcome back ${user.firstName}`);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to login"
    });
  }
};

export const logout = async (_, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out successfully.",
      success: true
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to logout"
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { user } = req;
    
    if (!user) {
      return res.status(404).json({
        message: "User details not found",
        success: false
      });
    }
    
    return res.status(200).json({
      user
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch user",
      success: false
    });
  }
};
export const getAllUsers = async (req, res) => {
  const { user } = req;

  try {
    let users = await User.findAll();

    // Exclude current user
    users = users.filter(u => u.id !== user.id);

    if (users.length === 0) {
      return res.status(404).json({
        message: "Users not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Users fetched successfully",
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      message: "Users can't be fetched",
      success: false,
    });
  }
};
export const editProfile = async (req, res) => {
  const userId = req.user.id;
  const { firstName, lastName, email, bio } = req.body;
  const file = req.file;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    let imageUrl = user.profilePicture; // keep existing image if no new file

    if (file) {
      const uploadRes = await uploadMedia(file.path);
      imageUrl = uploadRes.secure_url;
    }

    // Update user
    const [updatedRows] = await User.update(
      {
        firstName,
        lastName,
        email,
        bio,
        profilePicture: imageUrl,
      },
      { where: { id: userId } }
    );

    // Fetch updated user
    const updatedUser = await User.findByPk(userId, {
      attributes: ["id", "firstName", "lastName", "email", "bio", "profilePicture", "username"],
    });

    return res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Edit profile error:", error);
    return res.status(500).json({
      message: "Failed to update profile",
      success: false,
    });
  }
};
export const getByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({
      where: { username },
      attributes: { exclude: ["password"] }, // don’t send password
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
export const searchUser=async (req,res)=>{
  const {query}=req.query
  if(!query && query.length===""){
    return res.status(400).json({
      message:"Please enter query first",
      success:false
    })
  }
  try {
 const users = await User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.iLike]: `%${query}%` } }, // case-insensitive
          { email: { [Op.iLike]: `%${query}%` } },
          { firstName: { [Op.iLike]: `%${query}%` } },
          { lastName: { [Op.iLike]: `%${query}%` } },
        ],
      },
      attributes: ["id", "username", "email", "firstName", "lastName", "profilePicture"], // limit fields
      order: [["createdAt", "DESC"]],
    });
    
    return res.json({
      success: true,
      count: users.length,
      data: users,
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}