import React, { MutableRefObject } from 'react';

import { canUseDOM } from './common';

/**
 * React.Ref uses the readonly type `React.RefObject` instead of
 * `React.MutableRefObject`, We pretty much always assume ref objects are
 * mutable (at least when we create them), so this type is a workaround so some
 * of the weird mechanics of using refs with TS.
 *
 * Reference:
 * https://github.com/reach/reach-ui/blob/v0.10.4/packages/utils/src/types.tsx#L13-L17
 */
export type AssignableRef<ValueType> =
  | {
      bivarianceHack(instance: ValueType | null): void;
    }['bivarianceHack']
  | MutableRefObject<ValueType | null>;

/**
 * Passes or assigns an arbitrary value to a ref function or object.
 *
 * Reference:
 * https://github.com/reach/reach-ui/blob/v0.10.1/packages/utils/src/index.tsx#L128-L148
 */
export function assignRef<RefValueType = any>(
  ref: AssignableRef<RefValueType> | null | undefined,
  value: any
): void {
  if (ref == null) return;
  if (typeof ref === 'function') {
    ref(value);
  } else {
    try {
      ref.current = value;
    } catch (error) {
      throw new Error(`Cannot assign value "${value}" to ref "${ref}"`);
    }
  }
}

export function createNamedContext<ContextValueType>(
  name: string,
  defaultValue: ContextValueType
): React.Context<ContextValueType> {
  const Ctx = React.createContext<ContextValueType>(defaultValue);
  Ctx.displayName = name;
  return Ctx;
}

/**
 * Reference:
 * https://gist.github.com/sw-yx/f18fe6dd4c43fddb3a4971e80114a052#file-createctx-nonullcheck-tsx-L3-L11
 */
export function createContextHookWithProvider<A>(
  name: string,
  defaultValue?: A
) {
  const context = createNamedContext<A | undefined>(name, defaultValue);
  function useCtx() {
    const ctx = React.useContext(context);
    if (!ctx) throw new Error('useCtx must be inside a Provider with a value');
    return ctx;
  }
  return [useCtx, context.Provider] as const;
}

/**
 * Reference:
 * https://github.com/reach/reach-ui/blob/v0.10.4/packages/utils/src/index.tsx#L26-L56
 *
 *
 * React currently throws a warning when using useLayoutEffect on the server.
 * To get around it, we can conditionally useEffect on the server (no-op) and
 * useLayoutEffect in the browser. We occasionally need useLayoutEffect to
 * ensure we don't get a render flash for certain operations, but we may also
 * need affected components to render on the server. One example is when setting
 * a component's descendants to retrieve their index values.
 *
 * Important to note that using this hook as an escape hatch will break the
 * eslint dependency warnings unless you rename the import to `useLayoutEffect`.
 * Use sparingly only when the effect won't effect the rendered HTML to avoid
 * any server/client mismatch.
 *
 * If a useLayoutEffect is needed and the result would create a mismatch, it's
 * likely that the component in question shouldn't be rendered on the server at
 * all, so a better approach would be to lazily render those in a parent
 * component after client-side hydration.
 *
 * TODO: We are calling useLayoutEffect in a couple of places that will likely
 * cause some issues for SSR users, whether the warning shows or not. Audit and
 * fix these.
 *
 * https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85
 * https://github.com/reduxjs/react-redux/blob/master/src/utils/useIsomorphicLayoutEffect.js
 *
 * @param effect
 * @param deps
 */
export const useIsomorphicLayoutEffect = canUseDOM()
  ? React.useLayoutEffect
  : React.useEffect;
