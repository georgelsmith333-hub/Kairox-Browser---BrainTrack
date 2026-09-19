import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@workspace/kairox-design-system/hooks/use-colors';
import { IconButton, SectionTitle, Screen, StatusPill, Surface } from '@/components/KairoxUI';
import { useKairox } from '@/context/KairoxContext';

export default function TabsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { activeProfileId, profiles, addTab, closeTab, setActiveProfileId, profileTabs, bookmarks, history } = useKairox();
  const activeProfile = profiles.find((profile) => profile.id === activeProfileId) ?? profiles[0];
  const activeTabs = profileTabs(activeProfile.id);

  return <Screen><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.topbar}><View><Text style={[styles.eyebrow, { color: colors.primary }]}>BROWSER CORE</Text><Text style={[styles.title, { color: colors.foreground }]}>Tabs</Text></View><IconButton name="add" onPress={() => { addTab(); }} label="New tab" tone="primary" /></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.profileRail}>{profiles.map((profile) => <Pressable key={profile.id} onPress={() => setActiveProfileId(profile.id)} style={[styles.profileChip, { backgroundColor: profile.id === activeProfileId ? colors.accent : colors.secondary }]}><View style={[styles.profileMini, { backgroundColor: profile.id === activeProfileId ? colors.primary : colors.muted }]} /><Text style={[styles.profileChipText, { color: profile.id === activeProfileId ? colors.accentForeground : colors.foreground }]}>{profile.name}</Text></Pressable>)}</ScrollView>
    <SectionTitle eyebrow={`${activeTabs.length} open`} title={activeProfile.name} action="New tab" onAction={() => addTab()} />
    {activeTabs.map((tab) => <View key={tab.id} style={[styles.tabCard, { backgroundColor: colors.card, borderColor: colors.border }]}><Pressable onPress={() => router.push({ pathname: '/browser', params: { url: tab.url } })} style={({ pressed }) => [styles.tabMain, { opacity: pressed ? 0.75 : 1 }]}><View style={[styles.tabIcon, { backgroundColor: colors.accent }]}><Ionicons name={tab.private ? 'eye-off-outline' : 'globe-outline'} size={17} color={colors.accentForeground} /></View><View style={styles.tabCopy}><Text numberOfLines={1} style={[styles.tabTitle, { color: colors.foreground }]}>{tab.title}</Text><Text numberOfLines={1} style={[styles.tabUrl, { color: colors.mutedForeground }]}>{tab.url}</Text><View style={styles.tabMeta}><StatusPill label={tab.private ? 'Temporary' : activeProfile.name} tone={tab.private ? 'warn' : 'neutral'} /></View></View></Pressable><IconButton name="close" onPress={() => closeTab(tab.id)} label={`Close ${tab.title}`} /></View>)}
    <SectionTitle eyebrow={`${bookmarks.filter((bookmark) => bookmark.profileId === activeProfile.id).length} saved`} title="Bookmarks" />
    {bookmarks.filter((bookmark) => bookmark.profileId === activeProfile.id).length ? bookmarks.filter((bookmark) => bookmark.profileId === activeProfile.id).slice(0, 5).map((bookmark) => <Pressable key={bookmark.id} onPress={() => router.push({ pathname: '/browser', params: { url: bookmark.url } })} style={[styles.bookmarkRow, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.bookmarkIcon, { backgroundColor: colors.accent }]}><Ionicons name="star" size={15} color={colors.accentForeground} /></View><View style={styles.bookmarkCopy}><Text numberOfLines={1} style={[styles.tabTitle, { color: colors.foreground }]}>{bookmark.title}</Text><Text numberOfLines={1} style={[styles.tabUrl, { color: colors.mutedForeground }]}>{bookmark.url}</Text></View><Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} /></Pressable>) : <Surface><Text style={[styles.restoreTitle, { color: colors.foreground }]}>No bookmarks in this profile</Text><Text style={[styles.restoreText, { color: colors.mutedForeground }]}>Save a page from the browser toolbar and it will stay local to this profile.</Text></Surface>}
    <SectionTitle eyebrow={`${history.filter((entry) => entry.profileId === activeProfile.id).length} recent`} title="History" />
    {history.filter((entry) => entry.profileId === activeProfile.id).slice(0, 3).map((entry) => <Pressable key={entry.id} onPress={() => router.push({ pathname: '/browser', params: { url: entry.url } })} style={styles.historyRow}><Ionicons name="time-outline" size={17} color={colors.mutedForeground} /><Text numberOfLines={1} style={[styles.historyText, { color: colors.mutedForeground }]}>{entry.title}</Text><Text style={[styles.historyArrow, { color: colors.mutedForeground }]}>›</Text></Pressable>)}
    <Surface style={styles.restoreCard}><Ionicons name="sparkles-outline" size={20} color={colors.primary} /><View style={styles.restoreCopy}><Text style={[styles.restoreTitle, { color: colors.foreground }]}>Session restore is profile-scoped</Text><Text style={[styles.restoreText, { color: colors.mutedForeground }]}>Tabs are saved locally and reopen inside the profile that created them.</Text></View></Surface>
  </ScrollView></Screen>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 22, paddingBottom: 120 },
  topbar: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  eyebrow: { fontSize: 11, letterSpacing: 1.5, fontWeight: '800', marginBottom: 8 },
  title: { fontSize: 34, fontWeight: '700', letterSpacing: -0.9 },
  profileRail: { gap: 8, paddingVertical: 22 },
  profileChip: { borderRadius: 22, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 9 },
  profileMini: { width: 7, height: 7, borderRadius: 4 },
  profileChipText: { fontSize: 12, fontWeight: '700' },
  tabCard: { borderWidth: 1, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  tabMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  tabIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  tabCopy: { flex: 1, gap: 5 },
  tabTitle: { fontSize: 14, fontWeight: '700' },
  tabUrl: { fontSize: 11 },
  tabMeta: { flexDirection: 'row' },
  restoreCard: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginTop: 18 },
  restoreCopy: { flex: 1, gap: 5 },
  restoreTitle: { fontSize: 14, fontWeight: '700' },
  restoreText: { fontSize: 12, lineHeight: 18 },
  bookmarkRow: { borderWidth: 1, borderRadius: 16, minHeight: 58, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  bookmarkIcon: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  bookmarkCopy: { flex: 1, gap: 4 },
  historyRow: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 4 },
  historyText: { flex: 1, fontSize: 13 },
  historyArrow: { fontSize: 20 },
});