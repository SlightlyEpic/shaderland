import { Workspace } from '@/lib/models';
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import clientPromise from '@/lib/mongoose';

type RouteParams = {
    workspaceId: string,
    programId: string,
};

// Define the request body type for type safety
interface UpdateShaderRequest {
    code: string;
    type: 'vertex' | 'fragment';
}

export const PUT = withApiAuthRequired(async (req: NextRequest, ctx) => {
    const params = ctx.params as RouteParams;
    const session = await getSession();
    if (!session || !session.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userSub = session.user.sub;

    await clientPromise;
    await Workspace.init();

    // Extract query parameters
    const workspaceId = params.workspaceId;
    const programId = params.programId;

    // Validate input parameters
    if (!workspaceId || !programId) {
        return NextResponse.json({
            message: 'Workspace ID and Program ID are required'
        }, { status: 400 });
    }

    // Validate MongoDB ObjectIds
    if (!mongoose.Types.ObjectId.isValid(workspaceId) ||
        !mongoose.Types.ObjectId.isValid(programId)) {
        return NextResponse.json({
            message: 'Invalid Workspace or Program ID'
        }, { status: 400 });
    }

    // Parse request body
    let updateData: UpdateShaderRequest;
    try {
        updateData = await req.json();
    } catch (error) {
        return NextResponse.json({
            message: 'Invalid request body'
        }, { status: 400 });
    }

    // Validate shader type and code
    if (!['vertex', 'fragment'].includes(updateData.type)) {
        return NextResponse.json({
            message: 'Invalid shader type'
        }, { status: 400 });
    }

    try {
        // Find and update the workspace
        const workspace = await Workspace.findOne({
            _id: workspaceId,
            userSub: userSub
        });

        // Check if workspace exists
        if (!workspace) {
            return NextResponse.json({
                message: 'Workspace not found or access denied'
            }, { status: 404 });
        }

        // Find the specific program
        const program = workspace.programs.find(program => program._id?.toString() == programId)

        // Check if program exists
        if (!program) {
            return NextResponse.json({
                message: 'Program not found'
            }, { status: 404 });
        }

        // Update the specific shader
        if (updateData.type === 'vertex') {
            program.shaders.vertex.code = updateData.code;
            program.shaders.vertex.lastModified = new Date();
        } else {
            program.shaders.fragment.code = updateData.code;
            program.shaders.fragment.lastModified = new Date();
        }

        // Update program's last modified timestamp
        program.lastModified = new Date();

        // Save the workspace with updated program
        await workspace.save();

        // Return the updated shader
        return NextResponse.json({
            message: 'Shader updated successfully',
            shader: {
                type: updateData.type,
                code: updateData.code,
                lastModified: updateData.type === 'vertex'
                    ? program.shaders.vertex.lastModified
                    : program.shaders.fragment.lastModified
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Error updating shader:', error);
        return NextResponse.json({
            message: 'Internal server error'
        }, { status: 500 });
    }
});
