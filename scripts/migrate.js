// Import sequelize from "../models/index.js";
import "../models/associations.js";


import sequelize from "../models/index.js";

const migrate = async () => {
  try {
    console.log("Starting database migration...");
    
    // This will create all tables if they don't exist
    await sequelize.sync({ force: false });
    console.log("✅ Base tables synchronized");
    
    // Apply any schema changes
    await sequelize.sync({ alter: true });
    console.log("✅ Schema alterations applied");
    
    console.log("✅ Database migration completed successfully!");
    console.log("📋 New tables created:");
    console.log("  - user_deletion_requests");
    console.log("  - post_deletion_requests");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

migrate();