import { create } from 'zustand';

// Define the type for a single message
export type Message = {
    id: string;
    context: string;
    role: 'user' | 'assistant';
    content: string;
};

// Define the type for the chat state
type ChatState = {
    // Map programId to its chat messages
    chats: Record<string, Message[]>;

    // Add a message to a specific program's chat
    addMessage: (programId: string, message: Message) => void;

    // Clear the chat for a specific program
    clearChat: (programId: string) => void;
};

// Create the Zustand store
export const useChatStore = create<ChatState>((set) => ({
    // Initialize chats as an empty object
    chats: {},

    // Add a message to a specific program's chat
    addMessage: (programId, message) =>
        set((state) => {
            let prevMessages = state.chats[programId];
            if (!prevMessages) {
                prevMessages = [
                    {
                        id: 'assistant',
                        context: '',
                        role: 'assistant',
                        content: 'Hello! I\'m your AI powered code assistant, feel free to ask me any questions you have.'
                    },
                ]
            };

            return {
                chats: {
                    ...state.chats,
                    [programId]: [...(prevMessages), message],
                },
            }
        }),

    // Clear the chat for a specific program
    clearChat: (programId) =>
        set((state) => ({
            chats: {
                ...state.chats,
                [programId]: [],
            },
        })),
}));
