import { useChatStore, type Message } from '@/lib/zustand/chatStore';
import { useChat } from 'ai/react';
import { useMemo, useRef, useState } from 'react';

function genSystemPrompt(vert: string, frag: string): string {
    return `
        You are a helpful assistant for a WebGL shader programmer. 
        The user is working on a program with the following shaders:

        Vertex Shader:
        ${vert}

        Fragment Shader:
        ${frag}

        Provide concise and helpful answers to their questions about the shaders, debugging, or WebGL concepts.
        Do not use markdown, all responses should be plaintext.
    `;
}

export function useProgramAI(programId: string, vertShader: string, fragShader: string) {
    const { chats, addMessage } = useChatStore(); // Zustand store
    const [isThinking, setThinking] = useState(0);
    const lastVertShader = useRef('');
    const lastFragShader = useRef('');

    // System prompt that includes the latest shader code
    const { messages, append, isLoading } = useChat({
        api: '/api/ai/chat',
        initialMessages: chats[programId] || [
            {
                id: 'user',
                role: 'user',
                context: genSystemPrompt(vertShader, fragShader),
                content: '',
            },
            {
                id: 'assistant',
                role: 'assistant',
                context: '',
                content: 'Hello! I\'m your AI powered code assistant, feel free to ask me any questions you have.'
            },
        ] satisfies Message[],
        onFinish: (message) => {
            // Save the AI's response to the Zustand store
            addMessage(programId, message as Message);
            setThinking(t => t - 1);
        },
    });

    const ask = async (question: string) => {
        let userMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            context: '',
            content: question,
        } as Message;

        let changed = false;
        if(vertShader !== lastVertShader.current) {
            lastVertShader.current = vertShader;
            changed = true;
        }
        if(fragShader !== lastFragShader.current) {
            lastFragShader.current = fragShader;
            changed = true;
        }

        if(changed) {
            // change system prompt
            userMessage.context = genSystemPrompt(lastVertShader.current, lastFragShader.current);
        }

        const actualUserMessage = {
            id: userMessage.id,
            role: userMessage.role,
            content: `System prompt: ${userMessage.context}\n\n${userMessage.content}`
        }

        // Save the user's question to the Zustand store
        addMessage(programId, userMessage);

        setThinking(t => t + 1);
        await append(actualUserMessage);
    };

    return { ask, messages: chats[programId] || messages, isLoading, isThinking };
}
