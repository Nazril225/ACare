/**
 * Role Select Screen — Layar pemilihan peran masuk ACare.
 *
 * Ditampilkan saat pengguna belum memilih peran (role === null).
 * Pengguna memilih untuk masuk sebagai:
 *  - Customer / Pengguna  → area layanan pelanggan (tabs)
 *  - Admin                → area dashboard operasional admin
 *
 * Perpindahan layar dilakukan otomatis oleh guard `Stack.Protected`
 * di root layout begitu `setRole(...)` dipanggil.
 */

import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TechnicianLoginPicker } from '@/components/technician/technician-login-picker';
import { ACareColors } from '@/constants/theme';
import { useACare } from '@/context/acare-context';
import { Technician, UserRole } from '@/types/acare';

// ─── Tipe ─────────────────────────────────────────────────────────────────────

interface RoleOption {
  role: UserRole;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
}

// ─── Data Opsi Peran ──────────────────────────────────────────────────────────

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'customer',
    icon: '👤',
    title: 'Customer / Pengguna',
    subtitle: 'Area layanan pelanggan',
    description:
      'Pesan layanan servis AC, pantau status pengerjaan, dan lihat riwayat servis Anda.',
  },
  {
    role: 'admin',
    icon: '🛡️',
    title: 'Admin',
    subtitle: 'Area operasional',
    description:
      'Kelola pesanan masuk, tugaskan teknisi, serta pantau pelanggan dan data master.',
  },
  {
    role: 'technician',
    icon: '👷',
    title: 'Teknisi',
    subtitle: 'Area pengerjaan lapangan',
    description:
      'Lihat pesanan yang ditugaskan, perbarui status pengerjaan, dan catat hasil servis AC.',
  },
];

// ─── Komponen ─────────────────────────────────────────────────────────────────

export default function RoleSelectScreen() {
  const insets = useSafeAreaInsets();
  const { setRole, technicians, setCurrentTechnician } = useACare();
  const [pickerOpen, setPickerOpen] = useState(false);

  function handleSelectRole(option: RoleOption) {
    if (option.role === 'technician') {
      setPickerOpen(true);
      return;
    }
    setRole(option.role);
  }

  function handleSelectTechnician(technician: Technician) {
    setPickerOpen(false);
    setCurrentTechnician(technician);
    setRole('technician');
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 48,
          paddingBottom: insets.bottom + 32,
        },
      ]}
      showsVerticalScrollIndicator={false}>

      {/* ── Brand & Sapaan ──────────────────────────────────────────────────── */}
      <View style={styles.hero}>
        <View style={styles.logoWrap}>
          <Text style={styles.logoEmoji}>❄️</Text>
        </View>
        <Text style={styles.brandName}>ACare</Text>
        <Text style={styles.heroTitle}>Selamat Datang</Text>
        <Text style={styles.heroSubtitle}>
          Pilih peran untuk mulai menggunakan aplikasi layanan AC
        </Text>
      </View>

      {/* ── Kartu Pilihan Peran ─────────────────────────────────────────────── */}
      <View style={styles.optionsWrap}>
        {ROLE_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.role}
            style={styles.optionCard}
            activeOpacity={0.8}
            onPress={() => handleSelectRole(option)}
            accessibilityRole="button"
            accessibilityLabel={`Masuk sebagai ${option.title}`}>
            <View style={styles.optionIconWrap}>
              <Text style={styles.optionIcon}>{option.icon}</Text>
            </View>

            <View style={styles.optionTextWrap}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>

            <Text style={styles.optionChevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Catatan Demo ────────────────────────────────────────────────────── */}
      <Text style={styles.footnote}>
        Mode demo — seluruh data disimpan di memori dan tidak permanen.
      </Text>

      {/* ── Modal Pilih Identitas Teknisi ───────────────────────────────────── */}
      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setPickerOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <TechnicianLoginPicker
              technicians={technicians}
              selectedId={null}
              onSelect={handleSelectTechnician}
              onCancel={() => setPickerOpen(false)}
            />
          </Pressable>
        </Pressable>
      </Modal>

    </ScrollView>
  );
}

// ─── Stylesheet ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ACareColors.slate50,
  },
  content: {
    paddingHorizontal: 20,
    flexGrow: 1,
    justifyContent: 'center',
    gap: 28,
  },

  // ── Hero ────────────────────────────────────────────────────────────────────
  hero: {
    alignItems: 'center',
    gap: 4,
  },
  logoWrap: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: ACareColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: ACareColors.accent,
    marginBottom: 12,
  },
  logoEmoji: {
    fontSize: 36,
  },
  brandName: {
    fontSize: 15,
    fontWeight: '800',
    color: ACareColors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: ACareColors.slate900,
    letterSpacing: -0.4,
    marginTop: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: ACareColors.slate500,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 320,
    marginTop: 4,
  },

  // ── Option Cards ────────────────────────────────────────────────────────────
  optionsWrap: {
    gap: 14,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: ACareColors.white,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: ACareColors.slate200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  optionIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: ACareColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIcon: {
    fontSize: 26,
  },
  optionTextWrap: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: ACareColors.slate900,
  },
  optionSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: ACareColors.primary,
  },
  optionDescription: {
    fontSize: 12,
    color: ACareColors.slate500,
    lineHeight: 17,
    marginTop: 2,
  },
  optionChevron: {
    fontSize: 26,
    color: ACareColors.slate300,
    fontWeight: '700',
  },

  // ── Footnote ────────────────────────────────────────────────────────────────
  footnote: {
    fontSize: 11,
    color: ACareColors.slate400,
    textAlign: 'center',
    lineHeight: 16,
  },

  // ── Modal Teknisi ───────────────────────────────────────────────────────────
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: ACareColors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: ACareColors.slate200,
    marginBottom: 12,
  },
});
