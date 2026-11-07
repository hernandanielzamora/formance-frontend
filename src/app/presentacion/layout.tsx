import type { Metadata } from 'next';
import '@/presentation/presentation.css';
import '@/presentation/final-deck.css';
import '@/presentation/motion.css';
import '@/presentation/motion-5.css';
import '@/presentation/marketing-deck.css';
export const metadata: Metadata = { title: 'Formance · El producto en acción', robots: { index: false, follow: false } };
export default function PresentationLayout({ children }: {
    children: React.ReactNode;
}) { return <div className="presentation">{children}</div>; }
