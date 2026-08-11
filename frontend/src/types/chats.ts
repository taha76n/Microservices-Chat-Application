import { Chat } from "./chat";
import { User } from "./user";

export interface Chats {
  _id: string;
  user: User;
  chat: Chat;
}
