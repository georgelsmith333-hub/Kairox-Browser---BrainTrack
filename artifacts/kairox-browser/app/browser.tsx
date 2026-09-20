import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Linking, Modal, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { useColors } from '@workspace/kairox-design-system/hooks/use-colors';
import { IconButton, Screen, StatusPill, Surface } from '@/components/KairoxUI';
import { useKairox } from '@/context/KairoxContext';
import { EmbeddedBrowser } from '@/components/EmbeddedBrowser';
import type { EmbeddedBrowserHandle } from '@/components/EmbeddedBrowser';

function normalizedUrl(value: string, searchEngine: 'google' | 'duckduckgo' | 'brave' = 'google', httpsFirst = true) {
  if (value.startsWith('http://')) return httpsFirst ? `https://${value.slice('http://'.length)}` : value;
  if (value.startsWith('https://')) return value;
  if (value.includes('.') && !value.includes(' ')) return `https://${value}`;
  const searchHosts = {
    google: 'https://www.google.com/search?q=',
    duckduckgo: 'https://duckduckgo.com/?q=',
    brave: 'https://search.brave.com/search?q=',
  };
  return `${searchHosts[searchEngine]}${encodeURIComponent(value)}`;
}

export default function BrowserScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ url?: string }>();
  const { activeProfileId, profiles, settings, addTab, addHistory, toggleBookmark, isBookmarked } = useKairox();
  const initialInput = params.url ?? 'example.com';
  const initialUrl = normalizedUrl(initialInput, settings.searchEngine, settings.httpsFirst);
  const [address, setAddress] = useState(params.url ?? '');
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [httpFallbackUrl, setHttpFallbackUrl] = useState<string | null>(
    settings.httpsFirst && initialInput.startsWith('http://') ? normalizedUrl(initialInput, settings.searchEngine, false) : null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const [consoleMessages, setConsoleMessages] = useState<string[]>([]);
  const activeProfile = profiles.find((profile) => profile.id === activeProfileId) ?? profiles[0];
  const webViewRef = useRef<EmbeddedBrowserHandle | null>(null);
  const target = useMemo(() => normalizedUrl(address || 'example.com', settings.searchEngine, settings.httpsFirst), [address, settings.searchEngine, settings.httpsFirst]);
  const openPage = () => {
    const rawAddress = address || 'example.com';
    const nextUrl = normalizedUrl(rawAddress, settings.searchEngine, settings.httpsFirst);
    setCurrentUrl(nextUrl);
    setHttpFallbackUrl(settings.httpsFirst && rawAddress.startsWith('http://') ? normalizedUrl(rawAddress, settings.searchEngine, false) : null);
    setLoadError(false);
    addTab(nextUrl, nextUrl.replace(/^https?:\/\//, '').split('/')[0]);
    addHistory(nextUrl, nextUrl.replace(/^https?:\/\//, '').split('/')[0]);
  };
  const handoffToDeviceBrowser = async () => {
    addHistory(currentUrl);
    if (Platform.OS === 'web') {
      await Linking.openURL(currentUrl);
      return;
    }
    await WebBrowser.openBrowserAsync(currentUrl);
  };
  const sharePage = async () => {
    await Share.share({ message: currentUrl, url: currentUrl });
  };
  const openHelp = () => Linking.openURL('https://developer.mozilla.org');
  const handleMessage = (event: { nativeEvent?: { data?: string } }) => {
    try {
      const payload = JSON.parse(event.nativeEvent?.data ?? '{}') as { type?: string; level?: string; message?: string; name?: string };
      if (payload.type === 'console' && payload.message) setConsoleMessages((previous) => [`${payload.level ?? 'log'}  ${payload.message}`, ...previous].slice(0, 20));
      if (payload.type === 'extension-error' && payload.message) setConsoleMessages((previous) => [`extension ${payload.name ?? 'script'}  ${payload.message}`, ...previous].slice(0, 20));
    } catch {
      // Ignore messages that are not Kairox bridge payloads.
    }
  };

  const previewShell = (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.identityRow}><StatusPill label="Profile isolated" tone="good" /><StatusPill label="HTTPS first" /><StatusPill label="Web preview only" tone="warn" /></View>
      <View style={styles.hero}>
        <Text style={[styles.heroEyebrow, { color: colors.primary }]}>KAIROX BROWSER</Text>
        <Text style={[styles.heroTitle, { color: colors.foreground }]}>A live page surface.{'\n'}Native on Android.</Text>
        <Text style={[styles.heroText, { color: colors.mutedForeground }]}>This Replit preview is running inside your current browser, so it uses a web frame. The Android app uses Kairox's embedded WebView as its own page engine. A system-browser handoff is only available when a site blocks web embedding.</Text>
        <View style={styles.buttonRow}>
          <Pressable onPress={openHelp} style={({ pressed }) => [styles.helpButton, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}><Text style={[styles.helpButtonText, { color: colors.foreground }]}>Engine docs</Text></Pressable>
        </View>
      </View>
      {loadError ? <Surface><Text style={[styles.infoTitle, { color: colors.foreground }]}>This page blocked the web preview</Text><Text style={[styles.infoText, { color: colors.mutedForeground }]}>The Kairox Android app can load pages through its embedded WebView. In this Replit preview, this site does not allow framing, so the device-browser handoff is an optional fallback.</Text><Pressable onPress={handoffToDeviceBrowser} style={[styles.fallbackButton, { backgroundColor: colors.secondary }]}><Ionicons name="open-outline" size={17} color={colors.foreground} /><Text style={[styles.fallbackButtonText, { color: colors.foreground }]}>Use device browser fallback</Text></Pressable></Surface> : null}
      <View style={[styles.previewFrame, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.previewFrameTop, { borderBottomColor: colors.border }]}><View style={styles.previewDots}><View style={[styles.previewDot, { backgroundColor: colors.destructive }]} /><View style={[styles.previewDot, { backgroundColor: colors.chart2 }]} /><View style={[styles.previewDot, { backgroundColor: colors.chart4 }]} /></View><Text numberOfLines={1} style={[styles.previewFrameLabel, { color: colors.mutedForeground }]}>{target.replace(/^https?:\/\//, '')}</Text></View><View style={styles.previewFrameBody}><EmbeddedBrowser sourceUrl={currentUrl} settings={settings} extensions={settings.extensions} onNavigationStateChange={() => undefined} onLoadStart={() => { setIsLoading(true); setLoadError(false); }} onLoadEnd={() => { setIsLoading(false); setHttpFallbackUrl(null); }} onError={() => { setIsLoading(false); if (httpFallbackUrl && currentUrl !== httpFallbackUrl) { setCurrentUrl(httpFallbackUrl); setAddress(httpFallbackUrl); setHttpFallbackUrl(null); setLoadError(false); } else { setLoadError(true); } }} /></View></View>
      <Surface><View style={styles.infoTop}><Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} /><Text style={[styles.infoTitle, { color: colors.foreground }]}>Session details</Text></View><View style={styles.infoGrid}><View><Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Address</Text><Text numberOfLines={1} style={[styles.infoValue, { color: colors.foreground }]}>{target}</Text></View><View><Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Profile space</Text><Text style={[styles.infoValue, { color: colors.foreground }]}>{activeProfile.storageNamespace}</Text></View><View><Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Protection</Text><Text style={[styles.infoValue, { color: colors.foreground }]}>Local controls enabled</Text></View></View></Surface>
    </ScrollView>
  );

  const nativeBrowser = (
    <View style={styles.webSurface}>
      {isLoading ? <View style={[styles.loadingBar, { backgroundColor: colors.primary }]} /> : null}
      {loadError ? <View style={[styles.errorOverlay, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}><Ionicons name="warning-outline" size={22} color={colors.primary} /><Text style={[styles.errorTitle, { color: colors.foreground }]}>Page unavailable</Text><Text style={[styles.errorText, { color: colors.mutedForeground }]}>Kairox is still the active engine. Retry the embedded page first; the device browser is only an optional fallback for sites that refuse WebView.</Text><Pressable onPress={() => { setLoadError(false); webViewRef.current?.reload(); }} style={[styles.retryButton, { backgroundColor: colors.primary }]}><Text style={[styles.retryText, { color: colors.primaryForeground }]}>Retry in Kairox</Text></Pressable><Pressable onPress={handoffToDeviceBrowser} style={[styles.retryButton, { backgroundColor: colors.secondary }]}><Text style={[styles.retryText, { color: colors.foreground }]}>Use device browser fallback</Text></Pressable></View> : null}
       <EmbeddedBrowser ref={webViewRef} sourceUrl={currentUrl} settings={settings} extensions={settings.extensions} onMessage={handleMessage} onNavigationStateChange={(navigation) => { setAddress(navigation.url); setCurrentUrl(navigation.url); setHttpFallbackUrl(null); addHistory(navigation.url, navigation.title ?? navigation.url); }} onLoadStart={() => { setIsLoading(true); setLoadError(false); }} onLoadEnd={() => { setIsLoading(false); setHttpFallbackUrl(null); }} onError={() => { setIsLoading(false); if (httpFallbackUrl && currentUrl !== httpFallbackUrl) { setCurrentUrl(httpFallbackUrl); setAddress(httpFallbackUrl); setHttpFallbackUrl(null); setLoadError(false); } else { setLoadError(true); } }} />
    </View>
  );

  const browserToolbar = (
    <View style={[styles.browserToolbar, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <IconButton name="chevron-back" onPress={() => webViewRef.current?.goBack()} label="Back page" />
      <IconButton name="chevron-forward" onPress={() => webViewRef.current?.goForward()} label="Forward page" />
      <IconButton name={isLoading ? 'close' : 'refresh'} onPress={() => webViewRef.current?.reload()} label={isLoading ? 'Stop loading' : 'Reload page'} />
      <IconButton name={isBookmarked(currentUrl) ? 'star' : 'star-outline'} onPress={() => toggleBookmark(currentUrl)} label={isBookmarked(currentUrl) ? 'Remove bookmark' : 'Save bookmark'} />
      <IconButton name="share-outline" onPress={sharePage} label="Share page" />
    </View>
  );

  const nativeOnlyView = Platform.OS !== 'web' ? <>{nativeBrowser}{browserToolbar}</> : null;
  const previewOnlyView = Platform.OS === 'web' ? previewShell : null;

  return <Screen><View style={styles.container}>
    <View style={styles.topbar}><IconButton name="arrow-back" onPress={() => router.back()} label="Go back" /><View style={styles.profileLine}><View style={[styles.profileDot, { backgroundColor: colors.primary }]} /><Text style={[styles.profileText, { color: colors.foreground }]}>{activeProfile.name}</Text></View><View style={styles.topActions}><IconButton name="ellipsis-horizontal" onPress={() => setShowInspector(true)} label="Browser actions" /></View></View>
    <View style={[styles.addressBar, { backgroundColor: colors.card, borderColor: colors.border }]}><Ionicons name={currentUrl.startsWith('https://') ? 'lock-closed-outline' : 'globe-outline'} size={16} color={colors.primary} /><TextInput accessibilityLabel="Browser address" value={address} onChangeText={setAddress} onSubmitEditing={openPage} autoCapitalize="none" autoCorrect={false} placeholder="Search or enter address" placeholderTextColor={colors.mutedForeground} style={[styles.addressInput, { color: colors.foreground }]} /><Pressable onPress={openPage} accessibilityRole="button"><Ionicons name="arrow-forward-circle" size={24} color={colors.primary} /></Pressable></View>
    {nativeOnlyView}
    {previewOnlyView}
  </View><Modal visible={showInspector} transparent animationType="slide" onRequestClose={() => setShowInspector(false)}><View style={styles.modalBackdrop}><View style={[styles.inspectorSheet, { backgroundColor: colors.card }]}><View style={styles.inspectorHeader}><View><Text style={[styles.inspectorEyebrow, { color: colors.primary }]}>POWER SESSION</Text><Text style={[styles.inspectorTitle, { color: colors.foreground }]}>Page controls</Text></View><IconButton name="close" onPress={() => setShowInspector(false)} label="Close page controls" /></View><View style={styles.inspectorGrid}><View><Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>User agent</Text><Text style={[styles.infoValue, { color: colors.foreground }]}>{settings.userAgentPreset}</Text></View><View><Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Route</Text><Text style={[styles.infoValue, { color: colors.foreground }]}>{settings.routeMode === 'direct' ? 'direct' : 'configured'}</Text></View><View><Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Scripts</Text><Text style={[styles.infoValue, { color: colors.foreground }]}>{settings.extensions.filter((extension) => extension.enabled).length} active</Text></View></View><Pressable onPress={() => { setShowInspector(false); router.push('/(tabs)/menu'); }} style={[styles.sheetAction, { backgroundColor: colors.secondary }]}><Ionicons name="options-outline" size={18} color={colors.foreground} /><Text style={[styles.sheetActionText, { color: colors.foreground }]}>Open engine settings</Text></Pressable><Pressable onPress={() => setConsoleMessages([])} style={[styles.sheetAction, { backgroundColor: colors.secondary }]}><Ionicons name="trash-outline" size={18} color={colors.foreground} /><Text style={[styles.sheetActionText, { color: colors.foreground }]}>Clear console bridge</Text></Pressable><Text style={[styles.consoleHeading, { color: colors.foreground }]}>Console bridge</Text><View style={[styles.consoleBox, { backgroundColor: colors.background }]}>{consoleMessages.length ? consoleMessages.map((message, index) => <Text key={`${message}-${index}`} style={[styles.consoleLine, { color: colors.mutedForeground }]}>{message}</Text>) : <Text style={[styles.consoleLine, { color: colors.mutedForeground }]}>No page messages captured yet.</Text>}</View><Text style={[styles.sheetNote, { color: colors.mutedForeground }]}>Kairox only receives console messages emitted by the page bridge. It does not collect cookies, passwords, or authorization headers.</Text></View></View></Modal></Screen>;
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 16 },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 },
  topActions: { flexDirection: 'row' },
  profileLine: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  profileDot: { width: 7, height: 7, borderRadius: 4 },
  profileText: { fontSize: 12, fontWeight: '700' },
  addressBar: { minHeight: 52, borderRadius: 16, borderWidth: 1, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 8 },
  addressInput: { flex: 1, fontSize: 14, paddingVertical: 13 },
  page: { paddingTop: 17, paddingBottom: 50, gap: 14 },
  identityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  hero: { paddingVertical: 31 },
  heroEyebrow: { fontSize: 11, letterSpacing: 1.5, fontWeight: '800', marginBottom: 11 },
  heroTitle: { fontSize: 31, lineHeight: 35, fontWeight: '700', letterSpacing: -0.8 },
  heroText: { fontSize: 14, lineHeight: 21, marginTop: 14 },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 22 },
  openButton: { alignSelf: 'flex-start', borderRadius: 14, paddingHorizontal: 15, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', gap: 8 },
  openButtonText: { fontSize: 13, fontWeight: '700' },
  helpButton: { alignSelf: 'flex-start', borderRadius: 14, paddingHorizontal: 15, paddingVertical: 12, borderWidth: 1, justifyContent: 'center' },
  helpButtonText: { fontSize: 13, fontWeight: '700' },
  previewFrame: { height: 420, borderRadius: 19, borderWidth: 1, overflow: 'hidden', marginTop: 2 },
  previewFrameTop: { minHeight: 39, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingHorizontal: 12, gap: 10 },
  previewDots: { flexDirection: 'row', gap: 5 },
  previewDot: { width: 7, height: 7, borderRadius: 4 },
  previewFrameLabel: { flex: 1, fontSize: 11, fontFamily: 'monospace' },
  previewOpen: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  previewFrameBody: { flex: 1 },
  fallbackButton: { alignSelf: 'flex-start', borderRadius: 13, paddingHorizontal: 13, paddingVertical: 11, marginTop: 15, flexDirection: 'row', gap: 7, alignItems: 'center' },
  fallbackButtonText: { fontSize: 12, fontWeight: '700' },
  infoTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  infoTitle: { fontSize: 14, fontWeight: '700' },
  infoText: { fontSize: 13, lineHeight: 19, marginTop: 8 },
  infoGrid: { gap: 14 },
  infoLabel: { fontSize: 11, marginBottom: 4 },
  infoValue: { fontFamily: 'monospace', fontSize: 12 },
  webSurface: { flex: 1, overflow: 'hidden', borderRadius: 16, marginTop: 13, position: 'relative' },
  loadingBar: { position: 'absolute', left: 0, right: 0, top: 0, height: 3, zIndex: 2 },
  errorOverlay: { position: 'absolute', zIndex: 3, left: 20, right: 20, top: '35%', borderRadius: 18, padding: 20, alignItems: 'center', gap: 8 },
  errorTitle: { fontSize: 16, fontWeight: '700' },
  errorText: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
  retryButton: { borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10, marginTop: 4 },
  retryText: { fontSize: 13, fontWeight: '700' },
  browserToolbar: { minHeight: 58, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2, marginTop: 10 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.56)' },
  inspectorSheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 22, gap: 12, maxHeight: '78%' },
  inspectorHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inspectorEyebrow: { fontSize: 10, letterSpacing: 1.4, fontWeight: '800' },
  inspectorTitle: { fontSize: 24, fontWeight: '700', marginTop: 4 },
  inspectorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, paddingVertical: 9 },
  sheetAction: { minHeight: 48, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  sheetActionText: { fontSize: 13, fontWeight: '700' },
  consoleHeading: { fontSize: 14, fontWeight: '700', marginTop: 5 },
  consoleBox: { minHeight: 100, maxHeight: 150, borderRadius: 13, padding: 11 },
  consoleLine: { fontFamily: 'monospace', fontSize: 10, lineHeight: 16 },
  sheetNote: { fontSize: 11, lineHeight: 16 },
});