/**
 * Admin Customers Screen — Halaman Manajemen Daftar Pelanggan untuk Admin ACare.
 *
 * Fitur:
 *  - Header "Customer" dengan badge peran ADMIN & tombol kembali
 *  - Input pencarian berdasarkan nama, email, nomor telepon, atau alamat
 *  - Counter ringkasan jumlah pelanggan terdaftar & total pesanan
 *  - Daftar kartu pelanggan menggunakan CustomerCard
 *  - Empty state informatif jika pelanggan kosong atau hasil pencarian tidak ditemukan
 *  - Navigasi menuju Detail Customer (/(admin)/customer-detail)
 *
 * Mengambil data riil dari ACareContext via useACare().customers dan orders.
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

import { CustomerCard } from '@/components/admin/customer-card';
import { ACareColors } from '@/constants/theme';
import { useACare } from '@/context/acare-context';
import { CustomerUser } from '@/types/acare';

export default function AdminCustomersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { customers, orders } = useACare();

  const [searchQuery, setSearchQuery] = useState<string>('');

  // ── Hitung Jumlah Pesanan per Pelanggan ─────────────────────────────────────
  const ordersCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((order) => {
      map[order.customerId] = (map[order.customerId] || 0) + 1;
    });
    return map;
  }, [orders]);

  // ── Filter dan Pencarian ────────────────────────────────────────────────────
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase().trim();
    return customers.filter((customer) => {
      const matchName = customer.name.toLowerCase().includes(q);
      const matchEmail = customer.email.toLowerCase().includes(q);
      const matchPhone = customer.phone.toLowerCase().includes(q);
      const matchAddress = customer.address.toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchAddress;
    });
  }, [customers, searchQuery]);

  function handleCustomerPress(customer: CustomerUser) {
    router.push({
      pathname: '/(admin)/customer-detail',
      params: { customerId: customer.id },
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
            <Text style={styles.headerTitle}>Customer</Text>
            <Text style={styles.headerSubtitle}>
              Kelola dan pantau seluruh data pelanggan ACare
            </Text>
          </View>
        </View>
      </View>

      {/* ── Ringkasan ───────────────────────────────────────────────────────── */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryCount}>{customers.length}</Text>
          <Text style={styles.summaryLabel}>Total Pelanggan</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryCount}>{orders.length}</Text>
          <Text style={styles.summaryLabel}>Total Pesanan</Text>
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
            placeholder="Cari nama, email, atau telepon pelanggan..."
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

      {/* ── List Header ─────────────────────────────────────────────────────── */}
      <View style={styles.listHeaderRow}>
        <Text style={styles.listHeaderText}>
          Menampilkan {filteredCustomers.length} Customer
        </Text>
        {searchQuery.trim().length > 0 && (
          <Text style={styles.searchHintText}>
            Hasil pencarian &quot;{searchQuery}&quot;
          </Text>
        )}
      </View>

      {/* ── Customers List / Empty State ────────────────────────────────────── */}
      {filteredCustomers.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyTitle}>
            {customers.length === 0 ? 'Belum ada pelanggan' : 'Tidak ada pelanggan'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {customers.length === 0
              ? 'Belum ada data pelanggan yang terdaftar di sistem ACare saat ini.'
              : 'Tidak ditemukan pelanggan yang sesuai dengan kata kunci pencarian.'}
          </Text>
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.resetFilterBtn}
              onPress={() => setSearchQuery('')}
              accessibilityRole="button"
              accessibilityLabel="Reset pencarian">
              <Text style={styles.resetFilterBtnText}>Reset Pencarian</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.customersList}>
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              ordersCount={ordersCountMap[customer.id] || 0}
              onPress={handleCustomerPress}
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

  // ── Summary ─────────────────────────────────────────────────────────────────
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACareColors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ACareColors.slate200,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryCount: {
    fontSize: 18,
    fontWeight: '800',
    color: ACareColors.primary,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: ACareColors.slate500,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: ACareColors.slate200,
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

  // ── Customers List ──────────────────────────────────────────────────────────
  customersList: {
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
