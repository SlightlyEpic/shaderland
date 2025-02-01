"use client"

import * as React from "react"
import {
    BookOpen,
    Github,
    Grape,
    Group,
    LifeBuoy,
    Send,
    Settings2,
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user, error, isLoading } = useUser();
    const workspaceNames = useWorkspaceNames();
    const currentWorkspace = useCurrentWorkspace();
    const workspaceData = !currentWorkspace
        ? undefined
        : useWorkspace(currentWorkspace);

    const data = React.useMemo(() => ({
        navMain: [
            {
                title: "My Workspaces",
                url: "#",
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
                url: "#",
                icon: Group,
                items: (!workspaceData || workspaceData.error || workspaceData.isLoading)
                    ? []
                    : workspaceData.data!.programs.map(p => ({
                        title: p.name ?? '',
                        url: `/app/workspaces/${currentWorkspace}/programs/${p._id ?? ''}`,
                    }))
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
