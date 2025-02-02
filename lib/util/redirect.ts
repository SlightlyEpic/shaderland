import { redirect } from 'next/navigation';
import { useShaderStore } from '../zustand/store';
import { useCurrentWorkspace } from '@/hooks/useCurrentWorkspace';

export function useChangeWorkspace() {
    const setCurrentProgramId = useShaderStore(store => store.setCurrentProgramId);

    return (wid: string) => {
        setCurrentProgramId(null);
        redirect(`/app/${wid}`);
    }
}

export function useChangeProgram() {
    const setCurrentProgramId = useShaderStore(store => store.setCurrentProgramId);
    const wid = useCurrentWorkspace();

    return (pid: string) => {
        setCurrentProgramId(pid);
    }
}
