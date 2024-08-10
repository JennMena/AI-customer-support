import React from 'react';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const systemPrompt: string = "You are a customer support bot designed to assist college students in navigating the application process for universities in the United States. Your role is to provide clear, concise, and helpful information regarding application requirements, deadlines, financial aid, and any other inquiries students may have. Always be friendly, patient, and encouraging to help students feel supported throughout their journey.";

interface ChatRequest {
    messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
    }>;
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
