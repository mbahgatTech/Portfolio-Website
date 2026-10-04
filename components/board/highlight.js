import { useEffect, useRef } from 'react';

// Which strings are lit. The camera rests on a shot and lights its main item's
// strings; hovering or focusing a piece lights that piece's strings instead,
// until the pointer or focus leaves it. Lit strings carry data-on; lit pieces
// carry data-lit="on" (the piece) or "near" (pieces tied to it); the root carries
// data-lit-active while anything is lit. Nothing re-renders.

export function useBoardHighlight(rootRef, board) {
  const api = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    let resting = null;
    let pointed = null;
    let current;

    const apply = () => {
      const id = pointed || resting;
      if (id === current) return;
      current = id;
      root.querySelectorAll('[data-on]').forEach((el) => el.removeAttribute('data-on'));
      root.querySelectorAll('[data-lit]').forEach((el) => el.removeAttribute('data-lit'));
      if (!id) {
        root.removeAttribute('data-lit-active');
        return;
      }
      root.setAttribute('data-lit-active', '');
      root.querySelectorAll(`[data-from="${id}"], [data-to="${id}"]`).forEach((el) => el.setAttribute('data-on', ''));
      root.querySelectorAll(`[data-board-item="${id}"]`).forEach((el) => el.setAttribute('data-lit', 'on'));
      (board.adjacency[id] || []).forEach((other) => {
        root.querySelectorAll(`[data-board-item="${other}"]`).forEach((el) => el.setAttribute('data-lit', 'near'));
      });
    };

    const itemOf = (target) => (target && target.closest ? target.closest('[data-board-item]') : null);
    const onOver = (event) => {
      if (event.pointerType === 'touch') return;
      const item = itemOf(event.target);
      pointed = item ? item.getAttribute('data-board-item') : null;
      apply();
    };
    const onLeave = () => {
      pointed = null;
      apply();
    };
    const onFocusIn = (event) => {
      const item = itemOf(event.target);
      if (!item) return;
      pointed = item.getAttribute('data-board-item');
      apply();
    };
    const onFocusOut = (event) => {
      if (itemOf(event.relatedTarget)) return;
      pointed = null;
      apply();
    };

    api.current = {
      rest(id) {
        resting = id || null;
        apply();
      },
    };
    root.addEventListener('pointerover', onOver);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('focusin', onFocusIn);
    root.addEventListener('focusout', onFocusOut);
    return () => {
      api.current = null;
      root.removeEventListener('pointerover', onOver);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('focusin', onFocusIn);
      root.removeEventListener('focusout', onFocusOut);
    };
  }, [rootRef, board]);

  return api;
}
