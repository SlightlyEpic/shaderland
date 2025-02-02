"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { NewProgramDialog } from '../new-program-dialog'

export function NavMain({
    items,
}: {
    items: {
        title: string,
        url?: string,
        icon: LucideIcon,
        isActive?: boolean,
        items?: {
            icon?: LucideIcon,
            title: string,
            url?: string,
            onClick?: (...params: unknown[]) => unknown,
        }[]
    }[]
}) {
    return (
        <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={item.title}>
                                <a href={item.url}>
                                    <item.icon />
                                    <span>{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                            {item.items?.length ? (
                                <>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuAction className="data-[state=open]:rotate-90">
                                            <ChevronRight />
                                            <span className="sr-only">Toggle</span>
                                        </SidebarMenuAction>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items?.map((subItem) => {
                                                if(subItem.title === 'New program') {
                                                    return (
                                                        <SidebarMenuSubItem key={subItem.title}>
                                                            <SidebarMenuSubButton asChild>
                                                                <NewProgramDialog>
                                                                    <span 
                                                                        onClick={subItem.onClick!} 
                                                                        className='flex gap-2 items-center text-sm bg-white/5 p-1 px-2 rounded-md cursor-pointer hover:text-blue-400'
                                                                    >
                                                                        {subItem.icon && <subItem.icon size={16} />} {subItem.title}
                                                                    </span>
                                                                </NewProgramDialog>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    )
                                                }
                                                
                                                return (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton asChild>
                                                        {subItem.url
                                                            ? <a href={subItem.url}>
                                                                {subItem.icon && <subItem.icon />} <span>{subItem.title}</span>
                                                            </a>
                                                            : <span onClick={subItem.onClick!} className='cursor-pointer'>
                                                                {subItem.icon && <subItem.icon />} {subItem.title}
                                                            </span>
                                                        }
                                                        
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            )})}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </>
                            ) : null}
                        </SidebarMenuItem>
                    </Collapsible>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}
