import { useMutation, useQueryClient } from '@tanstack/react-query';

interface MutateWorkspaceResponse {
    message: string,
}

interface MutateWorkspaceVariables {
    id: string;
}

async function deleteWorkspace(vars: MutateWorkspaceVariables): Promise<MutateWorkspaceResponse> {
    const response = await fetch(
        `/api/workspaces/${vars.id}`,
        {
            method: 'DELETE',
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete shader');
    }

    return response.json();
}

export function useDeleteWorkspaceMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteWorkspace,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['workspace-names']
            });
        },
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}
