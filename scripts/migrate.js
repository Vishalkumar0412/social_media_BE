// import sequelize from "../models/index.js";
import "../models/associations.js";

import sequelize from "../models/index.js";

const migrate = async () => {
  try {
    // This will create all tables if they don't exist
    await sequelize.sync({ force: false });
    await sequelize.sync({ alter: true });
    console.log("Database migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrate();