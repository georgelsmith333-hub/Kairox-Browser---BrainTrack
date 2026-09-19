import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useColors } from '@workspace/kairox-design-system/hooks/use-colors';
import { Screen, SectionTitle, Surface } from '@/components/KairoxUI';
import { useKairox } from '@/context/KairoxContext';

function SettingRow({ icon, title, detail, value, onValueChange }: { icon: keyof typeof Ionicons.glyphMap; title: string; detail: string; value: boolean; onValueChange: (value: boolean) => void }) {
  const colors = useColors();
  return <View style={styles.settingRow}><View style={[styles.settingIcon, { backgroundColor: colors.secondary }]}><Ionicons name={icon} size={18} color={colors.foreground} /></View><View style={styles.settingCopy}><Text style={[styles.settingTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.settingDetail, { color: colors.mutedForeground }]}>{detail}</Text></View><Switch accessibilityLabel={title} value={value} onValueChange={onValueChange} trackColor={{ false: colors.muted, true: colors.accent }} thumbColor={value ? colors.primary : colors.mutedForeground} /></View>;
}

function ChoiceRow<T extends string>({ values, selected, labels, onSelect }: { values: readonly T[]; selected: T; labels: Record<T, string>; onSelect: (value: T) => void }) {
  const colors = useColors();
  return <View style={styles.choiceRow}>{values.map((value) => <Pressable key={value} onPress={() => onSelect(value)} style={[styles.choice, { backgroundColor: selected === value ? colors.accent : colors.secondary }]}><Text style={[styles.choiceText, { color: selected === value ? colors.accentForeground : colors.foreground }]}>{labels[value]}</Text></Pressable>)}</View>;
}

export default function MenuScreen() {
  const colors = useColors();
  const { settings, updateSettings, addExtension, updateExtension, deleteExtension } = useKairox();
  const [isExtensionOpen, setIsExtensionOpen] = useState(false);
  const [extensionName, setExtensionName] = useState('');
  const [extensionMatch, setExtensionMatch] = useState('*');
  const [extensionCode, setExtensionCode] = useState('');

  const saveExtension = () => {
    const created = addExtension({ name: extensionName, match: extensionMatch, code: extensionCode, enabled: true });
    if (!created) return;
    setExtensionName('');
    setExtensionMatch('*');
    setExtensionCode('');
    setIsExtensionOpen(false);
  };

  return <Screen><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <Text style={[styles.eyebrow, { color: colors.primary }]}>CONTROL CENTER</Text><Text style={[styles.title, { color: colors.foreground }]}>Engine settings</Text><Text style={[styles.subtitle, { color: colors.mutedForeground }]}>These controls change the Android page engine. The web preview keeps them visible but cannot host the native WebView.</Text>

    <SectionTitle eyebrow="Privacy center" title="Protection policy" />
    <Surface><SettingRow icon="shield-checkmark-outline" title="Tracker navigation filter" detail="Stops known tracker and advertising hosts when they become top-level navigations." value={settings.blockTrackers} onValueChange={(value) => updateSettings({ blockTrackers: value, trackingProtection: value })} /><View style={[styles.rule, { backgroundColor: colors.border }]} /><SettingRow icon="lock-closed-outline" title="HTTPS first" detail="Prefer secure connections before falling back." value={settings.httpsFirst} onValueChange={(value) => updateSettings({ httpsFirst: value })} /><View style={[styles.rule, { backgroundColor: colors.border }]} /><SettingRow icon="code-slash-outline" title="JavaScript" detail="Required by most modern sites; disable it for hostile or text-only pages." value={settings.javaScriptEnabled} onValueChange={(value) => updateSettings({ javaScriptEnabled: value })} /><View style={[styles.rule, { backgroundColor: colors.border }]} /><SettingRow icon="layers-outline" title="Third-party cookies" detail="Off by default. Turn on only for sites that need cross-site login." value={settings.thirdPartyCookies} onValueChange={(value) => updateSettings({ thirdPartyCookies: value })} /><View style={[styles.rule, { backgroundColor: colors.border }]} /><SettingRow icon="close-circle-outline" title="Block popup intents" detail="Stops intent and marketplace handoffs from the page session." value={settings.blockPopups} onValueChange={(value) => updateSettings({ blockPopups: value })} /><View style={[styles.rule, { backgroundColor: colors.border }]} /><SettingRow icon="sparkles-outline" title="Reduce motion" detail="Keep Kairox transitions brief and quiet." value={settings.reduceMotion} onValueChange={(value) => updateSettings({ reduceMotion: value })} /></Surface>

    <SectionTitle eyebrow="Identity" title="User agent" />
    <Surface><Text style={[styles.settingTitle, { color: colors.foreground }]}>Presentation string</Text><Text style={[styles.settingDetail, { color: colors.mutedForeground }]}>This is applied to the native WebView on the next page load. Sites can still identify other browser characteristics.</Text><ChoiceRow values={['kairox', 'mobile', 'desktop', 'custom'] as const} selected={settings.userAgentPreset} labels={{ kairox: 'Kairox', mobile: 'Mobile', desktop: 'Desktop', custom: 'Custom' }} onSelect={(userAgentPreset) => updateSettings({ userAgentPreset })} />{settings.userAgentPreset === 'custom' ? <TextInput accessibilityLabel="Custom user agent" value={settings.customUserAgent} onChangeText={(customUserAgent) => updateSettings({ customUserAgent })} placeholder="Paste a complete user-agent string" placeholderTextColor={colors.mutedForeground} style={[styles.textInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} autoCapitalize="none" autoCorrect={false} /> : null}</Surface>

    <SectionTitle eyebrow="Search" title="Default search engine" />
    <Surface><Text style={[styles.settingDetail, { color: colors.mutedForeground }]}>Search terms entered in the address bar use this provider. Direct URLs still open directly.</Text><ChoiceRow values={['google', 'duckduckgo', 'brave'] as const} selected={settings.searchEngine} labels={{ google: 'Google', duckduckgo: 'DuckDuckGo', brave: 'Brave' }} onSelect={(searchEngine) => updateSettings({ searchEngine })} /></Surface>

    <SectionTitle eyebrow="Network" title="Route behavior" />
    <Surface><Text style={[styles.settingTitle, { color: colors.foreground }]}>{settings.routeMode === 'direct' ? 'Direct connection' : 'User-supplied proxy profile'}</Text><Text style={[styles.settingDetail, { color: colors.mutedForeground }]}>The endpoint is stored locally. Expo WebView does not expose Android’s system proxy bridge, so direct mode remains active until a native proxy module is installed; Kairox never silently routes traffic through a public proxy.</Text><ChoiceRow values={['direct', 'user'] as const} selected={settings.routeMode} labels={{ direct: 'Direct', user: 'Proxy profile' }} onSelect={(routeMode) => updateSettings({ routeMode, proxy: { ...settings.proxy, enabled: routeMode === 'user' } })} />{settings.routeMode === 'user' ? <View style={styles.proxyFields}><View style={styles.inlineFields}><TextInput accessibilityLabel="Proxy host" value={settings.proxy.host} onChangeText={(host) => updateSettings({ proxy: { ...settings.proxy, host } })} placeholder="proxy.example.com" placeholderTextColor={colors.mutedForeground} style={[styles.textInput, styles.flexInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} autoCapitalize="none" autoCorrect={false} /><TextInput accessibilityLabel="Proxy port" value={settings.proxy.port} onChangeText={(port) => updateSettings({ proxy: { ...settings.proxy, port } })} placeholder="8080" placeholderTextColor={colors.mutedForeground} keyboardType="number-pad" style={[styles.textInput, styles.portInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /></View><ChoiceRow values={['http', 'https', 'socks5'] as const} selected={settings.proxy.scheme} labels={{ http: 'HTTP', https: 'HTTPS', socks5: 'SOCKS5' }} onSelect={(scheme) => updateSettings({ proxy: { ...settings.proxy, scheme } })} /></View> : null}</Surface>

    <SectionTitle eyebrow="Power user" title="Local add-on scripts" action="Add script" onAction={() => setIsExtensionOpen(true)} />
    <Surface><Text style={[styles.settingDetail, { color: colors.mutedForeground }]}>These are user-installed page scripts, similar to lightweight extensions. They run only on Android, only on matching URLs, and stay in local Kairox storage.</Text>{settings.extensions.length ? settings.extensions.map((extension) => <View key={extension.id} style={[styles.extensionRow, { borderBottomColor: colors.border }]}><View style={styles.extensionCopy}><Text style={[styles.settingTitle, { color: colors.foreground }]}>{extension.name}</Text><Text style={[styles.settingDetail, { color: colors.mutedForeground }]}>{extension.match}</Text></View><Switch accessibilityLabel={`Enable ${extension.name}`} value={extension.enabled} onValueChange={(enabled) => updateExtension(extension.id, { enabled })} trackColor={{ false: colors.muted, true: colors.accent }} thumbColor={extension.enabled ? colors.primary : colors.mutedForeground} /><Pressable accessibilityRole="button" onPress={() => deleteExtension(extension.id)} style={styles.deleteButton}><Ionicons name="trash-outline" size={18} color={colors.destructive} /></Pressable></View>) : <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No add-on scripts installed.</Text>}</Surface>

    <SectionTitle eyebrow="Expert guide" title="What is really active" />
    <Surface><Text style={[styles.guideLine, { color: colors.foreground }]}><Text style={{ color: colors.primary }}>01  </Text>Set a profile first. Profiles keep tabs, bookmarks, and history separated.</Text><Text style={[styles.guideLine, { color: colors.foreground }]}><Text style={{ color: colors.primary }}>02  </Text>Choose Desktop or Custom user agent, then reload the page to apply it.</Text><Text style={[styles.guideLine, { color: colors.foreground }]}><Text style={{ color: colors.primary }}>03  </Text>Add a script with a match pattern such as *example.com* and test it in the page session.</Text><Text style={[styles.guideLine, { color: colors.foreground }]}><Text style={{ color: colors.primary }}>04  </Text>Use Browser actions to inspect the console bridge. Kairox never reads passwords or authorization headers.</Text><Text style={[styles.guideLine, { color: colors.mutedForeground }]}>Proxy profile storage is ready, but actual routing needs a native Android proxy bridge; it is not safe to claim that a standard WebView switch changes network routing.</Text></Surface>

    <SectionTitle eyebrow="About Kairox" title="Keep browsing yours" />
    <Surface><Text style={[styles.aboutText, { color: colors.foreground }]}>No sign-in is required for normal browsing. Kairox keeps profile data local by default and gives advanced tools a clear boundary.</Text><Pressable onPress={() => Linking.openURL('https://developer.mozilla.org')} style={styles.aboutLink}><Text style={[styles.aboutLinkText, { color: colors.primary }]}>Read the browser engine docs</Text><Ionicons name="open-outline" size={15} color={colors.primary} /></Pressable></Surface>

    <Modal visible={isExtensionOpen} transparent animationType="slide" onRequestClose={() => setIsExtensionOpen(false)}><View style={styles.modalBackdrop}><View style={[styles.modal, { backgroundColor: colors.card }]}><Text style={[styles.modalEyebrow, { color: colors.primary }]}>LOCAL ADD-ON</Text><Text style={[styles.modalTitle, { color: colors.foreground }]}>Install a page script</Text><Text style={[styles.modalText, { color: colors.mutedForeground }]}>Only install code you understand. It runs inside the matching page and can change that page’s DOM.</Text><TextInput accessibilityLabel="Script name" value={extensionName} onChangeText={setExtensionName} placeholder="Script name" placeholderTextColor={colors.mutedForeground} style={[styles.textInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} /><TextInput accessibilityLabel="Match pattern" value={extensionMatch} onChangeText={setExtensionMatch} placeholder="*example.com*" placeholderTextColor={colors.mutedForeground} style={[styles.textInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} autoCapitalize="none" autoCorrect={false} /><TextInput accessibilityLabel="Script code" value={extensionCode} onChangeText={setExtensionCode} placeholder="document.body.style..." placeholderTextColor={colors.mutedForeground} style={[styles.codeInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]} multiline autoCapitalize="none" autoCorrect={false} /><View style={styles.modalActions}><Pressable onPress={() => setIsExtensionOpen(false)} style={[styles.modalButton, { backgroundColor: colors.secondary }]}><Text style={[styles.modalButtonText, { color: colors.foreground }]}>Cancel</Text></Pressable><Pressable onPress={saveExtension} style={[styles.modalButton, { backgroundColor: colors.primary }]}><Text style={[styles.modalButtonText, { color: colors.primaryForeground }]}>Install</Text></Pressable></View></View></View></Modal>
  </ScrollView></Screen>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 22, paddingBottom: 120 },
  eyebrow: { fontSize: 11, letterSpacing: 1.5, fontWeight: '800', marginBottom: 9 },
  title: { fontSize: 34, fontWeight: '700', letterSpacing: -0.9 },
  subtitle: { fontSize: 14, lineHeight: 21, marginTop: 10 },
  settingRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 11 },
  settingIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  settingCopy: { flex: 1, gap: 4 },
  settingTitle: { fontSize: 14, fontWeight: '700' },
  settingDetail: { fontSize: 11, lineHeight: 16 },
  rule: { height: 1, marginVertical: 4 },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 15 },
  choice: { borderRadius: 12, paddingHorizontal: 13, paddingVertical: 10 },
  choiceText: { fontSize: 12, fontWeight: '700' },
  textInput: { height: 48, borderWidth: 1, borderRadius: 13, paddingHorizontal: 13, fontSize: 13, marginTop: 12 },
  proxyFields: { marginTop: 4 },
  inlineFields: { flexDirection: 'row', gap: 8 },
  flexInput: { flex: 1 },
  portInput: { width: 90 },
  extensionRow: { minHeight: 58, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  extensionCopy: { flex: 1, gap: 4 },
  deleteButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 12, lineHeight: 18, marginTop: 15 },
  guideLine: { fontSize: 12, lineHeight: 19, marginBottom: 10 },
  aboutText: { fontSize: 13, lineHeight: 19 },
  aboutLink: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 17 },
  aboutLinkText: { fontSize: 13, fontWeight: '700' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.56)' },
  modal: { borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 22, gap: 10 },
  modalEyebrow: { fontSize: 11, letterSpacing: 1.5, fontWeight: '800' },
  modalTitle: { fontSize: 24, fontWeight: '700', marginBottom: 2 },
  modalText: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  codeInput: { minHeight: 130, borderWidth: 1, borderRadius: 13, padding: 13, fontFamily: 'monospace', fontSize: 12, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  modalButton: { flex: 1, alignItems: 'center', borderRadius: 14, paddingVertical: 14 },
  modalButtonText: { fontSize: 14, fontWeight: '700' },
});