/**
 * Layout grup (acare) — area pelanggan.
 *
 * Berupa Stack agar layar non-tab (mis. booking & order-detail) dapat di-push
 * di atas tab bar. Tab bar (native di iOS/Android, web di browser) didefinisikan
 * oleh grup `(tabs)`.
 */

import { Stack } from 'expo-router';

export default function AcareLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
