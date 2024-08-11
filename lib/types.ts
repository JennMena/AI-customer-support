import { Timestamp } from "firebase/firestore";

export type MessageRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  content: string;
  role: MessageRole;
  createdAt?: Timestamp;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
}
