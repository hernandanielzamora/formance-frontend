import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'Formance', description: 'Tu entrenamiento, alimentación y progreso en un solo lugar.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
