import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ACareProvider, useACare } from '@/context/acare-context';

SplashScreen.preventAutoHideAsync();

/**
 * RootNavigator — menentukan grup layar aktif berdasarkan peran pengguna.
 *
 *  - Belum memilih peran (null) → layar pemilihan peran
 *  - Customer                    → grup (acare) berisi tab pelanggan
 *  - Admin                       → grup (admin) berisi dashboard operasional
 *  - Technician                  → grup (technician) berisi dashboard teknisi
 *
 * Guard `Stack.Protected` memindahkan layar secara otomatis saat `setRole(...)`
 * dipanggil, dan menghapus riwayat grup yang tidak lagi tersedia.
 */
function RootNavigator() {
  const { role } = useACare();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={role === 'customer'}>
        <Stack.Screen name="(acare)" />
      </Stack.Protected>

      <Stack.Protected guard={role === 'admin'}>
        <Stack.Screen name="(admin)" />
      </Stack.Protected>

      <Stack.Protected guard={role === 'technician'}>
        <Stack.Screen name="(technician)" />
      </Stack.Protected>

      <Stack.Protected guard={role === null}>
        <Stack.Screen name="role-select" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ACareProvider>
        <AnimatedSplashOverlay />
        <RootNavigator />
      </ACareProvider>
    </ThemeProvider>
  );
}
