import { Workspace } from '@/lib/models';
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import clientPromise from '@/lib/mongoose';

type RouteParams = {
    workspaceId: string,
};

export const GET = withApiAuthRequired(async (req: NextRequest, ctx) => {
    const params = ctx.params as unknown as RouteParams;
    const session = await getSession();
    if (!session || !session.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userSub = session.user.sub;
    const workspaceId = params.workspaceId;

    await clientPromise;
    await Workspace.init();

    if (!workspaceId) {
        return NextResponse.json({ message: 'Workspace ID is required' }, { status: 400 });
    }

    try {
        // Validate that the ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
            return NextResponse.json({ message: 'Invalid workspace ID' }, { status: 400 });
        }

        // Find the workspace, ensuring it belongs to the user
        const workspace = await Workspace.findOne({
            _id: workspaceId,
            userSub: userSub
        }).lean(); // .lean() for performance if you don't need mongoose document methods

        if (!workspace) {
            return NextResponse.json({ message: 'Workspace not found or access denied' }, { status: 404 });
        }

        // Convert MongoDB _id to string for consistent JSON serialization
        return NextResponse.json({
            ...workspace,
            id: workspace._id.toString(),
            // name: workspace.name,
            // description: workspace.description || '',
            // createdAt: workspace.createdAt,
            // lastModified: workspace.lastModified,
            // programs: workspace.programs.map(program => ({
            //     id: program._id ? program._id.toString() : null,
            //     name: program.name,
            //     description: program.description || '',
            //     createdAt: program.createdAt,
            //     lastModified: program.lastModified,
            //     shaders: {
            //         vertex: {
            //             code: program.shaders.vertex.code,
            //             createdAt: program.shaders.vertex.createdAt,
            //             lastModified: program.shaders.vertex.lastModified
            //         },
            //         fragment: {
            //             code: program.shaders.fragment.code,
            //             createdAt: program.shaders.fragment.createdAt,
            //             lastModified: program.shaders.fragment.lastModified
            //         }
            //     }
            // }))
        }, { status: 200 });
    } catch (error) {
        console.error('Error reading workspace:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
});