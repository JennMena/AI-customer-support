"use client"

import { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { AlertCircle } from "lucide-react";
import { collection, doc, addDoc, getDocs, query, where, orderBy, Timestamp, setDoc, limit, deleteDoc } from "firebase/firestore";
import { useUser } from "@clerk/nextjs";
import { db } from "../../../firebaseConfig";
import ChatArea from "@/components/ChatArea";
import Header from "@/app/_components/Header";
import HistoryArea from "@/components/HistoryArea";
import { ChatMessage, Conversation } from "@/lib/types";
import { FirebaseCollection } from "@/lib/enums";
import { ERROR_ASSISTANT_MESSAGE, INITIAL_ASSISTANT_MESSAGE } from "@/lib/constants";


export default function Chat() {

  const { user } = useUser();

  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [message, setMessage] = useState('');

  const [isLoading, setIsLoading] = useState(false)

  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    if (currentConversationId !== conversationId) {
      changeConversation(conversationId);
      fetchHistory();
    }
  };

  const createNewConversation = async () => {
    if (user && !currentConversationId) { // Check if the user is authenticated and there's no active conversation
      const chatsRef = collection(db, FirebaseCollection.CHATS);
      const conversationId = `${user.id}_${Timestamp.now().toDate().toISOString()}`; // Generate ID based on user ID and timestamp
      const conversationDocRef = doc(chatsRef, conversationId);

      await setDoc(conversationDocRef, {
        userId: user.id,
        conversationId: conversationId,
        createdAt: Timestamp.now(),
      });
      setCurrentConversationId(conversationDocRef.id);
      fetchHistory();
      const initialAssistantMessage: ChatMessage = {
        role: 'assistant',
        content: INITIAL_ASSISTANT_MESSAGE,
        createdAt: Timestamp.now(),
      };
      setMessages( [initialAssistantMessage]);
      await saveMessage(initialAssistantMessage);
    }
  };

  useEffect(() => {
    if (user) {
      createNewConversation();
      fetchHistory();
    }
  }, [user]);

  const saveMessage = async (message: ChatMessage) => {
    if (user && currentConversationId) {
      const conversationDocRef = doc(db, FirebaseCollection.CHATS, currentConversationId);
      const messagesRef = collection(conversationDocRef, FirebaseCollection.MESSAGES);
      await addDoc(messagesRef, message);
    }
  };

  const sendMessages = async () => {
    if (isLoading) {
      return;
    }

    if (!message.trim() || !currentConversationId) {
      setMessage('');
      toast.custom((t) => (
        <div
          className={`${t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-sm bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg shadow-lg`}
          style={{ animationDuration: '1s' }}
        >
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-800" />
            <div className="ml-2">
              Oops! It looks like you forgot to type something.
            </div>
          </div>
        </div>
      ), { duration: 1500 });
      return;
    }

    const userMessage: ChatMessage = {
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
    setIsLoading(true);

    try {
      // Send the user's message to the API endpoint for processing
      const response = await fetch('/api/kb/retrieve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        //body: JSON.stringify({ messages: [...messages, userMessage] }),
        body: JSON.stringify({ question: userMessage.content }),
      });

      if (!response.ok) {
        toast.error('Failed to send the message.');
        console.error('Error:', response.statusText);
        return;
      }

      const reader = response.body!.getReader(); // Create a reader to process the streamed response
      const decoder = new TextDecoder(); // Create a decoder to convert the streamed response into text
      let assistantResponse = '';

      // Process the text from the response
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true }); // Decode the streamed response
        assistantResponse += text;
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];  // Get the last message (assistant's placeholder)
          let otherMessages = messages.slice(0, messages.length - 1);  // Get all other messages
          return [
            ...otherMessages,
            { ...lastMessage, content: assistantResponse },  // Append the decoded text to the assistant's message
          ]
        })
      }
      
      // Save the user and assistant messages to Firestore
      await saveMessage(userMessage);
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: assistantResponse,
        createdAt: Timestamp.now(),
      };
      await saveMessage(assistantMessage);
    } catch (error) {
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: ERROR_ASSISTANT_MESSAGE,
        createdAt: Timestamp.now(),
      };
      setMessages((messages) => [
        ...messages,
        assistantMessage
      ]);
      await saveMessage(assistantMessage);
      console.error('Error:', error);
    }

    setIsLoading(false);
  };

  //Fetch user chats
  const fetchHistory = async () => {
    const chatsRef = collection(db, FirebaseCollection.CHATS);
    const q = query(chatsRef,
      where('userId', '==', user?.id),
      orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    let history = [];

    for (const conversation of querySnapshot.docs) {
      const conversationId = conversation.id;
      const conversationData = conversation.data();

      // Fetch the last message
      const messagesRef = collection(db, FirebaseCollection.CHATS, conversationId, FirebaseCollection.MESSAGES);
      const lastMessageQuery = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
      const lastMessageSnapshot = await getDocs(lastMessageQuery);

      let lastMessage = 'No messages';
      if (!lastMessageSnapshot.empty) {
        lastMessage = lastMessageSnapshot.docs[0].data().content;
      }

      const createdAtDate = conversationData.createdAt.toDate();
      const formattedDate = createdAtDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });

      history.push({
        id: conversationId,
        title: `Chat of ${formattedDate}`,
        lastMessage: lastMessage,
      });
    }

    setConversations(history);
  };

  const onDeleteConversation = async (id: string) => {
    try {
      await deleteDoc(doc(db, FirebaseCollection.CHATS, id));

      setConversations((prevConversations) =>
        prevConversations.filter((conversation) => conversation.id !== id)
      );

      toast.success("Conversation deleted successfully.");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete the conversation.");
    }
  };

  const changeConversation = async (id: string) => {
    const messagesRef = collection(db, FirebaseCollection.CHATS, id, FirebaseCollection.MESSAGES);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    const querySnapshot = await getDocs(q);

    const conversationMessages = querySnapshot.docs.map((doc) => ({
      role: doc.data().role,
      content: doc.data().content,
    }));

    setMessages(conversationMessages);
  };



  return (
    <div>
      <Header/>
      <div className="flex flex-col md:flex-row w-full" style={{ height: 'calc(100vh - 4rem)' }}>
        <div className="hidden md:block md:w-1/3 mt-10 md:mt-0 bg-gray-100 dark:bg-slate-800 p-4 rounded-sm overflow-y-auto">
          <HistoryArea conversations={conversations}
            onSelectConversation={handleSelectConversation}
            onDeleteConversation={onDeleteConversation}
            currentConversationId={currentConversationId}
            user={user} />
        </div>
        <div className="md:w-2/3 lg:w-3/4 w-full">
          <ChatArea
            message={message}
            messages={messages}
            setMessage={setMessage}
            sendMessages={sendMessages}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
