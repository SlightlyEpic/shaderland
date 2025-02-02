import { Workspace } from '@/lib/models';
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import clientPromise from '@/lib/mongoose';

type RouteParams = {
    workspaceId: string,
};

export const GET = withApiAuthRequired(async (req: NextRequest, ctx) => {
    const params = ctx.params as RouteParams;
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
        if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
            return NextResponse.json({ message: 'Invalid workspace ID' }, { status: 400 });
        }

        const workspace = await Workspace.findOne({
            _id: workspaceId,
            userSub: userSub
        }).lean();

        if (!workspace) {
            return NextResponse.json({ message: 'Workspace not found or access denied' }, { status: 404 });
        }

        return NextResponse.json({
            ...workspace,
            id: workspace._id.toString(),
        }, { status: 200 });
    } catch (error) {
        console.error('Error reading workspace:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
});

export const DELETE = withApiAuthRequired(async (req: NextRequest, ctx) => {
    const params = ctx.params as RouteParams;

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
        const deleteResult = await Workspace.deleteOne({
            _id: workspaceId,
            userSub: userSub
        });

        return NextResponse.json({
            message: 'success',
        }, { status: 200 });
    } catch (error) {
        console.error('Error deleting workspace:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
});
