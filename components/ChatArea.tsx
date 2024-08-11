import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontalIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useUser } from "@clerk/nextjs";
import ReactMarkdown from 'react-markdown';

export default function ChatArea({
    message,
    messages,
    setMessage,
    sendMessages,
}: {
    message: string;
    messages: { role: string; content: string }[];
    setMessage: (message: string) => void;
    sendMessages: () => Promise<void>;
}) {

    const { user } = useUser();
    const userImage = user?.imageUrl;

    return (
        <div className="text-zinc-700">
            <div className="container flex mt-5 flex-col items-center justify-center">
                
                <div className="mt-4 w-full max-w-[650px]">
                    {/* response container */}
                    <ScrollArea
                        className="mb-2 h-[550px] rounded-md border p-4 flex flex-col space-y-2 flex-grow overflow-auto max-h-full"
                    >
                        {messages.map((m, index) => (
                            <div
                                key={index}
                                className={`flex items-center space-x-3 ${m.role === 'assistant' ? 'justify-start' : 'justify-end'
                                    }`}
                            >
                                {m.role === 'assistant' && (
                                    <Avatar>
                                        <AvatarImage src='' />
                                        <AvatarFallback className="bg-light_green text-white">WT</AvatarFallback>
                                    </Avatar>
                                )}

                                <div
                                    className={`border-2 border-opacity-50 ${m.role === 'assistant' ? 'border-dark_green' : 'border-blue-800'} text-black rounded-lg p-3 max-w-xs mt-2`}
                                >
                                    <ReactMarkdown>
                                        {m.content}
                                    </ReactMarkdown>
                                </div>

                                {m.role === 'user' && (
                                    <Avatar>
                                        <AvatarImage src={userImage} />
                                        <AvatarFallback className="text-sm">U</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                    </ScrollArea>
                </div>
                {/* input form */}
                <div className="relative mt-1 w-full max-w-[600px]">
                    <Input
                        value={message}
                        placeholder="Ask me anything..."
                        className="pr-12 placeholder:italic placeholder:text-zinc-600 w-full"
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault(); 
                                sendMessages(); 
                            }
                        }}
                    />
                    <Button
                        size="icon"
                        type="button"
                        variant="secondary"
                        className="absolute right-1 top-1 h-8 w-10"
                        onClick={sendMessages}
                    >
                        <SendHorizontalIcon className="h-5 w-5 text-emerald-500" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
