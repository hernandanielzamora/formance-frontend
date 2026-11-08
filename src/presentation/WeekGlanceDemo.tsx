'use client';
import { useEffect, useState, type CSSProperties } from 'react';

// Réplica estática de la lectura semanal real (semana del 2/11 de la cuenta demo),
// animada para la presentación. No consulta la API.
const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const trained = [true, true, false, true, true, false, false];
const kcal = [2556, 2563, 2521, 2593, 2692, 3451, 2909];
const target = 2596;
const weights = [78.8, 78.6, 78.5, 78.6];
const max = 3600;

function CountUp({ to, from = 0, decimals = 0, delay = 0 }: { to: number; from?: number; decimals?: number; delay?: number }) {
  const format = (value: number) => new Intl.NumberFormat('es-AR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
  const [value, setValue] = useState(to);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0; const start = performance.now() + delay; const duration = 900;
    setValue(from);
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / duration));
      setValue(from + (to - from) * (1 - Math.pow(1 - t, 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [to, from, delay]);
  return <>{format(value)}</>;
}

export function WeekGlanceDemo() {
  const low = Math.min(...weights); const span = Math.max(...weights) - low || 1;
  const points = weights.map((kg, i) => `${6 + (i / (weights.length - 1)) * 348},${60 - ((kg - low) / span) * 48}`).join(' ');
  return <div className="wg" aria-label="Ejemplo de la lectura semanal de Formance">
    <div className="wg-head"><span className="wg-eyebrow">TU SEMANA EN 10 SEGUNDOS</span><strong>Muy buena semana</strong>
      <p>Cumpliste tu rutina, subiste cargas y comiste en objetivo la mayoría de los días. <b>Para ajustar: el fin de semana.</b></p></div>
    <div className="wg-cards">
      <article className="wg-card"><header><span>Entrenamiento</span><em>Bien</em></header><strong><CountUp to={4} delay={350} /><small>/4</small></strong><small>días planificados</small>
        <ol className="wg-dots">{days.map((day, i) => <li key={day} className={trained[i] ? 'is-done' : 'is-rest'} style={{ '--i': i } as CSSProperties}><span>{trained[i] ? '✓' : ''}</span><small>{day}</small></li>)}</ol>
        <p className="wg-record">Sentadilla <b>90 kg</b> <i>+2,5</i></p></article>
      <article className="wg-card"><header><span>Alimentación</span><em>Bien</em></header><strong><CountUp to={2755} from={1800} delay={500} /><small> kcal</small></strong><small>promedio · objetivo 2.596</small>
        <div className="wg-bars"><i className="wg-target" style={{ bottom: `${(target / max) * 100}%` }} />
          {kcal.map((value, i) => <div key={i} className={value > target * 1.1 ? 'is-over' : 'is-on'} style={{ '--i': i } as CSSProperties}><span style={{ height: `${(value / max) * 100}%` }} /><small>{days[i]}</small></div>)}</div>
        <p className="wg-record">En objetivo <b>5 de 7 días</b></p></article>
      <article className="wg-card"><header><span>Peso</span><em>Bien</em></header><strong><CountUp to={78.6} from={79.2} decimals={1} delay={900} /><small> kg</small></strong><small>promedio semanal</small>
        <svg className="wg-line" viewBox="0 0 360 70" preserveAspectRatio="none" aria-hidden="true"><polyline points={points} />{weights.map((kg, i) => <circle key={i} cx={6 + (i / (weights.length - 1)) * 348} cy={60 - ((kg - low) / span) * 48} r="4" style={{ '--i': i } as CSSProperties} />)}</svg>
        <p className="wg-record"><b>−0,4 kg</b> vs semana anterior</p></article>
    </div>
    <div className="wg-lists">
      <ul className="wg-wins"><li style={{ '--i': 0 } as CSSProperties}><span>✓</span>4 de 4 entrenamientos y cargas en subida</li><li style={{ '--i': 1 } as CSSProperties}><span>✓</span>Proteína en objetivo 6 de 7 días</li><li style={{ '--i': 2 } as CSSProperties}><span>✓</span>Peso promedio −0,4 kg</li></ul>
      <div className="wg-focus"><span>FOCO PARA LA PRÓXIMA SEMANA</span><strong>Planificá una comida del fin de semana con anticipación.</strong></div>
    </div>
  </div>;
}
