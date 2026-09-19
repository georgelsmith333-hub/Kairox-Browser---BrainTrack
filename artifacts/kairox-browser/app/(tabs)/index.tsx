import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@workspace/kairox-design-system/hooks/use-colors';
import { IconButton, KairoxMark, Metric, SearchField, SectionTitle, Screen, StatusPill, Surface } from '@/components/KairoxUI';
import { useKairox } from '@/context/KairoxContext';

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { profiles, activeProfileId, settings, profileTabs } = useKairox();
  const [address, setAddress] = useState('');
  const activeProfile = profiles.find((profile) => profile.id === activeProfileId) ?? profiles[0];
  const recentTabs = profileTabs(activeProfileId).filter((tab) => tab.url !== 'kairox://home');
  const openAddress = () => {
    if (!address.trim()) return;
    router.push({ pathname: '/browser', params: { url: address.trim() } });
    setAddress('');
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topbar}><KairoxMark animated /><Pressable testID="active-profile" accessibilityRole="button" onPress={() => router.push('/(tabs)/profiles')} style={({ pressed }) => [styles.profileButton, { backgroundColor: colors.secondary, opacity: pressed ? 0.78 : 1 }]}><View style={[styles.profileDot, { backgroundColor: colors.primary }]} /><Text style={[styles.profileName, { color: colors.foreground }]}>{activeProfile.name}</Text><Ionicons name="chevron-down" size={14} color={colors.mutedForeground} /></Pressable></View>
        <View style={[styles.intro, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.introGlow, { backgroundColor: colors.accent }]} /><Text style={[styles.kicker, { color: colors.primary }]}>MORE THAN BROWSING</Text><Text style={[styles.title, { color: colors.foreground }]}>A quieter way{'\n'}to move online.</Text><Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Profiles, privacy, and developer tools that stay out of your way until you need them.</Text><View style={styles.introMeta}><StatusPill label="Local by default" tone="good" /><Text style={[styles.introMetaText, { color: colors.mutedForeground }]}>Built for clear control</Text></View></View>
        <SearchField value={address} onChangeText={setAddress} onSubmitEditing={openAddress} placeholder="Search or enter an address" />
        <View style={styles.routeLine}><StatusPill label={`Privacy: ${settings.privacyMode}`} tone="good" /><StatusPill label={`Route: ${settings.routeMode === 'direct' ? 'Direct' : 'User route'}`} /><StatusPill label="Engine: Expo preview" /></View>
        <SectionTitle eyebrow="Continue browsing" title="Your workspace" action="See tabs" onAction={() => router.push('/(tabs)/tabs')} />
        {recentTabs.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalGap}>{recentTabs.slice(0, 4).map((tab) => <Pressable key={tab.id} onPress={() => router.push({ pathname: '/browser', params: { url: tab.url } })} style={[styles.recentCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.recentIcon, { backgroundColor: colors.accent }]}><Text style={[styles.recentIconText, { color: colors.accentForeground }]}>{tab.title.slice(0, 1).toUpperCase()}</Text></View><Text numberOfLines={1} style={[styles.recentTitle, { color: colors.foreground }]}>{tab.title}</Text><Text numberOfLines={1} style={[styles.recentUrl, { color: colors.mutedForeground }]}>{tab.url.replace(/^https?:\/\//, '')}</Text></Pressable>)}</ScrollView> : <Surface><Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your workspace is clear</Text><Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Open an address above to create your first browsing session.</Text></Surface>}
        <SectionTitle eyebrow="Power shortcuts" title="Open a lab" />
        <View style={styles.shortcutGrid}>{[
          { label: 'Inspector', icon: 'scan-outline' as const, route: '/(tabs)/lab' },
          { label: 'Network', icon: 'git-network-outline' as const, route: '/(tabs)/lab' },
          { label: 'Privacy', icon: 'shield-checkmark-outline' as const, route: '/(tabs)/menu' },
          { label: 'Capture', icon: 'aperture-outline' as const, route: '/(tabs)/lab' },
        ].map((shortcut) => <Pressable key={shortcut.label} accessibilityRole="button" onPress={() => router.push(shortcut.route as never)} style={({ pressed }) => [styles.shortcut, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}><View style={[styles.shortcutIcon, { backgroundColor: colors.secondary }]}><Ionicons name={shortcut.icon} size={20} color={colors.foreground} /></View><Text style={[styles.shortcutLabel, { color: colors.foreground }]}>{shortcut.label}</Text></Pressable>)}</View>
        <SectionTitle eyebrow="Your setup" title="At a glance" />
        <Surface><View style={styles.metrics}><Metric value={String(profiles.length)} label="profiles" /><Metric value={String(profileTabs(activeProfileId).length)} label="active tabs" /><Metric value="50" label="profile limit" /><View style={styles.setupCopy}><Text style={[styles.setupTitle, { color: colors.foreground }]}>Each profile gets its own space.</Text><Text style={[styles.setupText, { color: colors.mutedForeground }]}>Local data is separated by profile namespace. No account is required for browsing.</Text></View></View></Surface>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 18, paddingBottom: 120 },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 38 },
  profileButton: { borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 9 },
  profileDot: { width: 8, height: 8, borderRadius: 4 },
  profileName: { fontSize: 12, fontWeight: '700' },
  intro: { marginBottom: 23, borderRadius: 24, borderWidth: 1, padding: 19, overflow: 'hidden', position: 'relative' },
  introGlow: { position: 'absolute', width: 180, height: 180, borderRadius: 90, right: -76, top: -78, opacity: 0.75 },
  kicker: { fontSize: 11, letterSpacing: 1.5, fontWeight: '800', marginBottom: 10 },
  title: { fontSize: 36, lineHeight: 40, letterSpacing: -1.2, fontWeight: '700', marginBottom: 13 },
  subtitle: { fontSize: 15, lineHeight: 22, maxWidth: 330 },
  introMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20 },
  introMetaText: { fontSize: 11, fontWeight: '600' },
  routeLine: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 13 },
  horizontalGap: { gap: 12 },
  recentCard: { width: 180, minHeight: 122, borderRadius: 16, borderWidth: 1, padding: 14 },
  recentIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  recentIconText: { fontSize: 13, fontWeight: '800' },
  recentTitle: { fontSize: 14, fontWeight: '700', marginBottom: 5 },
  recentUrl: { fontSize: 11 },
  emptyTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  emptyText: { fontSize: 13, lineHeight: 19 },
  shortcutGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  shortcut: { width: '48%', minHeight: 92, borderRadius: 17, borderWidth: 1, padding: 12, justifyContent: 'space-between' },
  shortcutIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  shortcutLabel: { fontSize: 13, fontWeight: '700' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  setupCopy: { width: '100%', marginTop: 6, paddingTop: 14 },
  setupTitle: { fontSize: 14, fontWeight: '700', marginBottom: 5 },
  setupText: { fontSize: 13, lineHeight: 19 },
});
