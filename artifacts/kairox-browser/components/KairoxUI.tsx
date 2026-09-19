import { Ionicons } from '@expo/vector-icons';
import React, { ReactNode, useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@workspace/kairox-design-system/hooks/use-colors';

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const content = <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: Platform.OS === 'web' ? 67 : insets.top, paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom }]}>{children}</View>;
  return content;
}

export function KairoxMark({ animated = false }: { animated?: boolean }) {
  const colors = useColors();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2600, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 2600, useNativeDriver: false }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [animated, pulse]);

  const orbScale = animated ? pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) : 1;
  const orbRotate = animated ? pulse.interpolate({ inputRange: [0, 1], outputRange: ['-6deg', '6deg'] }) : '0deg';

  return (
    <View style={styles.markWrap}>
      <Animated.View style={[styles.mark, { backgroundColor: colors.primary, transform: [{ scale: orbScale }, { rotate: orbRotate }] }]}><Text style={[styles.markText, { color: colors.primaryForeground }]}>K</Text></Animated.View>
      <Text style={[styles.wordmark, { color: colors.foreground }]}>KAIROX</Text>
    </View>
  );
}

export function IconButton({ name, onPress, label, tone = 'default' }: { name: keyof typeof Ionicons.glyphMap; onPress: () => void; label: string; tone?: 'default' | 'primary' }) {
  const colors = useColors();
  return (
    <Pressable testID={label} accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.iconButton, { backgroundColor: tone === 'primary' ? colors.primary : colors.secondary, opacity: pressed ? 0.7 : 1 }]}>
      <Ionicons name={name} size={20} color={tone === 'primary' ? colors.primaryForeground : colors.foreground} />
    </Pressable>
  );
}

export function SectionTitle({ eyebrow, title, action, onAction }: { eyebrow?: string; title: string; action?: string; onAction?: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.sectionTitle}>
      <View>
        {eyebrow ? <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text> : null}
        <Text style={[styles.sectionHeading, { color: colors.foreground }]}>{title}</Text>
      </View>
      {action && onAction ? <Pressable accessibilityRole="button" onPress={onAction}><Text style={[styles.action, { color: colors.primary }]}>{action}</Text></Pressable> : null}
    </View>
  );
}

export function SearchField({ value, onChangeText, placeholder, onSubmitEditing }: { value: string; onChangeText: (value: string) => void; placeholder: string; onSubmitEditing?: () => void }) {
  const colors = useColors();
  return (
    <View style={[styles.searchField, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Ionicons name="search-outline" size={19} color={colors.mutedForeground} />
      <TextInput testID="address-input" accessibilityLabel={placeholder} value={value} onChangeText={onChangeText} onSubmitEditing={onSubmitEditing} placeholder={placeholder} placeholderTextColor={colors.mutedForeground} autoCapitalize="none" autoCorrect={false} style={[styles.searchInput, { color: colors.foreground }]} returnKeyType="go" />
      {value ? <IconButton name="close-circle" onPress={() => onChangeText('')} label="Clear search" /> : <Ionicons name="scan-outline" size={19} color={colors.mutedForeground} />}
    </View>
  );
}

export function Surface({ children, style }: { children: ReactNode; style?: object }) {
  const colors = useColors();
  return <View style={[styles.surface, { backgroundColor: colors.card, borderColor: colors.border }, style]}>{children}</View>;
}

export function StatusPill({ label, tone = 'neutral' }: { label: string; tone?: 'good' | 'warn' | 'neutral' }) {
  const colors = useColors();
  const background = tone === 'good' ? colors.accent : tone === 'warn' ? colors.secondary : colors.muted;
  const foreground = tone === 'good' ? colors.accentForeground : tone === 'warn' ? colors.secondaryForeground : colors.mutedForeground;
  return <View style={[styles.statusPill, { backgroundColor: background }]}><View style={[styles.statusDot, { backgroundColor: tone === 'good' ? colors.primary : foreground }]} /><Text style={[styles.statusText, { color: foreground }]}>{label}</Text></View>;
}

export function Metric({ value, label }: { value: string; label: string }) {
  const colors = useColors();
  return <View style={styles.metric}><Text style={[styles.metricValue, { color: colors.foreground }]}>{value}</Text><Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>{label}</Text></View>;
}

export const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20 },
  markWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  markText: { fontSize: 17, fontWeight: '800' },
  wordmark: { fontSize: 14, fontWeight: '800', letterSpacing: 2.4 },
  iconButton: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 26, marginBottom: 13 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 5 },
  sectionHeading: { fontSize: 23, fontWeight: '700', letterSpacing: -0.3 },
  action: { fontSize: 13, fontWeight: '700', paddingBottom: 3 },
  searchField: { minHeight: 54, borderRadius: 17, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 7, gap: 10 },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 14 },
  surface: { borderRadius: 18, borderWidth: 1, padding: 16 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start', borderRadius: 30, paddingHorizontal: 10, paddingVertical: 7 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '600' },
  metric: { gap: 4 },
  metricValue: { fontSize: 18, fontWeight: '700' },
  metricLabel: { fontSize: 12 },
});