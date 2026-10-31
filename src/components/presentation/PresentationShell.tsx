"use client";
import { useEffect, useRef, useState } from 'react';
import { slides } from '@/presentation/slides';
import { slideHashAliases } from '@/presentation/hash-aliases';
import { enabledSlides } from '@/presentation/types';
import { Slide } from './Primitives';
import { useSceneTransition } from './useSceneTransition';
const active = enabledSlides(slides);
export function ProgressIndicator({ index, total }: {
    index: number;
    total: number;
}) { return <span className="p-progress" aria-label={`Diapositiva ${index + 1} de ${total}`}>{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>; }
export function PresentationControls({ index, onNavigate, onPresent, showProgress, onToggle }: {
    index: number;
    onNavigate: (index: number) => void;
    onPresent: () => void;
    showProgress: boolean;
    onToggle: () => void;
}) { return <nav className="p-controls" aria-label="Controles de presentación"><button aria-label="Anterior" disabled={index === 0} onClick={() => onNavigate(index - 1)}>←</button>{showProgress && <ProgressIndicator index={index} total={active.length}/>}<button aria-label="Siguiente" disabled={index === active.length - 1} onClick={() => onNavigate(index + 1)}>→</button><span className="p-controls-divider"/><button onClick={onPresent}>Presentar</button><button aria-label={showProgress ? 'Ocultar progreso' : 'Mostrar progreso'} aria-pressed={showProgress} onClick={onToggle}>◦</button></nav>; }
export default function PresentationShell() {
    const [index, setIndex] = useState(0), [debug, setDebug] = useState(false), [progress, setProgress] = useState(true), [notice, setNotice] = useState('');
    const stage = useRef<HTMLElement>(null);
    const wheelGesture = useRef({ lockedUntil: -Infinity, lastEvent: -Infinity, delta: 0 });
    const touchOrigin = useRef<{ x: number; y: number } | null>(null);
    const requestedIndex = useRef(0);
    const { animate: animateScene, cancel: cancelSceneTransition } = useSceneTransition();
    function navigate(next: number) {
        const bounded = Math.max(0, Math.min(active.length - 1, next));
        if (!active[bounded] || bounded === requestedIndex.current) return;
        const direction = bounded > requestedIndex.current ? 1 : -1;
        requestedIndex.current = bounded;
        const hash = `#${active[bounded].id}`;
        if (window.location.hash !== hash) window.history.pushState(null, '', hash);
        animateScene(() => setIndex(bounded), direction);
    }
    useEffect(() => {
        function sync() { cancelSceneTransition(); const hashId = window.location.hash.slice(1); const id = slideHashAliases[hashId] ?? hashId; const next = active.findIndex(s => s.id === id); requestedIndex.current = next < 0 ? 0 : next; setIndex(requestedIndex.current); if (next < 0 || id !== hashId)
            window.history.replaceState(null, '', `#${active[requestedIndex.current].id}`); }
        sync();
        setDebug(new URLSearchParams(window.location.search).get('debug') === '1');
        window.addEventListener('hashchange', sync);
        window.addEventListener('popstate', sync);
        return () => { window.removeEventListener('hashchange', sync); window.removeEventListener('popstate', sync); };
    }, []);
    useEffect(() => {
        function key(event: KeyboardEvent) { const target = event.target as HTMLElement; if (event.altKey || event.ctrlKey || event.metaKey || target.closest('button,a,input,textarea,select,[contenteditable="true"],[data-presentation-interactive]'))
            return; const destinations: Record<string, number> = { ArrowRight: requestedIndex.current + 1, ' ': requestedIndex.current + 1, PageDown: requestedIndex.current + 1, ArrowLeft: requestedIndex.current - 1, PageUp: requestedIndex.current - 1, Home: 0, End: active.length - 1 }; if (event.key in destinations) {
            event.preventDefault();
            navigate(destinations[event.key]);
        } if (event.key === 'Escape' && document.fullscreenElement)
            void document.exitFullscreen().catch(() => { }); }
        window.addEventListener('keydown', key);
        return () => window.removeEventListener('keydown', key);
    }, [index]);
    useEffect(() => {
        const element = stage.current;
        if (!element) return;
        const isControl = (target: EventTarget | null) =>
            target instanceof Element && Boolean(target.closest('button,a,input,textarea,select,[contenteditable="true"],[data-presentation-interactive]'));

        function wheel(event: WheelEvent) {
            // Keep browser zoom and controls independent of slide navigation.
            if (event.ctrlKey || event.metaKey || event.altKey || isControl(event.target) || !event.deltaY) return;
            event.preventDefault();
            const now = performance.now();
            const gesture = wheelGesture.current;
            // Require 650 ms of silence after navigation, including trackpad inertia.
            // This is an input lock, never a timer that advances a slide.
            if (now < gesture.lockedUntil) {
                gesture.lockedUntil = now + 650;
                gesture.lastEvent = now;
                return;
            }
            const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element!.clientHeight : 1);
            if (now - gesture.lastEvent > 650 || Math.sign(delta) !== Math.sign(gesture.delta)) gesture.delta = 0;
            gesture.lastEvent = now;
            gesture.delta += delta;
            if (Math.abs(gesture.delta) < 24) return;
            gesture.lockedUntil = now + 650;
            gesture.delta = 0;
            navigate(requestedIndex.current + Math.sign(delta));
        }
        function touchStart(event: TouchEvent) {
            touchOrigin.current = event.touches.length === 1 && !isControl(event.target)
                ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
        }
        function touchEnd(event: TouchEvent) {
            const origin = touchOrigin.current;
            touchOrigin.current = null;
            if (!origin || event.touches.length || event.changedTouches.length !== 1) return;
            const dx = origin.x - event.changedTouches[0].clientX;
            const dy = origin.y - event.changedTouches[0].clientY;
            const distance = Math.abs(dx) > Math.abs(dy) ? dx : dy;
            // Left/up advances; right/down goes back. Taps do not navigate.
            if (Math.abs(distance) >= 60) navigate(requestedIndex.current + Math.sign(distance));
        }
        function touchCancel() { touchOrigin.current = null; }
        element.addEventListener('wheel', wheel, { passive: false });
        element.addEventListener('touchstart', touchStart, { passive: true });
        element.addEventListener('touchend', touchEnd, { passive: true });
        element.addEventListener('touchcancel', touchCancel, { passive: true });
        return () => {
            element.removeEventListener('wheel', wheel);
            element.removeEventListener('touchstart', touchStart);
            element.removeEventListener('touchend', touchEnd);
            element.removeEventListener('touchcancel', touchCancel);
        };
    }, [index]);
    async function present() { try {
        if (document.fullscreenElement) {
            await document.exitFullscreen();
            return;
        }
        if (!stage.current?.requestFullscreen) {
            setNotice('Pantalla completa no disponible. Podés continuar con la presentación.');
            return;
        }
        await stage.current.requestFullscreen();
        setNotice('');
    }
    catch {
        setNotice('No se pudo activar pantalla completa. Podés continuar con la presentación.');
    } }
    const current = active[index];
    return <main ref={stage} className="p-shell" data-theme={current.theme ?? 'light'} aria-label="Presentación Formance" aria-roledescription="presentación"><div className="p-scene" data-scene={current.id} key={current.id}><Slide id={current.id}>{current.render}</Slide></div><div className="p-sr-only" aria-live="polite">{index + 1} de {active.length}: {current.title}</div>{debug && <aside className="p-debug">{index + 1}/{active.length} · {current.id} · {current.section} · {current.title} · {current.speaker ?? 'Sin asignar'} · {current.theme ?? 'light'} <a href="/presentacion/mapa">Mapa</a></aside>}<p className="p-notice" role="status">{notice}</p><PresentationControls index={index} onNavigate={next => navigate(requestedIndex.current + next - index)} onPresent={() => void present()} showProgress={progress} onToggle={() => setProgress(v => !v)}/></main>;
}
