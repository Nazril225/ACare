// ─── Role ────────────────────────────────────────────────────────────────────

/** Peran pengguna yang sedang aktif di sesi aplikasi ACare. */
export type UserRole = 'customer' | 'admin';

// ─── Service ─────────────────────────────────────────────────────────────────

/** Jenis layanan servis AC yang tersedia di ACare. */
export type ServiceType =
  | 'Cuci AC'
  | 'Servis AC'
  | 'Isi Freon'
  | 'Perbaikan AC'
  | 'Bongkar/Pasang AC';

/** Entitas data satu jenis layanan ACare. */
export interface ServiceItem {
  /** ID unik layanan. */
  id: string;
  /** Nama layanan sesuai ServiceType. */
  name: ServiceType;
  /** Deskripsi singkat untuk kartu layanan. */
  shortDesc: string;
  /** Deskripsi lengkap yang ditampilkan di halaman detail atau konfirmasi. */
  fullDesc: string;
  /** Harga dasar per unit (Rupiah). */
  price: number;
  /** Estimasi durasi pengerjaan, misal "45–60 Menit". */
  duration: string;
  /** Label opsional yang ditampilkan di kartu layanan (misal "Paling Populer"). */
  badge?: string;
  /** Nama ikon (digunakan sebagai referensi emoji atau SF Symbol). */
  icon: string;
}

// ─── Order Status ─────────────────────────────────────────────────────────────

/** Status pengerjaan pesanan servis AC. Urut dari awal hingga selesai. */
export type OrderStatus =
  | 'Menunggu Konfirmasi'
  | 'Dikonfirmasi'
  | 'Teknisi Menuju Lokasi'
  | 'Sedang Dikerjakan'
  | 'Selesai'
  | 'Dibatalkan';

// ─── Payment ─────────────────────────────────────────────────────────────────

/** Metode pembayaran yang dipilih pelanggan saat membuat pesanan. */
export type PaymentMethod = 'Tunai ke Teknisi' | 'Transfer Bank' | 'QRIS';

/** Status pembayaran pesanan. */
export type PaymentStatus = 'Belum Bayar' | 'Lunas';

// ─── Technician ──────────────────────────────────────────────────────────────

/** Status ketersediaan seorang teknisi. */
export type TechnicianStatus = 'Tersedia' | 'Bertugas' | 'Libur';

/** Data master satu teknisi ACare. */
export interface Technician {
  /** ID unik teknisi. */
  id: string;
  /** Nama lengkap teknisi. */
  name: string;
  /** Nomor telepon / WhatsApp teknisi. */
  phone: string;
  /** Rating rata-rata (skala 1.0 – 5.0). */
  rating: number;
  /** Jumlah pekerjaan yang telah diselesaikan (lifetime). */
  completedJobs: number;
  /** Status ketersediaan saat ini. */
  status: TechnicianStatus;
  /** Spesialisasi utama teknisi. */
  specialization: string;
}

// ─── Customer User ───────────────────────────────────────────────────────────

/** Data profil seorang pelanggan terdaftar. */
export interface CustomerUser {
  /** ID unik pelanggan. */
  id: string;
  /** Nama lengkap pelanggan. */
  name: string;
  /** Alamat email pelanggan. */
  email: string;
  /** Nomor telepon / WhatsApp pelanggan. */
  phone: string;
  /** Alamat rumah / alamat servis default. */
  address: string;
}

// ─── Order ───────────────────────────────────────────────────────────────────

/** Data lengkap satu pesanan servis AC. */
export interface Order {
  /** ID unik pesanan, format "AC-YYYY-NNN". */
  id: string;
  /** ID pelanggan yang membuat pesanan. */
  customerId: string;
  /** Nama pelanggan (snapshot saat pesanan dibuat). */
  customerName: string;
  /** Nomor telepon pelanggan (snapshot saat pesanan dibuat). */
  customerPhone: string;
  /** Jenis layanan yang dipesan. */
  serviceType: ServiceType;
  /** Total biaya pesanan (harga layanan × jumlah unit AC). */
  price: number;
  /** Tanggal kedatangan teknisi, format "YYYY-MM-DD". */
  date: string;
  /** Slot waktu kedatangan, misal "09:00 WIB". */
  time: string;
  /** Alamat lokasi servis. */
  address: string;
  /** Patokan atau catatan tambahan untuk alamat (opsional). */
  addressNote?: string;
  /** Deskripsi keluhan AC yang disampaikan pelanggan. */
  complaints: string;
  /** Status pengerjaan saat ini. */
  status: OrderStatus;
  /** ID teknisi yang ditugaskan (opsional, diisi oleh admin). */
  technicianId?: string;
  /** Nama teknisi yang ditugaskan (opsional, snapshot saat penugasan). */
  technicianName?: string;
  /** Metode pembayaran yang dipilih. */
  paymentMethod: PaymentMethod;
  /** Status pembayaran. */
  paymentStatus: PaymentStatus;
  /** Catatan hasil pengerjaan dari teknisi (opsional, diisi setelah selesai). */
  technicianNotes?: string;
  /** Timestamp pembuatan pesanan, format "YYYY-MM-DD HH:mm". */
  createdAt: string;
  /** Jumlah unit AC yang diservis. Default 1. */
  acUnitsCount: number;
}

// ─── Booking Form ─────────────────────────────────────────────────────────────

/**
 * Data yang dikumpulkan dari form pemesanan multi-langkah.
 * Digunakan sebagai input untuk membuat Order baru.
 */
export interface BookingFormData {
  /** Jenis layanan yang dipilih pelanggan. */
  serviceType: ServiceType;
  /** Harga satuan layanan (Rupiah, sebelum dikalikan jumlah unit). */
  price: number;
  /** Tanggal kedatangan teknisi, format "YYYY-MM-DD". */
  date: string;
  /** Slot waktu kedatangan, misal "09:00 WIB". */
  time: string;
  /** Nama pelanggan (dapat berbeda dari nama profil utama). */
  customerName: string;
  /** Nomor telepon pelanggan. */
  customerPhone: string;
  /** Alamat lokasi servis. */
  address: string;
  /** Patokan atau catatan tambahan alamat (opsional). */
  addressNote?: string;
  /** Deskripsi keluhan yang diinput oleh pelanggan. */
  complaints: string;
  /** Jumlah unit AC yang akan diservis. */
  acUnitsCount: number;
  /** Metode pembayaran yang dipilih pelanggan. */
  paymentMethod: PaymentMethod;
}
