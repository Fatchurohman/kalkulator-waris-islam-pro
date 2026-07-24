/**
 * Engine Kalkulator Faraidh (Ilmu Waris Islam) - Mazhab Syafi'i
 * File: script.js
 * 
 * Fitur & Aturan Logika:
 * 1. Pembersihan Harta (Harta Kotor - Hutang/Biaya Jenazah - Wasiat maks 1/3)
 * 2. Logika Hijab Hirman (Penghalang Ahli Waris menurut Mazhab Syafi'i)
 * 3. Al-Furudul Muqaddarah (1/2, 1/4, 1/8, 2/3, 1/3, 1/6)
 * 4. Ashabah (Binafsihi, Bil Ghair, Ma'al Ghair)
 * 5. Penyelesaian 'Aul (Porsi > 1) & Radd (Porsi < 1 tanpa Ashabah)
 */

class FaraidhEngineSyafii {
    constructor(inputData) {
        // Harta
        this.hartaKotor = parseFloat(inputData.hartaKotor) || 0;
        this.hutangBiaya = parseFloat(inputData.hutangBiaya) || 0;
        this.wasiat = parseFloat(inputData.wasiat) || 0;

        // Hitung Harta Bersih
        let hartaSisaHutang = Math.max(0, this.hartaKotor - this.hutangBiaya);
        let batasWasiat = hartaSisaHutang / 3;
        this.wasiatDiterima = Math.min(this.wasiat, batasWasiat);
        this.hartaBersih = Math.max(0, hartaSisaHutang - this.wasiatDiterima);

        // Raw Ahli Waris Input
        this.rawWaris = {
            suami: inputData.suami ? 1 : 0,
            istri: parseInt(inputData.istri) || 0,
            anakLaki: parseInt(inputData.anakLaki) || 0,
            anakPerempuan: parseInt(inputData.anakPerempuan) || 0,
            cucuLaki: parseInt(inputData.cucuLaki) || 0, // Cucu dari anak laki-laki
            cucuPerempuan: parseInt(inputData.cucuPerempuan) || 0, // Cucu perempuan dari anak laki-laki
            ayah: inputData.ayah ? 1 : 0,
            ibu: inputData.ibu ? 1 : 0,
            kakek: inputData.kakek ? 1 : 0, // Kakek sahih (ayah dari ayah)
            nenekAyah: inputData.nenekAyah ? 1 : 0, // Nenek dari pihak ayah
            nenekIbu: inputData.nenekIbu ? 1 : 0, // Nenek dari pihak ibu
            saudaraKandungLaki: parseInt(inputData.saudaraKandungLaki) || 0,
            saudaraKandungPerempuan: parseInt(inputData.saudaraKandungPerempuan) || 0,
            saudaraSeayahLaki: parseInt(inputData.saudaraSeayahLaki) || 0,
            saudaraSeayahPerempuan: parseInt(inputData.saudaraSeayahPerempuan) || 0,
            saudaraSeibu: parseInt(inputData.saudaraSeibu) || 0, // Laki/Perempuan seibu
            pamanKandung: parseInt(inputData.pamanKandung) || 0, // Saudara kandung ayah
            pamanSeayah: parseInt(inputData.pamanSeayah) || 0, // Saudara seayah dari ayah
            anakPamanKandung: parseInt(inputData.anakPamanKandung) || 0, // Sepupu laki kandung
            anakPamanSeayah: parseInt(inputData.anakPamanSeayah) || 0 // Sepupu laki seayah
        };

        this.statusHijab = {};
        this.warisAktif = { ...this.rawWaris };
        this.porsiFardh = {};
        this.keterangan = {};
    }

    /**
     * Engine Logika Hijab Hirman (Penghalangan Penuh) Menurut Mazhab Syafi'i
     */
    terapkanHijab() {
        const w = this.warisAktif;
        const h = this.statusHijab;

        // Inisialisasi status hijab
        for (let k in w) {
            h[k] = { terhalang: false, oleh: "" };
        }

        const adaAnakLaki = w.anakLaki > 0;
        const adaAnakP = w.anakPerempuan > 0;
        const adaCucuLaki = w.cucuLaki > 0;
        const adaKeturunanLaki = adaAnakLaki || adaCucuLaki;
        const adaKeturunan = adaAnakLaki || adaAnakP || adaCucuLaki || (w.cucuPerempuan > 0);
        const adaAyah = w.ayah > 0;
        const adaIbu = w.ibu > 0;
        const totalAnakPerempuan = w.anakPerempuan;

        // 1. Cucu Laki-laki terhalang oleh Anak Laki-laki
        if (adaAnakLaki) {
            h.cucuLaki = { terhalang: true, oleh: "Anak Laki-laki" };
            w.cucuLaki = 0;
        }

        // 2. Cucu Perempuan terhalang oleh Anak Laki-laki atau 2+ Anak Perempuan (jika tidak ada Cucu Laki-laki sebagai Mu'asshib)
        if (adaAnakLaki) {
            h.cucuPerempuan = { terhalang: true, oleh: "Anak Laki-laki" };
            w.cucuPerempuan = 0;
        } else if (totalAnakPerempuan >= 2 && w.cucuLaki === 0) {
            h.cucuPerempuan = { terhalang: true, oleh: "2 atau lebih Anak Perempuan (stok 2/3 habis)" };
            w.cucuPerempuan = 0;
        }

        // 3. Kakek terhalang oleh Ayah
        if (adaAyah) {
            h.kakek = { terhalang: true, oleh: "Ayah" };
            w.kakek = 0;
        }

        // 4. Nenek dari Ibu terhalang oleh Ibu. Nenek dari Ayah terhalang oleh Ibu ATAU Ayah.
        if (adaIbu) {
            h.nenekIbu = { terhalang: true, oleh: "Ibu" };
            w.nenekIbu = 0;
            h.nenekAyah = { terhalang: true, oleh: "Ibu" };
            w.nenekAyah = 0;
        } else if (adaAyah) {
            h.nenekAyah = { terhalang: true, oleh: "Ayah" };
            w.nenekAyah = 0;
        }

        // 5. Saudara Seibu (Laki & Perempuan) terhalang oleh Keturunan (Anak/Cucu) ATAU Ayah/Kakek
        if (adaKeturunan || adaAyah || w.kakek > 0) {
            h.saudaraSeibu = { terhalang: true, oleh: "Keturunan atau Ayah/Kakek" };
            w.saudaraSeibu = 0;
        }

        // 6. Saudara Kandung (Laki & Perempuan) terhalang oleh Anak Laki-laki, Cucu Laki-laki, atau Ayah
        if (adaKeturunanLaki || adaAyah) {
            let penghalang = adaAyah ? "Ayah" : "Anak/Cucu Laki-laki";
            h.saudaraKandungLaki = { terhalang: true, oleh: penghalang };
            h.saudaraKandungPerempuan = { terhalang: true, oleh: penghalang };
            w.saudaraKandungLaki = 0;
            w.saudaraKandungPerempuan = 0;
        }

        // 7. Saudara Seayah terhalang oleh:
        //    a. Penghalang Saudara Kandung
        //    b. Saudara Kandung Laki-laki
        //    c. Saudara Kandung Perempuan yang menjadi Ashabah Ma'al Ghair (bersama Anak/Cucu Perempuan)
        //    d. 2+ Saudara Kandung Perempuan (kecuali ada Saudara Seayah Laki-laki sebagai Mu'asshib)
        const sKandungP_IsAshabahMaalGhair = (w.saudaraKandungPerempuan > 0) && (adaAnakP || w.cucuPerempuan > 0) && (!adaKeturunanLaki) && (!adaAyah);
        
        if (adaKeturunanLaki || adaAyah || w.saudaraKandungLaki > 0 || sKandungP_IsAshabahMaalGhair) {
            let penghalang = "Ayah / Anak-Cucu L/ Saudara Kandung";
            h.saudaraSeayahLaki = { terhalang: true, oleh: penghalang };
            h.saudaraSeayahPerempuan = { terhalang: true, oleh: penghalang };
            w.saudaraSeayahLaki = 0;
            w.saudaraSeayahPerempuan = 0;
        } else if (w.saudaraKandungPerempuan >= 2 && w.saudaraSeayahLaki === 0) {
            h.saudaraSeayahPerempuan = { terhalang: true, oleh: "2+ Saudara Kandung Perempuan" };
            w.saudaraSeayahPerempuan = 0;
        }

        // 8. Paman Kandung terhalang oleh Ayah, Kakek, Anak/Cucu L, atau Saudara Laki-laki (Kandung/Seayah) / Saudara P yang jadi Ashabah Ma'al Ghair
        const sSeayahP_IsAshabahMaalGhair = (w.saudaraSeayahPerempuan > 0) && (adaAnakP || w.cucuPerempuan > 0) && (!adaKeturunanLaki) && (!adaAyah);
        const adaAshabahLakiLebihDekat = adaKeturunanLaki || adaAyah || w.kakek > 0 || w.saudaraKandungLaki > 0 || w.saudaraSeayahLaki > 0 || sKandungP_IsAshabahMaalGhair || sSeayahP_IsAshabahMaalGhair;

        if (adaAshabahLakiLebihDekat) {
            h.pamanKandung = { terhalang: true, oleh: "Laki-laki garis utama / Saudara" };
            w.pamanKandung = 0;
        }

        // 9. Paman Seayah terhalang oleh Paman Kandung atau yang menghalangi Paman Kandung
        if (adaAshabahLakiLebihDekat || w.pamanKandung > 0) {
            h.pamanSeayah = { terhalang: true, oleh: "Paman Kandung atau kerabat lebih dekat" };
            w.pamanSeayah = 0;
        }

        // 10. Anak Paman Kandung (Sepupu) terhalang oleh Paman Seayah / Paman Kandung dll.
        if (adaAshabahLakiLebihDekat || w.pamanKandung > 0 || w.pamanSeayah > 0) {
            h.anakPamanKandung = { terhalang: true, oleh: "Paman atau kerabat lebih dekat" };
            w.anakPamanKandung = 0;
        }

        // 11. Anak Paman Seayah terhalang oleh Anak Paman Kandung dll.
        if (adaAshabahLakiLebihDekat || w.pamanKandung > 0 || w.pamanSeayah > 0 || w.anakPamanKandung > 0) {
            h.anakPamanSeayah = { terhalang: true, oleh: "Sepupu Kandung atau kerabat lebih dekat" };
            w.anakPamanSeayah = 0;
        }
    }

    /**
     * Hitung Porsi Fardh & Ashabah
     */
    kalkulasi() {
        this.terapkanHijab();
        const w = this.warisAktif;
        const p = {}; // Porsi Fardh (dalang pecahan)
        const ket = {};

        const adaKeturunan = (w.anakLaki + w.anakPerempuan + w.cucuLaki + w.cucuPerempuan) > 0;
        const totalSaudara = w.saudaraKandungLaki + w.saudaraKandungPerempuan + w.saudaraSeayahLaki + w.saudaraSeayahPerempuan + w.saudaraSeibu;

        // --- PASANGAN ---
        if (w.suami) {
            p.suami = adaKeturunan ? 1/4 : 1/2;
            ket.suami = adaKeturunan ? "1/4 (Ada keturunan)" : "1/2 (Tidak ada keturunan)";
        }
        if (w.istri > 0) {
            p.istri = adaKeturunan ? 1/8 : 1/4;
            ket.istri = adaKeturunan ? `1/8 (Dibatagi ${w.istri} istri)` : `1/4 (Dibagi ${w.istri} istri)`;
        }

        // --- IBU ---
        if (w.ibu) {
            p.ibu = (adaKeturunan || totalSaudara >= 2) ? 1/6 : 1/3;
            ket.ibu = (adaKeturunan || totalSaudara >= 2) ? "1/6 (Ada keturunan/2+ saudara)" : "1/3 (Tanpa keturunan & saudara < 2)";
        }

        // --- NENEK ---
        let totalNenek = w.nenekIbu + w.nenekAyah;
        if (totalNenek > 0) {
            p.nenek = 1/6;
            ket.nenek = `1/6 (Dibagi rata untuk ${totalNenek} nenek)`;
        }

        // --- AYAH & KAKEK ---
        if (w.ayah) {
            if (w.anakLaki > 0 || w.cucuLaki > 0) {
                p.ayah = 1/6;
                ket.ayah = "1/6 (Fardh murni karena ada keturunan laki-laki)";
            } else if (w.anakPerempuan > 0 || w.cucuPerempuan > 0) {
                p.ayah = 1/6; // Nanti ditambah Ashabah jika ada sisa
                ket.ayah = "1/6 + Ashabah (Fardh + Sisa harta)";
            } else {
                ket.ayah = "Ashabah Binafsihi (Mengambil seluruh sisa harta)";
            }
        }

        if (w.kakek) {
            if (w.anakLaki > 0 || w.cucuLaki > 0) {
                p.kakek = 1/6;
                ket.kakek = "1/6 (Fardh murni)";
            } else if (w.anakPerempuan > 0 || w.cucuPerempuan > 0) {
                p.kakek = 1/6;
                ket.kakek = "1/6 + Ashabah";
            } else {
                ket.kakek = "Ashabah Binafsihi";
            }
        }

        // --- SAUDARA SEIBU ---
        if (w.saudaraSeibu > 0) {
            if (w.saudaraSeibu === 1) {
                p.saudaraSeibu = 1/6;
                ket.saudaraSeibu = "1/6 (1 orang saudara seibu)";
            } else {
                p.saudaraSeibu = 1/3;
                ket.saudaraSeibu = `1/3 (Dibagi rata untuk ${w.saudaraSeibu} saudara seibu)`;
            }
        }

        // --- ANAK PEREMPUAN & CUCU PEREMPUAN (Jika Tanpa Mu'asshib) ---
        if (w.anakLaki === 0) {
            if (w.anakPerempuan === 1) {
                p.anakPerempuan = 1/2;
                ket.anakPerempuan = "1/2 (Tunggal tanpa anak laki-laki)";
            } else if (w.anakPerempuan > 1) {
                p.anakPerempuan = 2/3;
                ket.anakPerempuan = `2/3 (Dibagi rata ${w.anakPerempuan} anak perempuan)`;
            }
        } else {
            ket.anakLaki = "Ashabah Binafsihi (Rasio 2)";
            ket.anakPerempuan = "Ashabah bil Ghair (Rasio 1 bersama Anak Laki-laki)";
        }

        if (w.cucuLaki === 0 && w.cucuPerempuan > 0) {
            if (w.anakPerempuan === 0) {
                p.cucuPerempuan = (w.cucuPerempuan === 1) ? 1/2 : 2/3;
                ket.cucuPerempuan = (w.cucuPerempuan === 1) ? "1/2" : `2/3 (Dibagi ${w.cucuPerempuan} cucu)`;
            } else if (w.anakPerempuan === 1) {
                p.cucuPerempuan = 1/6; // Pelengkap 2/3 (Takmilatun li Tsulutsain)
                ket.cucuPerempuan = "1/6 (Pelengkap 2/3 bersama 1 anak perempuan)";
            }
        } else if (w.cucuLaki > 0) {
            ket.cucuLaki = "Ashabah Binafsihi";
            if (w.cucuPerempuan > 0) ket.cucuPerempuan = "Ashabah bil Ghair (Rasio 1 bersama Cucu Laki)";
        }

        // --- SAUDARA KANDUNG & SEAYAH (PEREMPUAN) FARDH ---
        const tidakAdaAshabahLaki = (w.anakLaki === 0 && w.cucuLaki === 0 && !w.ayah && !w.kakek);
        if (tidakAdaAshabahLaki) {
            if (w.saudaraKandungLaki === 0 && w.saudaraKandungPerempuan > 0) {
                if (w.anakPerempuan > 0 || w.cucuPerempuan > 0) {
                    ket.saudaraKandungPerempuan = "Ashabah Ma'al Ghair (Mengambil sisa bersama keturunan perempuan)";
                } else {
                    p.saudaraKandungPerempuan = (w.saudaraKandungPerempuan === 1) ? 1/2 : 2/3;
                    ket.saudaraKandungPerempuan = (w.saudaraKandungPerempuan === 1) ? "1/2" : `2/3 (Dibagi ${w.saudaraKandungPerempuan} orang)`;
                }
            } else if (w.saudaraKandungLaki > 0) {
                ket.saudaraKandungLaki = "Ashabah Binafsihi";
                if (w.saudaraKandungPerempuan > 0) ket.saudaraKandungPerempuan = "Ashabah bil Ghair";
            }

            // Seayah
            if (w.saudaraSeayahLaki === 0 && w.saudaraSeayahPerempuan > 0) {
                if (w.anakPerempuan > 0 || w.cucuPerempuan > 0) {
                    ket.saudaraSeayahPerempuan = "Ashabah Ma'al Ghair";
                } else if (w.saudaraKandungPerempuan === 0) {
                    p.saudaraSeayahPerempuan = (w.saudaraSeayahPerempuan === 1) ? 1/2 : 2/3;
                    ket.saudaraSeayahPerempuan = (w.saudaraSeayahPerempuan === 1) ? "1/2" : "2/3";
                } else if (w.saudaraKandungPerempuan === 1) {
                    p.saudaraSeayahPerempuan = 1/6; // Pelengkap 2/3
                    ket.saudaraSeayahPerempuan = "1/6 (Pelengkap 2/3)";
                }
            } else if (w.saudaraSeayahLaki > 0) {
                ket.saudaraSeayahLaki = "Ashabah Binafsihi";
                if (w.saudaraSeayahPerempuan > 0) ket.saudaraSeayahPerempuan = "Ashabah bil Ghair";
            }
        }

        // --- HITUNG SUM PORSI FARDH ---
        let totalFardh = 0;
        for (let key in p) totalFardh += p[key];

        // Hasil Nominal Rincian
        let hasilNominal = {};
        let statusKalkulasi = "NORMAL";

        // AUL (Jika Total Porsi Fardh > 1)
        if (totalFardh > 1.0000001) {
            statusKalkulasi = "AUL";
            for (let key in p) {
                let porsiAul = p[key] / totalFardh;
                hasilNominal[key] = porsiAul * this.hartaBersih;
                ket[key] += ` [Mengalami 'Aul: Disesuaikan dari ${(p[key]*100).toFixed(1)}% menjadi ${(porsiAul*100).toFixed(1)}%]`;
            }
        } 
        // RADD / ASHABAH (Jika Total Porsi Fardh <= 1)
        else {
            let sisaHarta = this.hartaBersih * (1 - totalFardh);

            // Tentukan Penerima Ashabah (Prioritas Menurut Syafi'i)
            let penerimaAshabah = null;

            if (w.anakLaki > 0) penerimaAshabah = "ANAK_LAKI";
            else if (w.cucuLaki > 0) penerimaAshabah = "CUCU_LAKI";
            else if (w.ayah) penerimaAshabah = "AYAH";
            else if (w.kakek) penerimaAshabah = "KAKEK";
            else if (w.saudaraKandungLaki > 0) penerimaAshabah = "SAUDARA_KANDUNG_LAKI";
            else if (w.saudaraKandungPerempuan > 0 && (w.anakPerempuan > 0 || w.cucuPerempuan > 0)) penerimaAshabah = "SAUDARA_KANDUNG_P_MAAL_GHAIR";
            else if (w.saudaraSeayahLaki > 0) penerimaAshabah = "SAUDARA_SEAYAH_LAKI";
            else if (w.saudaraSeayahPerempuan > 0 && (w.anakPerempuan > 0 || w.cucuPerempuan > 0)) penerimaAshabah = "SAUDARA_SEAYAH_P_MAAL_GHAIR";
            else if (w.pamanKandung > 0) penerimaAshabah = "PAMAN_KANDUNG";
            else if (w.pamanSeayah > 0) penerimaAshabah = "PAMAN_SEAYAH";
            else if (w.anakPamanKandung > 0) penerimaAshabah = "SEPUPU_KANDUNG";
            else if (w.anakPamanSeayah > 0) penerimaAshabah = "SEPUPU_SEAYAH";

            // Alokasikan Porsi Fardh terlebih dahulu
            for (let key in p) {
                hasilNominal[key] = p[key] * this.hartaBersih;
            }

            // Distribusi Sisa Harta ke Ashabah
            if (penerimaAshabah && sisaHarta > 0) {
                switch (penerimaAshabah) {
                    case "ANAK_LAKI": {
                        let poin = (w.anakLaki * 2) + w.anakPerempuan;
                        let perPoin = sisaHarta / poin;
                        hasilNominal.anakLaki = (hasilNominal.anakLaki || 0) + (perPoin * 2 * w.anakLaki);
                        if (w.anakPerempuan > 0) {
                            hasilNominal.anakPerempuan = (hasilNominal.anakPerempuan || 0) + (perPoin * w.anakPerempuan);
                        }
                        break;
                    }
                    case "CUCU_LAKI": {
                        let poin = (w.cucuLaki * 2) + w.cucuPerempuan;
                        let perPoin = sisaHarta / poin;
                        hasilNominal.cucuLaki = (hasilNominal.cucuLaki || 0) + (perPoin * 2 * w.cucuLaki);
                        if (w.cucuPerempuan > 0) {
                            hasilNominal.cucuPerempuan = (hasilNominal.cucuPerempuan || 0) + (perPoin * w.cucuPerempuan);
                        }
                        break;
                    }
                    case "AYAH":
                        hasilNominal.ayah = (hasilNominal.ayah || 0) + sisaHarta;
                        break;
                    case "KAKEK":
                        hasilNominal.kakek = (hasilNominal.kakek || 0) + sisaHarta;
                        break;
                    case "SAUDARA_KANDUNG_LAKI": {
                        let poin = (w.saudaraKandungLaki * 2) + w.saudaraKandungPerempuan;
                        let perPoin = sisaHarta / poin;
                        hasilNominal.saudaraKandungLaki = perPoin * 2 * w.saudaraKandungLaki;
                        if (w.saudaraKandungPerempuan > 0) {
                            hasilNominal.saudaraKandungPerempuan = perPoin * w.saudaraKandungPerempuan;
                        }
                        break;
                    }
                    case "SAUDARA_KANDUNG_P_MAAL_GHAIR":
                        hasilNominal.saudaraKandungPerempuan = (hasilNominal.saudaraKandungPerempuan || 0) + sisaHarta;
                        break;
                    case "SAUDARA_SEAYAH_LAKI": {
                        let poin = (w.saudaraSeayahLaki * 2) + w.saudaraSeayahPerempuan;
                        let perPoin = sisaHarta / poin;
                        hasilNominal.saudaraSeayahLaki = perPoin * 2 * w.saudaraSeayahLaki;
                        if (w.saudaraSeayahPerempuan > 0) {
                            hasilNominal.saudaraSeayahPerempuan = perPoin * w.saudaraSeayahPerempuan;
                        }
                        break;
                    }
                    case "SAUDARA_SEAYAH_P_MAAL_GHAIR":
                        hasilNominal.saudaraSeayahPerempuan = (hasilNominal.saudaraSeayahPerempuan || 0) + sisaHarta;
                        break;
                    case "PAMAN_KANDUNG":
                        hasilNominal.pamanKandung = sisaHarta;
                        break;
                    case "PAMAN_SEAYAH":
                        hasilNominal.pamanSeayah = sisaHarta;
                        break;
                    case "SEPUPU_KANDUNG":
                        hasilNominal.anakPamanKandung = sisaHarta;
                        break;
                    case "SEPUPU_SEAYAH":
                        hasilNominal.anakPamanSeayah = sisaHarta;
                        break;
                }
            } 
            // Jika TIDAK ada Ashabah dan Ada Sisa Harta -> Terjadi RADD (Pendapat Mu'tamad Syafi'iyah era belakangan)
            else if (!penerimaAshabah && sisaHarta > 0.01) {
                statusKalkulasi = "RADD";
                // Radd dibagikan proporsional kepada pemilik Fardh SELAIN Suami dan Istri
                let totalFardhNonPasangan = 0;
                for (let key in p) {
                    if (key !== "suami" && key !== "istri") {
                        totalFardhNonPasangan += p[key];
                    }
                }

                if (totalFardhNonPasangan > 0) {
                    for (let key in p) {
                        if (key !== "suami" && key !== "istri") {
                            let porsiRadd = (p[key] / totalFardhNonPasangan) * sisaHarta;
                            hasilNominal[key] += porsiRadd;
                            ket[key] += " + [Mendapatkan Pengembalian Radd]";
                        }
                    }
                } else {
                    // Jika HANYA ada suami/istri tanpa kerabat nasab, sisa harta diserahkan ke Baitul Maal
                    hasilNominal.baitulMaal = sisaHarta;
                    ket.baitulMaal = "Diserahkan ke Baitul Maal (Sisa harta karena Suami/Istri tidak menerima Radd)";
                }
            }
        }

        return {
            hartaKotor: this.hartaKotor,
            hutangBiaya: this.hutangBiaya,
            wasiatDiterima: this.wasiatDiterima,
            hartaBersih: this.hartaBersih,
            statusKalkulasi: statusKalkulasi,
            rawInput: this.rawWaris,
            warisAktif: this.warisAktif,
            statusHijab: this.statusHijab,
            hasilNominal: hasilNominal,
            keterangan: ket
        };
    }
}

// ========================================================
// CONTROLLER & INTEGRASI HTML UI
// ========================================================
function prosesHitungWaris() {
    // Ambil input dari Form HTML
    const inputData = {
        hartaKotor: document.getElementById('hartaKotor')?.value || 0,
        hutangBiaya: document.getElementById('hutangBiaya')?.value || 0,
        wasiat: document.getElementById('wasiat')?.value || 0,
        suami: document.getElementById('suami')?.checked || false,
        istri: document.getElementById('istri')?.value || 0,
        anakLaki: document.getElementById('anakLaki')?.value || 0,
        anakPerempuan: document.getElementById('anakPerempuan')?.value || 0,
        cucuLaki: document.getElementById('cucuLaki')?.value || 0,
        cucuPerempuan: document.getElementById('cucuPerempuan')?.value || 0,
        ayah: document.getElementById('ayah')?.checked || false,
        ibu: document.getElementById('ibu')?.checked || false,
        kakek: document.getElementById('kakek')?.checked || false,
        nenekAyah: document.getElementById('nenekAyah')?.checked || false,
        nenekIbu: document.getElementById('nenekIbu')?.checked || false,
        saudaraKandungLaki: document.getElementById('saudaraKandungLaki')?.value || 0,
        saudaraKandungPerempuan: document.getElementById('saudaraKandungPerempuan')?.value || 0,
        saudaraSeayahLaki: document.getElementById('saudaraSeayahLaki')?.value || 0,
        saudaraSeayahPerempuan: document.getElementById('saudaraSeayahPerempuan')?.value || 0,
        saudaraSeibu: document.getElementById('saudaraSeibu')?.value || 0,
        pamanKandung: document.getElementById('pamanKandung')?.value || 0,
        pamanSeayah: document.getElementById('pamanSeayah')?.value || 0,
        anakPamanKandung: document.getElementById('anakPamanKandung')?.value || 0,
        anakPamanSeayah: document.getElementById('anakPamanSeayah')?.value || 0
    };

    const engine = new FaraidhEngineSyafii(inputData);
    const hasil = engine.kalkulasi();

    renderHasilUI(hasil);
}

/**
 * Render Hasil ke elemen DOM HTML
 */
function renderHasilUI(hasil) {
    const container = document.getElementById('hasilOutput');
    if (!container) return;

    let fmt = (val) => "Rp " + Math.round(val).toLocaleString('id-ID');

    let html = `
        <div class="summary-box" style="background:#f0fdf4; border:1px solid #bbf7d0; padding:15px; border-radius:8px; margin-bottom:20px;">
            <h3 style="margin-top:0; color:#166534;">Ringkasan Kalkulasi Harta</h3>
            <p><strong>Total Harta Kotor:</strong> ${fmt(hasil.hartaKotor)}</p>
            <p><strong>Dipotong Hutang & Biaya Jenazah:</strong> ${fmt(hasil.hutangBiaya)}</p>
            <p><strong>Dipotong Wasiat (Maks 1/3):</strong> ${fmt(hasil.wasiatDiterima)}</p>
            <hr style="border:0; border-top:1px solid #cbd5e1; margin:10px 0;">
            <p style="font-size:1.1em; color:#15803d;"><strong>Harta Bersih Siap Bagi:</strong> ${fmt(hasil.hartaBersih)}</p>
            <p><small>Status Kasus: <span>${hasil.statusKalkulasi}</span></small></p>
        </div>

        <h3>Tabel Pembagian Ahli Waris</h3>
        <table style="width:100%; border-collapse:collapse; margin-top:10px;">
            <thead>
                <tr style="background-color:#0d9488; color:white; text-align:left;">
                    <th style="padding:10px; border:1px solid #ddd;">Ahli Waris</th>
                    <th style="padding:10px; border:1px solid #ddd;">Status / Alasan / Porsi</th>
                    <th style="padding:10px; border:1px solid #ddd;">Nominal Diterima</th>
                </tr>
            </thead>
            <tbody>
    `;

    const namaAhliWarisMap = {
        suami: "Suami", istri: "Istri", anakLaki: "Anak Laki-laki", anakPerempuan: "Anak Perempuan",
        cucuLaki: "Cucu Laki-laki (dari Anak Laki)", cucuPerempuan: "Cucu Perempuan (dari Anak Laki)",
        ayah: "Ayah", ibu: "Ibu", kakek: "Kakek (Ayah dari Ayah)", nenekIbu: "Nenek (Pihak Ibu)",
        nenekAyah: "Nenek (Pihak Ayah)", saudaraKandungLaki: "Saudara Kandung Laki-laki",
        saudaraKandungPerempuan: "Saudara Kandung Perempuan", saudaraSeayahLaki: "Saudara Seayah Laki-laki",
        saudaraSeayahPerempuan: "Saudara Seayah Perempuan", saudaraSeibu: "Saudara Seibu (Laki/Perempuan)",
        pamanKandung: "Paman Kandung", pamanSeayah: "Paman Seayah",
        anakPamanKandung: "Anak Paman Kandung (Sepupu)", anakPamanSeayah: "Anak Paman Seayah (Sepupu)",
        baitulMaal: "Baitul Maal / Kas Negara"
    };

    // Loop semua item yang ada
    for (let key in namaAhliWarisMap) {
        let label = namaAhliWarisMap[key];
        let nominal = hasil.hasilNominal[key] || 0;
        let ket = hasil.keterangan[key] || "-";
        let isHijab = hasil.statusHijab[key] && hasil.statusHijab[key].terhalang;

        // Tampilkan jika penerima dapat uang ATAU jika terhalang (agar transparan)
        if (nominal > 0 || isHijab) {
            let rowBg = isHijab ? "#fef2f2" : "#ffffff";
            let statusText = isHijab ? `<span style="color:#dc2626; font-weight:bold;">Mahjub / Terhalang oleh ${hasil.statusHijab[key].oleh}</span>` : ket;

            html += `
                <tr style="background-color:${rowBg}; border-bottom:1px solid #e2e8f0;">
                    <td style="padding:10px; border:1px solid #ddd;"><strong>${label}</strong></td>
                    <td style="padding:10px; border:1px solid #ddd;">${statusText}</td>
                    <td style="padding:10px; border:1px solid #ddd; font-weight:bold; color:${nominal > 0 ? '#0f766e' : '#94a3b8'};">
                        ${fmt(nominal)}
                    </td>
                </tr>
            `;
        }
    }

    html += `
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}
