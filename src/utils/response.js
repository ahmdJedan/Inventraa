// Helper agar format response JSON selalu konsisten

export class HttpError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export const sukses = (res, message, data = null, status = 200) =>
  res.status(status).json({ success: true, message, data });

export const gagal = (res, message, status = 400) =>
  res.status(status).json({ success: false, message });

export const tanganiError = (res, err) => {
  if (err instanceof HttpError) return gagal(res, err.message, err.status);
  if (err.code === '23505') return gagal(res, 'Data duplikat: kode barang sudah digunakan', 400);
  if (err.code === '23503')
    return gagal(res, 'Data tidak dapat diproses karena berelasi dengan data lain atau referensi tidak valid', 400);
  if (err.code === '22P02') return gagal(res, 'Format ID atau data tidak valid', 400);
  console.error(err);
  return gagal(res, err.message || 'Terjadi kesalahan pada server', 500);
};
