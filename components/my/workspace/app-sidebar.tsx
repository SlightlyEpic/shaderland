"use client"

import * as React from "react"
import {
    Github,
    Grape,
    Group,
    PlusCircle,
    Send,
    SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/my/workspace/sidebar/nav-main"
import { NavSecondary } from "@/components/my/workspace/sidebar/nav-secondary"
import { NavUser } from "@/components/my/workspace/sidebar/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useUser } from '@auth0/nextjs-auth0/client'
import { useWorkspaceNames } from '@/lib/queries/useWorkspaceNames'
import { useCurrentWorkspace } from '@/hooks/useCurrentWorkspace'
import { useWorkspace } from '@/lib/queries/useWorkspace'
import { useChangeProgram } from '@/lib/util/redirect'
import { useUpdateShader } from '@/lib/mutations/useMutateShader'
import { useShaderStore } from '@/lib/zustand/store'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user, error, isLoading } = useUser();
    const workspaceNames = useWorkspaceNames();
    const currentWorkspace = useCurrentWorkspace();
    const workspaceData = useWorkspace(currentWorkspace);
    const changeProgram = useChangeProgram();

    const updateShader = useUpdateShader();
    const zProgramId = useShaderStore(state => state.currentProgramId);
    const zShaderType = useShaderStore(state => state.currentShader);
    const zProgram = useShaderStore(state => zProgramId ? state.programs[zProgramId] : null);

    const saveAndChangeProgram = React.useCallback(async (pid: string) => {
        if(!zProgramId) return;
        if(!currentWorkspace) return;
        updateShader.mutateAsync({
            programId: zProgramId,
            update: {
                type: zShaderType,
                code: zShaderType === 'vertex' ? zProgram!.vertexShader : zProgram!.fragmentShader,
            },
            workspaceId: currentWorkspace,
        });

        changeProgram(pid);
    }, [updateShader]);

    const data = React.useMemo(() => ({
        navMain: [
            {
                title: "My Workspaces",
                url: "/app",
                icon: SquareTerminal,
                isActive: true,
                items: (workspaceNames.error || workspaceNames.isLoading)
                    ? []
                    : workspaceNames.data!.map(w => ({
                        title: w.name,
                        url: `/app/workspaces/${w.id}`,
                    }))
            },
            ...(!currentWorkspace
                ? []
                : [{
                title: "Workspace Programs",
                // url: "#",
                icon: Group,
                isActive: true,
                items: [
                    {
                        title: 'New program',
                        icon: PlusCircle,
                    },
                    ...(!workspaceData.data
                        ? []
                        : workspaceData.data!.programs.map(p => ({
                            title: p.name ?? '',
                            // url: `/app/workspaces/${currentWorkspace}/programs/${p._id ?? ''}`,
                            onClick: () => changeProgram(p._id as unknown as string),
                        })
                    )
                )]
            }]),
        ],
        navSecondary: [
            {
                title: "View on GitHub",
                url: "https://github.com/SlightlyEpic/shaderland",
                icon: Github,
            },
            {
                title: "Feedback",
                url: "#",
                icon: Send,
            },
        ],
    }), [workspaceNames, currentWorkspace]);
    
    return (
        <Sidebar
            className="top-[--header-height] !h-[calc(100svh-var(--header-height))]"
            {...props}
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="#">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <Grape className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Shaderland</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={{
                    name: user?.nickname ?? '',
                    email: user?.email ?? '',
                    avatar: user?.picture ?? '',
                }} />
            </SidebarFooter>
        </Sidebar>
    )
}
