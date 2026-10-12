import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/provider';

export const metadata: Metadata = { title: 'Formance', description: 'Tu entrenamiento, alimentación y progreso en un solo lugar.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body><AuthProvider>{children}</AuthProvider></body></html>;
}
