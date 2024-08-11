"use client"
import { useState, useEffect, useRef } from "react";
import { SignedOut, SignedIn, SignInButton, UserButton } from '@clerk/nextjs'
import { db } from "../../../firebaseConfig";
import { collection, doc, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { useUser } from "@clerk/nextjs";
import ChatArea from "@/components/ChatArea";
import Header from "@/app/_components/Header";


export default function Home() {

  const ref = useRef(null);

  const { user } = useUser();
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hi! I'm your assistant to guide you in your international application to US colleges. Tell me about your journey, what is your dream school and where are you applying from?`
  }]);

  const [message, setMessage] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (user && !currentConversationId) {
        const conversationsRef = collection(db, "chats", user.id, "conversations");
        const conversationDoc = await addDoc(conversationsRef, {
          createdAt: Timestamp.now(),
          userdId: user.id,
        });
        setCurrentConversationId(conversationDoc.id);

        const messagesRef = collection(db, "chats", user.id, "conversations", conversationDoc.id, "messages");
        const messagesQuery = query(messagesRef, orderBy("createdAt"));
        const messagesSnapshot = await getDocs(messagesQuery);
        const messagesList = messagesSnapshot.docs.map(doc => doc.data());
        setMessages(messagesList.length ? messagesList : messages);
      }
    };

    fetchMessages();
  }, [user]);

  const sendMessages = async () => {
    console.log(messages)
    if (!message.trim() || !currentConversationId) return;

    const userMessage = {
      role: 'user',
      content: message,
      createdAt: Timestamp.now(),
    };

    // Update local state to include the user's message
    setMessages((prevMessages) => [
      ...prevMessages,
      userMessage,
      { role: 'assistant', content: '' }
    ]);

    setMessage('');

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

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let result = '';

    if (reader) {
      await reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Uint8Array(), { stream: true });
        setMessages((prevMessages) => {
          let lastMessage = prevMessages[prevMessages.length - 1];
          let otherMessages = prevMessages.slice(0, prevMessages.length - 1);
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text
            },
          ];
        });
        return reader.read().then(processText);
      });
    }


  // Save the user and assistant messages to Firestore
  if (user && currentConversationId) {
    const conversationDocRef = doc(db, "chats", currentConversationId);
    const messagesRef = collection(conversationDocRef, "messages");

    // Save the user message
    await addDoc(messagesRef, userMessage);

    // Save the assistant message with the completed response
    const assistantMessage = {
      role: 'assistant',
      content: result,
      createdAt: Timestamp.now(),
    };
    await addDoc(messagesRef, assistantMessage);
  }
  };

  return (
    <div>
      <Header/>
      <ChatArea message={message}
        messages={messages}
        setMessage={setMessage}
        sendMessages={sendMessages}
        ref={ref}
      ></ChatArea>
    </div>
  );

}