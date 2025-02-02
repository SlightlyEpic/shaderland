'use client';

import { NewWorkspaceDialog } from '@/components/my/workspace/new-workspace-dialog';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useDeleteWorkspaceMutation } from '@/lib/mutations/useMutateDeleteWorkspace';
import { useWorkspaceNames } from '@/lib/queries/useWorkspaceNames';
import { Ellipsis, Loader, LoaderIcon, PlusCircle, Trash } from 'lucide-react';
import Link from 'next/link';
import { useCallback } from 'react';

export default function AppPage() {
    const workspaceNames = useWorkspaceNames();
    const deleteWorkspace = useDeleteWorkspaceMutation();

    const deleteWs = useCallback((id: string) => {
        deleteWorkspace.mutate({
            id: id
        });
    }, []);

    return (
        <div className='w-full flex justify-center items-center h-full'>
            <div className='w-full h-full max-h-[36rem] max-w-screen-lg flex flex-col items-start justify-start p-8 gap-4'>
                <div className='text-4xl font-bold font-mono'>Your workspaces</div>
                <Separator orientation='horizontal' />
                {workspaceNames.isLoading && <LoaderIcon className='animate-spin self-center' />}
                {!workspaceNames.isLoading && !workspaceNames.isError && (
                    <div className='w-full flex flex-col gap-4 max-h-[36rem] h-full overflow-y-scroll pr-8'>
                        <NewWorkspaceDialog>
                            <div 
                                className='flex gap-4 items-center p-4 text-xl font-bold font-mono 
                                rounded-md border border-dashed hover:bg-white/5 text-white/30 hover:text-blue-400 cursor-pointer'
                            >
                                <PlusCircle />
                                Create new workspace
                            </div>
                        </NewWorkspaceDialog>
                        {/* {workspaceNames.data!.map(v => [v, v, v, v, v, v, v, v]).flat()!.map(w => ( */}
                        {workspaceNames.data!.map(w => (
                            <div key={w.id} className='flex items-center'>
                                <Link 
                                    key={w.id}
                                    href={`/app/workspaces/${w.id}`}
                                    className='flex gap-4 px-4 py-2 text-xl font-bold font-mono rounded-md border hover:bg-white/5 cursor-pointer w-full
                                    h-12 rounded-r-none'
                                >
                                    <span>{w.name}</span> {!!w.description && '|'}
                                    <span className='text-opacity-75'>{w.description}</span>
                                    <span className='ml-auto text-sm self-center text-slate-600'>
                                        {new Date(w.createdAt).toLocaleString()}
                                    </span>
                                </Link>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button className='h-12 rounded-l-none' variant='secondary'>
                                            <Ellipsis />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <div className='flex flex-col gap-2'>
                                            <Button 
                                                className='flex items-center' 
                                                variant='destructive'
                                                disabled={deleteWorkspace.isPending}
                                                onClick={() => deleteWs(w.id)}
                                            >
                                                {deleteWorkspace.isPending
                                                    ? <Loader className='animate-spin' />
                                                    : <><Trash /> Delete Workspace</>
                                                }
                                                
                                            </Button>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
