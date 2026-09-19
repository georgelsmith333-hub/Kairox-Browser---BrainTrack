import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useColors } from '@workspace/kairox-design-system/hooks/use-colors';
import { IconButton, SectionTitle, Screen, StatusPill, Surface } from '@/components/KairoxUI';
import { Profile, useKairox } from '@/context/KairoxContext';

export default function ProfilesScreen() {
  const colors = useColors();
  const router = useRouter();
  const { profiles, activeProfileId, profileTabs, setActiveProfileId, createProfile, cloneProfile, deleteProfile } = useKairox();
  const [query, setQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<Profile | null>(null);
  const visibleProfiles = profiles.filter((profile) => profile.name.toLowerCase().includes(query.toLowerCase()));
  const submitCreate = () => {
    const profile = createProfile(name);
    if (!profile) return;
    setName('');
    setIsCreateOpen(false);
  };
  const openProfile = (profile: Profile) => {
    setActiveProfileId(profile.id);
    router.push('/(tabs)/tabs');
  };
  const actionProfile = (action: 'clone' | 'delete') => {
    if (!selected) return;
    if (action === 'clone') cloneProfile(selected.id);
    if (action === 'delete') deleteProfile(selected.id);
    setSelected(null);
  };

  return <Screen><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.topbar}><View><Text style={[styles.eyebrow, { color: colors.primary }]}>PROFILE VAULT</Text><Text style={[styles.title, { color: colors.foreground }]}>Profiles</Text></View><IconButton name="add" onPress={() => setIsCreateOpen(true)} label="Create profile" tone="primary" /></View>
    <TextInput accessibilityLabel="Search profiles" value={query} onChangeText={setQuery} placeholder="Search profiles…" placeholderTextColor={colors.mutedForeground} style={[styles.search, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]} />
    <View style={styles.limitRow}><Text style={[styles.limitLabel, { color: colors.mutedForeground }]}>{profiles.length} of 50 profiles</Text><View style={[styles.limitTrack, { backgroundColor: colors.muted }]}><View style={[styles.limitFill, { width: `${Math.max(4, (profiles.length / 50) * 100)}%`, backgroundColor: colors.primary }]} /></View></View>
    <SectionTitle eyebrow="Hard separation by default" title="Your spaces" />
    {visibleProfiles.map((profile) => <Pressable key={profile.id} onPress={() => openProfile(profile)} onLongPress={() => setSelected(profile)} style={({ pressed }) => [styles.profileCard, { backgroundColor: colors.card, borderColor: profile.id === activeProfileId ? colors.primary : colors.border, opacity: pressed ? 0.75 : 1 }]}><View style={[styles.avatar, { backgroundColor: profile.id === activeProfileId ? colors.primary : colors.accent }]}><Text style={[styles.avatarText, { color: profile.id === activeProfileId ? colors.primaryForeground : colors.accentForeground }]}>{profile.icon}</Text></View><View style={styles.profileCopy}><View style={styles.profileTitleRow}><Text style={[styles.profileTitle, { color: colors.foreground }]}>{profile.name}</Text>{profile.id === activeProfileId ? <StatusPill label="Active" tone="good" /> : null}</View><Text style={[styles.profileMeta, { color: colors.mutedForeground }]}>{profileTabs(profile.id).length} tabs  ·  {profile.temporary ? 'temporary session' : 'persistent space'}</Text><Text style={[styles.profileNamespace, { color: colors.mutedForeground }]}>{profile.storageNamespace}</Text></View><Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} /></Pressable>)}
    <Surface style={styles.isolationCard}><Ionicons name="lock-closed-outline" size={20} color={colors.primary} /><View style={styles.isolationCopy}><Text style={[styles.isolationTitle, { color: colors.foreground }]}>Separate by design</Text><Text style={[styles.isolationText, { color: colors.mutedForeground }]}>Each profile has its own local namespace. Export and import are explicit; nothing is silently shared.</Text></View></Surface>
    <Modal visible={isCreateOpen} transparent animationType="fade" onRequestClose={() => setIsCreateOpen(false)}><View style={[styles.modalBackdrop, { backgroundColor: 'rgba(0,0,0,0.56)' }]}><View style={[styles.modal, { backgroundColor: colors.card }]}><Text style={[styles.modalEyebrow, { color: colors.primary }]}>NEW SPACE</Text><Text style={[styles.modalTitle, { color: colors.foreground }]}>Create a profile</Text><Text style={[styles.modalText, { color: colors.mutedForeground }]}>A new local namespace is created for this profile.</Text><TextInput autoFocus value={name} onChangeText={setName} onSubmitEditing={submitCreate} placeholder="Profile name" placeholderTextColor={colors.mutedForeground} style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} /><View style={styles.modalActions}><Pressable onPress={() => setIsCreateOpen(false)} style={[styles.modalButton, { backgroundColor: colors.secondary }]}><Text style={[styles.modalButtonText, { color: colors.foreground }]}>Cancel</Text></Pressable><Pressable onPress={submitCreate} style={[styles.modalButton, { backgroundColor: colors.primary }]}><Text style={[styles.modalButtonText, { color: colors.primaryForeground }]}>Create</Text></Pressable></View></View></View></Modal>
    <Modal visible={Boolean(selected)} transparent animationType="slide" onRequestClose={() => setSelected(null)}><View style={[styles.modalBackdrop, { backgroundColor: 'rgba(0,0,0,0.56)' }]}><View style={[styles.actionSheet, { backgroundColor: colors.card }]}><Text style={[styles.modalEyebrow, { color: colors.primary }]}>PROFILE ACTIONS</Text><Text style={[styles.modalTitle, { color: colors.foreground }]}>{selected?.name}</Text><Pressable onPress={() => { if (selected) openProfile(selected); setSelected(null); }} style={styles.actionRow}><Ionicons name="open-outline" size={20} color={colors.foreground} /><Text style={[styles.actionText, { color: colors.foreground }]}>Open profile</Text></Pressable><Pressable onPress={() => actionProfile('clone')} style={styles.actionRow}><Ionicons name="copy-outline" size={20} color={colors.foreground} /><Text style={[styles.actionText, { color: colors.foreground }]}>Clone into a new space</Text></Pressable><Pressable onPress={() => actionProfile('delete')} style={styles.actionRow}><Ionicons name="trash-outline" size={20} color={colors.destructive} /><Text style={[styles.actionText, { color: colors.destructive }]}>Delete profile</Text></Pressable></View></View></Modal>
  </ScrollView></Screen>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 22, paddingBottom: 120 },
  topbar: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  eyebrow: { fontSize: 11, letterSpacing: 1.5, fontWeight: '800', marginBottom: 8 },
  title: { fontSize: 34, fontWeight: '700', letterSpacing: -0.9 },
  search: { height: 50, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, marginTop: 24, fontSize: 14 },
  limitRow: { gap: 8, marginTop: 12 },
  limitLabel: { fontSize: 12 },
  limitTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  limitFill: { height: 4, borderRadius: 2 },
  profileCard: { minHeight: 92, borderWidth: 1, borderRadius: 18, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  avatar: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '800' },
  profileCopy: { flex: 1, gap: 5 },
  profileTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  profileTitle: { fontSize: 15, fontWeight: '700' },
  profileMeta: { fontSize: 12 },
  profileNamespace: { fontFamily: 'monospace', fontSize: 10 },
  isolationCard: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginTop: 12 },
  isolationCopy: { flex: 1, gap: 5 },
  isolationTitle: { fontSize: 14, fontWeight: '700' },
  isolationText: { fontSize: 12, lineHeight: 18 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 22, gap: 10 },
  actionSheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 22, gap: 12 },
  modalEyebrow: { fontSize: 11, letterSpacing: 1.5, fontWeight: '800' },
  modalTitle: { fontSize: 24, fontWeight: '700', marginBottom: 2 },
  modalText: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  modalInput: { height: 52, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, fontSize: 15 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  modalButton: { flex: 1, alignItems: 'center', borderRadius: 14, paddingVertical: 14 },
  modalButtonText: { fontSize: 14, fontWeight: '700' },
  actionRow: { minHeight: 50, flexDirection: 'row', gap: 14, alignItems: 'center' },
  actionText: { fontSize: 15, fontWeight: '600' },
});