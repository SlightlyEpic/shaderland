import { useAutocompleteAI } from '@/hooks/useAutocompleteAI';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as shiki from 'shiki';
import { twMerge } from 'tailwind-merge';

type ShaderEditorProps = {
    value?: string;
    onChange: (value: string) => void;
    className?: string;
};

function range(a: number, b: number): number[] {
    return new Array(b - a + 1).fill(0).map((_, i) => i + a);
}

const ShaderEditor: React.FC<ShaderEditorProps> = ({ value, onChange, className = '' }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [highlighter, setHighlighter] = useState<shiki.Highlighter | null>(null);

    const [cursorPosition, setCursorPosition] = useState<number>(0);
    const { autocomplete } = useAutocompleteAI();
    const [isCompleting, setIsCompleting] = useState(false);

    const lines = value?.split('\n')?.length ?? 1;

    // Initialize shiki
    useEffect(() => {
        shiki
            .getSingletonHighlighter({
                langs: ['glsl'],
                themes: ['dark-plus']
            })
            .then(setHighlighter)
            .catch(console.error);
    }, []);

    // Update highlighting
    useEffect(() => {
        if (highlighter && editorRef.current) {
            const highlighted = highlighter.codeToHtml(value ?? '', {
                lang: 'glsl',
                theme: 'dark-plus'
            });
            editorRef.current.innerHTML = highlighted;
        }
    }, [value, highlighter]);

    const doAutocompleteAI = useCallback(async () => {
        if(!textareaRef.current) return;
        setIsCompleting(true);
        console.log('do autocomplete');
        try {
            // await new Promise(r => setTimeout(r, 3000));
            const newShader = await autocomplete(value ?? '', textareaRef.current.selectionEnd || textareaRef.current.selectionStart);
            onChange(newShader);
        } catch(e) {
            console.error('Autocomplete failed:', e);
        } finally {
            setIsCompleting(false);
        }
    }, [value]);

    // Handle text input
    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
    };

    // Handle tab key
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if(e.ctrlKey && e.key === ' ') {
            doAutocompleteAI();
        }
        
        if (e.key === 'Tab' && value) {
            e.preventDefault();
            const target = e.target as HTMLTextAreaElement;
            const start = target.selectionStart;
            const end = target.selectionEnd;

            // Insert 2 spaces for tab
            const newValue = 
                value.substring(0, start) + 
                '    ' + 
                value.substring(end);

            onChange(newValue);
            
            // Reset cursor position
            requestAnimationFrame(() => {
                if (textareaRef.current) {
                    textareaRef.current.selectionStart = start + 4;
                    textareaRef.current.selectionEnd = start + 4;
                }
            });
        }
    };

    const handleButtonClick = (e: React.MouseEvent<HTMLTextAreaElement, MouseEvent>) => {
        if(textareaRef.current) {
            setCursorPosition(textareaRef.current.selectionStart);
        }
    };

    return (
        <div className={twMerge(`relative font-mono text-sm ${className}`, isCompleting && 'brightness-50')}>
            <style>{`
                .shader-editor {
                    margin: 0;
                    border: 0;
                    background: none;
                    box-sizing: inherit;
                    display: inherit;
                    font-family: inherit;
                    font-size: inherit;
                    font-style: inherit;
                    font-variant-ligatures: inherit;
                    font-weight: inherit;
                    letter-spacing: inherit;
                    line-height: inherit;
                    tab-size: inherit;
                    text-indent: inherit;
                    text-rendering: inherit;
                    text-transform: inherit;
                    white-space: pre-wrap;
                    word-break: keep-all;
                    overflow-wrap: break-word;
                    flex-grow: 1;
                }

                .shader-editor-textarea {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 100%;
                    width: 100%;
                    resize: none;
                    color: inherit;
                    overflow: hidden;
                    -moz-osx-font-smoothing: grayscale;
                    -webkit-font-smoothing: antialiased;
                    -webkit-text-fill-color: transparent;
                    caret-color: white;
                    flex-grow: 1;
                }

                .shader-editor-textarea:focus {
                    outline: none;
                }

                /* Override shiki pre styles */
                .shader-editor pre {
                    margin: 0 !important;
                    padding: 0rem !important;
                    background: transparent !important;
                    flex-grow: 1;
                }

                .shader-editor code {
                    background: transparent !important;
                    white-space: pre-wrap !important;
                    word-break: keep-all !important;
                    overflow-wrap: break-word !important;
                    flex-grow: 1;
                }
            `}</style>

            <div className='flex w-full h-full pr-4'>
                <div className='flex flex-col w-6 border-r select-none mr-2'>
                    {
                        range(1, lines).map(v => (
                            <div key={v} className='font-mono border-b flex justify-center items-center'>{v}</div>
                        ))
                    }
                </div>
                <div className={`relative font-mono text-sm ${className} grow`}>
                    <div 
                        ref={editorRef}
                        className="shader-editor bg-zinc-900 text-white overflow-auto select-none p-0 m-0 *:p-0"
                        aria-hidden="true"
                    />
                    <textarea
                        disabled={isCompleting}
                        ref={textareaRef}
                        value={value}
                        onChange={handleTextareaChange}
                        onKeyDown={handleKeyDown}
                        onClick={handleButtonClick}
                        spellCheck="false"
                        className="shader-editor-textarea bg-transparent"
                        autoCapitalize="off"
                        autoComplete="off"
                        autoCorrect="off"
                    />
                </div>
            </div>
        </div>
    );
};

export default ShaderEditor;
