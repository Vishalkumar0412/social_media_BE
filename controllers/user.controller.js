import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../utills/generateToken.js';
import { Op } from 'sequelize';

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