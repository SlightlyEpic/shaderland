import { useParams } from 'next/navigation';

export function useCurrentWorkspace(): string | null {
    const params = useParams();
    console.log('params: ', params);

    const workspaceId = params?.workspaceId;

    if (Array.isArray(workspaceId)) {
        return workspaceId[0] || null;
    }

    return workspaceId || null;
}
