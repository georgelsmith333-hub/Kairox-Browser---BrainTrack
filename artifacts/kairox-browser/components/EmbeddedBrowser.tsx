// Metro resolves the platform-specific implementation before this barrel at runtime.
// The native implementation is the type source for the shared Expo TypeScript check.
export { EmbeddedBrowser } from './EmbeddedBrowser.native';
export type { EmbeddedBrowserHandle } from './EmbeddedBrowser.native';