import { lock, unlock, clearBodyLocks } from 'tua-body-scroll-lock';

import { isServer } from '../utils/common';

export type ScrollLockEvent = {
  isLocked: boolean;
  scrollbarWidthBeforeLock: number;
  currentScrollbarWidth: number;
};

class Scroller {
  private listeners: Array<(event: ScrollLockEvent) => void>;
  public isLocked: boolean;
  private scrollbarWidthBeforeLock: number;

  constructor() {
    this.listeners = [];
    this.isLocked = false;
    this.scrollbarWidthBeforeLock = this.getCurrentScrollbarWidth();
  }

  private setLocked(isLocked: boolean): void {
    this.isLocked = isLocked;
    this.notifyListeners();
  }

  public getCurrentScrollbarWidth(): number {
    if (isServer()) return 0;

    return window.innerWidth - document.body.clientWidth;
  }

  public getScrollbarWidthBeforeLock(): number {
    return this.isLocked
      ? this.scrollbarWidthBeforeLock
      : this.getCurrentScrollbarWidth();
  }

  lock(...args: Parameters<typeof lock>) {
    this.scrollbarWidthBeforeLock = this.getCurrentScrollbarWidth();
    lock(...args);
    this.setLocked(true);
  }

  unlock(...args: Parameters<typeof unlock>) {
    unlock(...args);
    this.setLocked(false);
  }

  unlockAll() {
    clearBodyLocks();
    this.setLocked(false);
  }

  private notifyListeners() {
    const event: ScrollLockEvent = {
      isLocked: this.isLocked,
      scrollbarWidthBeforeLock: this.scrollbarWidthBeforeLock,
      currentScrollbarWidth: this.getCurrentScrollbarWidth(),
    };

    this.listeners.forEach((listener) => {
      listener(event);
    });
  }

  subscribe(newListener: (event: ScrollLockEvent) => void) {
    this.listeners.push(newListener);

    const unsubscribe = () => {
      this.listeners = this.listeners.filter(
        (oldListener) => oldListener !== newListener
      );
    };

    return unsubscribe;
  }
}

export const scroller = new Scroller();
