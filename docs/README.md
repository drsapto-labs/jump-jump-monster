# 🎮 Jump Jump Monster — Master Knowledge Base & Project Blueprints

Selamat datang di basis pengetahuan resmi **Jump Jump Monster**, game kebugaran aktif anak (*webcam-based exergaming*) yang dikembangkan dengan pendekatan **Vibe Coding** oleh solo developer dalam ekosistem **OWOA / OMOA (One Month One App)**.

Dokumen ini merupakan intisari terpadu (*Single Source of Truth*) dari rangkaian riset mendalam, diskusi strategis (CEO, CTO, CMO), audit kepatuhan privasi anak, serta perencanaan roadmap 2-fase yang sebelumnya terdokumentasi di *Brain* Antigravity.

---

## 📚 Indeks Dokumen Pengetahuan di Folder `docs/`

| No | File Dokumen | Topik & Cakupan Utama |
|---|---|---|
| **01** | [01_analisis_eksekutif_game_motion.md](file:///Volumes/DevSSD/Development/OneWeekOneApp/Apps/jump_jump_monster/docs/01_analisis_eksekutif_game_motion.md) | **Analisis Eksekutif (CEO, CTO, CMO)**: Riset potensi pasar exergaming webcam, TAM/SAM/SOM ($18-25B TAM), arsitektur teknis MediaPipe/MoveNet, serta strategi positioning *"Screen Time That Moves"*. |
| **02** | [02_deep_dive_kompetitor_privasi_risiko.md](file:///Volumes/DevSSD/Development/OneWeekOneApp/Apps/jump_jump_monster/docs/02_deep_dive_kompetitor_privasi_risiko.md) | **Deep Dive Kompetitor & Risiko**: Bedah Active Arcade, Ring Fit, Just Dance. Kepatuhan privasi anak (COPPA / GDPR-K / zero server transmission), kelayakan solo dev, dan mitigasi *novelty fatigue*. |
| **03** | [03_game_proposal_vibe_coding.md](file:///Volumes/DevSSD/Development/OneWeekOneApp/Apps/jump_jump_monster/docs/03_game_proposal_vibe_coding.md) | **Proposal Game & Vibe Coding Playbook**: Komparasi 5 ide game gerak dengan tester anak (TK ~5 thn & SD 3 ~8 thn). Panduan orkestrasi model AI (Claude Opus, Claude Sonnet, Gemini Flash) dan proyeksi revenue. |
| **04** | [04_analisis_timeline_omoa_osoa.md](file:///Volumes/DevSSD/Development/OneWeekOneApp/Apps/jump_jump_monster/docs/04_analisis_timeline_omoa_osoa.md) | **Framework Timeline Baru (OMOA & OSOA)**: Reevaluasi 1 Bulan vs 1 Semester. Strategi 2-Fase: **Fase 1 (1 Bulan OMOA)** fokus menuntaskan *Jump Jump Monster*, **Fase 2 (1 Semester OSOA)** ekspansi ke platform edukasi *MoveLearn*. |
| **Aset** | [docs/assets/](file:///Volumes/DevSSD/Development/OneWeekOneApp/Apps/jump_jump_monster/docs/assets/) | Tangkapan layar referensi inspirasi game interaktif webcam (Noor Alam Shuvo, LinkedIn). |

---

## 🎯 Ringkasan Eksekutif & Visi Produk

### 1. Masalah & Solusi
* **Masalah**: Anak-anak menghabiskan rata-rata 3-5 jam *screen time* pasif per hari yang memicu kurang gerak dan kekhawatiran orang tua. Solusi perangkat keras seperti Nintendo Switch (Ring Fit) atau VR Headset mahal ($80 - $500), sementara game mobile biasa membuat anak terpaku duduk membungkuk.
* **Solusi**: **Jump Jump Monster** mengubah webcam laptop biasa menjadi arena bermain interaktif aktif tanpa periferal khusus. Anak melompat, merunduk, dan bergerak lincah di depan layar untuk mengendalikan monster lucu.

```
                  ★  ★  ★        ★  ★
                          🧒  (Deteksi Tubuh Realtime)
                     ██████    █████  ←── Rintangan Atas (Merunduk!)
                  ══════════════════════
                     👾          👾    ←── Monster Bawah (Melompat!)
```

### 2. Pilar Teknis Utama (CTO Blueprint)
* **Web-First & Zero-Install**: Menggunakan **Vite + TypeScript** dengan rendering 2D performa tinggi (Phaser.js atau HTML5 Canvas).
* **On-Device Pose Estimation**: Menggunakan **MediaPipe Pose** atau **TensorFlow.js MoveNet**. Seluruh inferensi skeletal AI berjalan lokal di GPU/WebGL browser pengguna. Latensi target `< 30ms`.
* **Zero Video Streaming / 100% Privacy Guard**: Sinyal kamera **TIDAK PERNAH** dikirim keluar dari peramban/perangkat pengguna. Hanya koordinat titik sendi (landmark x, y, visibility) yang diproses dalam memori lokal sementara, memenuhi standar COPPA dan Apple Review Guidelines.

---

## 🤖 Playbook Vibe Coding & Orkestrasi Model AI

Dalam membangun game ini sebagai solo developer, alokasikan model AI secara presisi berdasarkan kekuatannya:

```
┌─────────────────────────┬────────────────────────────────────────────────────────┐
│ Model AI                │ Tugas Utama & Domain Kerja                             │
├─────────────────────────┼────────────────────────────────────────────────────────┤
│ Claude Opus             │ • Arsitektur sistem game loop & state machine          │
│ (Thinking / Deep Arch)  │ • Algoritma deteksi gesture (jump threshold, smoothing)│
│                         │ • Review privasi (COPPA compliance & security)         │
├─────────────────────────┼────────────────────────────────────────────────────────┤
│ Claude Sonnet           │ • Integrasi MediaPipe dengan engine rendering (Phaser) │
│ (Integration / Logic)   │ • Gameplay mechanics (collision, score, world physics) │
│                         │ • Debugging glitch gerakan & pose latency jitter       │
├─────────────────────────┼────────────────────────────────────────────────────────┤
│ Gemini 3.8 Flash        │ • Boilerplate TypeScript, setup package & modules      │
│ (High Speed / Code Gen) │ • Komponen UI web, menu game, HUD, responsive styling  │
│                         │ • Optimasi performa komputasi dan audio manager        │
├─────────────────────────┼────────────────────────────────────────────────────────┤
│ generate_image / DALL-E │ • Sprite karakter monster, platform tile, background   │
│ (Asset Generation)      │   paralaks (Forest, Space, Candy World), ikon bintang  │
└─────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 👨‍👩‍👧‍👦 Protokol Pengujian Bersama Anak (QA Team Internal)

Dua anak bertindak sebagai validator gameplay alami:
1. **Tester 1: Anak TK (~5 Tahun)**
   * **Fokus Uji**: Apakah gesture intuitif tanpa perlu teks instruksi rumit? Apakah lompatan responsif? Apakah monster terlihat menggemaskan (tidak menakutkan)?
   * **Kriteria Lolos**: Anak bisa langsung bermain dalam 10 detik pertama hanya dengan melihat panduan visual.
2. **Tester 2: Anak SD Kelas 3 (~8 Tahun)**
   * **Fokus Uji**: Apakah ada rasa pencapaian (high score, progression)? Apakah rintangan cukup menantang? Berapa lama sesi bermain sebelum merasa lelah atau bosan?
   * **Kriteria Lolos**: Anak ingin mengulang bermain (*replayability*) minimal 3 sesi berturut-turut untuk mengalahkan skor sebelumnya.

---

## 🗺️ Roadmap OMOA: 4 Minggu Menuju Peluncuran

```
Minggu 1: Fondasi Teknis & Deteksi Gerakan
  ├── Inisialisasi Vite + TypeScript + MediaPipe Pose
  ├── Kalibrasi webcam otomatis (tinggi tubuh anak, pencahayaan)
  └── Deteksi gesture dasar: Jump, Duck, Lean Left/Right

Minggu 2: Core Gameplay Loop (Phaser / Canvas)
  ├── Setup karakter monster & physics endless runner
  ├── Spawning rintangan (monster bawah, rintangan gantung)
  └── Integrasi real-time pose feed ke kontrol karakter

Minggu 3: Visual Polish, Audio & Theming
  ├── 2 World Themes: World 1 (Enchanted Forest), World 2 (Space Galaxy)
  ├── Sound effects (SFX loncat, koin, game over) & musik upbeat
  └── HUD (Score, Multiplier, Energy Bar, Streak Kalori/Lompatan)

Minggu 4: Playtesting, Compliance & Soft Launch
  ├── 8-10 sesi playtesting intensif bersama anak-anak
  ├── Penerbitan Privacy Policy ramah anak (zero tracking, zero cookies)
  ├── Web deployment di Vercel/Netlify dengan custom domain
  └── Dokumentasi video demo untuk kampanye media sosial & komunitas
```

---

## 🛡️ Standar Privasi Anak (COPPA & Keamanan)

1. **No Backend Camera Upload**: Tidak ada video feed, frame gambar, atau data wajah yang diunggah ke server mana pun. Pemrosesan 100% *client-side*.
2. **No Third-Party Analytics / Trackers**: Menghindari Google Analytics atau Facebook Pixel pihak ketiga yang melacak identitas anak.
3. **No In-App Purchases Tanpa Parental Gate**: Jika ada fitur berbayar di masa depan, wajib menyertakan verifikasi perkalian matematika atau kontrol orang tua (*Parental Gate*).
