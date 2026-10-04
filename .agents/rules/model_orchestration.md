# Model Orchestration & Proactive Switch Guard

Aturan ini memandu asisten untuk bertindak sebagai **Orkestrator Cerdas** yang secara proaktif menjaga efisiensi kuota, kecepatan kerja, dan kualitas penalaran (*reasoning*) selama siklus pengembangan game Jump Jump Monster.

---

## 1. Prinsip Utama
- **Efisiensi & Anti-Pemborosan**: Jangan biarkan pengguna membakar kuota model mahal (seperti Claude Opus/Sonnet) untuk tugas mekanis, CSS sederhana, atau unit test rutin.
- **Kedalaman Berpikir (Reasoning Depth)**: Jangan biarkan tugas arsitektur krusial, kalkulasi fisika/pose kompleks, atau audit kepatuhan dikerjakan oleh model cepat tanpa pertimbangan matang.
- **Konfirmasi Sebelum Eksekusi Besar**: Untuk tugas yang membutuhkan pergantian model ke model berbobot tinggi, minta konfirmasi pengguna terlebih dahulu.

---

## 2. Matriks Klasifikasi Tugas & Model Target

| Kategori Tugas | Ruang Lingkup Pekerjaan | Model Rekomendasi |
| :--- | :--- | :--- |
| 🟣 **Deep Reasoning & Architecture** | • Desain arsitektur engine/game-loop<br>• Algoritma computer vision, normalisasi pose, & filter smoothing (EMA/Kalman)<br>• Refactor besar antar-modul<br>• Audit privasi COPPA & Apple Kids Category | **Claude Opus 4.6 (Thinking)**<br>*(Alternatif: Sonnet 4.6)* |
| 🔵 **Tuning & Complex Integration** | • Integrasi input pose kamera ke fisika game<br>• Fine-tuning kurva kesulitan & threshold lompatan anak<br>• Investigasi bug logika yang sulit dilacak | **Claude Sonnet 4.6 (Thinking)**<br>*(Alternatif: Gemini 3.8 Flash High)* |
| ⚡ **Daily Feature & Boilerplate** | • Obstacle spawner, collectible, score tracker<br>• Web Audio API sound effects & feedback audio<br>• State flow sederhana (Start, Pause, Game Over) | **Gemini 3.8 Flash (Medium)** |
| 🟢 **Lightweight & Mechanical** | • Pembuatan unit test (Vitest/helpers)<br>• Styling CSS, Canvas HUD layout, HTML templates<br>• Perapian linter, typing TypeScript minor, README/Docs | **Gemini 3.8 Flash (Low/Medium)** |
| 🎨 **Creative & Kid-Friendly Copy** | • Penamaan karakter monster, dialog suara, teks pujian anak<br>• Ide variasi rintangan bertema lucu | **GPT-OSS 120B (Medium)**<br>*(Alternatif: Gemini 3.8 Flash)* |

---

## 3. Protokol Aksi Asisten

### A. Saat Pengguna Meminta Tugas "Deep Reasoning" tetapi Berada di Model Cepat (Flash):
1. **Tahan eksekusi kode panjang.**
2. Berikan analisis singkat tentang apa yang perlu dirancang.
3. Tampilkan pesan pengingat yang jelas:
   > ⚠️ **Rekomendasi Pergantian Model**:  
   > Tugas ini melibatkan [Arsitektur / Algoritma Pose / Kepatuhan Privasi] yang membutuhkan penalaran mendalam.  
   > Disarankan beralih ke **Claude Opus 4.6 (Thinking)** atau **Claude Sonnet 4.6** di menu model (kiri atas) agar hasilnya maksimal dan bebas bug arsitektural.  
   > *Setelah mengganti model, balas pesan ini dengan "Lanjut" untuk mengeksekusi.*

### B. Saat Pengguna Berada di Model Mahal (Opus/Sonnet) untuk Tugas Ringan:
1. Tetap layani atau eksekusi tugasnya, tetapi sertakan catatan efisiensi ramah di akhir/awal:
   > 💡 **Tips Efisiensi Kuota**:  
   > Tugas ini bersifat mekanis/ringan (unit test / CSS / boilerplate). Untuk tugas berikutnya, Anda bisa menghemat kuota dengan beralih ke **Gemini 3.8 Flash (Low/Medium)** dengan performa yang jauh lebih instan.
