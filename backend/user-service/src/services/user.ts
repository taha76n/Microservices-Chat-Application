import { publishToQueue } from "../configs/rabbitmq.js";
import { redisClient } from "../configs/redis.js";
import crypto from "node:crypto";
import { User } from "../model/user.js";
import { generateToken } from "../utils/generateToken.js";
import { BadRequestError, TooManyRequestsError, UnauthorizedError } from "../utils/error.js";

const userLogin = async (email: string) => {
  const rateLimitKey = `otp:email:${email}`;

  const rateLimit = await redisClient.get(rateLimitKey);

  if (rateLimit) {
    throw new TooManyRequestsError("Too many requests. please wait before requesting new otp");
  }

  const otp = crypto.randomInt(10000, 1000000).toString();

  const otpKey = `otp:${email}`;

  await redisClient.set(otpKey, otp, { EX: 300 });

  await redisClient.set(rateLimitKey, "", { EX: 60 });

  const message = {
    to: email,
    subject: "Your otp code",
    body: `Your otp is ${otp}. It is valid for 5 minutes`,
  };

  publishToQueue("send-otp", message);

  return otp;
};

const verifyUser = async (otp: string, email: string) => {
  const rateLimitKey = `otp:verify:${email}`;

  const rateLimit = await redisClient.get(rateLimitKey);

  if (rateLimit) {
    throw new TooManyRequestsError("Too many requests. please wait before requesting new otp");
  }

  const otpKey = `otp:${email}`;

  const savedOtpKey = await redisClient.get(otpKey);

  if (!savedOtpKey || otp !== savedOtpKey) {
    throw new BadRequestError("Invalid or Expired Otp");
  }

  await redisClient.del(otpKey);

  const doesUserExists = await User.findOne({ email });

  if (!doesUserExists) {
    const user = await User.create({
      userName: email.slice(0, 7),
      email,
    });

    const token = generateToken(user);

    await redisClient.set(rateLimitKey, "true", { EX: 60 });
    return { user, token };
  }

  const token = generateToken(doesUserExists);

  return { doesUserExists, token };
};

const updateName = async (userId: any, userName: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new UnauthorizedError("Please Login");
  }

  user.userName = userName;

  user.save();

  const token = generateToken(user);

  return { token, user };
};

export const userService = {
  userLogin,
  verifyUser,
  updateName,
};
