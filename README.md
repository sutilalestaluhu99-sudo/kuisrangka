# SkeletalQuest: Puzzle Rangka Manusia

Aplikasi belajar Biologi kelas XI untuk memahami sistem rangka melalui materi, puzzle interaktif, dan kuis. Nama profil, progres, hasil, badge, dan preferensi disimpan lokal di IndexedDB melalui Dexie.js; tidak ada backend atau layanan cloud.

## Fitur

- Dashboard dengan XP, level, akurasi, progres materi, dan badge berdasarkan data tersimpan.
- Sepuluh materi sistem rangka berbahasa Indonesia dengan ringkasan, lokasi, fungsi, dan fakta.
- Puzzle tiga tingkat kesulitan dengan drag-and-drop, pemilihan potongan/target, feedback edukatif, petunjuk, skor, timer, jeda, reset terkonfirmasi, dan simpan progres otomatis.
- Kuis 10 soal acak dengan opsi teracak, pembahasan, skor, dan riwayat.
- Progres, riwayat sesi, pencapaian, profil lokal, preferensi suara, serta ekspor/impor JSON.
- Layout responsif, navigasi keyboard, error boundary, dan cache PWA untuk pemakaian offline setelah aplikasi dimuat.

## Teknologi dan struktur

- React 18, JavaScript ES Modules, Vite 6, Tailwind CSS 4.
- Dexie 4 + `dexie-react-hooks`, skema IndexedDB terversi dan migrasi.
- React Router 7, Lucide React, dan `@dnd-kit/core`.
- Vitest, React Testing Library, jsdom, dan fake-indexeddb.

```text
src/
  components/     Komponen navigasi dan elemen UI bersama
  data/           Konten materi, data puzzle, bank soal
  db/             Skema Dexie dan repository operasi database
  pages/          Dashboard, materi, puzzle, kuis, progres, pengaturan
  test/           Setup dan pengujian inti
  utils/          Efek suara
  App.jsx
  index.css
  main.jsx
```

## Menjalankan aplikasi

Pastikan Node.js 20 atau lebih baru dan npm tersedia.

```bash
npm install
npm run dev
```

Buka alamat lokal yang ditampilkan Vite. Data belajar disimpan terpisah pada profil browser yang digunakan.

## Pengujian dan build

```bash
npm test
npm run build
npm run preview
```

Build produksi berada di `dist/`. Untuk penggunaan offline, buka aplikasi melalui Vite preview atau hosting statis melalui HTTPS/localhost setidaknya sekali agar service worker dapat menyimpan aset lokal. Perubahan data utama tetap tersimpan di IndexedDB.

## Penyimpanan dan pemulihan data

Database bernama `SkeletalQuestDB`. Skema versi 1 memuat profil, materi, progres, hasil, badge, dan pengaturan. Versi 2 menambahkan catatan sesi dan mengisi status puzzle lama melalui migrasi. Repository berada di `src/db/repositories.js`; komponen tidak menggunakan IndexedDB API mentah. Gunakan Pengaturan → Ekspor data untuk membuat cadangan JSON dan Impor data untuk memulihkannya.

Data ekspor berisi informasi belajar lokal. Simpan berkas cadangan pada tempat yang aman dan hanya impor berkas yang dipercaya.

## Catatan materi

Jumlah rangka orang dewasa umumnya sekitar 206 tulang, tetapi variasi anatomi individual dapat terjadi. Puzzle memakai target anatomi yang eksplisit, bukan posisi acak. Ilustrasi di aplikasi berupa diagram konseptual lokal agar tidak bergantung pada aset eksternal.
