import { Message, useChat } from 'ai/react';
import { useMemo } from 'react';

// export function useAutocompleteAI({ onReply }: { onReply: (m: Message) => unknown }) {
export function useAutocompleteAI() {
    const { messages, append, isLoading, setMessages, reload } = useChat({
        api: '/api/ai/chat',
        initialMessages: [],
    })

    const autocomplete = async (shader: string, position: number) => {
        let line = '';
        let modShader = 'L1 ';
        let cursorLine = 1;
        let linePos = 0;
        for(let i = 0; i < position; i++) {
            if(shader[i] === '\n') {
                line = '';
                cursorLine++;
                linePos = 0;
            }
            else {
                line += shader[i];
                linePos++;
            }
        }

        console.log('line: ', line);

        let lineCount = 1;
        for(let i = 0; i < shader.length; i++) {
            modShader += shader[i];
            if(shader[i] === '\n') {
                lineCount++;
                modShader += `L${lineCount} `;
            }
        }

        const message = `
            Shader:
            ${modShader}

            Suggest an autocomplete for the line (Line number ${cursorLine}):
            ${line}

            Do not output any additional text, only output the autocompleted line in 1 sentence plaintext.
            Do not include the initial "L1" text. Try to preserve the indent of the line, if you cant figure out the indent then put 4 spaces before the line.
        `;
        // Only autocomplete after the words "${l.substring(Math.max(0, linePos - 10), linePos)}"
        console.log('system prompt: ', message);

        setMessages([
            {
                id: `autocomplete-${Date.now()}`,
                role: 'user',
                content: message,
            }
        ]);
        await reload();
        const newLine = messages.length ? messages[messages.length - 1] : null;
        console.log('newLine: ', newLine);

        if(!newLine) return shader;

        let lines = shader.split('\n');
        lines[cursorLine - 1] = newLine.content;
        const newShader = lines.join('\n');

        console.log('new shader:', newShader);

        return newShader;
    };

    return { autocomplete };
}
