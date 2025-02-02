'use client';

import { GLCanvas } from '@/components/my/workspace/ide/gl-canvas';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { defaultVertexShaderSource, defaultFragmentShaderSource } from '@/lib/util/defaultShaders';
import { RefreshCcw } from 'lucide-react';
import { useCallback, useState } from 'react';

type RouteParams = {
    workspaceId: string,
};

type WorkspacePageProps = {
    params: RouteParams,
};

export default function WorkspacePage({ params }: WorkspacePageProps) {
    const [_refresh, setRefresh] = useState(false);

    const refresh = useCallback(() => setRefresh(r => !r), []);

    return (
        <div className='flex flex-col w-full h-full'>
            <ResizablePanelGroup direction='horizontal'>
                <ResizablePanel defaultSize={50} className='h-full'>
                    {/* <div className='w-full flex gap-4 p-2'>
                        <Button className='group flex items-center ml-auto' size='sm' onClick={refresh}>
                            <RefreshCcw className='transition-transform duration-500 rotate-0 group-hover:rotate-180' /> 
                            Refresh output
                        </Button>
                    </div> */}
                    <GLCanvas
                        vertShaderSource={defaultVertexShaderSource}
                        fragShaderSource={defaultFragmentShaderSource}
                        refresh={_refresh}
                    />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50}>
                    Here goes the IDE
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}
