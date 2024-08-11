import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SYSTEM_PROMPT } from '@/lib/prompts';
import { ChatMessage } from '@/lib/types';

interface ChatRequest {
    messages: ChatMessage[];
}

export async function POST(req: Request): Promise<NextResponse> {
    const openai = new OpenAI();
    const data: ChatRequest = await req.json();
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: SYSTEM_PROMPT
            },
            ...data.messages
        ],
        model: 'gpt-4o-mini',
        stream: true
    });

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content;
                    if (content) {
                        const text = encoder.encode(content);
                        controller.enqueue(text);
                    }
                }
            } catch (err) {
                controller.error(err);
            } finally {
                controller.close();
            }
        }
    });
    return new NextResponse(stream);
}
