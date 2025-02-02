'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useNewWorkspaceMutation } from '@/lib/mutations/useMutateNewWorkspace';
import { Loader } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

type NewWorkspaceDialogProps = {
    children: React.ReactNode,
};

export function NewWorkspaceDialog({ children }: NewWorkspaceDialogProps) {
    const newWorkspaceMutation = useNewWorkspaceMutation();
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [open, setOpen] = useState(false);

    const onOpenChangeCb = useCallback((open: boolean) => {
        setOpen(open);
        if(!open) {
            setName('');
            setDesc('');
        }
    }, []);

    useEffect(() => {
        if(newWorkspaceMutation.isSuccess) setOpen(false);
    }, [newWorkspaceMutation.isSuccess]);

    const createCb = useCallback(() => {
        let mut = newWorkspaceMutation.mutate({
            name: name,
            description: desc,
        });
    }, [name, desc, newWorkspaceMutation]);

    return (
        <Dialog onOpenChange={onOpenChangeCb} open={open}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <div className='w-full h-full p-4 flex flex-col gap-4'>
                    <DialogTitle>
                        <div className='text-2xl font-bold'>Create new workspace</div>
                    </DialogTitle>
                    <DialogDescription className='hidden' />
                    <Separator />
                    <Label htmlFor="workspace-name" className='font-bold'>Name</Label>
                    <Input id="workspace-name" type="text" onChange={e => setName(e.target.value)} value={name} />
                    <Label htmlFor="workspace-desc" className='font-bold'>Description</Label>
                    <Input id="workspace-desc" type="text" onChange={e => setDesc(e.target.value)} value={desc} />

                    <Button 
                        className='mt-4'
                        onClick={createCb}
                        disabled={newWorkspaceMutation.isPending}
                    >
                        {newWorkspaceMutation.isPending
                            ? <Loader className='animate-spin' />
                            : 'Create'
                        }
                        
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
