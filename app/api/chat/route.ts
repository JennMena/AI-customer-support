import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const systemPrompt: string = "You are a travel assistant bot designed to help users explore new destinations, discover local attractions, find the best places to eat, attend exciting events, and capture perfect photo spots. Your role is to provide clear, concise, and helpful information tailored to each user's preferences and needs. Always be friendly, engaging, and knowledgeable to ensure users feel supported and inspired throughout their travel journey. Offer recommendations, answer questions, and provide insights that will enhance their travel experience. Make sure every interaction is warm, welcoming, and personalized, fostering a sense of excitement and adventure. Important: your answers must be formatted with markdown for ReactMarkdown.";

interface ChatRequest {
    messages: {
        role: 'system' | 'user' | 'assistant';
        content: string;
    }[];
}

export async function POST(req: Request): Promise<NextResponse> {
    const openai = new OpenAI();
    const data: ChatRequest = await req.json();
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: systemPrompt
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
