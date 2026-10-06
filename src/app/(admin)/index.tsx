/**
 * Admin Dashboard Screen — Halaman ringkasan operasional admin ACare.
 *
 * Menampilkan:
 *  - Header Dashboard Admin dengan subjudul & badge peran ADMIN
 *  - Summary Cards metrik pesanan:
 *      1. Total Pesanan
 *      2. Menunggu Konfirmasi
 *      3. Sedang Berjalan (Dikonfirmasi + Teknisi Menuju Lokasi + Sedang Dikerjakan)
 *      4. Selesai
 *      5. Dibatalkan
 *  - Quick Overview data master (Layanan, Customer, Teknisi)
 *  - Section "Pesanan Terbaru" dengan AdminOrderCard yang dapat diklik ke detail
 *  - Empty state informatif jika pesanan kosong
 *
 * Mengambil seluruh data riil dari ACareContext via useACare().
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
import { useRouter } from 'expo-router';

import { AdminOrderCard } from '@/components/admin/admin-order-card';
import { AdminStatCard } from '@/components/admin/admin-stat-card';
import { ACareColors } from '@/constants/theme';
import { useACare } from '@/context/acare-context';
import { Order } from '@/types/acare';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orders, services, technicians, customers, stats } = useACare();

  // ── Hitung Metrik Statistik ─────────────────────────────────────────────────
  const totalOrders = orders.length;

  const pendingCount = useMemo(() => {
    return orders.filter((o) => o.status === 'Menunggu Konfirmasi').length;
  }, [orders]);

  const inProgressCount = useMemo(() => {
    return orders.filter(
      (o) =>
        o.status === 'Dikonfirmasi' ||
        o.status === 'Teknisi Menuju Lokasi' ||
        o.status === 'Sedang Dikerjakan'
    ).length;
  }, [orders]);

  const completedCount = useMemo(() => {
    return orders.filter((o) => o.status === 'Selesai').length;
  }, [orders]);

  const cancelledCount = useMemo(() => {
    return orders.filter((o) => o.status === 'Dibatalkan').length;
  }, [orders]);

  // Pesanan terbaru (ambil 5 pesanan teratas)
  const recentOrders = useMemo(() => {
    return orders.slice(0, 5);
  }, [orders]);

  function handleOrderPress(order: Order) {
    router.push({
      pathname: '/(admin)/order-detail',
      params: { orderId: order.id },
    });
  }

  function handleNavigateToOrders() {
    router.push('/(admin)/orders');
  }

  function handleNavigateToCustomer() {
    router.push('/(acare)');
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 40,
        },
      ]}
      showsVerticalScrollIndicator={false}>

      {/* ── Header Admin Dashboard ────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <View style={styles.badgeRow}>
            <View style={styles.adminRoleBadge}>
              <Text style={styles.adminRoleBadgeDot}>●</Text>
              <Text style={styles.adminRoleBadgeText}>ADMIN</Text>
            </View>
            <TouchableOpacity
              style={styles.customerSwitchBtn}
              activeOpacity={0.8}
              onPress={handleNavigateToCustomer}
              accessibilityRole="button"
              accessibilityLabel="Beralih ke Tampilan Pelanggan">
              <Text style={styles.customerSwitchBtnText}>Tampilan Customer →</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.headerTitle}>Dashboard Admin</Text>
          <Text style={styles.headerSubtitle}>
            Kelola dan pantau pesanan ACare
          </Text>
        </View>
      </View>

      {/* ── Section: Summary Cards (Ringkasan Pesanan) ─────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ringkasan Status Pesanan</Text>
        <Text style={styles.sectionSubtitle}>
          Kondisi operasional pesanan real-time dari sistem ACare
        </Text>

        {/* Baris 1: Total Pesanan & Menunggu Konfirmasi */}
        <View style={styles.statsGridRow}>
          <AdminStatCard
            title="Total Pesanan"
            value={totalOrders}
            icon="📋"
            accentColor={ACareColors.slate900}
            subtitle="Seluruh pesanan masuk"
            accessibilityLabel={`Total pesanan: ${totalOrders}`}
          />
          <AdminStatCard
            title="Menunggu Konfirmasi"
            value={pendingCount}
            icon="⏳"
            accentColor="#D97706"
            badgeBg="#FEF3C7"
            subtitle="Perlu verifikasi admin"
            accessibilityLabel={`Menunggu konfirmasi: ${pendingCount}`}
          />
        </View>

        {/* Baris 2: Sedang Berjalan & Selesai */}
        <View style={styles.statsGridRow}>
          <AdminStatCard
            title="Sedang Berjalan"
            value={inProgressCount}
            icon="⚡"
            accentColor={ACareColors.primary}
            badgeBg="#E0F2FE"
            subtitle="Dikonfirmasi & di lapangan"
            accessibilityLabel={`Sedang berjalan: ${inProgressCount}`}
          />
          <AdminStatCard
            title="Selesai"
            value={completedCount}
            icon="✓"
            accentColor="#059669"
            badgeBg="#D1FAE5"
            subtitle="Pekerjaan tuntas"
            accessibilityLabel={`Selesai: ${completedCount}`}
          />
        </View>

        {/* Baris 3: Dibatalkan */}
        <View style={styles.statsGridRow}>
          <AdminStatCard
            title="Dibatalkan"
            value={cancelledCount}
            icon="✕"
            accentColor="#DC2626"
            badgeBg="#FEE2E2"
            subtitle="Pesanan dibatalkan"
            accessibilityLabel={`Dibatalkan: ${cancelledCount}`}
          />
          <View style={styles.revenueCard}>
            <View style={styles.revenueTop}>
              <View style={styles.revenueIconWrap}>
                <Text style={styles.revenueIconText}>💰</Text>
              </View>
              <Text style={styles.revenueValueText}>
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0,
                }).format(stats.revenue)}
              </Text>
            </View>
            <Text style={styles.revenueTitleText}>Total Pendapatan</Text>
            <Text style={styles.revenueSubText}>Dari pesanan berstatus selesai</Text>
          </View>
        </View>
      </View>

      {/* ── Section: Quick Overview (Data Master) ──────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview Master Data</Text>
        <Text style={styles.sectionSubtitle}>
          Kapasitas layanan, pelanggan, dan teknisi terdaftar
        </Text>

        <View style={styles.masterDataRow}>
          {/* Layanan */}
          <View style={styles.masterDataItem}>
            <View style={styles.masterIconWrap}>
              <Text style={styles.masterIconText}>❄️</Text>
            </View>
            <Text style={styles.masterCountText}>{services.length}</Text>
            <Text style={styles.masterLabelText}>Layanan AC</Text>
          </View>

          {/* Customer */}
          <View style={styles.masterDataItem}>
            <View style={[styles.masterIconWrap, { backgroundColor: '#F0F9FF' }]}>
              <Text style={styles.masterIconText}>👥</Text>
            </View>
            <Text style={styles.masterCountText}>{customers.length}</Text>
            <Text style={styles.masterLabelText}>Customer</Text>
          </View>

          {/* Teknisi */}
          <View style={styles.masterDataItem}>
            <View style={[styles.masterIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.masterIconText}>👷</Text>
            </View>
            <Text style={styles.masterCountText}>{technicians.length}</Text>
            <Text style={styles.masterLabelText}>Teknisi</Text>
          </View>
        </View>
      </View>

      {/* ── Section: Pesanan Terbaru ───────────────────────────────────────── */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Pesanan Terbaru</Text>
            <Text style={styles.sectionSubtitle}>
              Menampilkan {recentOrders.length} dari {totalOrders} pesanan
            </Text>
          </View>
          <TouchableOpacity
            style={styles.viewAllOrdersBtn}
            activeOpacity={0.7}
            onPress={handleNavigateToOrders}
            accessibilityRole="button"
            accessibilityLabel="Lihat Semua Pesanan">
            <Text style={styles.viewAllOrdersBtnText}>Lihat Semua Pesanan →</Text>
          </TouchableOpacity>
        </View>

        {orders.length === 0 ? (
          /* Empty State */
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Belum ada pesanan</Text>
            <Text style={styles.emptySubtitle}>
              Belum ada pesanan yang masuk ke dalam sistem ACare saat ini.
            </Text>
          </View>
        ) : (
          /* Daftar Order */
          <View style={styles.ordersList}>
            {recentOrders.map((order) => (
              <AdminOrderCard
                key={order.id}
                order={order}
                onPress={handleOrderPress}
              />
            ))}
          </View>
        )}
      </View>

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
    gap: 20,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    marginBottom: 4,
  },
  headerTitleWrap: {
    gap: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  adminRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACareColors.slate900,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 5,
  },
  adminRoleBadgeDot: {
    fontSize: 8,
    color: '#38BDF8',
  },
  adminRoleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: ACareColors.white,
    letterSpacing: 0.8,
  },
  customerSwitchBtn: {
    backgroundColor: ACareColors.white,
    borderWidth: 1,
    borderColor: ACareColors.slate300,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  customerSwitchBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: ACareColors.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: ACareColors.slate900,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: ACareColors.slate500,
  },

  // ── Section ─────────────────────────────────────────────────────────────────
  section: {
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ACareColors.slate900,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: ACareColors.slate500,
    marginBottom: 4,
  },
  viewAllOrdersBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: ACareColors.primaryLight,
  },
  viewAllOrdersBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: ACareColors.primary,
  },

  // ── Stats Grid ──────────────────────────────────────────────────────────────
  statsGridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  revenueCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  revenueTop: {
    marginBottom: 8,
  },
  revenueIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  revenueIconText: {
    fontSize: 18,
  },
  revenueValueText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#15803D',
  },
  revenueTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 2,
  },
  revenueSubText: {
    fontSize: 10,
    color: '#15803D',
    opacity: 0.8,
  },

  // ── Master Data Row ─────────────────────────────────────────────────────────
  masterDataRow: {
    flexDirection: 'row',
    gap: 10,
  },
  masterDataItem: {
    flex: 1,
    backgroundColor: ACareColors.white,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ACareColors.slate200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    gap: 4,
  },
  masterIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ACareColors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  masterIconText: {
    fontSize: 18,
  },
  masterCountText: {
    fontSize: 18,
    fontWeight: '800',
    color: ACareColors.slate900,
  },
  masterLabelText: {
    fontSize: 11,
    color: ACareColors.slate500,
    fontWeight: '600',
  },

  // ── Orders List ─────────────────────────────────────────────────────────────
  ordersList: {
    gap: 0,
  },

  // ── Empty State ─────────────────────────────────────────────────────────────
  emptyState: {
    backgroundColor: ACareColors.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ACareColors.slate200,
    borderStyle: 'dashed',
    gap: 6,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ACareColors.slate800,
  },
  emptySubtitle: {
    fontSize: 12,
    color: ACareColors.slate400,
    textAlign: 'center',
    lineHeight: 18,
  },
});
