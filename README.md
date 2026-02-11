# Kalkulator Aspal Hotmix dengan Mode Profil

## Cara Kerja

- Aplikasi menyediakan dua mode input: **Luas langsung** atau **Profil (PR)** (segmen dinamis).
- Untuk mode PR setiap segmen punya L1, L2, dan panjang P; rata-rata lebar = (L1+L2)/2; luas segmen = avg × P (sama persis seperti Excel Anda).
- Semua input numerik dinormalisasi (komma → titik, mendukung format ribuan) dan otomatis diformat saat blur.
- Validasi realtime memastikan nilai wajib dan tidak negatif; baris segmen dapat ditambahkan/dihapus.
- Perhitungan hotmix: konversi ketebalan cm→m → volume = luas × tebal(m) → ton = volume × BJ → tambah waste → total; hasil dibulatkan ke 2 desimal.
- UI responsif (Bootstrap), kode vanilla JS, dan siap di-host statis di GitHub Pages.
