import { DataTypes } from "sequelize";
import sequelize from "./index.js";

const UserFollower = sequelize.define("UserFollower", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  followerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
  followingId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
}, {
  tableName: "user_followers",
  indexes: [
    {
      unique: true,
      fields: ["followerId", "followingId"],
    },
  ],
});

export { UserFollower };