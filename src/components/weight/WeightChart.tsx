'use client';
import { useId, useState } from 'react';
import { formatNumber } from '@/lib/food';
import { dateLabel } from '@/lib/training-sessions';
import type { WeightMeasurement } from '@/lib/weight';

export default function WeightChart({ measurements }: { measurements: WeightMeasurement[] }) {
  const titleId = useId(); const [selected, setSelected] = useState('');
  if (!measurements.length) return <div className="empty-library"><h3>Todavía no hay mediciones en este período</h3><p>Registrá un peso o elegí otro rango de fechas.</p></div>;
  const points = [...measurements].sort((a, b) => a.localDate.localeCompare(b.localDate));
  const chosen = points.find(item => item.id === selected) || points.at(-1)!;
  const minimum = Math.min(...points.map(item => item.weightKg)); const maximum = Math.max(...points.map(item => item.weightKg));
  const pad = Math.max(0.5, (maximum - minimum) * 0.2); const bottom = Math.max(0, minimum - pad); const top = maximum + pad;
  const first = new Date(points[0].localDate).getTime(); const last = new Date(points.at(-1)!.localDate).getTime();
  const coordinates = points.map(item => ({ item, x: last === first ? 420 : 75 + (new Date(item.localDate).getTime() - first) / (last - first) * 650, y: 185 - (item.weightKg - bottom) / (top - bottom) * 150 }));
  return <figure className="weight-chart"><figcaption id={titleId}>Peso registrado en el período</figcaption><svg viewBox="0 0 800 240" role="group" aria-labelledby={titleId}>
    {[0, 0.5, 1].map(value => <g key={value}><line x1="75" x2="725" y1={35 + value * 150} y2={35 + value * 150} stroke="#dce3d3" strokeDasharray="4 5" /><text x="65" y={40 + value * 150} textAnchor="end">{formatNumber(top - value * (top - bottom))}</text></g>)}
    <text x="25" y="20">kg</text>
    {points.length > 1 && <polyline points={coordinates.map(point => `${point.x},${point.y}`).join(' ')} fill="none" stroke="#64813d" strokeWidth="3" />}
    {coordinates.map(({ item, x, y }) => <g key={item.id} role="button" tabIndex={0} aria-label={`${dateLabel(item.localDate)}, ${formatNumber(item.weightKg)} kg`} aria-pressed={chosen.id === item.id} onClick={() => setSelected(item.id)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(item.id); } }}><circle cx={x} cy={y} r="20" fill="transparent" /><circle className="weight-dot" cx={x} cy={y} r={chosen.id === item.id ? 8 : 5} fill={chosen.id === item.id ? '#19221b' : '#64813d'} stroke="white" strokeWidth="2" pointerEvents="none" /><title>{item.localDate}: {item.weightKg} kg</title></g>)}
    <text x="75" y="220">{dateLabel(points[0].localDate)}</text><text x="725" y="220" textAnchor="end">{dateLabel(points.at(-1)!.localDate)}</text>
  </svg><p className="weight-chart-selected" role="status">{dateLabel(chosen.localDate, { day: 'numeric', month: 'long', year: 'numeric' })}: <strong>{formatNumber(chosen.weightKg)} kg</strong>{chosen.source === 'onboarding' ? ' · Peso inicial' : ''}{chosen.dateInferred ? ' · Fecha aproximada del registro inicial' : ''}</p><p className="food-hint">Seleccioná un punto para ver la medición. La escala se adapta a los datos; la línea une mediciones y no estima el peso de los días intermedios.</p></figure>;
}
