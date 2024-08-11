import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontalIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useUser } from "@clerk/nextjs";

export default function ChatArea({
    message,
    messages,
    setMessage,
    sendMessages,
    ref,
}: {
    message: string;
    messages: { role: string; content: string }[];
    setMessage: (message: string) => void;
    sendMessages: () => Promise<void>;
    ref: React.RefObject<HTMLDivElement>;
}) {

    const { user } = useUser();
    const userImage = user?.imageUrl;

    return (
        <section className="text-zinc-700">
            <div className="container flex mt-4 flex-col items-center justify-center">
                {/*<h1 className="font-serif text-2xl font-medium">Hi {user?.firstName}! Ready to plan your trip?</h1>*/}
                <div className="mt-4 w-full max-w-lg">
                    {/* response container */}
                    <ScrollArea
                        className="mb-2 h-[550px] rounded-md border p-4 flex flex-col space-y-2 flex-grow overflow-auto max-h-full"
                        ref={ref}
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
                                        <AvatarFallback className="bg-emerald-500 text-white">WT</AvatarFallback>
                                    </Avatar>
                                )}

                                <div
                                    className={`${m.role === 'assistant' ? 'bg-blue-500' : 'bg-green-500'
                                        } text-white rounded-lg p-3 max-w-xs mt-2`}
                                >
                                    {m.content}
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
                <div className="relative w-full max-w-lg">
                    <Input
                        value={message}
                        placeholder="Ask me anything..."
                        className="pr-12 placeholder:italic placeholder:text-zinc-600 w-full"
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button
                        size="icon"
                        type="button"
                        variant="secondary"
                        /*disabled={isLoading}*/
                        className="absolute right-1 top-1 h-8 w-10"
                        onClick={sendMessages}
                    >
                        <SendHorizontalIcon className="h-5 w-5 text-emerald-500" />
                    </Button>
                </div>
            </div>
        </section>
    );
}
