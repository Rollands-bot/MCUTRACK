# MCUTrack Roles & Responsibilities

## Role Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    MCUTrack User Roles                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐                                               │
│  │    ADMIN     │  ← System administrator                       │
│  └──────────────┘                                               │
│                                                                  │
│  ┌──────────────┐                                               │
│  │    NURSE     │  ← Front desk / Check-in                      │
│  └──────────────┘                                               │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │     LAB      │  │  RADIOLOGY   │  │   DOCTOR     │          │
│  │  Technician  │  │  Technician  │  │  (Medical)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. ADMIN (Administrator Sistem)

### Siapa?
- **IT Staff** atau **Staff Administrasi** yang mengelola sistem MCUTrack
- Biasanya 1-2 orang per rumah sakit
- **Bukan** tenaga medis

### Tugas Utama:
| Tugas | Deskripsi |
|-------|-----------|
| 👤 **User Management** | Membuat akun staff baru, assign role, reset password |
| 📦 **Package Management** | Membuat MCU package (Basic, Executive, dll) |
| ⚙️ **System Config** | Mengatur pengaturan sistem |
| 📊 **Audit Log** | Memantau log aktivitas untuk compliance |
| 🏥 **Company Management** | Mengelola data perusahaan klien |

### Akses dalam Sistem:
```
✅ Dashboard admin
✅ User management (CRUD users)
✅ MCU package configuration
✅ Audit log viewer
✅ Company/Client management
✅ System settings
❌ Tidak bisa input medical results (bukan tenaga medis)
```

### Contoh Skenario:
> **Admin** membuat package "Executive Checkup" dengan steps:
> 1. Nursing (Vitals)
> 2. Laboratory (Hematologi, Kimia Darah)
> 3. Radiology (X-Ray Thorax)
> 4. Doctor (Final Assessment)

---

## 2. NURSE (Perawat Front Desk)

### Siapa?
- **Perawat** di **front desk** / **penerimaan**
- Staff medis pertama yang bertemu pasien
- Biasanya 2-4 orang per shift

### Tugas Utama:
| Tugas | Deskripsi |
|-------|-----------|
| 📝 **Patient Registration** | Daftar pasien baru, generate MRN |
| 🏷️ **Check-in** | Create visit untuk pasien yang datang |
| 🩺 **Vitals Measurement** | Ukur TD, HR, BB, TB |
| 📋 **Patient Direction** | Arahkan pasien ke dept yang tepat |
| 📊 **Queue Monitoring** | Pantau antrian visit |

### Akses dalam Sistem:
```
✅ Dashboard nursing
✅ Patient registration
✅ Create new visit
✅ Input vitals (BP, HR, Weight, Height)
✅ Update visit status (WAITING → IN_PROGRESS)
✅ View all visits queue
❌ Tidak bisa input lab/radiology results
❌ Tidak bisa make final FIT/UNFIT decision
```

### Contoh Skenario:
> **Nurse** menerima pasien:
> 1. Cari/catat MRN pasien
> 2. Create visit dengan package "Basic Health"
> 3. Ukur vitals: TD 120/80, HR 80, BB 70kg, TB 170cm
> 4. Submit nursing step → DONE
> 5. Arahkan pasien ke Lab untuk darah

---

## 3. LAB (Teknisi Laboratorium)

### Siapa?
- **Teknisi Lab** yang melakukan pemeriksaan darah/urine
- Bekerja di **laboratorium** rumah sakit
- Biasanya 2-5 orang per shift

### Tugas Utama:
| Tugas | Deskripsi |
|-------|-----------|
| 🩸 **Sample Collection** | Ambil darah/urine pasien |
| 🔬 **Lab Analysis** | Jalankan tes (Hematologi, Kimia, dll) |
| 📊 **Result Entry** | Input hasil lab ke sistem |
| 🚩 **Flag Abnormal** | Tandai hasil abnormal/kritis |
| ✅ **Result Validation** | Validasi hasil sebelum submit |

### Akses dalam Sistem:
```
✅ Dashboard laboratory
✅ View pending lab requests
✅ Input lab results (numeric + units)
✅ Flag abnormal values (LOW/HIGH/CRITICAL)
✅ Update lab step status
✅ View patient history (lab results)
❌ Tidak bisa input radiology results
❌ Tidak bisa make final decision
```

### Contoh Skenario:
> **Lab Tech** menerima request:
> 1. Lihat queue: 5 pasien menunggu
> 2. Ambil darah pasien A
> 3. Jalankan tes: Hemoglobin, Leukosit, Trombosit
> 4. Input hasil: Hb 14.2 g/dL, Leukosit 7500/μL
> 5. System auto-flag: "Normal"
> 6. Submit → Lab step DONE

---

## 4. RADIOLOGY (Teknisi Radiologi)

### Siapa?
- **Teknisi Radiologi** yang melakukan imaging
- Bekerja di **departemen radiologi**
- Biasanya 2-4 orang per shift

### Tugas Utama:
| Tugas | Deskripsi |
|-------|-----------|
| 📷 **Imaging** | Rontgen X-Ray, USG, CT, dll |
| 📝 **Finding Entry** | Catat temuan imaging |
| 📎 **Attachment** | Upload gambar (optional) |
| ✅ **Result Submission** | Submit hasil ke doctor |

### Akses dalam Sistem:
```
✅ Dashboard radiology
✅ View pending radiology requests
✅ Input radiology findings (text)
✅ Upload images (X-Ray files)
✅ Update radiology step status
✅ View patient imaging history
❌ Tidak bisa input lab results
❌ Tidak bisa make final decision
```

### Contoh Skenario:
> **Radiology Tech** menerima request X-Ray:
> 1. Lihat queue: 3 pasien untuk X-Ray
> 2. Panggil pasien B untuk Thorax X-Ray
> 3. Lakukan imaging
> 4. Input findings: "Cor dan pulmo dalam batas normal"
> 5. Optional: Upload DICOM image
> 6. Submit → Radiology step DONE

---

## 5. DOCTOR (Dokter MCU)

### Siapa?
- **Dokter** yang berwenang membuat keputusan FIT/UNFIT
- Biasanya **Dokter Umum** atau **Dokter Okupasi**
- 1-3 orang tergantung volume MCU

### Tugas Utama:
| Tugas | Deskripsi |
|-------|-----------|
| 📋 **Result Review** | Review semua hasil (lab, radiology, nursing) |
| 🩺 **Physical Exam** | Pemeriksaan fisik (jika perlu) |
| ✅ **Final Decision** | Putuskan FIT / UNFIT / FIT WITH CONDITIONS |
| 📝 **Medical Notes** | Catat temuan dan rekomendasi |
| 📄 **Report Approval** | Approve final MCU report |

### Akses dalam Sistem:
```
✅ Dashboard doctor
✅ View ALL completed results
✅ Input final assessment
✅ Make FIT/UNFIT decision
✅ Add conditions/recommendations
✅ Generate final report
✅ View visit history
❌ Tidak bisa modify lab/radiology results (hanya review)
```

### Contoh Skenario:
> **Doctor** review pasien C:
> 1. Lihat semua results: Nursing ✅, Lab ✅, Radiology ✅
> 2. Review: Hb normal, X-Ray normal, Vitals normal
> 3. Physical exam: Tidak ada kelainan
> 4. Decision: **FIT**
> 5. Notes: "Tidak ada kontraindikasi untuk bekerja"
> 6. Finalize visit → Report generated

---

## Workflow Collaboration

```
┌──────────────────────────────────────────────────────────────────┐
│                    Patient Journey                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│   ┌─────────┐                                                    │
│   │  NURSE  │ ← Patient arrives                                  │
│   │  👩‍⚕️    │   - Register                                       │
│   └────┬────┘   - Vitals                                         │
│        │                                                         │
│        ▼                                                         │
│   ┌─────────┐     ┌─────────────┐                               │
│   │   LAB   │     │  RADIOLOGY  │                               │
│   │  🩸     │     │     📷      │                               │
│   │         │     │             │  ← Parallel execution         │
│   └────┬────┘     └──────┬──────┘                               │
│        │                 │                                       │
│        └────────┬────────┘                                       │
│                 │                                                │
│                 ▼                                                │
│            ┌─────────┐                                          │
│            │ DOCTOR  │ ← All results complete                    │
│            │ 👨‍⚕️     │   - Review                                 │
│            └────┬────┘   - Final decision                        │
│                 │                                                │
│                 ▼                                                │
│            ┌─────────┐                                          │
│            │  FINAL  │ ← Report generated                        │
│            │  REPORT │                                           │
│            └─────────┘                                          │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Permission Matrix

| Feature | ADMIN | NURSE | LAB | RADIOLOGY | DOCTOR |
|---------|-------|-------|-----|-----------|--------|
| User Management | ✅ | ❌ | ❌ | ❌ | ❌ |
| Package Config | ✅ | ❌ | ❌ | ❌ | ❌ |
| Patient Registration | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create Visit | ✅ | ✅ | ❌ | ❌ | ❌ |
| Input Vitals | ✅ | ✅ | ❌ | ❌ | ❌ |
| Input Lab Results | ❌ | ❌ | ✅ | ❌ | ❌ |
| Input Rad Results | ❌ | ❌ | ❌ | ✅ | ❌ |
| Review All Results | ❌ | ❌ | ❌ | ❌ | ✅ |
| FIT/UNFIT Decision | ❌ | ❌ | ❌ | ❌ | ✅ |
| View Audit Log | ✅ | ❌ | ❌ | ❌ | ❌ |
| Dashboard (All) | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Typical Staffing (Per Shift)

| Role | Count | Notes |
|------|-------|-------|
| ADMIN | 1 | Part-time, on-call |
| NURSE | 2-4 | Front desk + vitals room |
| LAB | 2-3 | Phlebotomy + analysis |
| RADIOLOGY | 2 | X-Ray + USG |
| DOCTOR | 1-2 | Final assessment |

**Total**: 8-14 staff per shift for optimal MCU flow

---

## Role dalam Database

```prisma
enum Role {
  ADMIN      // id: "admin_001"
  NURSE      // id: "nurse_001", "nurse_002"
  LAB        // id: "lab_001", "lab_002"
  RADIOLOGY  // id: "rad_001"
  DOCTOR     // id: "doc_001", "doc_002"
}

model User {
  id       String @id
  email    String @unique
  password String // hashed
  name     String // "Suster Ani", "Dr. Budi"
  role     Role   // Determines access
}
```

---

## Login Experience

```
┌─────────────────────────────────────────┐
│         MCUTrack Login                  │
├─────────────────────────────────────────┤
│  Email: admin@hospital.com              │
│  Password: ********                     │
│  [ Login ]                              │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Welcome, Admin!                        │
│  Role: ADMINISTRATOR                    │
│                                         │
│  → Redirected to /admin/dashboard       │
└─────────────────────────────────────────┘
```

Setiap role melihat **dashboard berbeda** sesuai tanggung jawab mereka.
