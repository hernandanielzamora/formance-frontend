'use client';
import { useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';

/** Visual transition only: a caller must explicitly request every scene change. */
export function useSceneTransition() {
  const running = useRef<ViewTransition | null>(null);
  const generation = useRef(0);
  useEffect(() => () => {
    generation.current++;
    running.current?.skipTransition();
    delete document.documentElement.dataset.presentationDirection;
  }, []);
  const cancel = () => { generation.current++; running.current?.skipTransition(); };
  const animate = (commit: () => void, direction = 1) => {
    const request = ++generation.current;
    running.current?.skipTransition();
    document.documentElement.dataset.presentationDirection = direction < 0 ? 'backward' : 'forward';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !document.startViewTransition || document.visibilityState !== 'visible') {
      commit();
      return;
    }
    const transition = document.startViewTransition(() => {
      // Rapid manual inputs may supersede a snapshot that is still being captured.
      if (request === generation.current) flushSync(commit);
    });
    running.current = transition;
    void transition.ready.catch(() => {});
    void transition.finished.catch(() => {}).finally(() => {
      if (running.current === transition) running.current = null;
    });
  };
  return { animate, cancel };
}
