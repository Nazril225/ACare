/**
 * Admin Orders Screen — Halaman Manajemen Pesanan untuk Admin ACare.
 *
 * Fitur:
 *  - Header "Manajemen Pesanan" dengan badge peran ADMIN
 *  - Input pencarian (Search ID pesanan, nama customer, atau layanan)
 *  - Filter Status:
 *      1. "Semua"
 *      2. "Menunggu Konfirmasi"
 *      3. "Berjalan" (Dikonfirmasi + Teknisi Menuju Lokasi + Sedang Dikerjakan)
 *      4. "Selesai"
 *      5. "Dibatalkan"
 *  - Mini statistics counter pada setiap tab filter
 *  - Daftar kartu pesanan menggunakan AdminOrderCard
 *  - Empty state informatif jika hasil filter/pencarian kosong
 *  - Navigasi ke Detail Pesanan Admin (/(admin)/order-detail)
 *
 * Mengambil data riil dari ACareContext via useACare().orders.
 */

import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AdminOrderCard } from '@/components/admin/admin-order-card';
import { ACareColors } from '@/constants/theme';
import { useACare } from '@/context/acare-context';
import { Order } from '@/types/acare';

type StatusFilterKey = 'semua' | 'menunggu' | 'berjalan' | 'selesai' | 'dibatalkan';

export default function AdminOrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orders } = useACare();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<StatusFilterKey>('semua');

  // ── Hitung Counter per Kategori ─────────────────────────────────────────────
  const counts = useMemo(() => {
    const total = orders.length;
    const menunggu = orders.filter((o) => o.status === 'Menunggu Konfirmasi').length;
    const berjalan = orders.filter(
      (o) =>
        o.status === 'Dikonfirmasi' ||
        o.status === 'Teknisi Menuju Lokasi' ||
        o.status === 'Sedang Dikerjakan'
    ).length;
    const selesai = orders.filter((o) => o.status === 'Selesai').length;
    const dibatalkan = orders.filter((o) => o.status === 'Dibatalkan').length;
    return { total, menunggu, berjalan, selesai, dibatalkan };
  }, [orders]);

  // ── Filter dan Pencarian ────────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Filter Kategori Status
      let matchStatus = true;
      if (activeFilter === 'menunggu') {
        matchStatus = order.status === 'Menunggu Konfirmasi';
      } else if (activeFilter === 'berjalan') {
        matchStatus =
          order.status === 'Dikonfirmasi' ||
          order.status === 'Teknisi Menuju Lokasi' ||
          order.status === 'Sedang Dikerjakan';
      } else if (activeFilter === 'selesai') {
        matchStatus = order.status === 'Selesai';
      } else if (activeFilter === 'dibatalkan') {
        matchStatus = order.status === 'Dibatalkan';
      }

      if (!matchStatus) return false;

      // 2. Pencarian Query (ID, Nama Customer, atau Layanan)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = order.id.toLowerCase().includes(q);
        const matchCustomer = order.customerName.toLowerCase().includes(q);
        const matchService = order.serviceType.toLowerCase().includes(q);
        return matchId || matchCustomer || matchService;
      }

      return true;
    });
  }, [orders, activeFilter, searchQuery]);

  function handleOrderPress(order: Order) {
    router.push({
      pathname: '/(admin)/order-detail',
      params: { orderId: order.id },
    });
  }

  function handleBackToDashboard() {
    router.push('/(admin)');
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
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={handleBackToDashboard}
            accessibilityRole="button"
            accessibilityLabel="Kembali ke Dashboard Admin">
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <View style={styles.roleBadgeRow}>
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeDot}>●</Text>
                <Text style={styles.adminBadgeText}>ADMIN</Text>
              </View>
            </View>
            <Text style={styles.headerTitle}>Manajemen Pesanan</Text>
            <Text style={styles.headerSubtitle}>
              Kelola dan pantau seluruh pesanan ACare
            </Text>
          </View>
        </View>
      </View>

      {/* ── Search Input ────────────────────────────────────────────────────── */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cari ID pesanan atau nama customer..."
            placeholderTextColor={ACareColors.slate400}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearSearchBtn}
              onPress={() => setSearchQuery('')}
              accessibilityRole="button"
              accessibilityLabel="Hapus pencarian">
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Filter Status Tabs ───────────────────────────────────────────────── */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsScroll}>
          {/* Semua */}
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'semua' && styles.filterTabActive]}
            onPress={() => setActiveFilter('semua')}
            accessibilityRole="tab"
            accessibilityLabel={`Filter Semua: ${counts.total} pesanan`}>
            <Text
              style={[
                styles.filterTabText,
                activeFilter === 'semua' && styles.filterTabTextActive,
              ]}>
              Semua ({counts.total})
            </Text>
          </TouchableOpacity>

          {/* Menunggu Konfirmasi */}
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'menunggu' && styles.filterTabActive]}
            onPress={() => setActiveFilter('menunggu')}
            accessibilityRole="tab"
            accessibilityLabel={`Filter Menunggu Konfirmasi: ${counts.menunggu} pesanan`}>
            <Text
              style={[
                styles.filterTabText,
                activeFilter === 'menunggu' && styles.filterTabTextActive,
              ]}>
              Menunggu ({counts.menunggu})
            </Text>
          </TouchableOpacity>

          {/* Berjalan */}
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'berjalan' && styles.filterTabActive]}
            onPress={() => setActiveFilter('berjalan')}
            accessibilityRole="tab"
            accessibilityLabel={`Filter Berjalan: ${counts.berjalan} pesanan`}>
            <Text
              style={[
                styles.filterTabText,
                activeFilter === 'berjalan' && styles.filterTabTextActive,
              ]}>
              Berjalan ({counts.berjalan})
            </Text>
          </TouchableOpacity>

          {/* Selesai */}
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'selesai' && styles.filterTabActive]}
            onPress={() => setActiveFilter('selesai')}
            accessibilityRole="tab"
            accessibilityLabel={`Filter Selesai: ${counts.selesai} pesanan`}>
            <Text
              style={[
                styles.filterTabText,
                activeFilter === 'selesai' && styles.filterTabTextActive,
              ]}>
              Selesai ({counts.selesai})
            </Text>
          </TouchableOpacity>

          {/* Dibatalkan */}
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'dibatalkan' && styles.filterTabActive]}
            onPress={() => setActiveFilter('dibatalkan')}
            accessibilityRole="tab"
            accessibilityLabel={`Filter Dibatalkan: ${counts.dibatalkan} pesanan`}>
            <Text
              style={[
                styles.filterTabText,
                activeFilter === 'dibatalkan' && styles.filterTabTextActive,
              ]}>
              Dibatalkan ({counts.dibatalkan})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ── Order List Header ───────────────────────────────────────────────── */}
      <View style={styles.listHeaderRow}>
        <Text style={styles.listHeaderText}>
          Menampilkan {filteredOrders.length} Pesanan
        </Text>
        {searchQuery.trim().length > 0 && (
          <Text style={styles.searchHintText}>
            Hasil pencarian &quot;{searchQuery}&quot;
          </Text>
        )}
      </View>

      {/* ── Order List / Empty State ────────────────────────────────────────── */}
      {filteredOrders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>Tidak ada pesanan</Text>
          <Text style={styles.emptySubtitle}>
            Tidak ditemukan pesanan yang sesuai dengan filter atau pencarian.
          </Text>
          {(searchQuery.length > 0 || activeFilter !== 'semua') && (
            <TouchableOpacity
              style={styles.resetFilterBtn}
              onPress={() => {
                setSearchQuery('');
                setActiveFilter('semua');
              }}
              accessibilityRole="button"
              accessibilityLabel="Reset filter dan pencarian">
              <Text style={styles.resetFilterBtnText}>Reset Filter & Pencarian</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.ordersList}>
          {filteredOrders.map((order) => (
            <AdminOrderCard
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
    gap: 16,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    marginBottom: 4,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ACareColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ACareColors.slate200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: ACareColors.slate700,
  },
  headerTitleWrap: {
    flex: 1,
  },
  roleBadgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACareColors.slate900,
    borderRadius: 6,
    paddingHorizontal: 7,
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

  // ── Search Section ──────────────────────────────────────────────────────────
  searchSection: {
    marginTop: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACareColors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: ACareColors.slate200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: ACareColors.slate900,
  },
  clearSearchBtn: {
    padding: 6,
  },
  clearSearchText: {
    fontSize: 13,
    color: ACareColors.slate400,
    fontWeight: '700',
  },

  // ── Filter Section ──────────────────────────────────────────────────────────
  filterSection: {
    gap: 8,
  },
  filterTabsScroll: {
    gap: 8,
    paddingBottom: 2,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: ACareColors.white,
    borderWidth: 1,
    borderColor: ACareColors.slate200,
  },
  filterTabActive: {
    backgroundColor: ACareColors.slate900,
    borderColor: ACareColors.slate900,
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

  // ── List Header ─────────────────────────────────────────────────────────────
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  listHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: ACareColors.slate700,
  },
  searchHintText: {
    fontSize: 11,
    color: ACareColors.primary,
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
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ACareColors.slate200,
    borderStyle: 'dashed',
    gap: 8,
    marginTop: 8,
  },
  emptyIcon: {
    fontSize: 48,
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
    paddingHorizontal: 20,
  },
  resetFilterBtn: {
    backgroundColor: ACareColors.slate100,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginTop: 8,
  },
  resetFilterBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: ACareColors.slate700,
  },
});
