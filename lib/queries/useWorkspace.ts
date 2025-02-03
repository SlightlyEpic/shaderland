import { useQuery } from '@tanstack/react-query';
import { IWorkspace } from '../models';
import { useShaderStore } from '../zustand/store';
import { useEffect } from 'react';

async function fetchWorkspaces(workspaceId: string): Promise<IWorkspace> {
    const response = await fetch(`/api/workspaces/${workspaceId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch workspaces');
    }
    return response.json();
}

export function useWorkspace(workspaceId?: string) {
    const setProgram = useShaderStore(state => state.setProgram);

    const q = useQuery<IWorkspace | null, Error>({
        queryKey: ['workspaces', workspaceId],
        queryFn: () => workspaceId ? fetchWorkspaces(workspaceId) : null,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 60,
        retry: 3,
    });

    useEffect(() => {
        if(q.isSuccess && q.data) {
            for(let p of q.data.programs) {
                setProgram({
                    id: p._id as unknown as string,
                    name: p.name,
                    lastModified: Date.now(),
                    vertexShader: p.shaders.vertex.code,
                    fragmentShader: p.shaders.fragment.code,
                });
            }
        }
    }, [q.isSuccess, setProgram]);

    return q;
}
