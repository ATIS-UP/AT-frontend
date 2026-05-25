import { Helmet as HelmetBase, HelmetProvider as HelmetProviderBase } from 'react-helmet-async';

declare module 'react-helmet-async' {
  export const Helmet: typeof HelmetBase;
  export const HelmetProvider: typeof HelmetProviderBase;
}

export {};
