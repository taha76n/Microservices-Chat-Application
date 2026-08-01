import express from "express";
import { userController } from "../controllers/user.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/login", userController.userLogin);
router.post("/verify", userController.verifyUser);
router.post("/update/user", isAuth, userController.updateName);
router.get("/me", isAuth, userController.myProfile);
router.get("/user/all", isAuth, userController.getAllUsers);
router.get("/user/:id", userController.getUser);

export default router;
