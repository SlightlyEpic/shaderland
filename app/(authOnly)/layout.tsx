'use client';

import { SiteHeader } from '@/components/my/header';
import { AppSidebar } from '@/components/my/workspace/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useUser } from '@auth0/nextjs-auth0/client';
import { redirect } from 'next/navigation';

export default function AuthOnlyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const { user, error, isLoading } = useUser();

    if(isLoading) return <></>;
    if(!user) redirect('/');

    return (
        <div className="[--header-height:calc(theme(spacing.14))]">
            <SidebarProvider className="flex flex-col">
                <SiteHeader />
                <div className="max-h-1/2 flex">
                    <AppSidebar />
                    <SidebarInset>
                        {children}
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </div>
    )
}
