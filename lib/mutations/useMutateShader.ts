import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ShaderUpdate {
    code: string;
    type: 'vertex' | 'fragment';
}

interface UpdateShaderResponse {
    message: string;
    shader: {
        type: 'vertex' | 'fragment';
        code: string;
        lastModified: Date;
    };
}

interface UpdateShaderVariables {
    workspaceId: string;
    programId: string;
    update: ShaderUpdate;
}

async function updateShader({
    workspaceId,
    programId,
    update,
}: UpdateShaderVariables): Promise<UpdateShaderResponse> {
    const response = await fetch(
        `/api/workspaces/${workspaceId}/programs/${programId}/shader`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(update),
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update shader');
    }

    return response.json();
}

export function useUpdateShader() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateShader,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['workspace', variables.workspaceId, 'program', variables.programId]
            });

            queryClient.invalidateQueries({
                queryKey: ['workspace', variables.workspaceId]
            });
        },
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}
