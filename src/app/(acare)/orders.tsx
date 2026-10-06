/**
 * Orders Screen — Halaman daftar pesanan pelanggan ACare.
 *
 * Menampilkan:
 *  - Header dengan nama pelanggan dan total pesanan
 *  - Filter tab: "Semua", "Aktif", "Selesai"
 *  - Daftar pesanan customer menggunakan ActiveOrderCard
 *  - Empty state informatif jika belum ada pesanan, lengkap dengan tombol "Pesan Layanan"
 *
 * Mengambil data langsung dari ACareContext (Stage 1) via useACare().
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

type OrderFilter = 'semua' | 'aktif' | 'selesai';

const BOTTOM_NAV_HEIGHT = 80;

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, orders } = useACare();
  const [filter, setFilter] = useState<OrderFilter>('semua');

  // Filter pesanan milik currentUser
  const myOrders = useMemo(() => {
    return orders.filter((o) => o.customerId === currentUser.id);
  }, [orders, currentUser.id]);

  // Pesanan aktif (status bukan Selesai dan bukan Dibatalkan)
  const activeOrders = useMemo(() => {
    return myOrders.filter(
      (o) => o.status !== 'Selesai' && o.status !== 'Dibatalkan'
    );
  }, [myOrders]);

  // Pesanan selesai / dibatalkan
  const historyOrders = useMemo(() => {
    return myOrders.filter(
      (o) => o.status === 'Selesai' || o.status === 'Dibatalkan'
    );
  }, [myOrders]);

  // Pesanan yang ditampilkan sesuai filter
  const displayedOrders = useMemo(() => {
    if (filter === 'aktif') return activeOrders;
    if (filter === 'selesai') return historyOrders;
    return myOrders;
  }, [filter, myOrders, activeOrders, historyOrders]);

  function handleOrderPress(order: typeof displayedOrders[number]) {
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
          <Text style={styles.headerTitle}>Daftar Pesanan</Text>
          <Text style={styles.headerSubtitle}>
            {currentUser.name} • {myOrders.length} Pesanan Tercatat
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addOrderBtn}
          activeOpacity={0.8}
          onPress={handleCreateBooking}
          accessibilityRole="button"
          accessibilityLabel="Buat Pesanan Baru">
          <Text style={styles.addOrderBtnText}>+ Pesan</Text>
        </TouchableOpacity>
      </View>

      {/* ── Filter Tabs ─────────────────────────────────────────────────────── */}
      <View style={styles.filterTabsRow}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'semua' && styles.filterTabActive]}
          onPress={() => setFilter('semua')}>
          <Text
            style={[
              styles.filterTabText,
              filter === 'semua' && styles.filterTabTextActive,
            ]}>
            Semua ({myOrders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'aktif' && styles.filterTabActive]}
          onPress={() => setFilter('aktif')}>
          <Text
            style={[
              styles.filterTabText,
              filter === 'aktif' && styles.filterTabTextActive,
            ]}>
            Aktif ({activeOrders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'selesai' && styles.filterTabActive]}
          onPress={() => setFilter('selesai')}>
          <Text
            style={[
              styles.filterTabText,
              filter === 'selesai' && styles.filterTabTextActive,
            ]}>
            Selesai ({historyOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Daftar Pesanan / Empty State ────────────────────────────────────── */}
      {displayedOrders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>
            {filter === 'aktif'
              ? 'Tidak ada pesanan aktif.'
              : filter === 'selesai'
              ? 'Belum ada riwayat pesanan selesai.'
              : 'Belum ada pesanan.'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {filter === 'aktif'
              ? 'Pesanan yang sedang diproses atau dikerjakan akan muncul di sini.'
              : 'Pesan layanan servis AC dengan mudah sekarang juga!'}
          </Text>

          <TouchableOpacity
            style={styles.emptyActionBtn}
            activeOpacity={0.8}
            onPress={handleCreateBooking}
            accessibilityRole="button"
            accessibilityLabel="Pesan Layanan dari daftar pesanan">
            <Text style={styles.emptyActionBtnText}>Pesan Layanan Sekarang</Text>
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
