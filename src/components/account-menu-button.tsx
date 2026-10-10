/**
 * AccountMenuButton — Tombol akun (avatar) dengan menu pilihan peran.
 *
 * Menampilkan avatar bulat yang dapat diklik. Saat diklik, muncul menu untuk
 * berpindah peran (Customer ↔ Admin) atau kembali ke layar pemilihan peran.
 *
 * Menggunakan `Modal` bawaan React Native sehingga tanpa dependency baru.
 */

import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ACareColors } from '@/constants/theme';
import { useACare } from '@/context/acare-context';
import { UserRole } from '@/types/acare';

interface AccountMenuButtonProps {
  /** Huruf awal yang ditampilkan di dalam avatar. */
  initial: string;
  /** Ukuran avatar (default 44). */
  size?: number;
  /** Label aksesibilitas tombol. */
  accessibilityLabel?: string;
}

interface RoleOption {
  role: UserRole;
  icon: string;
  label: string;
  description: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'customer',
    icon: '👤',
    label: 'Masuk sebagai Customer',
    description: 'Area layanan pelanggan',
  },
  {
    role: 'admin',
    icon: '🛡️',
    label: 'Masuk sebagai Admin',
    description: 'Dashboard operasional',
  },
];

export function AccountMenuButton({
  initial,
  size = 44,
  accessibilityLabel = 'Menu akun dan peran',
}: AccountMenuButtonProps) {
  const { role, setRole } = useACare();
  const [open, setOpen] = useState(false);

  function choose(next: UserRole | null) {
    setOpen(false);
    setRole(next);
  }

  function chooseOption(option: RoleOption) {
    choose(option.role);
  }

  const dynamicAvatar = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.avatar, dynamicAvatar]}
        activeOpacity={0.8}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}>
        <Text style={styles.avatarInitial}>{initial}</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />

            <>
              <Text style={styles.sheetTitle}>Ganti Peran</Text>
              <Text style={styles.sheetSubtitle}>
                Masuk sebagai peran lain untuk mengakses fitur yang berbeda
              </Text>

              {ROLE_OPTIONS.map((option) => {
                const isActive = role === option.role;
                return (
                  <TouchableOpacity
                    key={option.role}
                    style={[
                      styles.optionRow,
                      isActive && styles.optionRowActive,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => chooseOption(option)}
                    accessibilityRole="button"
                    accessibilityLabel={option.label}>
                    <View style={styles.optionIconWrap}>
                      <Text style={styles.optionIcon}>{option.icon}</Text>
                    </View>

                    <View style={styles.optionTextWrap}>
                      <Text style={styles.optionLabel}>{option.label}</Text>
                      <Text style={styles.optionDescription}>
                        {option.description}
                      </Text>
                    </View>

                    {isActive ? (
                      <Text style={styles.optionCheck}>✓</Text>
                    ) : (
                      <Text style={styles.optionChevron}>›</Text>
                    )}
                  </TouchableOpacity>
                );
              })}

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.switchRoleRow}
                activeOpacity={0.7}
                onPress={() => choose(null)}
                accessibilityRole="button"
                accessibilityLabel="Ganti peran dan pilih ulang">
                <Text style={styles.switchRoleText}>
                  ⇄  Ganti Peran (Pilih Ulang)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                activeOpacity={0.7}
                onPress={() => setOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="Tutup menu akun">
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
            </>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // ── Avatar ──────────────────────────────────────────────────────────────────
  avatar: {
    backgroundColor: ACareColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: ACareColors.accent,
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: ACareColors.primary,
  },

  // ── Modal / Sheet ────────────────────────────────────────────────────────────
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
    gap: 10,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: ACareColors.slate200,
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: ACareColors.slate900,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: ACareColors.slate500,
    lineHeight: 17,
    marginBottom: 4,
  },

  // ── Role Option ──────────────────────────────────────────────────────────────
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: ACareColors.slate200,
    backgroundColor: ACareColors.slate50,
  },
  optionRowActive: {
    borderColor: ACareColors.primary,
    backgroundColor: '#F0F9FF',
  },
  optionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: ACareColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIcon: {
    fontSize: 20,
  },
  optionTextWrap: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: ACareColors.slate900,
  },
  optionDescription: {
    fontSize: 11,
    color: ACareColors.slate500,
  },
  optionCheck: {
    fontSize: 18,
    fontWeight: '800',
    color: ACareColors.primary,
  },
  optionChevron: {
    fontSize: 22,
    color: ACareColors.slate300,
    fontWeight: '700',
  },

  // ── Divider & Switch Role ────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: ACareColors.slate100,
    marginVertical: 4,
  },
  switchRoleRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: ACareColors.primary,
    backgroundColor: ACareColors.white,
  },
  switchRoleText: {
    fontSize: 13,
    fontWeight: '700',
    color: ACareColors.primary,
  },

  // ── Cancel ───────────────────────────────────────────────────────────────────
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: ACareColors.slate500,
  },
});
