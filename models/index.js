import { Sequelize } from "sequelize";
import { config } from "dotenv";
config();


const sequelize = new Sequelize(process.env.POSTGRES_URI, {
  dialect: "postgres",
  logging: false,
  define: {
    freezeTableName: true,
    timestamps: true,
  },
});

export default sequelize;