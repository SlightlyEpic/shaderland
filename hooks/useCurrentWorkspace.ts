import { useParams } from 'next/navigation';

export function useCurrentWorkspace(): string | undefined {
    const params = useParams();
    
    const workspaceId = params?.workspaceId;

    if (Array.isArray(workspaceId)) {
        return workspaceId[0];
    }

    return workspaceId;
}
