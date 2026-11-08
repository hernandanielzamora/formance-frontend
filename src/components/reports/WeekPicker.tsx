'use client';
import { useEffect, useRef, useState } from 'react';
import { useCachedQuery } from '@/lib/store/hooks';
import { addDays, monday, dateLabel } from '@/lib/training-sessions';
import type { MonthlyReport } from '@/lib/reports';

const letters = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const toneLabel = { good: 'buena semana', mixed: 'semana con algo para ajustar', attention: 'semana para retomar', empty: 'sin registros' } as const;
export const monthOf = (week: string) => addDays(week, 3).slice(0, 7); // el jueves define el mes de la semana
function shiftMonth(month: string, delta: number) { const [y, m] = month.split('-').map(Number); const date = new Date(Date.UTC(y, m - 1 + delta, 1)); return date.toISOString().slice(0, 7); }

// Selector de semana: un mes por vista, una fila por semana, con el tono de cada semana registrada.
export default function WeekPicker({ week, today, zone, onSelect }: { week: string; today: string; zone: string; onSelect: (week: string) => void }) {
  const [open, setOpen] = useState(false); const [month, setMonth] = useState(() => monthOf(week));
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!open) setMonth(monthOf(week)); }, [week, open]);
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => { if (event instanceof KeyboardEvent ? event.key === 'Escape' : !ref.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close); document.addEventListener('keydown', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close); };
  }, [open]);
  const data = useCachedQuery<MonthlyReport>(`reports/monthly?month=${month}&timeZone=${encodeURIComponent(zone)}`, open).data;
  const first = `${month}-01`; const last = addDays(`${shiftMonth(month, 1)}-01`, -1);
  const rows: string[] = []; for (let start = monday(first); start <= last; start = addDays(start, 7)) rows.push(start);
  const title = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${first}T12:00:00Z`));
  return <div className="week-picker-wrap" ref={ref}>
    <button className="week-picker" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(!open)}>
      <span>{dateLabel(week, { day: 'numeric', month: 'short' })} – {dateLabel(addDays(week, 6), { day: 'numeric', month: 'short' })}</span><span className="week-picker-caret" aria-hidden="true">▾</span>
    </button>
    {open && <div className="week-popover" role="dialog" aria-label="Elegir semana">
      <div className="week-popover-head"><button aria-label="Mes anterior" onClick={() => setMonth(shiftMonth(month, -1))}>‹</button><strong>{title}</strong><button aria-label="Mes siguiente" disabled={shiftMonth(month, 1) > today.slice(0, 7)} onClick={() => setMonth(shiftMonth(month, 1))}>›</button></div>
      <div className="week-popover-days" aria-hidden="true">{letters.map(letter => <span key={letter}>{letter}</span>)}<span /></div>
      <ul>{rows.map(start => { const future = start > today; const info = data?.weeks.find(item => item.weekStart === start);
        return <li key={start}><button className={`week-row${start === week ? ' is-selected' : ''}`} disabled={future} aria-current={start === week ? 'date' : undefined}
          aria-label={`Semana del ${dateLabel(start, { day: 'numeric', month: 'long' })}${info ? `: ${toneLabel[info.tone]}` : ''}`} onClick={() => { onSelect(start); setOpen(false); }}>
          {Array.from({ length: 7 }, (_, i) => { const day = addDays(start, i); return <span key={day} className={`${day.slice(0, 7) !== month ? 'is-outside' : ''}${day === today ? ' is-today' : ''}`}>{Number(day.slice(8))}</span>; })}
          <i className={`week-tone is-${info?.tone ?? 'none'}`} aria-hidden="true" /></button></li>; })}</ul>
      <p className="week-popover-legend"><i className="week-tone is-good" />Bien <i className="week-tone is-mixed" />Con ajustes <i className="week-tone is-attention" />A retomar</p>
      {week !== monday(today) && <button className="week-popover-today" onClick={() => { onSelect(monday(today)); setOpen(false); }}>Ir a esta semana</button>}
    </div>}
  </div>;
}
