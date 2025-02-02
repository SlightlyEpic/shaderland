import { useMutation, useQueryClient } from '@tanstack/react-query';

interface NewWorkspaceResponse {
    id: string,
    name: string,
    description?: string,
}

interface NewWorkspaceVariables {
    name: string;
    description?: string;
}

async function createNewWorkspace(bodyData: NewWorkspaceVariables): Promise<NewWorkspaceResponse> {
    const response = await fetch(
        `/api/workspaces`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyData),
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create workspace');
    }

    return response.json();
}

export function useNewWorkspaceMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createNewWorkspace,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['workspace-names']
            });
        },
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}
