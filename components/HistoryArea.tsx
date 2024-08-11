import React from 'react';
import { useUser } from "@clerk/nextjs";

type UserResource = ReturnType<typeof useUser>["user"];

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  user: UserResource;
}

const HistoryArea: React.FC<ConversationListProps> = ({ conversations, onSelectConversation, user}) => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">History of chats</h2>
      <h4 className="text-[15px] font-medium mb-5">Hi {user?.firstName}! Here are your past conversations.</h4>
      <ul className="space-y-2">
        {conversations.map((conversation) => (
          <li key={conversation.id} className="cursor-pointer">
            <button
              className="w-full p-3 rounded-lg bg-white dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-left"
              onClick={() => onSelectConversation(conversation.id)}
            >
              <h3 className="font-medium text-gray-800 dark:text-gray-100">{conversation.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{conversation.lastMessage}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryArea;
