/**
 * ACareContext — State management lokal reaktif untuk aplikasi ACare.
 *
 * Mengelola:
 *  - Peran pengguna aktif (customer / admin)
 *  - Profil pelanggan yang sedang login (untuk demo: bisa berganti)
 *  - Daftar pesanan (read + create + update status + assign teknisi + cancel)
 *  - Data master layanan, teknisi, dan pelanggan
 *  - Statistik ringkasan untuk dashboard admin
 *
 * Tidak menggunakan backend, Firebase, API, atau dependency eksternal.
 * Seluruh state disimpan di memori menggunakan React useState + useMemo.
 */

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import {
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  SERVICES_DATA,
  TECHNICIANS_DATA,
} from '@/constants/acare-data';
import {
  BookingFormData,
  CustomerUser,
  Order,
  OrderStatus,
  ServiceItem,
  Technician,
  TechnicianStatus,
  UserRole,
} from '@/types/acare';

// ─── Tipe Konteks ─────────────────────────────────────────────────────────────

interface ACareStats {
  /** Jumlah total seluruh pesanan. */
  total: number;
  /** Pesanan dengan status "Menunggu Konfirmasi". */
  pending: number;
  /** Pesanan dengan status "Dikonfirmasi". */
  confirmed: number;
  /**
   * Pesanan yang sedang aktif dikerjakan di lapangan:
   * "Teknisi Menuju Lokasi" + "Sedang Dikerjakan".
   */
  inProgress: number;
  /** Pesanan dengan status "Selesai". */
  completed: number;
  /** Pesanan dengan status "Dibatalkan". */
  cancelled: number;
  /** Total pendapatan dari pesanan berstatus "Selesai" (Rupiah). */
  revenue: number;
}

interface ACareContextType {
  // ── Peran & Profil ──────────────────────────────────────────────────────────
  /**
   * Peran pengguna yang aktif saat ini.
   * `null` berarti belum memilih peran (layar pemilihan peran ditampilkan).
   */
  role: UserRole | null;
  /**
   * Ubah peran aktif (customer ↔ admin).
   * Kirim `null` untuk kembali ke layar pemilihan peran.
   */
  setRole: (role: UserRole | null) => void;
  /** Profil pelanggan yang sedang "login" (dapat diganti untuk demo). */
  currentUser: CustomerUser;
  /** Ganti profil pelanggan aktif. */
  setCurrentUser: (user: CustomerUser) => void;
  /**
   * Teknisi yang sedang "login" pada peran technician.
   * `null` berarti belum ada identitas teknisi terpilih; peran technician
   * hanya boleh diaktifkan setelah teknisi dipilih.
   */
  currentTechnician: Technician | null;
  /** Tetapkan identitas teknisi aktif (dipakai sebelum masuk peran technician). */
  setCurrentTechnician: (technician: Technician | null) => void;

  // ── Data Master (read-only dari luar context) ───────────────────────────────
  /** Daftar lengkap layanan AC yang tersedia. */
  services: ServiceItem[];
  /** Daftar teknisi ACare. */
  technicians: Technician[];
  /** Daftar semua pelanggan terdaftar. */
  customers: CustomerUser[];

  // ── Pesanan ─────────────────────────────────────────────────────────────────
  /** Seluruh daftar pesanan (semua pelanggan, semua status). */
  orders: Order[];
  /**
   * Pesanan milik `currentUser` yang masih aktif
   * (status bukan "Selesai" dan bukan "Dibatalkan").
   */
  activeCustomerOrders: Order[];
  /**
   * Pesanan milik `currentUser` yang sudah selesai atau dibatalkan
   * (untuk halaman Riwayat Servis).
   */
  historyCustomerOrders: Order[];

  // ── Aksi Pesanan ─────────────────────────────────────────────────────────────
  /**
   * Buat pesanan baru dari data form pemesanan.
   * Otomatis menetapkan status "Menunggu Konfirmasi" dan menghasilkan ID baru.
   * @returns Objek Order yang baru dibuat.
   */
  createOrder: (data: BookingFormData) => Order;
  /**
   * Perbarui status pesanan (oleh admin/teknisi).
   * Jika status baru adalah "Selesai", paymentStatus otomatis berubah ke "Lunas".
   * @param orderId  ID pesanan yang diperbarui.
   * @param status   Status baru.
   * @param notes    Catatan opsional dari teknisi.
   */
  updateOrderStatus: (orderId: string, status: OrderStatus, notes?: string) => void;
  /**
   * Tugaskan teknisi ke pesanan.
   * Jika pesanan masih "Menunggu Konfirmasi", otomatis berubah ke "Dikonfirmasi".
   * Status teknisi yang ditugaskan berubah menjadi "Bertugas".
   * @param orderId      ID pesanan.
   * @param technicianId ID teknisi yang ditugaskan.
   */
  assignTechnician: (orderId: string, technicianId: string) => void;
  /**
   * Batalkan pesanan (oleh pelanggan atau admin).
   * @param orderId  ID pesanan yang dibatalkan.
   * @param reason   Alasan pembatalan (opsional, disimpan di technicianNotes).
   */
  cancelOrder: (orderId: string, reason?: string) => void;
  /**
   * Cari satu pesanan berdasarkan ID-nya.
   * @returns Objek Order jika ditemukan, undefined jika tidak.
   */
  getOrderById: (orderId: string) => Order | undefined;

  // ── Statistik Admin ──────────────────────────────────────────────────────────
  /** Statistik ringkasan untuk dashboard admin. */
  stats: ACareStats;
}

// ─── Pembuatan Context ────────────────────────────────────────────────────────

const ACareContext = createContext<ACareContextType | undefined>(undefined);

// ─── Helper: Buat ID Pesanan ──────────────────────────────────────────────────

function generateOrderId(existingCount: number): string {
  const year = new Date().getFullYear();
  const num = String(existingCount + 1).padStart(3, '0');
  return `AC-${year}-${num}`;
}

// ─── Helper: Timestamp Sekarang ───────────────────────────────────────────────

function nowTimestamp(): string {
  // Format: "YYYY-MM-DD HH:mm"
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface ACareProviderProps {
  children: ReactNode;
}

export function ACareProvider({ children }: ACareProviderProps) {
  // Peran aktif (null = belum memilih, layar pemilihan peran tampil)
  const [role, setRole] = useState<UserRole | null>(null);

  // Profil pelanggan aktif (default: pelanggan pertama)
  const [currentUser, setCurrentUser] = useState<CustomerUser>(
    INITIAL_CUSTOMERS[0]
  );

  // Identitas teknisi aktif (default: belum dipilih → null)
  const [currentTechnician, setCurrentTechnician] = useState<Technician | null>(
    null
  );

  // Daftar pesanan
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

  // Daftar teknisi (bisa berubah statusnya saat penugasan)
  const [technicians, setTechnicians] = useState<Technician[]>(TECHNICIANS_DATA);

  // Data master statis
  const services: ServiceItem[] = SERVICES_DATA;
  const customers: CustomerUser[] = INITIAL_CUSTOMERS;

  // ── Derived: Pesanan aktif & riwayat untuk currentUser ───────────────────

  const activeCustomerOrders = useMemo<Order[]>(
    () =>
      orders.filter(
        (o) =>
          o.customerId === currentUser.id &&
          o.status !== 'Selesai' &&
          o.status !== 'Dibatalkan'
      ),
    [orders, currentUser.id]
  );

  const historyCustomerOrders = useMemo<Order[]>(
    () =>
      orders.filter(
        (o) =>
          o.customerId === currentUser.id &&
          (o.status === 'Selesai' || o.status === 'Dibatalkan')
      ),
    [orders, currentUser.id]
  );

  // ── Derived: Statistik Admin ──────────────────────────────────────────────

  const stats = useMemo<ACareStats>(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'Menunggu Konfirmasi').length;
    const confirmed = orders.filter((o) => o.status === 'Dikonfirmasi').length;
    const inProgress = orders.filter(
      (o) =>
        o.status === 'Teknisi Menuju Lokasi' ||
        o.status === 'Sedang Dikerjakan'
    ).length;
    const completed = orders.filter((o) => o.status === 'Selesai').length;
    const cancelled = orders.filter((o) => o.status === 'Dibatalkan').length;
    const revenue = orders
      .filter((o) => o.status === 'Selesai')
      .reduce((sum, o) => sum + o.price, 0);
    return { total, pending, confirmed, inProgress, completed, cancelled, revenue };
  }, [orders]);

  // ── Aksi: Buat Pesanan Baru ────────────────────────────────────────────────

  const createOrder = useCallback(
    (data: BookingFormData): Order => {
      const newOrder: Order = {
        id: generateOrderId(orders.length),
        customerId: currentUser.id,
        customerName: data.customerName || currentUser.name,
        customerPhone: data.customerPhone || currentUser.phone,
        serviceType: data.serviceType,
        price: data.price * data.acUnitsCount,
        date: data.date,
        time: data.time,
        address: data.address || currentUser.address,
        addressNote: data.addressNote,
        complaints: data.complaints,
        status: 'Menunggu Konfirmasi',
        paymentMethod: data.paymentMethod,
        paymentStatus: 'Belum Bayar',
        createdAt: nowTimestamp(),
        acUnitsCount: data.acUnitsCount,
      };

      setOrders((prev) => [newOrder, ...prev]);
      return newOrder;
    },
    [orders.length, currentUser]
  );

  // ── Aksi: Perbarui Status Pesanan ─────────────────────────────────────────

  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus, notes?: string) => {
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== orderId) return order;
          return {
            ...order,
            status,
            paymentStatus: status === 'Selesai' ? 'Lunas' : order.paymentStatus,
            technicianNotes: notes !== undefined ? notes : order.technicianNotes,
          };
        })
      );
    },
    []
  );

  // ── Aksi: Tugaskan Teknisi ────────────────────────────────────────────────

  const assignTechnician = useCallback(
    (orderId: string, technicianId: string) => {
      const tech = technicians.find((t) => t.id === technicianId);
      if (!tech) return;

      // Perbarui pesanan: isi teknisi, dan naikkan status jika masih "Menunggu Konfirmasi"
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== orderId) return order;
          return {
            ...order,
            technicianId: tech.id,
            technicianName: tech.name,
            status:
              order.status === 'Menunggu Konfirmasi'
                ? 'Dikonfirmasi'
                : order.status,
          };
        })
      );

      // Perbarui status teknisi menjadi "Bertugas"
      setTechnicians((prev) =>
        prev.map((t) =>
          t.id === technicianId
            ? { ...t, status: 'Bertugas' as TechnicianStatus }
            : t
        )
      );
    },
    [technicians]
  );

  // ── Aksi: Batalkan Pesanan ────────────────────────────────────────────────

  const cancelOrder = useCallback(
    (orderId: string, reason?: string) => {
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== orderId) return order;
          const cancelNote = reason
            ? `Dibatalkan: ${reason}`
            : 'Dibatalkan atas permintaan.';
          return {
            ...order,
            status: 'Dibatalkan' as OrderStatus,
            technicianNotes: cancelNote,
          };
        })
      );
    },
    []
  );

  // ── Query: Cari Pesanan by ID ─────────────────────────────────────────────

  const getOrderById = useCallback(
    (orderId: string): Order | undefined => {
      return orders.find((o) => o.id === orderId);
    },
    [orders]
  );

  // ── Nilai Konteks ─────────────────────────────────────────────────────────

  const contextValue = useMemo<ACareContextType>(
    () => ({
      role,
      setRole,
      currentUser,
      setCurrentUser,
      currentTechnician,
      setCurrentTechnician,
      services,
      technicians,
      customers,
      orders,
      activeCustomerOrders,
      historyCustomerOrders,
      createOrder,
      updateOrderStatus,
      assignTechnician,
      cancelOrder,
      getOrderById,
      stats,
    }),
    [
      role,
      currentUser,
      currentTechnician,
      technicians,
      orders,
      activeCustomerOrders,
      historyCustomerOrders,
      createOrder,
      updateOrderStatus,
      assignTechnician,
      cancelOrder,
      getOrderById,
      stats,
    ]
  );

  return (
    <ACareContext.Provider value={contextValue}>
      {children}
    </ACareContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Hook untuk mengakses ACareContext di komponen manapun.
 * Harus digunakan di dalam pohon komponen yang dibungkus `<ACareProvider>`.
 *
 * @throws Error jika dipanggil di luar `<ACareProvider>`.
 */
export function useACare(): ACareContextType {
  const context = useContext(ACareContext);
  if (!context) {
    throw new Error(
      'useACare() harus digunakan di dalam <ACareProvider>. ' +
        'Pastikan <ACareProvider> membungkus komponen root aplikasi.'
    );
  }
  return context;
}
