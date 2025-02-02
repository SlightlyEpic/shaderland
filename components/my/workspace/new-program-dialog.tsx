'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCurrentWorkspace } from '@/hooks/useCurrentWorkspace';
import { useNewProgramMutation } from '@/lib/mutations/useMutateNewProgram';
import { Loader } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

type NewProgramDialogProps = {
    children: React.ReactNode,
};

export function NewProgramDialog({ children }: NewProgramDialogProps) {
    const workspaceId = useCurrentWorkspace();
    const newProgramMutation = useNewProgramMutation(workspaceId);
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
        if(newProgramMutation.isSuccess) setOpen(false);
    }, [newProgramMutation.isSuccess]);

    const createCb = useCallback(() => {
        let mut = newProgramMutation.mutate({
            workspaceId: workspaceId,
            name: name,
            description: desc,
        });
    }, [name, desc, newProgramMutation]);

    return (
        <Dialog onOpenChange={onOpenChangeCb} open={open}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <div className='w-full h-full p-4 flex flex-col gap-4'>
                    <DialogTitle>
                        <div className='text-2xl font-bold'>Create new program</div>
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
                        disabled={newProgramMutation.isPending}
                    >
                        {newProgramMutation.isPending
                            ? <Loader className='animate-spin' />
                            : 'Create'
                        }
                        
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
