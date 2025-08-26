import { Sequelize } from "sequelize";

const connectDB = async () => {
  try {
    const sequelize = new Sequelize(process.env.POSTGRES_URI, {
      dialect: "postgres",
      logging: false, // set true for SQL logs
      define: {
        freezeTableName: true, // prevent pluralization
        timestamps: true, // adds createdAt and updatedAt
      },
    });

    await sequelize.authenticate();
    console.log("PostgreSQL Connected ✅");

    // Sync all models
    await sequelize.sync({ force: false }); // set force: true to drop tables
    console.log("Database synchronized ✅");

    return sequelize;
  } catch (error) {
    console.error("❌ Error connecting to PostgreSQL:", error);
    process.exit(1);
  }
};

export default connectDB;