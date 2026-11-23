-- =====================================================
-- INVENTRA - Skema Database Supabase (PostgreSQL)
-- Jalankan di: Supabase Dashboard > SQL Editor > New query
-- =====================================================

create table if not exists categories (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text
);

create table if not exists barang (
    id uuid primary key default gen_random_uuid(),
    kode_barang text unique not null,
    nama_barang text not null,
    deskripsi text,
    category_id uuid references categories(id),
    lokasi text,
    kondisi text default 'Baik'
        check (kondisi in ('Baik', 'Rusak Ringan', 'Rusak Berat')),
    jumlah integer default 0 check (jumlah >= 0),
    satuan text default 'Unit',
    tanggal_masuk date default current_date
);

create table if not exists transaksi (
    id uuid primary key default gen_random_uuid(),
    barang_id uuid references barang(id) on delete cascade,
    jenis_transaksi text not null
        check (jenis_transaksi in ('Barang Masuk', 'Barang Keluar')),
    jumlah integer not null check (jumlah > 0),
    keterangan text,
    tanggal_transaksi date default current_date
);

-- ---------- Data awal kategori ----------
insert into categories (name, description) values
('Elektronik', 'Perangkat elektronik seperti laptop dan proyektor'),
('Furniture', 'Meja, kursi, lemari, dan perabot lainnya'),
('Alat Tulis', 'Perlengkapan tulis dan kantor'),
('Peralatan Laboratorium', 'Alat-alat untuk kegiatan praktikum'),
('Peralatan Kebersihan', 'Perlengkapan kebersihan ruangan'),
('Lainnya', 'Barang yang tidak termasuk kategori lain');

-- ---------- Data awal barang (opsional, untuk uji coba) ----------
insert into barang (kode_barang, nama_barang, deskripsi, category_id, lokasi, kondisi, jumlah, satuan)
values
('BRG-001', 'Laptop ASUS', 'Laptop untuk kegiatan praktikum.',
 (select id from categories where name = 'Elektronik'), 'Lab Komputer', 'Baik', 10, 'Unit'),
('BRG-002', 'Proyektor Epson', 'Proyektor untuk presentasi dan seminar.',
 (select id from categories where name = 'Elektronik'), 'Ruang Seminar', 'Baik', 5, 'Unit'),
('BRG-003', 'Kursi Lipat', 'Kursi lipat untuk kegiatan.',
 (select id from categories where name = 'Furniture'), 'Gudang', 'Rusak Ringan', 20, 'Buah');

-- ---------- Catatan keamanan ----------
-- Tabel yang dibuat lewat SQL Editor tidak mengaktifkan RLS secara default,
-- sehingga API Express dapat mengakses tabel menggunakan key Supabase.
-- Jika RLS diaktifkan, gunakan service_role key di backend (jangan pernah di Flutter).
