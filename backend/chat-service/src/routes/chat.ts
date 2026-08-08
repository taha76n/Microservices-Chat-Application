import express from "express";
import { chatController } from "../controllers/chat.js";
import { isAuth } from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();
console.log("hitted");


router.post("/new", isAuth, chatController.createNewChat);
router.post("/all", isAuth, chatController.getAllChats);
router.post(
  "/message",
  isAuth,
  upload.single("image"),
  chatController.sendMessage
);
router.get('/:chatId', isAuth, chatController.getMessagesByChat)

export default router;
