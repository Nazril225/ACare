import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, useColorScheme, View, StyleSheet, Text } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { ACareColors, Colors, MaxContentWidth, Spacing } from '@/constants/theme';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/(acare)/(tabs)" asChild>
            <TabButton>🏠 Home</TabButton>
          </TabTrigger>
          <TabTrigger name="orders" href="/(acare)/(tabs)/orders" asChild>
            <TabButton>📋 Pesanan</TabButton>
          </TabTrigger>
          <TabTrigger name="history" href="/(acare)/(tabs)/history" asChild>
            <TabButton>🕐 Riwayat</TabButton>
          </TabTrigger>
          <TabTrigger name="profile" href="/(acare)/(tabs)/profile" asChild>
            <TabButton>👤 Profil</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.tabButtonView}>
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        {/* Brand ACare */}
        <View style={styles.brandRow}>
          <Text style={styles.brandEmoji}>❄️</Text>
          <ThemedText type="smallBold" style={styles.brandText}>
            ACare
          </ThemedText>
        </View>

        {props.children}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 'auto',
  },
  brandEmoji: {
    fontSize: 16,
  },
  brandText: {
    color: ACareColors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
});
