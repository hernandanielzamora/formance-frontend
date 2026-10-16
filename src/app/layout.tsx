import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/provider';
import localFont from 'next/font/local';
import DashboardShell from '@/components/ui/DashboardShell';
import BackendConnection from '@/components/ui/BackendConnection';
const geist = localFont({ src: './fonts/GeistVF.woff', variable: '--font-geist', display: 'swap' });

export const metadata: Metadata = { title: 'Formance', description: 'Tu entrenamiento, alimentación y progreso en un solo lugar.', icons: { icon: '/brand/isotype.svg' } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es" data-scroll-behavior="smooth"><body className={geist.variable}><AuthProvider><BackendConnection /><DashboardShell>{children}</DashboardShell></AuthProvider></body></html>;
}
