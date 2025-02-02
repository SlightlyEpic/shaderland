'use client';

import ShaderEditor from '@/components/my/workspace/ide/editor';
import { GLCanvas } from '@/components/my/workspace/ide/gl-canvas';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useCurrentWorkspace } from '@/hooks/useCurrentWorkspace';
import { useUpdateShader } from '@/lib/mutations/useMutateShader';
import { useWorkspace } from '@/lib/queries/useWorkspace';
import { defaultVertexShaderSource, defaultFragmentShaderSource } from '@/lib/util/defaultShaders';
import { useShaderStore } from '@/lib/zustand/store';
import { Loader, RefreshCcw, Save, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

type RouteParams = {
    workspaceId: string,
};

type WorkspacePageProps = {
    params: RouteParams,
};

export default function WorkspacePage({ params }: WorkspacePageProps) {
    const [_refreshCanvas, setRefreshCanvas] = useState(false);
    const saveShaderSource = useUpdateShader();

    const workspaceId = useCurrentWorkspace();
    const workspace = useWorkspace(workspaceId);

    const programId = useShaderStore(state => state.currentProgramId);
    const setCurrentShader = useShaderStore(state => state.setCurrentShader);
    const setCurrentProgramId = useShaderStore(state => state.setCurrentProgramId);
    const updateFragmentShader = useShaderStore(state => state.updateFragmentShader);
    const updateVertexShader = useShaderStore(state => state.updateVertexShader);
    const currentShader = useShaderStore(state => state.currentShader);

    const program = workspace?.data?.programs?.find(p => (p._id as unknown as string) === programId);
    const [shaderContent, setShaderContent] = useState<string>()
    
    useEffect(() => {
        currentShader === 'vertex'
            ? setShaderContent(program?.shaders.vertex.code)
            : setShaderContent(program?.shaders.fragment.code);
    }, [program, currentShader]);

    const refreshCanvas = useCallback(() => setRefreshCanvas(r => !r), []);
    const updateShaderSource = useCallback((source: string) => {
        if(!programId) return;
        if(currentShader === 'vertex') {
            updateVertexShader(programId, source);
            setShaderContent(source);
        } else {
            updateFragmentShader(programId, source);
            setShaderContent(source);
        }
    }, [programId, currentShader, updateFragmentShader, updateVertexShader]);

    useEffect(() => {
        setCurrentProgramId(null);
    }, []);

    useEffect(refreshCanvas, [programId]);

    return (
        <div className='flex flex-col w-full h-full'>
            <ResizablePanelGroup direction='horizontal'>
                <ResizablePanel defaultSize={50} className='h-full'>
                    <div className='w-full flex items-center gap-4 p-2'>
                        <div className='text-white/30'>
                            WebGL output
                        </div>
                        <Button className='group flex items-center ml-auto' size='sm' onClick={refreshCanvas}>
                            <RefreshCcw className='transition-transform duration-500 rotate-0 group-hover:rotate-180' /> 
                            Refresh output
                        </Button>
                    </div>
                    <GLCanvas
                        vertShaderSource={defaultVertexShaderSource}
                        fragShaderSource={defaultFragmentShaderSource}
                        refresh={_refreshCanvas}
                    />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50}>
                    <div className='w-full h-full max-h-[calc(100svh-var(--header-height))-1px]'>
                        <div className='flex h-12 border-b justify-end items-center'>
                            {programId && <>
                                <div className='mr-auto flex items-center px-2 gap-2'>
                                    <Button size='sm'>
                                        <Sparkles /> Explain with AI
                                    </Button>
                                    <Button size='sm' variant='ghost'>
                                        {
                                            saveShaderSource.isPending
                                                ? <><Loader className='animate-spin' /> Saving</>
                                                : <><Save /> Save</>
                                        }
                                    </Button>
                                </div>
                                <div 
                                    className={twMerge(
                                        'flex items-center px-4 w-max border-r cursor-pointer h-full',
                                        currentShader === 'vertex' ? 'bg-primary' : 'bg-secondary'
                                    )}
                                    onClick={() => setCurrentShader('vertex')}
                                >
                                    vertex.glsl
                                </div>
                                <div 
                                    className={twMerge(
                                        'flex items-center px-4 w-max border-r cursor-pointer h-full',
                                        currentShader === 'fragment' ? 'bg-primary' : 'bg-secondary'
                                    )}
                                    onClick={() => setCurrentShader('fragment')}
                                >
                                    fragment.glsl
                                </div>
                            </>}
                        </div>
                        <div className='overflow-y-scroll'>
                            <ShaderEditor
                                value={shaderContent!}
                                onChange={updateShaderSource}
                            />
                        </div>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}
