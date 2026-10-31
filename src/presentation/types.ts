import type { ReactNode } from 'react';
export const speakers = ['Hernán', 'Matías', 'Nahuel', 'Diego'] as const;
export type PresentationSlide = {
    id: string;
    section: string;
    title: string;
    speaker?: typeof speakers[number];
    /** Rehearsal estimate only. Never schedules or triggers navigation. */
    durationSeconds?: number;
    notes?: string[];
    enabled?: boolean;
    theme?: 'light' | 'dark';
    render: ReactNode;
};
export const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
export function timeline(slides: PresentationSlide[]) { let accumulated = 0; return slides.filter(s => s.enabled !== false).map(slide => { accumulated += slide.durationSeconds ?? 0; return { ...slide, accumulated }; }); }

export const enabledSlides = (slides: PresentationSlide[]) => slides.filter(slide => slide.enabled !== false);
