import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@workspace/kairox-design-system/hooks/use-colors';
import { Metric, SectionTitle, Screen, StatusPill, Surface } from '@/components/KairoxUI';
import { useKairox } from '@/context/KairoxContext';

const tools = [
  { key: 'inspector', label: 'Inspector', icon: 'scan-outline' as const, detail: 'Inspect elements and metadata when the native engine exposes a live page session.' },
  { key: 'console', label: 'Console', icon: 'terminal-outline' as const, detail: 'Collect page console events without exposing cookies or authorization headers.' },
  { key: 'network', label: 'Network', icon: 'git-network-outline' as const, detail: 'Review request timing and route diagnostics from the active session.' },
  { key: 'storage', label: 'Storage', icon: 'server-outline' as const, detail: 'Review profile-scoped storage once a native engine session is active.' },
  { key: 'headers', label: 'Headers', icon: 'code-slash-outline' as const, detail: 'Review the supported presentation preset and safe request metadata.' },
  { key: 'capture', label: 'Capture', icon: 'aperture-outline' as const, detail: 'Capture viewport evidence or extract readable page content from an allowed page.' },
];

export default function LabScreen() {
  const colors = useColors();
  const { settings, updateSettings } = useKairox();
  const [activeTool, setActiveTool] = useState('network');
  const [checking, setChecking] = useState(false);
  const [routeResult, setRouteResult] = useState<{ ok: boolean; latency?: number; detail: string } | null>(null);
  const active = tools.find((tool) => tool.key === activeTool) ?? tools[0];
  const checkRoute = async () => {
    setChecking(true);
    setRouteResult(null);
    if (settings.routeMode !== 'direct') {
      setChecking(false);
      setRouteResult({ ok: false, detail: 'Proxy profile saved only' });
      return;
    }
    const startedAt = Date.now();
    try {
      const response = await fetch('https://www.gstatic.com/generate_204', { method: 'GET' });
      setRouteResult({ ok: response.ok, latency: Date.now() - startedAt, detail: response.ok ? 'Direct transport reachable' : `HTTP ${response.status}` });
    } catch {
      setRouteResult({ ok: false, detail: 'Direct transport unavailable' });
    } finally {
      setChecking(false);
    }
  };

  return <Screen><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View><Text style={[styles.eyebrow, { color: colors.primary }]}>LABS</Text><Text style={[styles.title, { color: colors.foreground }]}>Make the invisible legible.</Text><Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Advanced controls stay observable, bounded, and separate from everyday browsing.</Text></View>
    <SectionTitle eyebrow="Network lab" title="Current route" action={settings.routeMode === 'direct' ? 'Use a route' : 'Use direct'} onAction={() => updateSettings({ routeMode: settings.routeMode === 'direct' ? 'user' : 'direct' })} />
    <Surface><View style={styles.routeHeader}><View style={[styles.routeIcon, { backgroundColor: colors.accent }]}><Ionicons name="git-network-outline" size={20} color={colors.accentForeground} /></View><View style={styles.routeCopy}><Text style={[styles.routeTitle, { color: colors.foreground }]}>{settings.routeMode === 'direct' ? 'Direct connection' : 'User-supplied route'}</Text><Text style={[styles.routeText, { color: colors.mutedForeground }]}>{settings.routeMode === 'direct' ? 'No proxy configured' : 'Endpoint configuration is local to this profile'}</Text></View><StatusPill label={settings.routeMode === 'direct' ? 'READY' : 'CONFIGURE'} tone={settings.routeMode === 'direct' ? 'good' : 'warn'} /></View><View style={styles.metricRow}><Metric value={routeResult?.latency ? `${routeResult.latency} ms` : '—'} label="last latency" /><Metric value={routeResult ? (routeResult.ok ? '100%' : '0%') : '—'} label="success rate" /><Metric value={routeResult?.ok ? 'REACHABLE' : settings.routeMode === 'direct' ? 'UNTESTED' : 'NOT APPLIED'} label="transport" /></View><Pressable accessibilityRole="button" onPress={checkRoute} style={({ pressed }) => [styles.checkButton, { backgroundColor: colors.primary, opacity: pressed ? 0.7 : 1 }]}>{checking ? <ActivityIndicator color={colors.primaryForeground} /> : <Ionicons name="pulse-outline" size={18} color={colors.primaryForeground} />}<Text style={[styles.checkText, { color: colors.primaryForeground }]}>{checking ? 'Checking direct transport' : routeResult ? routeResult.detail : 'Run real connectivity check'}</Text></Pressable><Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>This check measures a real direct HTTPS request. A saved proxy profile is not reported as active until a native Android proxy bridge applies it.</Text></Surface>
    <SectionTitle eyebrow="Developer lab" title="Choose a tool" />
    <View style={styles.toolGrid}>{tools.map((tool) => <Pressable key={tool.key} accessibilityRole="button" onPress={() => setActiveTool(tool.key)} style={[styles.tool, { backgroundColor: activeTool === tool.key ? colors.accent : colors.card, borderColor: activeTool === tool.key ? colors.primary : colors.border }]}><Ionicons name={tool.icon} size={20} color={activeTool === tool.key ? colors.accentForeground : colors.foreground} /><Text style={[styles.toolLabel, { color: activeTool === tool.key ? colors.accentForeground : colors.foreground }]}>{tool.label}</Text></Pressable>)}</View>
    <Surface style={styles.toolDetail}><View style={styles.toolDetailTop}><View style={[styles.liveDot, { backgroundColor: activeTool === 'console' || activeTool === 'headers' || activeTool === 'network' ? colors.primary : colors.mutedForeground }]} /><Text style={[styles.toolDetailEyebrow, { color: activeTool === 'console' || activeTool === 'headers' || activeTool === 'network' ? colors.primary : colors.mutedForeground }]}>{activeTool === 'console' || activeTool === 'headers' || activeTool === 'network' ? 'AVAILABLE' : 'BOUNDARY'}</Text></View><Text style={[styles.toolDetailTitle, { color: colors.foreground }]}>{active.label}</Text><Text style={[styles.toolDetailText, { color: colors.mutedForeground }]}>{active.detail}</Text><View style={[styles.capability, { backgroundColor: colors.muted }]}><Ionicons name={activeTool === 'console' || activeTool === 'headers' || activeTool === 'network' ? 'checkmark-circle-outline' : 'information-circle-outline'} size={16} color={colors.mutedForeground} /><Text style={[styles.capabilityText, { color: colors.mutedForeground }]}>{activeTool === 'console' ? 'Open a page, then use Browser actions to view the live console bridge. Only page-emitted console messages are captured.' : activeTool === 'headers' ? 'The selected user-agent string is applied to Android WebView on the next page load.' : activeTool === 'network' ? 'The route check above measures a real direct request. Request-level interception is not claimed.' : 'This capability is intentionally not fabricated: the stock WebView does not expose a safe DOM or page-storage inspector.'}</Text></View></Surface>
  </ScrollView></Screen>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 22, paddingBottom: 120 },
  eyebrow: { fontSize: 11, letterSpacing: 1.5, fontWeight: '800', marginBottom: 9 },
  title: { fontSize: 32, lineHeight: 37, fontWeight: '700', letterSpacing: -0.8 },
  subtitle: { fontSize: 14, lineHeight: 21, marginTop: 10, maxWidth: 350 },
  routeHeader: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  routeIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  routeCopy: { flex: 1, gap: 4 },
  routeTitle: { fontSize: 14, fontWeight: '700' },
  routeText: { fontSize: 11 },
  metricRow: { flexDirection: 'row', gap: 28, paddingVertical: 18, marginTop: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'transparent' },
  checkButton: { minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  checkText: { fontSize: 13, fontWeight: '700' },
  disclaimer: { fontSize: 11, lineHeight: 17, marginTop: 12 },
  toolGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  tool: { width: '31.5%', minHeight: 74, borderWidth: 1, borderRadius: 15, padding: 11, justifyContent: 'space-between' },
  toolLabel: { fontSize: 12, fontWeight: '700' },
  toolDetail: { marginTop: 15, gap: 9 },
  toolDetailTop: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  toolDetailEyebrow: { fontSize: 10, letterSpacing: 1.3, fontWeight: '800' },
  toolDetailTitle: { fontSize: 19, fontWeight: '700' },
  toolDetailText: { fontSize: 13, lineHeight: 19 },
  capability: { borderRadius: 13, padding: 11, flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 3 },
  capabilityText: { flex: 1, fontSize: 11, lineHeight: 16 },
});