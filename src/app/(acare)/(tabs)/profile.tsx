/**
 * Profile Screen — Halaman profil pelanggan ACare.
 *
 * Menampilkan:
 *  - Header Profil
 *  - Kartu profil utama: Avatar inisial, nama pelanggan, email, dan badge peran "Customer"
 *  - Informasi kontak & alamat lengkap (Read-only)
 *  - Statistik ringkasan pesanan pelanggan (Total, Aktif, Selesai)
 *  - Informasi aplikasi & status akun
 *
 * Mengambil data riil dari ACareContext via useACare().currentUser dan useACare().orders.
 */

import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ACareColors } from '@/constants/theme';
import { useACare } from '@/context/acare-context';

const BOTTOM_NAV_HEIGHT = 80;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { currentUser, orders, role, setRole } = useACare();

  // Hitung ringkasan pesanan customer ini
  const myOrders = useMemo(() => {
    return orders.filter((o) => o.customerId === currentUser.id);
  }, [orders, currentUser.id]);

  const activeCount = useMemo(() => {
    return myOrders.filter(
      (o) => o.status !== 'Selesai' && o.status !== 'Dibatalkan'
    ).length;
  }, [myOrders]);

  const completedCount = useMemo(() => {
    return myOrders.filter((o) => o.status === 'Selesai').length;
  }, [myOrders]);

  const firstLetter = currentUser.name.charAt(0).toUpperCase();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + BOTTOM_NAV_HEIGHT + 24,
        },
      ]}
      showsVerticalScrollIndicator={false}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
        <Text style={styles.headerSubtitle}>Informasi akun & layanan ACare</Text>
      </View>

      {/* ── Kartu Profil Utama ──────────────────────────────────────────────── */}
      <View style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>{firstLetter}</Text>
        </View>

        <View style={styles.profileTextWrap}>
          <Text style={styles.profileName}>{currentUser.name}</Text>
          <Text style={styles.profileEmail}>{currentUser.email}</Text>

          {/* Badge Role */}
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeDot}>●</Text>
            <Text style={styles.roleBadgeText}>
              {role === 'customer' ? 'Customer' : 'Admin'}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Ringkasan Pesanan ───────────────────────────────────────────────── */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{myOrders.length}</Text>
          <Text style={styles.statLabel}>Total Pesanan</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: ACareColors.primary }]}>
            {activeCount}
          </Text>
          <Text style={styles.statLabel}>Sedang Aktif</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: '#047857' }]}>
            {completedCount}
          </Text>
          <Text style={styles.statLabel}>Selesai</Text>
        </View>
      </View>

      {/* ── Informasi Detail Customer ───────────────────────────────────────── */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Informasi Kontak & Alamat</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nama Lengkap</Text>
          <Text style={styles.infoValue}>{currentUser.name}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{currentUser.email}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>No. Telepon / WhatsApp</Text>
          <Text style={styles.infoValue}>{currentUser.phone}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Alamat Utama Servis</Text>
          <Text style={styles.addressValue}>{currentUser.address}</Text>
        </View>
      </View>

      {/* ── Informasi Akun & Aplikasi ───────────────────────────────────────── */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Status Akun & Aplikasi</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Peran Akun</Text>
          <View style={styles.accountRoleTag}>
            <Text style={styles.accountRoleTagText}>Customer</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status Akun</Text>
          <Text style={styles.accountActiveText}>✓ Aktif</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Versi Aplikasi</Text>
          <Text style={styles.appVersionText}>ACare Mobile v1.0.0</Text>
        </View>
      </View>

      {/* ── Aksi: Ganti Peran ───────────────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.switchRoleBtn}
        activeOpacity={0.85}
        onPress={() => setRole(null)}
        accessibilityRole="button"
        accessibilityLabel="Ganti peran masuk">
        <Text style={styles.switchRoleBtnIcon}>⇄</Text>
        <Text style={styles.switchRoleBtnText}>Ganti Peran / Keluar</Text>
      </TouchableOpacity>

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
    paddingHorizontal: 16,
    gap: 16,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: ACareColors.slate900,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: ACareColors.slate500,
    marginTop: 2,
  },

  // ── Profile Card ────────────────────────────────────────────────────────────
  profileCard: {
    backgroundColor: ACareColors.white,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: ACareColors.slate200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: ACareColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: ACareColors.accent,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: ACareColors.primary,
  },
  profileTextWrap: {
    flex: 1,
    gap: 3,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '800',
    color: ACareColors.slate900,
  },
  profileEmail: {
    fontSize: 12,
    color: ACareColors.slate500,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    gap: 5,
    marginTop: 4,
  },
  roleBadgeDot: {
    fontSize: 8,
    color: ACareColors.primary,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: ACareColors.primaryDark,
  },

  // ── Stats Row ───────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: ACareColors.white,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ACareColors.slate200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: ACareColors.slate900,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: ACareColors.slate500,
    fontWeight: '500',
  },

  // ── Section Card ────────────────────────────────────────────────────────────
  sectionCard: {
    backgroundColor: ACareColors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: ACareColors.slate200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: ACareColors.slate900,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 12,
  },
  infoBlock: {
    paddingVertical: 6,
    gap: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: ACareColors.slate500,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: ACareColors.slate900,
    flex: 1,
    textAlign: 'right',
  },
  addressValue: {
    fontSize: 13,
    fontWeight: '500',
    color: ACareColors.slate800,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: ACareColors.slate100,
    marginVertical: 4,
  },
  accountRoleTag: {
    backgroundColor: ACareColors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  accountRoleTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: ACareColors.primary,
  },
  accountActiveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
  },
  appVersionText: {
    fontSize: 12,
    color: ACareColors.slate500,
    fontWeight: '600',
  },

  // ── Ganti Peran ─────────────────────────────────────────────────────────────
  switchRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ACareColors.white,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: ACareColors.primary,
  },
  switchRoleBtnIcon: {
    fontSize: 16,
    color: ACareColors.primary,
    fontWeight: '700',
  },
  switchRoleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: ACareColors.primary,
  },
});
