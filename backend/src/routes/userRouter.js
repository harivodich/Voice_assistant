import { Router } from "express";
import { getMe, updateProfile } from "../controllers/userController.js";

export const userRouter = Router();

userRouter.get("/me", getMe);
userRouter.patch("/profile", updateProfile);
