"use client"

import { useState, useEffect, useRef } from "react";
import { SignedOut, SignedIn, SignInButton, UserButton } from '@clerk/nextjs'
import { db } from "../../../firebaseConfig";
import { collection, doc, addDoc, getDocs, query, orderBy, Timestamp, setDoc } from "firebase/firestore";
import { useUser } from "@clerk/nextjs";
import ChatArea from "@/components/ChatArea";
import Header from "@/app/_components/Header";
import HistoryArea from "@/components/HistoryArea";

export default function Chat() {

  ////This is temporary until I implement the fetching of the chats
  const [conversations, setConversations] = useState([
    { id: 1, title: 'Trip to Paris', lastMessage: '...' },
    { id: 2, title: 'New York', lastMessage: '...' },
    { id: 3, title: 'Exploring', lastMessage: '...' },
  ]);
  //////////////////////////

  const ref = useRef(null);

  const { user } = useUser();

  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hi! I'm your travel assistant, here to help you explore amazing destinations, discover the best places to eat, find exciting events, and capture the best photo spots. Where are you planning to go, and how can I assist you today?`
  }]);

  const [message, setMessage] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  useEffect(() => {
    const createNewConversation = async () => {
      if (user && !currentConversationId) { // Check if the user is authenticated and there's no active conversation

        const chatsRef = collection(db, "chats");

        const conversationId = `${user.id}_${Timestamp.now().toDate().toISOString()}`; // Generate ID based on user ID and timestamp
        const conversationDocRef = doc(chatsRef, conversationId);

        await setDoc(conversationDocRef, {
          userId: user.id,
          conversationId: conversationId,
          createdAt: Timestamp.now(),
        });

        setCurrentConversationId(conversationDocRef.id);
      }
    };

    createNewConversation();
  }, [user]);


  const sendMessages = async () => {

    if (!message.trim() || !currentConversationId) {
      setMessage('');
      return; //TO DO: send a toast warning 
    }

    const userMessage = {
      role: 'user',
      content: message,
      createdAt: Timestamp.now(),
    };

    setMessages((prevMessages) => [
      ...prevMessages,
      userMessage,
      { role: 'assistant', content: '' }
    ]);

    setMessage('');

    // Send the user's message to the API endpoint for processing
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: [...messages, userMessage] }),
    });

    if (!response.ok) {
      console.error('Error in response:', response.statusText);
      return;
    }

    const reader = response.body?.getReader(); // Create a reader to process the streamed response
    const decoder = new TextDecoder(); // Create a decoder to convert the streamed response into text
    let assistantResponse = '';

    if (reader) {
      await reader.read().then(function processText({ done, value }) {
        if (done) {
          return assistantResponse; // Return the final result when done
        }
        const text = decoder.decode(value || new Uint8Array(), { stream: true }); // Decode the streamed response
        assistantResponse += text; // Accumulate the response text
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[updatedMessages.length - 1] = {
            role: 'assistant',
            content: assistantResponse // Update the last message with the accumulated text
          };
          return updatedMessages;
        });
        return reader.read().then(processText); // Continue reading the next chunk of the response
      });
    }

    // Save the user and assistant messages to Firestore
    if (user && currentConversationId) {
      const conversationDocRef = doc(db, "chats", currentConversationId);
      const messagesRef = collection(conversationDocRef, "messages");

      await addDoc(messagesRef, userMessage);

      const assistantMessage = {
        role: 'assistant',
        content: assistantResponse,
        createdAt: Timestamp.now(),
      };
      await addDoc(messagesRef, assistantMessage);
    }
  };

  return (
    <div>
      <Header />
      <div className="flex flex-col md:flex-row w-full" style={{ height: 'calc(100vh - 4rem)' }}>
        <div className="hidden md:block md:w-1/3 mt-10 md:mt-0 bg-gray-100 dark:bg-slate-800 p-4 rounded-sm overflow-y-auto">
          <HistoryArea conversations={conversations} onSelectConversation={handleSelectConversation} user={user} />
        </div>
        <div className="md:w-2/3 lg:w-3/4 w-full">
          <ChatArea
            message={message}
            messages={messages}
            setMessage={setMessage}
            sendMessages={sendMessages}
            ref={ref}
          />
        </div>
      </div>
    </div>


  );
}
