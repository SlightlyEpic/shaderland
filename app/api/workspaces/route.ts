import { Workspace } from '@/lib/models';
import clientPromise from '@/lib/mongoose';
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { fromError } from 'zod-validation-error';

const bodySchema = z.object({
    name: z.string().min(1).max(128),
});

export const POST = withApiAuthRequired(async function (req: NextRequest) {
    const session = await getSession();
    if (!session || !session.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await clientPromise;
    await Workspace.init();
    
    try {
        const userSub = session.user.sub;
        const body = await req.json();

        const { data: validatedBody, error } = bodySchema.safeParse(body);
        if(error) {
            return NextResponse.json({
                message: 'Validation error',
                details: fromError(error).toString()
            }, { status: 400 });
        }

        const { name } = validatedBody;
        
        if (!name || name.trim() === '') {
            return NextResponse.json({ message: 'Workspace name is required' }, { status: 400 });
        }
        
        // Create a new workspace
        const newWorkspace = new Workspace({
            name: name.trim(),
            userSub: userSub,
            description: '',
            programs: []
        });

        // Save the workspace
        await newWorkspace.save();

        // Return the newly created workspace's ID
        return NextResponse.json({
            id: (newWorkspace._id as any).toString(),
            name: newWorkspace.name
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating workspace:', error);
        // @ts-expect-error
        if(error?.message == 'Unexpected end of JSON input') return NextResponse.json({ message: 'Request body must be JSON' }, { status: 400 });
        else return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
});