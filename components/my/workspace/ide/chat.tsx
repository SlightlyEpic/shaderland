'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input'
import { useProgramAI } from '@/hooks/useProgramAI'
import { useShaderStore } from '@/lib/zustand/store'
import { useUser } from '@auth0/nextjs-auth0/client';
import { AvatarImage } from '@radix-ui/react-avatar';
import { Bot, User } from 'lucide-react';
import { KeyboardEvent, useCallback, useState } from 'react';
import { twMerge } from 'tailwind-merge';

type AIChatProps = {
    vertShader?: string,
    fragShader?: string,
}

export function AIChat(props: AIChatProps) {
    const { user } = useUser();
    const zProgramId = useShaderStore(state => state.currentProgramId);
    const zProgram = useShaderStore(state => zProgramId ? state.programs[zProgramId] : null);
    const { ask, messages, isLoading, isThinking } = useProgramAI(
        zProgramId ?? '', 
        zProgram?.vertexShader ?? '', 
        zProgram?.fragmentShader ?? ''
    );

    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        if(e.key === 'Enter') {
            setInputValue('');
            ask(inputValue)
        }
    }, [inputValue]);

    return (
        <div className='flex flex-col gap-2 w-full h-full focus:outline-none outline-none focus:border-transparent focus:ring-0'>
            <div className='flex flex-col gap-2 grow overflow-y-scroll focus:outline-none outline-none focus:border-transparent focus:ring-0'>
                {messages.filter(m => m.content).map((m, i) => (
                    <Alert key={i} className={twMerge('max-w-screen-md', m.role === 'assistant' ? 'self-start' : 'self-end')}>
                        {m.role === 'assistant'
                            ? <Bot />
                            : <User />
                        }
                        <AlertTitle>{m.role === 'assistant' ? 'Assistant' : 'You'}</AlertTitle>
                        <AlertDescription>
                            {m.content}
                        </AlertDescription>
                    </Alert>
                ))}
                {isThinking > 0 && (
                    <Alert className='max-w-screen-md self-start'>
                        <Bot />
                        <AlertTitle>Assistant</AlertTitle>
                        <AlertDescription>
                            <span className='animate-ping font-bold pl-1' style={{ animationDelay: '0ms' }}>• </span>
                            <span className='animate-ping font-bold' style={{ animationDelay: '200ms' }}>• </span>
                            <span className='animate-ping font-bold' style={{ animationDelay: '400ms' }}>• </span>
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            <Input 
                tabIndex={1}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder='Ask questions about your code'
                className='w-full rounded-md border focus:border-primary mt-auto mb-[5.5rem]'
                onKeyDown={handleKeyDown}
            />
        </div>
    )
}
