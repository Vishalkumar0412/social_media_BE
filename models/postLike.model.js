import { DataTypes } from "sequelize";
import sequelize from "./index.js";

const PostLike = sequelize.define("PostLike", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
  postId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "posts",
      key: "id",
    },
  },
}, {
  tableName: "post_likes",
  indexes: [
    {
      unique: true,
      fields: ["userId", "postId"],
    },
  ],
});

export { PostLike };