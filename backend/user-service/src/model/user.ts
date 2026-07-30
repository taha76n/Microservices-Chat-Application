import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
  userName: string;
  email: string;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
