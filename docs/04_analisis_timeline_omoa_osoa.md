# 🎮 Revaluasi Game — Framework Baru: 1 Bulan & 1 Semester

> **Konteks**: Proposal sebelumnya di [percakapan 5a9794ff](file:///Users/saptosutardi/.gemini/antigravity-ide/brain/5a9794ff-e99e-4b47-9372-fd40748aa74d/game_proposal_vibe_coding.md) mengasumsikan timeline OWOA (1 minggu). Anda sekarang punya **2 jalur development baru**:
> 
> | Jalur | Durasi | Karakter Produk |
> |---|---|---|
> | **OMOA** (One Month One App) | 4 minggu | Medium — polished, monetizable |
> | **OSOA** (One Semester One App) | ~5 bulan | Large — platform-level, ecosystem |

---

## 1. 🔄 Mengapa Timeline Baru Mengubah Segalanya

### Apa yang 1 Bulan BISA Berikan vs 1 Minggu

| Aspek | 1 Minggu (OWOA) | 1 Bulan (OMOA) | 1 Semester (OSOA) |
|---|---|---|---|
| **Lines of code** | ~1-3K | ~5-15K | ~30-80K |
| **Polish level** | MVP/Demo | **Production-ready** | Platform-grade |
| **ML integration** | Tidak realistis | ✅ **Bisa** (MediaPipe plug-and-play) | ✅ Custom model training |
| **Game content** | 1 game mode | **3-5 game modes** | 10+ modes + UGC |
| **Monetisasi** | Belum | **Freemium siap** | Full subscription + B2B |
| **Compliance (COPPA)** | Tidak sempat | ⚠️ Bisa dasar | ✅ Lengkap + audit |
| **Playtesting** | 1-2 sesi | **8-12 sesi** (2-3x/minggu) | 40+ sesi iteratif |

> [!IMPORTANT]
> **Implikasi kritis**: Dengan 1 bulan, **Jump Jump Monster** (endless runner) menjadi **terlalu sederhana** sebagai proyek medium. Dengan 1 semester, **platform multi-game lengkap** menjadi realistis. Ini menggeser rekomendasi.

---

## 2. 📊 Reevaluasi 5 Ide Game — Dua Jalur

### Scoring Framework

Setiap ide dinilai berdasarkan 6 kriteria (skala 1-5):

| Kriteria | Bobot | Alasan |
|---|---|---|
| **Vibe-Codability** | 25% | Seberapa mudah AI models membantu generate kode |
| **Solo Dev Fit** | 20% | Apakah bisa dikerjakan tanpa tim |
| **Revenue Potential** | 20% | Peluang menghasilkan uang |
| **Anak Jadi Tester** | 15% | Apakah anak TK & SD 3 bisa jadi QA |
| **Anti-Bosan** | 10% | Ketahanan terhadap novelty fatigue |
| **Tech Risk** | 10% | Seberapa besar risiko teknis |

---

### 🏆 IDE #1: Jump Jump Monster (Endless Runner)

```
  ★  ★  ★        ★  ★
          🧒          
     ██████    █████  ←── duck!
  ══════════════════════
     👾          👾    ←── jump!
```

| Kriteria | Score 1 Bulan | Score 1 Semester | Catatan |
|---|---|---|---|
| Vibe-Codability | ⭐⭐⭐⭐⭐ (5) | ⭐⭐⭐⭐⭐ (5) | Endless runner = paling banyak tutorial, AI sangat paham |
| Solo Dev Fit | ⭐⭐⭐⭐⭐ (5) | ⭐⭐⭐⭐ (4) | Untuk 1 semester, ini terlalu kecil scope-nya |
| Revenue Potential | ⭐⭐⭐ (3) | ⭐⭐⭐ (3) | Sudah sangat saturated sebagai genre |
| Anak Jadi Tester | ⭐⭐⭐⭐⭐ (5) | ⭐⭐⭐⭐⭐ (5) | Anak suka lompat, intuitif |
| Anti-Bosan | ⭐⭐ (2) | ⭐⭐⭐ (3) | Repetitif tanpa variasi signifikan |
| Tech Risk | ⭐⭐⭐⭐⭐ (5) | ⭐⭐⭐⭐⭐ (5) | Sangat rendah risikonya |

| Jalur | Weighted Score | Verdict |
|---|---|---|
| **1 Bulan** | **4.10 / 5** | ✅ **Cocok sempurna sebagai OMOA** |
| **1 Semester** | **3.90 / 5** | ⚠️ Terlalu kecil, under-utilize waktu |

---

### 🥈 IDE #2: Dance Bubbles

```
   🫧    🫧         🫧
      🫧       🫧
         🧒
    ← tangan kiri   tangan kanan →
```

| Kriteria | Score 1 Bulan | Score 1 Semester | Catatan |
|---|---|---|---|
| Vibe-Codability | ⭐⭐⭐⭐ (4) | ⭐⭐⭐⭐ (4) | Bubble logic + hit detection AI bisa generate |
| Solo Dev Fit | ⭐⭐⭐⭐ (4) | ⭐⭐⭐⭐ (4) | Music sync butuh effort, tapi doable |
| Revenue Potential | ⭐⭐⭐⭐ (4) | ⭐⭐⭐⭐ (4) | Song packs = proven model (Beat Saber, Just Dance) |
| Anak Jadi Tester | ⭐⭐⭐⭐⭐ (5) | ⭐⭐⭐⭐⭐ (5) | Anak suka nari dan pop bubble |
| Anti-Bosan | ⭐⭐⭐⭐ (4) | ⭐⭐⭐⭐⭐ (5) | Lagu baru = konten baru, endless |
| Tech Risk | ⭐⭐⭐ (3) | ⭐⭐⭐⭐ (4) | Music sync agak tricky, tapi 1 semester cukup |

| Jalur | Weighted Score | Verdict |
|---|---|---|
| **1 Bulan** | **4.10 / 5** | ✅ Bisa jadi OMOA (tanpa music sync, pakai timing-based saja) |
| **1 Semester** | **4.30 / 5** | ✅ Bagus — tapi bukan yang terbaik untuk semester |

---

### 🥉 IDE #3: ABC Body Spell (Edu-Motion)

```
   Spell: C - A - ?
   
   [T]     [B]     [T]
   jump!   duck!   ← correct: T
```

| Kriteria | Score 1 Bulan | Score 1 Semester | Catatan |
|---|---|---|---|
| Vibe-Codability | ⭐⭐⭐ (3) | ⭐⭐⭐⭐ (4) | Gesture matching lebih kompleks, AI butuh banyak prompt |
| Solo Dev Fit | ⭐⭐⭐ (3) | ⭐⭐⭐⭐ (4) | Content creation (kurikulum) butuh riset |
| Revenue Potential | ⭐⭐⭐⭐⭐ (5) | ⭐⭐⭐⭐⭐ (5) | **EdTech = premium pricing**, orang tua sangat willing to pay |
| Anak Jadi Tester | ⭐⭐⭐⭐ (4) | ⭐⭐⭐⭐ (4) | TK belajar huruf, SD 3 bisa math/English |
| Anti-Bosan | ⭐⭐⭐⭐ (4) | ⭐⭐⭐⭐⭐ (5) | Konten edukasi hampir tidak terbatas |
| Tech Risk | ⭐⭐⭐ (3) | ⭐⭐⭐⭐ (4) | Pose matching huruf = butuh tuning |

| Jalur | Weighted Score | Verdict |
|---|---|---|
| **1 Bulan** | **3.65 / 5** | ⚠️ Terlalu padat untuk 1 bulan, hasil setengah matang |
| **1 Semester** | **4.40 / 5** | ✅✅ **Sangat cocok sebagai proyek semester** |

---

### IDE #4: Shadow Dodge

| Kriteria | Score 1 Bulan | Score 1 Semester | Catatan |
|---|---|---|---|
| Vibe-Codability | ⭐⭐ (2) | ⭐⭐⭐ (3) | Background segmentation = jarang di tutorial, AI kurang reference |
| Solo Dev Fit | ⭐⭐ (2) | ⭐⭐⭐ (3) | Butuh banyak visual processing optimization |
| Revenue Potential | ⭐⭐⭐ (3) | ⭐⭐⭐ (3) | Novelty tinggi tapi monetisasi tidak jelas |
| Anak Jadi Tester | ⭐⭐⭐⭐⭐ (5) | ⭐⭐⭐⭐⭐ (5) | Anak SUKA melihat bayangan diri sendiri |
| Anti-Bosan | ⭐⭐ (2) | ⭐⭐⭐ (3) | Gimmick kuat tapi cepat bosan |
| Tech Risk | ⭐⭐ (2) | ⭐⭐⭐ (3) | Background segmentation di low-end device = masalah |

| Jalur | Weighted Score | Verdict |
|---|---|---|
| **1 Bulan** | **2.65 / 5** | ❌ Terlalu risky untuk solo dev 1 bulan |
| **1 Semester** | **3.25 / 5** | ⚠️ Bisa, tapi ada opsi lebih baik |

---

### IDE #5: Pose Freeze (Musical Statues)

| Kriteria | Score 1 Bulan | Score 1 Semester | Catatan |
|---|---|---|---|
| Vibe-Codability | ⭐⭐⭐⭐⭐ (5) | ⭐⭐⭐⭐⭐ (5) | Pose comparison = well-documented, AI sangat bisa |
| Solo Dev Fit | ⭐⭐⭐⭐⭐ (5) | ⭐⭐⭐ (3) | Sederhana — terlalu kecil untuk semester |
| Revenue Potential | ⭐⭐ (2) | ⭐⭐ (2) | Sulit dijual standalone, terlalu thin |
| Anak Jadi Tester | ⭐⭐⭐⭐⭐ (5) | ⭐⭐⭐⭐⭐ (5) | Musical statues = game klasik, anak langsung paham |
| Anti-Bosan | ⭐⭐⭐ (3) | ⭐⭐⭐ (3) | Fun tapi repetitif setelah beberapa hari |
| Tech Risk | ⭐⭐⭐⭐⭐ (5) | ⭐⭐⭐⭐⭐ (5) | Paling rendah risikonya |

| Jalur | Weighted Score | Verdict |
|---|---|---|
| **1 Bulan** | **3.95 / 5** | ✅ Bisa jadi OMOA, tapi revenue lemah |
| **1 Semester** | **3.45 / 5** | ❌ Under-utilize waktu, terlalu kecil |

---

## 3. 🏅 Ranking Final

### Jalur OMOA (1 Bulan — Medium App)

| Rank | Game | Score | Rekomendasi |
|---|---|---|---|
| 🥇 | **Jump Jump Monster** | 4.10 | ✅ **PILIHAN TERBAIK** — scope sempurna untuk 1 bulan |
| 🥈 | **Dance Bubbles** | 4.10 | ✅ Sama baiknya, jika Anda prefer music-based |
| 🥉 | **Pose Freeze** | 3.95 | ✅ Aman tapi revenue lemah |
| 4 | ABC Body Spell | 3.65 | ⚠️ Terlalu ambisius untuk 1 bulan |
| 5 | Shadow Dodge | 2.65 | ❌ Terlalu risky |

### Jalur OSOA (1 Semester — Large App)

| Rank | Game | Score | Rekomendasi |
|---|---|---|---|
| 🥇 | **ABC Body Spell** | 4.40 | ✅✅ **PILIHAN TERBAIK** — EdTech = premium, scope pas |
| 🥈 | **Dance Bubbles** | 4.30 | ✅ Runner-up yang kuat |
| 🥉 | Jump Jump Monster | 3.90 | ⚠️ Terlalu kecil untuk 1 semester |
| 4 | Pose Freeze | 3.45 | ❌ Terlalu thin |
| 5 | Shadow Dodge | 3.25 | ⚠️ Bisa tapi ada opsi lebih baik |

---

## 4. 🎯 Rekomendasi Utama: Strategi 2-Fase

> [!IMPORTANT]
> **Jangan pilih salah satu jalur. Gunakan KEDUANYA secara berurutan.**

### FASE 1 → OMOA (Bulan 1): "Jump Jump Monster"

**Kenapa mulai dari sini:**

| Alasan | Detail |
|---|---|
| **Batu loncatan teknis** | Anda belajar MediaPipe, Phaser.js, webcam, gesture detection |
| **Validasi pasar** | Apakah anak Anda benar-benar suka? Apakah tracking cukup akurat? |
| **Reusable core** | Engine yang Anda buat di sini = fondasi untuk proyek semester |
| **Ship something** | 1 bulan → sudah bisa live, bisa viral, bisa dapet feedback real |
| **Risk management** | Jika gagal, Anda hanya kehilangan 1 bulan, bukan 5 bulan |

**Scope 1 bulan — Jump Jump Monster:**

```
Minggu 1  ████████  Setup + MediaPipe + Gesture Detection
                    → Anak coba gerak, lihat skeleton di layar
                    → Model: Claude Opus (arsitektur awal)

Minggu 2  ████████  Phaser.js Endless Runner + Body Control
                    → Karakter bisa jump, duck, lean
                    → 3 jenis obstacle, scoring
                    → Model: Gemini Flash (boilerplate) + Sonnet (integrasi)

Minggu 3  ████████  Polish + 2 World Themes + Sound
                    → World 1: Forest, World 2: Space
                    → Particle effects, game over screen
                    → Model: Flash (UI) + generate_image (assets)

Minggu 4  ████████  Playtesting Intensif + Soft Launch
                    → 8-10 sesi dengan anak
                    → Landing page + privacy policy dasar
                    → Deploy sebagai web game
                    → Model: Sonnet (bugfix) + Opus (privacy review)
```

**Deliverable akhir bulan 1:**
- ✅ Web game playable di `jumpjumpmonster.com`
- ✅ 2 world/theme
- ✅ Score system + personal best
- ✅ Gesture: jump, duck, lean left/right
- ✅ Calibration wizard untuk anak
- ✅ Demo video (anak bermain) untuk marketing

---

### FASE 2 → OSOA (Semester, Bulan 2-6): "MoveLearn" — Platform Edu-Motion

**Kenapa ABC Body Spell (rebranded "MoveLearn") untuk semester:**

| Alasan | Detail |
|---|---|
| **Revenue terbaik** | EdTech = orang tua PALING rela bayar ($9.99-14.99/bulan) |
| **Content moat** | Kurikulum yang semakin kaya = defensible advantage |
| **B2B ready** | Sekolah beli lisensi kelas → $29.99/bulan/kelas → ARR signifikan |
| **Apple loves this** | Education + Health + Privacy = trifecta App Store feature |
| **Built on Fase 1** | Core engine (MediaPipe + Phaser) sudah jadi dari Jump Jump Monster |
| **Anak-anak dual-purpose** | TK: belajar huruf/angka, SD 3: English vocab, math |

**Scope 1 semester — MoveLearn:**

```
Bulan 2   ████████  Migrate core dari Jump Jump Monster
                    → Refactor ke modular game engine
                    → Game config JSON system
                    → Model: Opus (arsitektur refactor)

Bulan 3   ████████  3 Game Modes Edukasi
                    → "Letter Jump" — lompat ke huruf yang benar
                    → "Number Dodge" — hindari angka salah
                    → "Word Builder" — gerak tubuh spell kata
                    → Model: Sonnet (game logic) + Flash (boilerplate)

Bulan 4   ████████  Progression + Gamification + Parent Dashboard
                    → XP system, badges, streak
                    → Parent view: "Anak belajar 15 huruf hari ini"
                    → Daily challenges auto-generated
                    → Model: Flash (UI) + Sonnet (logic)

Bulan 5   ████████  Compliance + Monetisasi + B2B Pilot
                    → COPPA compliance lengkap (lawyer review)
                    → Freemium: 1 subject gratis, premium unlock
                    → Pilot di 2-3 sekolah (if possible)
                    → Model: Opus (legal/strategy)

Bulan 6   ████████  Polish + Public Launch + Marketing
                    → App Store submission (PWA atau native wrapper)
                    → Landing page premium
                    → Video marketing (anak bermain + belajar)
                    → Model: Mix semua
```

---

## 5. 🤖 Vibe Coding — Model Strategy untuk Timeline Baru

### Mengapa 1 Bulan + Vibe Coding = Sweet Spot

```
┌─────────────────────────────────────────────────────────┐
│          VIBE CODING LEVERAGE vs TIMELINE                │
│                                                         │
│  Output                                                 │
│    ▲                                                    │
│    │                          ★ 1 Bulan                 │
│    │                        ╱  (sweet spot)             │
│    │                      ╱                             │
│    │                    ╱   ← AI generates 70-80%       │
│    │                  ╱        You tune 20-30%          │
│    │         ★ 1 Minggu                                 │
│    │        ╱  (too rushed,                              │
│    │      ╱    AI errors pile up)                        │
│    │    ╱                                               │
│    └──────────────────────────────────────────▶ Time    │
│                                                         │
│  1 minggu: AI generate fast, tapi Anda tidak sempat     │
│            review → bug menumpuk → kualitas rendah      │
│                                                         │
│  1 bulan:  AI generate → Anda review → AI fix →         │
│            Anda test dengan anak → AI iterate →          │
│            POLISH. Ini optimal.                          │
│                                                         │
│  1 semester: AI leverage sama, tapi lebih banyak         │
│              manual effort untuk: kurikulum, konten,     │
│              compliance, B2B — yang AI kurang bisa       │
└─────────────────────────────────────────────────────────┘
```

### Model Rotation per Fase (Diperbarui)

| Fase | Minggu | Primary Model | Secondary | Kenapa |
|---|---|---|---|---|
| **OMOA Arsitektur** | 1 (hari 1-2) | Claude Opus 4.6 | — | Fondasi harus kokoh, Opus paling reliable untuk system design |
| **OMOA MediaPipe** | 1 (hari 3-7) | Claude Sonnet 4.6 | Gemini Flash | Integrasi teknis butuh reasoning, Flash untuk boilerplate |
| **OMOA Game Core** | 2 | Gemini 3.8 Flash | Sonnet | Endless runner = well-known pattern, Flash sangat cepat |
| **OMOA Polish** | 3 | Flash | `generate_image` | UI, effects, assets — Flash + image gen sangat produktif |
| **OMOA Playtest+Fix** | 4 | Sonnet | Flash | Bug fixing iteratif, Sonnet balance terbaik |
| **OSOA Refactor** | 5-6 | Opus | Sonnet | Arsitektur ulang ke modular engine = keputusan besar |
| **OSOA Game Modes** | 7-12 | Flash + Sonnet | — | Content generation, Flash untuk volume, Sonnet untuk nuance |
| **OSOA Gamification** | 13-16 | Sonnet | Flash | Progression system butuh logic yang thoughtful |
| **OSOA Compliance** | 17-20 | Opus | — | COPPA review = high-stakes, Opus terbaik |
| **OSOA Launch** | 21-24 | Mix semua | — | Semua model sesuai kebutuhan |

---

## 6. 💰 Revenue Projection — Timeline Baru

### Jump Jump Monster (OMOA — Bulan 1)

| Bulan ke- | Status | Revenue | Catatan |
|---|---|---|---|
| 1 | Development | $0 | Build & test |
| 2-3 | Soft launch (web) | $0-100 | Donations/tips, validation |
| 4-6 | (Transisi ke MoveLearn) | — | Revenue shifts ke MoveLearn |

### MoveLearn Platform (OSOA — Bulan 2-6+)

| Bulan ke- | MAU | Revenue/bulan | Kumulatif |
|---|---|---|---|
| 6 (launch) | 500 | $200 | $200 |
| 9 | 3,000 | $1,500 | $4,700 |
| 12 | 10,000 | $5,000 | $19,700 |
| 18 | 25,000 | $12,500 | $64,700 |
| 24 | 50,000 | $25,000 | $214,700 |

**Asumsi**: $9.99/bulan family plan EdTech, 5% conversion (EdTech convert lebih tinggi dari casual gaming)

### Revenue Breakdown by Channel (Tahun 2)

```
┌───────────────────────────────────────────┐
│           REVENUE MIX YEAR 2               │
│                                           │
│  ████████████████████  B2C Family Plans    │
│  (60%) $15K/bulan     $9.99/bulan          │
│                                           │
│  ██████████           B2B School License   │
│  (30%) $7.5K/bulan    $29.99/kelas/bulan   │
│                                           │
│  ████                 Jump Jump Monster    │
│  (10%) $2.5K/bulan    IAP + tips           │
│                                           │
│  Total: ~$25K/bulan   $300K/tahun          │
└───────────────────────────────────────────┘
```

> [!TIP]
> **EdTech premium pricing justified**: Orang tua bayar $150-300/bulan untuk les privat. $9.99/bulan untuk belajar sambil bergerak = **no-brainer** bagi mereka. Ini 15-30x lebih murah dari alternatif.

---

## 7. ⚖️ Risiko & Mitigasi — Framework Baru

| Risiko | Impact | Mitigasi dengan Timeline Baru |
|---|---|---|
| **Anak cepat bosan** | Tinggi | 1 bulan cukup untuk playtest 8-12 sesi → data retention nyata SEBELUM commit semester |
| **MediaPipe tidak akurat** | Sedang | Bulan 1 = pure validation. Jika tracking buruk, pivot ke keyboard/touch control |
| **COPPA compliance mahal** | Sedang | Bulan 1 (web game, no app store) = COPPA minimal. Compliance lengkap di bulan 5 saat ada revenue |
| **Revenue terlalu lambat** | Sedang | Jump Jump Monster (bulan 1) gratis → validasi market. MoveLearn (semester) = monetisasi serius |
| **Burnout solo dev** | Tinggi | **Bulan 1 = sprint. Bulan 2-6 = marathon pace.** 1 bulan sprint manageable. |
| **Kompetitor masuk** | Rendah | EdTech + body tracking + web = sangat niche, barrier tinggi untuk big tech |

---

## 8. 🎯 Decision Matrix Final

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   BULAN 1 (OMOA):  Jump Jump Monster                    │
│   ══════════════                                         │
│   → Bangun fondasi teknis (MediaPipe + Phaser)          │
│   → Validasi: apakah anak suka? tracking akurat?        │
│   → Ship sebagai web game gratis                        │
│   → Demo video → marketing ammo                        │
│   → Risk: MINIMAL (1 bulan, $0 cost)                   │
│                                                          │
│           ↓ Jika validasi positif ↓                      │
│                                                          │
│   BULAN 2-6 (OSOA):  MoveLearn (Edu-Motion Platform)   │
│   ════════════════                                       │
│   → Leverage core engine dari bulan 1                   │
│   → 3-5 edu game modes                                  │
│   → Progression system + parent dashboard               │
│   → COPPA compliance lengkap                            │
│   → Freemium launch → $5-25K/bulan target              │
│   → B2B pilot ke sekolah                                │
│                                                          │
│           ↓ Jika tidak validasi ↓                        │
│                                                          │
│   PIVOT: Reuse engine untuk proyek lain                 │
│   → Fitness app dewasa (no COPPA!)                      │
│   → atau tech showcase untuk portofolio                 │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 9. 🧒 Keuntungan Unik yang Diperkuat oleh Timeline Baru

| Keuntungan Anda | Dengan 1 Minggu | Dengan 1 Bulan | Dengan 1 Semester |
|---|---|---|---|
| Anak sebagai tester | 1-2 sesi | **8-12 sesi** | **40+ sesi** |
| Feedback loop | Terlalu cepat | **Daily iterate → weekly improve** | **Weekly iterate → monthly transform** |
| Anak TK (5 thn) insight | Superficial | **Real usage pattern** | **Longitudinal data** |
| Anak SD 3 (8 thn) insight | Superficial | **Preference & difficulty** | **Curriculum alignment** |
| Video anak bermain | 1 video | **3-5 video** | **10+ video = content library** |

> [!IMPORTANT]
> **Anak Anda = unfair advantage yang MAKIN kuat dengan timeline lebih panjang.** 1 minggu = snapshot. 1 bulan = pattern. 1 semester = deep understanding tentang apa yang membuat anak KEMBALI bermain.

---

## 10. ✅ Jawaban Langsung: Manakah yang Paling Tepat?

### Untuk Solo Developer + Vibe Coding:

> **OMOA (1 Bulan)**: 🏆 **Jump Jump Monster** — Endless runner dengan body tracking
> 
> Alasan: Paling vibe-codable (AI sangat paham genre ini), scope pas untuk 1 bulan, risiko teknis paling rendah, anak langsung bisa test, dan menjadi fondasi teknis untuk proyek semester.

> **OSOA (1 Semester)**: 🏆 **MoveLearn (ABC Body Spell rebranded)** — Platform edu-motion
> 
> Alasan: Revenue potential tertinggi (EdTech premium), content yang hampir tidak terbatas (kurikulum sekolah), B2B scalable ke sekolah, Apple/Google SUKA EdTech+Health, dan bisa dibangun di atas engine yang sudah jadi dari bulan 1.

### Kenapa Bukan yang Lain?

| Game | Kenapa Bukan |
|---|---|
| Dance Bubbles | Bagus, tapi music licensing = legal headache untuk solo dev |
| Shadow Dodge | Background segmentation = tech risk tinggi, vibe coding kurang reference |
| Pose Freeze | Terlalu thin untuk standalone product, lebih cocok jadi mini-game DALAM MoveLearn |

### The Meta-Strategy:

```
Jump Jump Monster (Bulan 1)
    → Fondasi teknis
    → Market validation
    → Fun game yang bisa standalone

        ↓ engine reuse ↓

MoveLearn Platform (Bulan 2-6)
    → Jump Jump Monster masuk sebagai "game mode" di MoveLearn
    → Dance Bubbles masuk sebagai game mode #2
    → Pose Freeze masuk sebagai game mode #3
    → ABC Body Spell = core education mode
    → SEMUA ide jadi 1 platform, bukan 5 app terpisah
```

> [!TIP]
> **Plot twist**: Anda tidak memilih 1 dari 5. Anda membangun 1 secara sprint, lalu MENGGABUNGKAN semuanya menjadi platform dalam 1 semester. Semua 5 ide hidup — dalam 1 produk.

---

*Analisis dibuat 15 September 2026. Disesuaikan untuk solo developer OWOA yang beralih ke framework OMOA (1 bulan) dan OSOA (1 semester), dengan 2 anak (TK & SD 3) sebagai tester, menggunakan vibe coding di Antigravity IDE.*
