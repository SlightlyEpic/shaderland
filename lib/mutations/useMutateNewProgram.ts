import { useMutation, useQueryClient } from '@tanstack/react-query';

interface NewProgramResponse {
    id: string,
    name: string,
    description?: string,
}

interface NewProgramVariables {
    workspaceId?: string;
    name: string;
    description?: string;
}

async function createNewProgram(vars: NewProgramVariables): Promise<NewProgramResponse> {
    if(!vars.workspaceId) throw new Error('Workspace id not provided');
    
    const response = await fetch(
        `/api/workspaces/${vars.workspaceId}/programs`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: vars.name,
                description: vars.description,
            }),
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create workspace');
    }

    return response.json();
}

export function useNewProgramMutation(workspaceId?: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createNewProgram,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['workspaces', workspaceId]
            });
        },
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}
