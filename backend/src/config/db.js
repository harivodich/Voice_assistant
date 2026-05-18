import { Sequelize } from "sequelize";
import { env } from "../utils/env.js";

const sequelize = new Sequelize({
  dialect: "postgres",
  username: env.dbUser,
  password: env.dbPassword,
  host: env.dbHost,
  port: env.dbPort,
  database: env.dbName,
  logging: env.nodeEnv === "production" ? false : console.log,
});

async function connectDb() {
  await sequelize.authenticate();
  // đảm bảo bảng/columns tồn tại trong dev; có thể tắt trong production nếu bạn dùng migration
  if (env.nodeEnv !== "production") {
    sequelize.sync();
  }
}

export { sequelize, connectDb };
