import { Workspace } from '@/lib/models';
import clientPromise from '@/lib/mongoose';
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { fromError } from 'zod-validation-error';

const bodySchema = z.object({
    name: z.string().min(1).max(128),
    description: z.optional(z.string().min(1).max(512)),
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

        // Create a new workspace
        const newWorkspace = new Workspace({
            name: validatedBody.name.trim(),
            userSub: userSub,
            description: validatedBody.description ?? '',
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

export const GET = withApiAuthRequired(async (req: NextRequest) => {
    const session = await getSession();
    if (!session || !session.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userSub = session.user.sub;

    await clientPromise;
    await Workspace.init();

    try {
        // Find the workspace, ensuring it belongs to the user
        const workspaces = await Workspace.find({
            userSub: userSub
        }).lean(); // .lean() for performance if you don't need mongoose document methods

        if (!workspaces) {
            return NextResponse.json({ message: 'Workspace not found or access denied' }, { status: 404 });
        }

        // Convert MongoDB _id to string for consistent JSON serialization
        return NextResponse.json(workspaces.map(w => ({
            ...w,
            id: w._id.toString(),
        }), { status: 200 }));
    } catch (error) {
        console.error('Error reading workspace:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
});