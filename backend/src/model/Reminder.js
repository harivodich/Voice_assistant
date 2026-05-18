import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Reminder = sequelize.define(
  "Reminder",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "user_id",
    },

    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    reminderTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "reminder_time",
    },

    status: {
      type: DataTypes.STRING,
      defaultValue: "pending", // pending | done
    },

    notified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "notified",
    },
  },
  {
    tableName: "reminders",
    timestamps: false,
  },
);
