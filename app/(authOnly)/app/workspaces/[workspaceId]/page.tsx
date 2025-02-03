'use client';

import { AIChat } from '@/components/my/workspace/ide/chat';
import ShaderEditor from '@/components/my/workspace/ide/editor';
import { GLCanvas } from '@/components/my/workspace/ide/gl-canvas';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCurrentWorkspace } from '@/hooks/useCurrentWorkspace';
import { useUpdateShader } from '@/lib/mutations/useMutateShader';
import { useWorkspace } from '@/lib/queries/useWorkspace';
import { useShaderStore } from '@/lib/zustand/store';
import { TabsContent } from '@radix-ui/react-tabs';
import { Bot, Loader, RefreshCcw, Save, Space, Sparkles, Terminal } from 'lucide-react';
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

    const [enableTimeUniform, setEnableTimeUniform] = useState(true);
    const [enableMouseUniform, setEnableMouseUniform] = useState(false);

    const workspaceId = useCurrentWorkspace();
    const workspace = useWorkspace(workspaceId);

    const shaderErrors = useShaderStore(state => state.shaderOutput);

    const programId = useShaderStore(state => state.currentProgramId);
    const setCurrentShader = useShaderStore(state => state.setCurrentShader);
    const setCurrentProgramId = useShaderStore(state => state.setCurrentProgramId);
    const updateFragmentShader = useShaderStore(state => state.updateFragmentShader);
    const updateVertexShader = useShaderStore(state => state.updateVertexShader);
    const currentShader = useShaderStore(state => state.currentShader);

    // const program = workspace?.data?.programs?.find(p => (p._id as unknown as string) === programId);
    const zProgram = useShaderStore(state => programId ? state.programs[programId] : null);
    const [shaderContent, setShaderContent] = useState<string>()

    useEffect(() => {
        currentShader === 'vertex'
            ? setShaderContent(zProgram?.vertexShader)
            : setShaderContent(zProgram?.fragmentShader);
    }, [zProgram, currentShader]);

    const refreshCanvas = useCallback(() => setRefreshCanvas(r => !r), []);
    const updateShaderSource = useCallback((source: string) => {
        if (!programId) return;
        if (currentShader === 'vertex') {
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

    const { ask, elm: AIChatElm } = AIChat({
        vertShader: zProgram ? (zProgram.vertexShader ?? '') : '',
        fragShader: zProgram ? (zProgram.fragmentShader ?? '') : '',
    });

    const explainWithAI = useCallback(() => {
        ask('Can you explain how both of my shaders work?');
    }, [ask]);

    return (
        <div className='flex flex-col w-full h-full'>
            <ResizablePanelGroup direction='horizontal'>
                <ResizablePanel defaultSize={50} className='h-full'>
                    <div className='w-full flex items-center border-b'>
                        {/* <div className='text-white/30 p-3'>
                            WebGL output
                        </div> */}

                        <div className='flex items-center gap-2 text-sm border-x p-3'>
                            <Switch checked={enableTimeUniform} onCheckedChange={setEnableTimeUniform} />
                            u_time
                        </div>
                        <div className='flex items-center gap-2 text-sm border-x p-3'>
                            <Switch checked={enableMouseUniform} onCheckedChange={setEnableMouseUniform} />
                            u_mouse
                        </div>

                        <Button className='group flex items-center ml-auto mr-2' size='sm' onClick={refreshCanvas}>
                            <RefreshCcw className='transition-transform duration-500 rotate-0 group-hover:rotate-180' />
                            Refresh output
                        </Button>
                    </div>
                    <GLCanvas
                        vertShaderSource={zProgram?.vertexShader}
                        fragShaderSource={zProgram?.fragmentShader}
                        refresh={_refreshCanvas}
                        mouseUniform={enableMouseUniform}
                        timeUniform={enableTimeUniform}
                    />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50}>
                    <div className='w-full h-full max-h-[calc(100svh-var(--header-height))-1px]'>
                        <div className='flex h-12 border-b justify-end items-center'>
                            {programId && <>
                                <div className='mr-auto flex items-center px-2 gap-2'>
                                    <Button size='sm' onClick={explainWithAI}>
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
                                <div className='text-muted-foreground text-sm mr-2 select-none'>
                                    {/* Ctrl+<Space className='inline' /> for AI autocomplete */}
                                    Ctrl+Space for AI autocomplete
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
                        <ResizablePanelGroup direction='vertical'>
                            <ResizablePanel defaultSize={80}>
                                <div className='overflow-y-scroll'>
                                    <ShaderEditor
                                        value={shaderContent!}
                                        onChange={updateShaderSource}
                                    />
                                </div>
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                            <ResizablePanel defaultSize={20} className='p-2'>
                                <Tabs defaultValue="AI" className="w-full h-full">
                                    <TabsList className="grid w-full grid-cols-2 mb-2">
                                        <TabsTrigger value="AI" className='p-0 h-full rounded-r-none flex gap-2'>
                                            <Bot /> Ask AI
                                        </TabsTrigger>
                                        <TabsTrigger value="Errors" className='p-0 h-full rounded-l-none flex gap-2'>
                                            <Terminal /> Compile Status
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="AI" className='h-full focus:outline-none outline-none focus:border-transparent focus:ring-0'>
                                        {AIChatElm}
                                    </TabsContent>
                                    <TabsContent value="Errors" className='h-full mb-8'>
                                        <div className='border w-full h-full grow p-2 font-mono whitespace-pre'>
                                            {shaderErrors ?? 'Compiled without errors ✅'}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}
