import { Workspace } from '@/lib/models';
import clientPromise from '@/lib/mongoose';
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withApiAuthRequired(async (req: NextRequest) => {
    const session = await getSession();
    if (!session || !session.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userSub = session.user.sub;

    await clientPromise;
    await Workspace.init();

    try {
        const workspaces = await Workspace.find({
            userSub: userSub
        }).lean();

        if (!workspaces) {
            return NextResponse.json({ message: 'Workspace not found or access denied' }, { status: 404 });
        }

        return NextResponse.json(workspaces.map(w => ({
            id: w._id.toString(),
            name: w.name,
            description: w.description,
            createdAt: w.createdAt.getTime(),
        }), { status: 200 }));
    } catch (error) {
        console.error('Error reading workspace:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
});
