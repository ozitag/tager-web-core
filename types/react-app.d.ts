/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

/**
 * Source:
 * https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/lib/react-app.d.ts
 */
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly NEXT_PUBLIC_ENV:
      | 'production'
      | 'development'
      | 'local'
      | undefined;
    readonly NEXT_PUBLIC_ORIGIN: string | undefined;
    readonly NEXT_PUBLIC_SSR_API_URL: string | undefined;
    readonly NEXT_PUBLIC_CSR_API_URL: string | undefined;
    readonly NEXT_PUBLIC_SENTRY_DSN: string | undefined;
    readonly NEXT_PUBLIC_SENTRY_ENVIRONMENT: 'web' | 'admin' | undefined;
    readonly NEXT_PUBLIC_YANDEX_METRIKA_COUNTER_ID: string | undefined;
    readonly NEXT_PUBLIC_GOOGLE_ANALYTICS_TRACKING_ID: string | undefined;
    readonly NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID: string | undefined;
    readonly NEXT_PUBLIC_FACEBOOK_PIXEL_ID: string | undefined;
  }
}

declare module '*.bmp' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  import * as React from 'react';

  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;

  const src: string;
  export default src;
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
