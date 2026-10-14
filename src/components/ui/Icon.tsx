type Name = 'arrow' | 'check' | 'eye' | 'eye-off' | 'grid' | 'workout' | 'food' | 'chart' | 'user' | 'logout' | 'lock';
const paths: Record<Name, React.ReactNode> = {
  arrow: <path d="M4 12h16M14 6l6 6-6 6" />,
  check: <path d="m5 12 4 4L19 6" />,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  'eye-off': <path d="m3 3 18 18M10 5c6-1 12 7 12 7a22 22 0 0 1-3 4M6 6c-3 2-4 6-4 6s4 7 10 7c2 0 4-.8 5-2" />,
  grid: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
  workout: <path d="M6 8v8M3 10v4M18 8v8M21 10v4M6 12h12" />,
  food: <path d="M5 3v6c0 3 6 3 6 0V3M8 3v18M19 3c-4 2-4 9 0 9V3Zm0 9v9" />,
  chart: <path d="M4 3v17h17M8 15l4-5 4 2 5-7" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>,
  logout: <path d="M9 4H4v16h5M9 12h12m-5-5 5 5-5 5" />,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
};
export default function Icon({ name, className = '' }: { name: Name; className?: string }) {
  return <svg className={`icon ${className}`} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
