import { useQuery } from '@tanstack/react-query';
import { IWorkspace } from '../models';

async function fetchWorkspaces(workspaceId: string): Promise<IWorkspace> {
    const response = await fetch(`/api/workspaces/${workspaceId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch workspaces');
    }
    return response.json();
}

export function useWorkspace(workspaceId?: string) {
    return useQuery<IWorkspace | null, Error>({
        queryKey: ['workspaces', workspaceId],
        queryFn: () => workspaceId ? fetchWorkspaces(workspaceId) : null,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 60,
        retry: 3,
    });
}
