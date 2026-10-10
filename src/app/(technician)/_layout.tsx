/**
 * Layout grup (technician) — area pengerjaan teknisi ACare.
 *
 * Stack tanpa header; tiap layar teknisi mengelola header-nya sendiri,
 * sama dengan konvensi grup (admin).
 */

import { Stack } from 'expo-router';

export default function TechnicianLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}