import mongoose, { Document, Schema } from "mongoose";

export interface IChat extends Document {
  users: string[];
  latestMessage: {
    text: string;
    sender: string;
  };

  updatedAt: Date;
  createdAt: Date;
}

const chatSchema: Schema<IChat> = new mongoose.Schema(
  {
    users: [
      {
        type: String,
        required: true,
      },
    ],
    latestMessage: {
      text: String,
      sender: String,
    },
  },
  { timestamps: true }
);

export const Chat = mongoose.model<IChat>("Chat", chatSchema);
