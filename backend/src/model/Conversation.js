import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Conversation = sequelize.define(
  "Conversation",
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
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    role: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isIn: [["user", "assistant"]],
      },
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    tableName: "conversations",
    timestamps: false,
  },
);
