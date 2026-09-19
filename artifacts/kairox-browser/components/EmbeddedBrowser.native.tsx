import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import type { WebViewErrorEvent, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview/lib/WebViewTypes';
import type { BrowserExtension, BrowserSettings } from '@/context/KairoxContext';

type EmbeddedBrowserProps = {
  sourceUrl: string;
  settings: BrowserSettings;
  extensions: BrowserExtension[];
  onNavigationStateChange: (navigation: WebViewNavigation) => void;
  onLoadStart: () => void;
  onLoadEnd: () => void;
  onError: (event: WebViewErrorEvent) => void;
  onMessage?: (event: WebViewMessageEvent) => void;
};

export type EmbeddedBrowserHandle = {
  goBack: () => void;
  goForward: () => void;
  reload: () => void;
};

const TRACKER_HOSTS = ['doubleclick.net', 'googlesyndication.com', 'google-analytics.com', 'facebook.net', 'adnxs.com', 'scorecardresearch.com', 'hotjar.com', 'segment.io'];

function userAgentFor(settings: BrowserSettings) {
  if (settings.userAgentPreset === 'custom' && settings.customUserAgent.trim()) return settings.customUserAgent.trim();
  if (settings.userAgentPreset === 'desktop') return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Kairox/1.1';
  if (settings.userAgentPreset === 'mobile') return 'Mozilla/5.0 (Linux; Android 15; Kairox) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36';
  return 'Mozilla/5.0 (Linux; Android 15; Kairox) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36 Kairox/1.1';
}

function extensionMatches(pattern: string, url: string) {
  const parts = pattern.trim().split('*').filter(Boolean);
  if (!parts.length) return true;
  let cursor = 0;
  return parts.every((part) => {
    const index = url.indexOf(part, cursor);
    if (index < 0) return false;
    cursor = index + part.length;
    return true;
  });
}

function injectedScript(settings: BrowserSettings, extensions: BrowserExtension[], currentUrl: string) {
  if (!settings.javaScriptEnabled) return undefined;
  const extensionCode = extensions.filter((extension) => extension.enabled && extensionMatches(extension.match, currentUrl)).map((extension) => `try { ${extension.code}\n } catch (error) { window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'extension-error', name: ${JSON.stringify(extension.name)}, message: String(error) })); }`).join('\n');
  const bridge = `
    (function() {
      if (!window.__kairoxBridgeInstalled) {
        window.__kairoxBridgeInstalled = true;
        ['log', 'warn', 'error'].forEach(function(level) {
          var original = console[level];
          console[level] = function() {
            try { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'console', level: level, message: Array.prototype.slice.call(arguments).map(String).join(' ') })); } catch (_) {}
            return original.apply(console, arguments);
          };
        });
      }
    })();
  `;
  return `${bridge}\n${extensionCode}\ntrue;`;
}

export const EmbeddedBrowser = forwardRef<EmbeddedBrowserHandle, EmbeddedBrowserProps>(function EmbeddedBrowser(
  { sourceUrl, settings, extensions, onNavigationStateChange, onLoadStart, onLoadEnd, onError, onMessage },
  ref,
) {
  const webViewRef = useRef<WebView>(null);
  useImperativeHandle(ref, () => ({
    goBack: () => webViewRef.current?.goBack(),
    goForward: () => webViewRef.current?.goForward(),
    reload: () => webViewRef.current?.reload(),
  }), []);

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: sourceUrl }}
      style={styles.webview}
      userAgent={userAgentFor(settings)}
      onNavigationStateChange={onNavigationStateChange}
      onLoadStart={onLoadStart}
      onLoadEnd={onLoadEnd}
      onError={onError}
      onMessage={onMessage}
      onShouldStartLoadWithRequest={(request) => {
        if (settings.blockPopups && (request.url.startsWith('intent:') || request.url.startsWith('market:'))) return false;
        if (settings.blockTrackers && TRACKER_HOSTS.some((host) => request.url.includes(host))) return false;
        return true;
      }}
      injectedJavaScriptBeforeContentLoaded={injectedScript(settings, extensions, sourceUrl)}
      startInLoadingState
      setSupportMultipleWindows={false}
      allowsBackForwardNavigationGestures
      javaScriptEnabled={settings.javaScriptEnabled}
      domStorageEnabled
      sharedCookiesEnabled={false}
      thirdPartyCookiesEnabled={settings.thirdPartyCookies}
      allowsInlineMediaPlayback
    />
  );
});

const styles = StyleSheet.create({
  webview: { flex: 1, backgroundColor: 'transparent' },
});