/**
 * Layout grup (admin) — area operasional admin.
 *
 * Stack tanpa header; tiap layar admin mengelola header-nya sendiri.
 */

import { Stack } from 'expo-router';

export default function AdminLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
