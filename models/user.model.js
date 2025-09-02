import { DataTypes, Sequelize } from "sequelize";
import sequelize from "./index.js";

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 30],
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 255],
    },
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bio: {
    type: DataTypes.STRING(150),
    defaultValue: "",
  },
  profilePicture: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  role:{
    type:Sequelize.ENUM('USER','ADMIN','SUPER-ADMIN'),
    defaultValue:"USER",
    allowNull:false
  }
}, {
  tableName: "users",
  indexes: [
    {
      unique: true,
      fields: ["email"],
    },
    {
      unique: true,
      fields: ["username"],
    },
  ],
});

export default User;