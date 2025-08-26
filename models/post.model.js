import { DataTypes } from "sequelize";
import sequelize from "./index.js";

const Post = sequelize.define("Post", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500],
    },
  },
  image: {
    type: DataTypes.STRING,
    defaultValue: "",
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
}, {
  tableName: "posts",
});

export { Post };