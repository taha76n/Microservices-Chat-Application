import type { Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { userService } from "../services/user.js";
import { TryCatch } from "../utils/TryCatch.js";
import { User } from "../model/user.js";

const userLogin = TryCatch(async (req, res) => {
  const { email } = req.body;
  

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  const otp = await userService.userLogin(email);

  res
    .status(200)
    .json({ message: `Otp sent successfully to email`, otp });
});

const verifyUser = TryCatch(async (req, res) => {
  const { email, otp } = req.body;

  if (!otp || !email) {
    return res.status(400).json({ message: "Email and Otp are required" });
  }

  const { user, token } = await userService.verifyUser(otp, email);

  return res.status(201).json({
    message: "User verified successfully",
    user: user,
    otp: otp,
    token: token,
  });
});

const myProfile = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res
    .status(200)
    .json({ message: "User Profile fetced successfully", user: user });
});

const updateName = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req?.user?._id;
    const updatedName = req.body.name;

    const {user, token} = await userService.updateName(userId, updatedName);

    return res
      .status(200)
      .json({ message: "User name updated successfully", user: user, token: token });
  }
);

const getUser = TryCatch(async (req, res) => {
  
  const user = await User.findById(req.params.id);

  return res.status(200).json({message:"User fetched successfully", user: user})
});

const getAllUsers = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const users = await User.find();

    return res
      .status(200)
      .json({ message: "Users fetched successfully", users: users });
  }
);

export const userController = {
  userLogin,
  verifyUser,
  myProfile,
  updateName,
  getUser,
  getAllUsers,
};
