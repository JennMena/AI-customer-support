"use client"
import { useState } from "react";
import { SignedOut, SignedIn, SignInButton, UserButton } from '@clerk/nextjs'

export default function Home() {

  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hi! I'm your assistant to guide you in your international application to US colleges. Tell me about your journey, what is your dream school and where are you applying from?`
  }]);

  const [message, setMessage] = useState('');

  const sendMessages = async () => {
    if (!message.trim()) return;
    setMessages((prevMessages) => 
      [
        ...prevMessages,
        { role: 'user', content: message },
        { role: 'assistant', content: '' }
      ]
    );
    setMessage('');
    const response = await fetch('api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: [...messages, { role: 'user', content: message }] }), 
    });

    if (!response.ok) {
      console.error('Error in response:', response.statusText);
      return; // Handle error response
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    let result = '';
    if (reader) {
      return reader.read().then(function processText({ done, value }: { done: boolean; value?: Uint8Array }): string | Promise<string> {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Uint8Array(), { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return ([
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text
            },
          ]);
        });
        return reader.read().then(processText);
      });
    }
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <UserButton/>
      <div className="flex flex-col w-[600px] h-[700px] border border-black p-2 space-y-2">
        
        <div className="flex flex-col space-y-2 flex-grow overflow-auto max-h-full">
          {
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex justify-${msg.role === 'assistant' ? 'start' : 'end'}`}
              >
                <div
                  className={`bg-${msg.role === 'assistant' ? 'blue-500' : 'green-500'} text-white rounded-lg p-3`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          }
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            className="border border-gray-300 rounded-lg p-2 flex-grow"
            placeholder="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)} />
          <button className="bg-blue-500 text-white rounded-lg px-4 py-2" onClick={sendMessages}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}