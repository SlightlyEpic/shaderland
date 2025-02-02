"use client"

import { SidebarIcon } from "lucide-react"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { useCurrentWorkspace } from '@/hooks/useCurrentWorkspace'
import { useWorkspace } from '@/lib/queries/useWorkspace'

export function SiteHeader() {
    const { toggleSidebar } = useSidebar()
    const workspaceId = useCurrentWorkspace();
    const workspace = useWorkspace(workspaceId);

    return (
        <header className="fle sticky top-0 z-50 w-full items-center border-b bg-background">
            <div className="flex h-[--header-height] w-full items-center gap-2 px-4">
                <Button
                    className="h-8 w-8"
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                >
                    <SidebarIcon />
                </Button>
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb className="hidden sm:block">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/app">
                                Workspaces
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        {workspace?.data &&
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{workspace.data.name}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </>
                        }
                    </BreadcrumbList>
                </Breadcrumb>
                {/* <ProfileCsr className='ml-auto' /> */}
            </div>
        </header>
    )
}
