import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import type { BrowserExtension, BrowserSettings } from '@/context/KairoxContext';
import type { EmbeddedBrowserHandle } from './EmbeddedBrowser.native';

type EmbeddedBrowserProps = {
  sourceUrl: string;
  settings?: BrowserSettings;
  extensions?: BrowserExtension[];
  onNavigationStateChange?: (navigation: { url: string; title?: string }) => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (event: unknown) => void;
};

export const EmbeddedBrowser = forwardRef<EmbeddedBrowserHandle, EmbeddedBrowserProps>(function EmbeddedBrowser(
  { sourceUrl, onLoadStart, onLoadEnd, onError },
  ref,
) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);

  useImperativeHandle(ref, () => ({
    goBack: () => window.history.back(),
    goForward: () => window.history.forward(),
    reload: () => frameRef.current?.contentWindow?.location.reload(),
  }), []);

  return React.createElement('iframe', {
    ref: frameRef,
    src: sourceUrl,
    title: `Kairox live preview for ${sourceUrl}`,
    onLoadStart,
    onLoad: onLoadEnd,
    onError,
    allow: 'accelerometer; autoplay; clipboard-read; clipboard-write; encrypted-media; fullscreen; geolocation; picture-in-picture',
    style: {
      border: 0,
      width: '100%',
      height: '100%',
      display: 'block',
      backgroundColor: 'transparent',
    },
  });
});