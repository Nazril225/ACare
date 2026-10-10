/**
 * Admin Customer Detail Screen — Halaman rincian profil & riwayat pesanan pelanggan ACare.
 *
 * Fitur:
 *  - Header bar dengan tombol kembali & badge peran ADMIN
 *  - Profil lengkap pelanggan:
 *      - Nama lengkap & ID pelanggan
 *      - Email & nomor telepon / WhatsApp
 *      - Alamat utama servis
 *  - Statistik ringkasan pesanan pelanggan (Total, Aktif, Selesai) dari relasi riil
 *  - Daftar seluruh pesanan milik pelanggan ini (relasi riil dari context)
 *  - Tombol aksi setiap pesanan menuju detail pesanan (/(admin)/order-detail)
 *  - Empty state informatif jika belum ada pesanan
 *
 * Mengambil data riil dari ACareContext via useACare().
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
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AdminOrderCard } from '@/components/admin/admin-order-card';
import { ACareColors } from '@/constants/theme';
import { useACare } from '@/context/acare-context';
import { Order } from '@/types/acare';

export default function AdminCustomerDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { customerId } = useLocalSearchParams<{ customerId?: string }>();
  const { customers, orders } = useACare();

  // Cari data pelanggan dari context
  const customer = useMemo(() => {
    return customers.find((c) => c.id === customerId);
  }, [customers, customerId]);

  // Seluruh pesanan milik pelanggan ini
  const customerOrders = useMemo(() => {
    if (!customer) return [];
    return orders.filter((o) => o.customerId === customer.id);
  }, [orders, customer]);

  // Pesanan aktif milik pelanggan ini
  const activeOrders = useMemo(() => {
    return customerOrders.filter(
      (o) => o.status !== 'Selesai' && o.status !== 'Dibatalkan'
    );
  }, [customerOrders]);

  // Pesanan selesai milik pelanggan ini
  const completedOrders = useMemo(() => {
    return customerOrders.filter((o) => o.status === 'Selesai');
  }, [customerOrders]);

  function handleOrderPress(order: Order) {
    router.push({
      pathname: '/(admin)/order-detail',
      params: { orderId: order.id },
    });
  }

  // Jika pelanggan tidak ditemukan
  if (!customer) {
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 20,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
          },
        ]}>
        <Text style={styles.notFoundIcon}>👥</Text>
        <Text style={styles.notFoundTitle}>Pelanggan Tidak Ditemukan</Text>
        <Text style={styles.notFoundDesc}>
          Data pelanggan dengan ID &quot;{customerId ?? '-'}&quot; tidak ditemukan dalam sistem ACare.
        </Text>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.8}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke Daftar Customer">
          <Text style={styles.backBtnText}>← Kembali ke Daftar Customer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initial = customer.name.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      {/* ── Header Bar ──────────────────────────────────────────────────────── */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke Daftar Customer">
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <View style={styles.badgeRow}>
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeDot}>●</Text>
              <Text style={styles.adminBadgeText}>ADMIN</Text>
            </View>
          </View>
          <Text style={styles.headerTitle}>Detail Customer</Text>
          <Text style={styles.headerSubtitle}>{customer.id}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}>

        {/* ── Kartu Profil Utama Pelanggan ───────────────────────────────────── */}
        <View style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>{initial}</Text>
            </View>

            <View style={styles.profileTextWrap}>
              <Text style={styles.profileName}>{customer.name}</Text>
              <Text style={styles.profileId}>{customer.id}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeDot}>●</Text>
                <Text style={styles.roleBadgeText}>Customer</Text>
              </View>
            </View>
          </View>

          {/* Grid Statistik */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statBoxIcon}>📋</Text>
              <Text style={styles.statBoxVal}>{customerOrders.length}</Text>
              <Text style={styles.statBoxLbl}>Total Pesanan</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statBoxIcon}>⚡</Text>
              <Text style={[styles.statBoxVal, { color: ACareColors.primary }]}>
                {activeOrders.length}
              </Text>
              <Text style={styles.statBoxLbl}>Pesanan Aktif</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statBoxIcon}>✓</Text>
              <Text style={[styles.statBoxVal, { color: '#047857' }]}>
                {completedOrders.length}
              </Text>
              <Text style={styles.statBoxLbl}>Selesai</Text>
            </View>
          </View>
        </View>

        {/* ── Informasi Kontak & Alamat ─────────────────────────────────────── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Informasi Kontak &amp; Alamat</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Email</Text>
            <Text style={styles.infoVal}>{customer.email}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>No. Telepon / WhatsApp</Text>
            <Text style={styles.infoValHighlight}>📞 {customer.phone}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.blockRow}>
            <Text style={styles.infoKey}>Alamat Utama Servis:</Text>
            <Text style={styles.addressText}>{customer.address}</Text>
          </View>
        </View>

        {/* ── Daftar Pesanan Pelanggan ──────────────────────────────────────── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderTextWrap}>
              <Text style={styles.sectionTitle}>Riwayat Pesanan</Text>
              <Text style={styles.sectionSubtitle}>
                Seluruh pesanan yang dibuat oleh {customer.name}
              </Text>
            </View>
            <View style={styles.orderCountBadge}>
              <Text style={styles.orderCountBadgeText}>
                {customerOrders.length}
              </Text>
            </View>
          </View>

          {customerOrders.length === 0 ? (
            <View style={styles.emptyOrdersBox}>
              <Text style={styles.emptyOrdersIcon}>📋</Text>
              <Text style={styles.emptyOrdersTitle}>Belum ada pesanan</Text>
              <Text style={styles.emptyOrdersSub}>
                Pelanggan {customer.name} belum memiliki pesanan servis AC di sistem ACare.
              </Text>
            </View>
          ) : (
            <View style={styles.ordersListWrap}>
              {customerOrders.map((ord) => (
                <AdminOrderCard
                  key={ord.id}
                  order={ord}
                  onPress={handleOrderPress}
                />
              ))}
            </View>
          )}
        </View>

        {/* ── Tombol Kembali ────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.backBottomBtn}
          activeOpacity={0.8}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke Daftar Customer">
          <Text style={styles.backBottomBtnText}>
            ← Kembali ke Daftar Customer
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

// ─── Stylesheet ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ACareColors.slate50,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 14,
  },

  // ── Header Bar ──────────────────────────────────────────────────────────────
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: ACareColors.white,
    borderBottomWidth: 1,
    borderBottomColor: ACareColors.slate200,
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: ACareColors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: ACareColors.slate700,
  },
  headerTitleWrap: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACareColors.slate900,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
  },
  adminBadgeDot: {
    fontSize: 7,
    color: '#38BDF8',
  },
  adminBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: ACareColors.white,
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: ACareColors.slate900,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: ACareColors.primary,
  },

  // ── Profile Card ────────────────────────────────────────────────────────────
  profileCard: {
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
    gap: 12,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: ACareColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#BAE6FD',
  },
  avatarLargeText: {
    fontSize: 24,
    fontWeight: '800',
    color: ACareColors.primary,
  },
  profileTextWrap: {
    flex: 1,
    gap: 3,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: ACareColors.slate900,
    letterSpacing: -0.3,
  },
  profileId: {
    fontSize: 12,
    fontWeight: '600',
    color: ACareColors.slate400,
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
    marginTop: 2,
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

  // ── Stats Grid ──────────────────────────────────────────────────────────────
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ACareColors.slate100,
  },
  statBoxIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  statBoxVal: {
    fontSize: 15,
    fontWeight: '800',
    color: ACareColors.slate900,
  },
  statBoxLbl: {
    fontSize: 9,
    color: ACareColors.slate500,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderTextWrap: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: ACareColors.slate900,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: ACareColors.slate500,
    lineHeight: 16,
  },
  orderCountBadge: {
    backgroundColor: ACareColors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  orderCountBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: ACareColors.primaryDark,
  },

  // ── Info Row ────────────────────────────────────────────────────────────────
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 12,
  },
  blockRow: {
    gap: 4,
  },
  infoKey: {
    fontSize: 13,
    color: ACareColors.slate500,
  },
  infoVal: {
    fontSize: 13,
    color: ACareColors.slate800,
    fontWeight: '500',
    flexShrink: 1,
    textAlign: 'right',
  },
  infoValHighlight: {
    fontSize: 13,
    color: ACareColors.primary,
    fontWeight: '700',
  },
  addressText: {
    fontSize: 13,
    color: ACareColors.slate800,
    lineHeight: 18,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: ACareColors.slate100,
    marginVertical: 8,
  },

  // ── Orders List Wrap ────────────────────────────────────────────────────────
  ordersListWrap: {
    gap: 0,
  },
  emptyOrdersBox: {
    backgroundColor: ACareColors.slate50,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ACareColors.slate200,
    borderStyle: 'dashed',
    gap: 4,
  },
  emptyOrdersIcon: {
    fontSize: 32,
    marginBottom: 2,
  },
  emptyOrdersTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: ACareColors.slate700,
  },
  emptyOrdersSub: {
    fontSize: 11,
    color: ACareColors.slate500,
    textAlign: 'center',
    lineHeight: 16,
  },

  // ── Bottom Button ───────────────────────────────────────────────────────────
  backBottomBtn: {
    backgroundColor: ACareColors.white,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ACareColors.slate300,
    marginTop: 6,
  },
  backBottomBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: ACareColors.slate700,
  },

  // ── Not Found ───────────────────────────────────────────────────────────────
  notFoundIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: ACareColors.slate900,
    marginBottom: 6,
  },
  notFoundDesc: {
    fontSize: 13,
    color: ACareColors.slate500,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: ACareColors.primary,
    borderRadius: 24,
    paddingVertical: 11,
    paddingHorizontal: 24,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: ACareColors.white,
  },
});
