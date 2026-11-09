import { useRef, type PointerEvent } from 'react';

// Vertical/diagonal gestures belong to page scrolling, not photo navigation.
export function photoSwipeStep(deltaX: number, deltaY: number): -1 | 0 | 1 {
  if (Math.abs(deltaX) < 45 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.25) return 0;
  return deltaX < 0 ? 1 : -1;
}

export function usePhotoSwipe(onSwipe: (step: number) => void, enabled: boolean) {
  const start = useRef<{ id: number; x: number; y: number; navigate: boolean } | null>(null);
  const suppressClickUntil = useRef(0);
  return {
    onPointerDown(event: PointerEvent<HTMLElement>) {
      if (!event.isPrimary) {
        start.current = null;
        suppressClickUntil.current = Date.now() + 500;
        return;
      }
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      start.current = { id: event.pointerId, x: event.clientX, y: event.clientY, navigate: enabled };
      suppressClickUntil.current = 0;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerUp(event: PointerEvent<HTMLElement>) {
      const gesture = start.current;
      start.current = null;
      if (!gesture || gesture.id !== event.pointerId) return;
      const deltaX = event.clientX - gesture.x;
      const deltaY = event.clientY - gesture.y;
      if (Math.hypot(deltaX, deltaY) > 10) suppressClickUntil.current = Date.now() + 500;
      const step = photoSwipeStep(deltaX, deltaY);
      if (gesture.navigate && step) onSwipe(step);
    },
    onPointerCancel() {
      start.current = null;
      suppressClickUntil.current = Date.now() + 500;
    },
    allowClick() {
      const allowed = Date.now() >= suppressClickUntil.current;
      suppressClickUntil.current = 0;
      return allowed;
    },
  };
}
