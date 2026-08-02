import express from "express";
import { chatController } from "../controllers/chat.js";
import { isAuth } from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

router.post("/new", isAuth, chatController.createNewChat);
router.post("/all", isAuth, chatController.getAllChats);
router.post(
  "/message",
  isAuth,
  upload.single("image"),
  chatController.sendMessage
);

export default router;
