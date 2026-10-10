/**
 * History Screen — Halaman riwayat pesanan servis AC pelanggan.
 *
 * Menampilkan:
 *  - Header riwayat pesanan
 *  - Tab filter: "Semua", "Selesai", "Dibatalkan"
 *  - Daftar kartu pesanan riwayat dengan ID, layanan, tanggal, total biaya, dan status badge
 *  - Setiap item dapat ditekan untuk membuka halaman detail pesanan
 *  - Empty state informatif dengan tombol aksi "Pesan Layanan"
 *
 * Mengambil data riil dari ACareContext via useACare().historyCustomerOrders atau useACare().orders.
 */

import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ActiveOrderCard } from '@/components/acare/active-order-card';
import { ACareColors } from '@/constants/theme';
import { useACare } from '@/context/acare-context';
import { Order } from '@/types/acare';

type HistoryFilter = 'semua' | 'selesai' | 'dibatalkan';

const BOTTOM_NAV_HEIGHT = 80;

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, historyCustomerOrders } = useACare();
  const [filter, setFilter] = useState<HistoryFilter>('semua');

  // Filter pesanan riwayat
  const completedOrders = useMemo(() => {
    return historyCustomerOrders.filter((o) => o.status === 'Selesai');
  }, [historyCustomerOrders]);

  const cancelledOrders = useMemo(() => {
    return historyCustomerOrders.filter((o) => o.status === 'Dibatalkan');
  }, [historyCustomerOrders]);

  const displayedOrders = useMemo(() => {
    if (filter === 'selesai') return completedOrders;
    if (filter === 'dibatalkan') return cancelledOrders;
    return historyCustomerOrders;
  }, [filter, historyCustomerOrders, completedOrders, cancelledOrders]);

  function handleOrderPress(order: Order) {
    router.push({
      pathname: '/(acare)/order-detail',
      params: { orderId: order.id },
    });
  }

  function handleCreateBooking() {
    router.push('/(acare)/booking');
  }

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
        <View>
          <Text style={styles.headerTitle}>Riwayat Servis</Text>
          <Text style={styles.headerSubtitle}>
            {currentUser.name} • {historyCustomerOrders.length} Pesanan Selesai / Batal
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addOrderBtn}
          activeOpacity={0.8}
          onPress={handleCreateBooking}
          accessibilityRole="button"
          accessibilityLabel="Pesan Layanan Baru">
          <Text style={styles.addOrderBtnText}>+ Pesan</Text>
        </TouchableOpacity>
      </View>

      {/* ── Filter Tabs ─────────────────────────────────────────────────────── */}
      <View style={styles.filterTabsRow}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'semua' && styles.filterTabActive]}
          onPress={() => setFilter('semua')}
          accessibilityRole="tab"
          accessibilityLabel="Filter Semua Riwayat">
          <Text
            style={[
              styles.filterTabText,
              filter === 'semua' && styles.filterTabTextActive,
            ]}>
            Semua ({historyCustomerOrders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'selesai' && styles.filterTabActive]}
          onPress={() => setFilter('selesai')}
          accessibilityRole="tab"
          accessibilityLabel="Filter Pesanan Selesai">
          <Text
            style={[
              styles.filterTabText,
              filter === 'selesai' && styles.filterTabTextActive,
            ]}>
            Selesai ({completedOrders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'dibatalkan' && styles.filterTabActive]}
          onPress={() => setFilter('dibatalkan')}
          accessibilityRole="tab"
          accessibilityLabel="Filter Pesanan Dibatalkan">
          <Text
            style={[
              styles.filterTabText,
              filter === 'dibatalkan' && styles.filterTabTextActive,
            ]}>
            Dibatalkan ({cancelledOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Daftar Riwayat / Empty State ────────────────────────────────────── */}
      {displayedOrders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🕐</Text>
          <Text style={styles.emptyTitle}>
            {filter === 'selesai'
              ? 'Belum ada pesanan yang selesai.'
              : filter === 'dibatalkan'
              ? 'Tidak ada pesanan yang dibatalkan.'
              : 'Belum ada riwayat pesanan.'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {filter === 'selesai'
              ? 'Pesanan yang telah tuntas dikerjakan teknisi akan tercatat di sini.'
              : 'Riwayat layanan servis AC Anda yang telah selesai atau dibatalkan akan tampil di sini.'}
          </Text>

          <TouchableOpacity
            style={styles.emptyActionBtn}
            activeOpacity={0.8}
            onPress={handleCreateBooking}
            accessibilityRole="button"
            accessibilityLabel="Pesan Layanan dari riwayat">
            <Text style={styles.emptyActionBtnText}>Pesan Layanan</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.ordersList}>
          {displayedOrders.map((order) => (
            <ActiveOrderCard
              key={order.id}
              order={order}
              onPress={handleOrderPress}
            />
          ))}
        </View>
      )}

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
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  addOrderBtn: {
    backgroundColor: ACareColors.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: ACareColors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  addOrderBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: ACareColors.white,
  },

  // ── Filter Tabs ─────────────────────────────────────────────────────────────
  filterTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: ACareColors.white,
    borderWidth: 1,
    borderColor: ACareColors.slate200,
  },
  filterTabActive: {
    backgroundColor: ACareColors.primary,
    borderColor: ACareColors.primary,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: ACareColors.slate600,
  },
  filterTabTextActive: {
    color: ACareColors.white,
    fontWeight: '700',
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
    marginTop: 10,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ACareColors.slate800,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: ACareColors.slate500,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  emptyActionBtn: {
    backgroundColor: ACareColors.primary,
    borderRadius: 24,
    paddingVertical: 11,
    paddingHorizontal: 24,
    marginTop: 12,
    shadowColor: ACareColors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: ACareColors.white,
  },
});
