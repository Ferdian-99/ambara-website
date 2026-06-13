# Panduan Admin AMBARA

Panduan ini dibuat untuk admin non-teknis yang mengelola client, proyek, progress, dokumen, foto, homepage, dan portfolio AMBARA.

## Cara Login Admin

1. Buka website AMBARA.
2. Klik menu `Portal`.
3. Masukkan email dan password akun admin.
4. Setelah berhasil masuk, sistem akan membuka dashboard sesuai akses akun.

Jika lupa password, klik `Lupa password?` di halaman login.

## Cara Tambah Client

1. Buka `Clients`.
2. Isi nama client.
3. Isi email client. Email dibutuhkan untuk undangan portal.
4. Isi nomor telepon dan alamat bila tersedia.
5. Klik `Simpan Client`.

Client yang baru dibuat belum otomatis bisa login sampai undangan portal dikirim dan diterima.

## Cara Cek Pesan Masuk

1. Buka `Pesan Masuk`.
2. Gunakan filter `Baru`, `Dibaca`, `Ditindaklanjuti`, atau `Arsip` bila perlu.
3. Klik `Buka Detail` untuk membaca pesan lengkap.
4. Jika ada nomor WhatsApp, klik `Chat WhatsApp` untuk membuka percakapan manual.
5. Jika ada email, klik `Email` untuk membalas lewat aplikasi email.
6. Klik `Tandai Ditindaklanjuti` setelah pesan sudah dihubungi.
7. Klik `Arsipkan` jika pesan sudah selesai ditangani.

Pesan masuk berasal dari form `/kontak`. Sistem belum mengirim notifikasi otomatis ke email atau WhatsApp, jadi admin perlu mengecek inbox dashboard secara berkala.

## Cara Kirim Undangan Portal

1. Buka `Clients`.
2. Cari client yang statusnya `BELUM TERHUBUNG`.
3. Klik `Kirim Undangan Portal`.
4. Client akan menerima email untuk membuat password sendiri.

Status akan berubah seperti ini:

```text
BELUM TERHUBUNG -> UNDANGAN TERKIRIM -> PORTAL AKTIF
```

`PORTAL AKTIF` berarti client sudah membuat password atau sudah masuk ke portal.

## Cara Buat Project

1. Buka `Projects`.
2. Klik `Buat Proyek`.
3. Pilih client.
4. Isi kode proyek, nama proyek, tipe proyek, lokasi, tahap, progress, status, estimasi selesai, dan catatan bila ada.
5. Klik simpan.

Gunakan kode proyek yang mudah diberikan ke client, misalnya `AMB-2026-001`.

## Cara Update Progress

1. Buka `Projects`.
2. Klik project yang ingin diperbarui.
3. Pada bagian `Progress Management`, isi judul update.
4. Pilih tahap proyek.
5. Atur persentase progress.
6. Isi deskripsi progress.
7. Klik `Simpan Update`.

Update ini akan terlihat oleh client di portal dan dapat muncul di halaman lacak proyek publik jika kode proyek digunakan.

## Cara Upload Dokumen

1. Buka detail project.
2. Pada bagian `Documents`, pilih file dokumen.
3. Isi nama dokumen.
4. Pilih kategori seperti `Quotation`, `Desain Final`, `Invoice`, `Kontrak`, atau `Lainnya`.
5. Klik `Upload Dokumen`.

Gunakan dokumen yang sudah final atau memang siap dilihat client.

## Cara Upload Foto Progress

1. Buka detail project.
2. Pada bagian `Progress Photos`, pilih foto progress.
3. Isi caption singkat.
4. Klik `Upload Foto Progress`.

Foto akan tampil di portal client dan halaman lacak proyek.

## Cara Edit Homepage

1. Buka `Homepage`.
2. Edit teks hero, statistik, tentang, atau layanan unggulan.
3. Perhatikan batas jumlah karakter di setiap field.
4. Klik `Simpan Homepage`.

Halaman homepage akan mengikuti teks terbaru tanpa mengubah desain.

## Cara Tambah Portfolio

1. Buka `Portfolio`.
2. Klik `Project Baru`.
3. Isi nama project, jenis project, lokasi, tahun, deskripsi, layanan, dan material.
4. Upload foto utama dan foto galeri bila tersedia.
5. Pilih apakah project tampil di beranda.
6. Pilih status `Tampil` agar muncul di website publik.
7. Klik `Buat Portfolio`.

Gunakan jenis project yang sesuai: `Residensial`, `Villa`, atau `Komersial`.

## Cara Arsipkan Data

Data client, project, dan portfolio sebaiknya diarsipkan, bukan dihapus, jika masih mungkin dibutuhkan nanti.

- Arsipkan client bila client sudah tidak aktif.
- Arsipkan project bila project sudah tidak perlu tampil di daftar aktif.
- Arsipkan portfolio bila tidak ingin tampil di website publik.
- Arsipkan pesan masuk bila inquiry sudah selesai ditindaklanjuti.

Gunakan tombol arsip dengan hati-hati karena data yang diarsipkan tidak muncul di daftar aktif.

## Hal Yang Jangan Dilakukan

- Jangan membagikan akun admin ke client.
- Jangan menghapus dokumen atau foto kecuali file memang salah.
- Jangan mengunggah invoice atau dokumen sensitif ke project yang salah.
- Jangan mengubah kode proyek setelah kode diberikan ke client, kecuali benar-benar perlu.
- Jangan membuat client baru untuk orang yang sama jika data client lama masih ada.
- Jangan memasukkan password client secara manual. Client sebaiknya membuat password sendiri melalui undangan email.
- Jangan mengubah pengaturan lanjutan portfolio jika tidak memahami efeknya.
- Jangan menandai pesan sebagai ditindaklanjuti sebelum client benar-benar dihubungi.
