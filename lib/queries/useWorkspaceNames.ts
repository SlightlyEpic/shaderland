import { useQuery } from '@tanstack/react-query';

interface Workspace {
    id: string;
    name: string;
    description?: string;
}

async function fetchWorkspaces(): Promise<Workspace[]> {
    const response = await fetch('/api/workspaces/list');
    if (!response.ok) {
        throw new Error('Failed to fetch workspaces');
    }
    return response.json();
}

export function useWorkspaceNames() {
    return useQuery<Workspace[], Error>({
        queryKey: ['workspaces'],
        queryFn: fetchWorkspaces,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 60,
        retry: 3,
        select: (data) => data.sort((a, b) => a.name.localeCompare(b.name)),
    });
}
