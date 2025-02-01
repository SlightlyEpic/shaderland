'use client';

import { SiteHeader } from '@/components/my/header';
import { AppSidebar } from '@/components/my/workspace/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useUser } from '@auth0/nextjs-auth0/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient();

export default function AuthOnlyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const { user, error, isLoading } = useUser();

    if(isLoading) return <></>;
    if(!user) redirect('/');

    return (
        <div className="[--header-height:calc(theme(spacing.14))]">
            <QueryClientProvider client={queryClient}>
                <ReactQueryDevtools initialIsOpen={false} />
                <SidebarProvider className="flex flex-col">
                    <SiteHeader />
                    <div className="max-h-1/2 flex">
                        <AppSidebar />
                        <SidebarInset>
                            {children}
                        </SidebarInset>
                    </div>
                </SidebarProvider>
            </QueryClientProvider>
        </div>
    )
}
