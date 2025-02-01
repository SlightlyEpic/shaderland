import { useQuery } from '@tanstack/react-query';
import { IWorkspace } from '../models';

async function fetchWorkspaces(workspaceId: string): Promise<IWorkspace> {
    const response = await fetch(`/api/workspaces/${workspaceId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch workspaces');
    }
    return response.json();
}

export function useWorkspace(workspaceId: string) {
    return useQuery<IWorkspace, Error>({
        queryKey: ['workspaces', workspaceId],
        queryFn: () => fetchWorkspaces(workspaceId),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 60,
        retry: 3,
    });
}
