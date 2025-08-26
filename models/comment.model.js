import { DataTypes } from "sequelize";
import sequelize from "./index.js";

const Comment = sequelize.define("Comment", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  text: {
    type: DataTypes.STRING(300),
    allowNull: false,
  },
  likeCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
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
  parentCommentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: "comments",
      key: "id",
    },
  },
}, {
  tableName: "comments",
});

export { Comment };