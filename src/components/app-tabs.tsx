import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors, ACareColors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={ACareColors.primaryLight}
      tintColor={ACareColors.primary}
      labelStyle={{ selected: { color: ACareColors.primary } }}>

      {/* ── Tab 1: Home ──────────────────────────────────── */}
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      {/* ── Tab 2: Pesanan ───────────────────────────────── */}
      <NativeTabs.Trigger name="orders">
        <NativeTabs.Trigger.Label>Pesanan</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/orders.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      {/* ── Tab 3: Riwayat ───────────────────────────────── */}
      <NativeTabs.Trigger name="history">
        <NativeTabs.Trigger.Label>Riwayat</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/history.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      {/* ── Tab 4: Profil ────────────────────────────────── */}
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/profile.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

    </NativeTabs>
  );
}
