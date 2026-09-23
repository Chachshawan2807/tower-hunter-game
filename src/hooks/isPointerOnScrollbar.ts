function elementShowsVerticalScrollbar(el: HTMLElement): boolean {
  const { overflowY } = window.getComputedStyle(el);
  if (overflowY !== "auto" && overflowY !== "scroll") return false;
  return el.scrollHeight > el.clientHeight;
}

function elementShowsHorizontalScrollbar(el: HTMLElement): boolean {
  const { overflowX } = window.getComputedStyle(el);
  if (overflowX !== "auto" && overflowX !== "scroll") return false;
  return el.scrollWidth > el.clientWidth;
}

/**
 * True when the pointer is over a native scrollbar gutter of `el` (desktop).
 * Scrollbar clicks often target the scroll container itself, not its children.
 */
export function isPointerOnElementScrollbar(
  el: HTMLElement,
  clientX: number,
  clientY: number
): boolean {
  const rect = el.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  const verticalGutter = el.offsetWidth - el.clientWidth;
  if (verticalGutter > 0 && elementShowsVerticalScrollbar(el)) {
    const rtl = window.getComputedStyle(el).direction === "rtl";
    if (rtl) {
      if (x < verticalGutter) return true;
    } else if (x >= el.clientWidth) {
      return true;
    }
  }

  const horizontalGutter = el.offsetHeight - el.clientHeight;
  if (horizontalGutter > 0 && elementShowsHorizontalScrollbar(el)) {
    if (y >= el.clientHeight) return true;
  }

  return false;
}

export function isPointerOnScrollbar(
  target: Element,
  clientX: number,
  clientY: number
): boolean {
  let el: Element | null = target;
  while (el) {
    if (el instanceof HTMLElement && isPointerOnElementScrollbar(el, clientX, clientY)) {
      return true;
    }
    el = el.parentElement;
  }
  return false;
}
