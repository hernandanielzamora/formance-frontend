"use client";
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/lib/auth/provider';
import { StoreProvider } from '@/lib/store/provider';
import DashboardShell from '@/components/ui/DashboardShell';
import BackendConnection from '@/components/ui/BackendConnection';
export default function ProductProviders({ children }: {
    children: React.ReactNode;
}) {
    const path = usePathname();
    if (path === '/presentacion' || path.startsWith('/presentacion/'))
        return children;
    return <AuthProvider><StoreProvider><BackendConnection /><DashboardShell>{children}</DashboardShell></StoreProvider></AuthProvider>;
}
