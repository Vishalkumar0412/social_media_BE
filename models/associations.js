import User from "./user.model.js";
import { Post } from "./post.model.js";
import { Comment } from "./comment.model.js";
import { PostLike } from "./postLike.model.js";
import { CommentLike } from "./commentLike.model.js";
import { UserFollower } from "./userFollower.model.js";
import Chat from "./chat.model.js";

// User-Post relationship
User.hasMany(Post, { foreignKey: "userId", as: "posts" });
Post.belongsTo(User, { foreignKey: "userId", as: "user" });

// User-Comment relationship
User.hasMany(Comment, { foreignKey: "userId", as: "comments" });
Comment.belongsTo(User, { foreignKey: "userId", as: "user" });

// Post-Comment relationship
Post.hasMany(Comment, { foreignKey: "postId", as: "comments" });
Comment.belongsTo(Post, { foreignKey: "postId", as: "post" });

// Comment self-referencing (replies)
Comment.hasMany(Comment, { foreignKey: "parentCommentId", as: "replies" });
Comment.belongsTo(Comment, { foreignKey: "parentCommentId", as: "parentComment" });

// Post Likes (Many-to-Many through PostLike)
User.belongsToMany(Post, { through: PostLike, foreignKey: "userId", as: "likedPosts" });
Post.belongsToMany(User, { through: PostLike, foreignKey: "postId", as: "likedByUsers" });

// Comment Likes (Many-to-Many through CommentLike)
User.belongsToMany(Comment, { through: CommentLike, foreignKey: "userId", as: "likedComments" });
Comment.belongsToMany(User, { through: CommentLike, foreignKey: "commentId", as: "likedByUsers" });

// User Followers (Many-to-Many through UserFollower)
User.belongsToMany(User, { 
  through: UserFollower, 
  foreignKey: "followerId", 
  otherKey: "followingId", 
  as: "following" 
});
User.belongsToMany(User, { 
  through: UserFollower, 
  foreignKey: "followingId", 
  otherKey: "followerId", 
  as: "followers" 
});

//chat 
User.hasMany(Chat, { foreignKey: "senderId", as: "sentMessages" });
User.hasMany(Chat, { foreignKey: "receiverId", as: "receivedMessages" });
Chat.belongsTo(User, { foreignKey: "senderId", as: "sender" });
Chat.belongsTo(User, { foreignKey: "receiverId", as: "receiver" });
export {
  User,
  Post,
  Comment,
  PostLike,
  CommentLike,
  UserFollower,
};