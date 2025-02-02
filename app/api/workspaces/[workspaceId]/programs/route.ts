import { IProgram, Workspace } from '@/lib/models';
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import clientPromise from '@/lib/mongoose';
import { defaultFragmentShaderSource, defaultVertexShaderSource } from '@/lib/util/defaultShaders';

// Define the request body type for type safety
interface CreateProgramRequest {
    name: string;
    description?: string;
}

type RouteParams = {
    workspaceId: string,
};

export const POST = withApiAuthRequired(async (req: NextRequest, ctx) => {
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

    // Validate input parameters
    if (!workspaceId) {
        return NextResponse.json({
            message: 'Workspace ID is required'
        }, { status: 400 });
    }

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        return NextResponse.json({
            message: 'Invalid Workspace ID'
        }, { status: 400 });
    }

    // Parse request body
    let programData: CreateProgramRequest;
    try {
        programData = await req.json();
    } catch (error) {
        return NextResponse.json({
            message: 'Invalid request body'
        }, { status: 400 });
    }

    // Validate program name
    if (!programData.name || programData.name.trim() === '') {
        return NextResponse.json({
            message: 'Program name is required'
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

        // Create a new program
        const newProgram: IProgram = {
            name: programData.name.trim(),
            userSub: userSub,
            description: programData.description?.trim() || '',
            shaders: {
                vertex: {
                    type: 'vertex',
                    code: defaultVertexShaderSource,
                    createdAt: new Date(),
                    lastModified: new Date()
                },
                fragment: {
                    type: 'fragment',
                    code: defaultFragmentShaderSource,
                    createdAt: new Date(),
                    lastModified: new Date()
                }
            },
            createdAt: new Date(),
            lastModified: new Date()
        };

        // Add the program to the workspace
        workspace.programs.push(newProgram);

        // Save the workspace with the new program
        await workspace.save();

        // Get the newly added program (last in the array)
        const addedProgram = workspace.programs[workspace.programs.length - 1];

        // Return the created program details
        return NextResponse.json({
            message: 'Program created successfully',
            program: {
                id: addedProgram._id!.toString(),
                name: addedProgram.name,
                description: addedProgram.description,
                createdAt: addedProgram.createdAt,
                shaders: {
                    vertex: {
                        code: addedProgram.shaders.vertex.code,
                        createdAt: addedProgram.shaders.vertex.createdAt
                    },
                    fragment: {
                        code: addedProgram.shaders.fragment.code,
                        createdAt: addedProgram.shaders.fragment.createdAt
                    }
                }
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating program:', error);
        return NextResponse.json({
            message: 'Internal server error'
        }, { status: 500 });
    }
});
