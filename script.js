/**
 * Engine Kalkulator Faraidh (Ilmu Waris Islam) - Mazhab Syafi'i (Versi 2.0 Complete)
 * File: script.js
 * 
 * Fitur & Aturan Logika:
 * 1. Pembersihan Harta (Harta Kotor - Hutang/Biaya Jenazah - Wasiat maks 1/3)
 * 2. Logika Hijab Hirman (Penghalang Ahli Waris menurut Mazhab Syafi'i)
 * 3. Al-Furudul Muqaddarah & Ashabah (Binafsihi, Bil Ghair, Ma'al Ghair)
 * 4. Penyelesaian 'Aul & Radd
 * 5. PENANGANAN KASUS KHUSUS SYAFI'I:
 *    - Mas'alah Gharrawain / Umariyatain (Pasangan + Ibu + Ayah)
 *    - Mas'alah Musytarakah / Himariyah (Suami + Ibu/Nenek + Saudara Seibu >= 2 + Saudara Kandung Laki)
 *    - Mas'alah Akdariyah (Suami + Ibu + Kakek + 1 Saudara Kandung Perempuan)
 */

class FaraidhEngineSyafii {
    constructor(inputData) {
        // 1. Pengolahan Harta
        this.hartaKotor = parseFloat(inputData.hartaKotor) || 0;
        this.hutangBiaya = parseFloat(inputData.hutangBiaya) || 0;
        this.wasiat = parseFloat(inputData.wasiat) || 0;

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
            cucuLaki: parseInt(inputData.cucuLaki) || 0,
            cucuPerempuan: parseInt(inputData.cucuPerempuan) || 0,
            ayah: inputData.ayah ? 1 : 0,
            ibu: inputData.ibu ? 1 : 0,
            kakek: inputData.kakek ? 1 : 0,
            nenekAyah: inputData.nenekAyah ? 1 : 0,
            nenekIbu: inputData.nenekIbu ? 1 : 0,
            saudaraKandungLaki: parseInt(inputData.saudaraKandungLaki) || 0,
            saudaraKandungPerempuan: parseInt(inputData.saudaraKandungPerempuan) || 0,
            saudaraSeayahLaki: parseInt(inputData.saudaraSeayahLaki) || 0,
            saudaraSeayahPerempuan: parseInt(inputData.saudaraSeayahPerempuan) || 0,
            saudaraSeibu: parseInt(inputData.saudaraSeibu) || 0,
            pamanKandung: parseInt(inputData.pamanKandung) || 0,
            pamanSeayah: parseInt(inputData.pamanSeayah) || 0,
            anakPamanKandung: parseInt(inputData.anakPamanKandung) || 0,
            anakPamanSeayah: parseInt(inputData.anakPamanSeayah) || 0
        };

        this.statusHijab = {};
        this.warisAktif = { ...this.rawWaris };
    }

    terapkanHijab() {
        const w = this.warisAktif;
        const h = this.statusHijab;

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

        if (adaAnakLaki) {
            h.cucuLaki = { terhalang: true, oleh: "Anak Laki-laki" };
            w.cucuLaki = 0;
            h.cucuPerempuan = { terhalang: true, oleh: "Anak Laki-laki" };
            w.cucuPerempuan = 0;
        } else if (w.anakPerempuan >= 2 && w.cucuLaki === 0) {
            h.cucuPerempuan = { terhalang: true, oleh: "2+ Anak Perempuan" };
            w.cucuPerempuan = 0;
        }

        if (adaAyah) {
            h.kakek = { terhalang: true, oleh: "Ayah" };
            w.kakek = 0;
        }

        if (adaIbu) {
            h.nenekIbu = { terhalang: true, oleh: "Ibu" };
            w.nenekIbu = 0;
            h.nenekAyah = { terhalang: true, oleh: "Ibu" };
            w.nenekAyah = 0;
        } else if (adaAyah) {
            h.nenekAyah = { terhalang: true, oleh: "Ayah" };
            w.nenekAyah = 0;
        }

        if (adaKeturunan || adaAyah || w.kakek > 0) {
            h.saudaraSeibu = { terhalang: true, oleh: "Keturunan atau Ayah/Kakek" };
            w.saudaraSeibu = 0;
        }

        // Catatan: Kasus Musytarakah & Akdariyah ditangani secara khusus sebelum hijab saudara menghalangi
        if (adaKeturunanLaki || adaAyah) {
            let penghalang = adaAyah ? "Ayah" : "Anak/Cucu Laki-laki";
            h.saudaraKandungLaki = { terhalang: true, oleh: penghalang };
            h.saudaraKandungPerempuan = { terhalang: true, oleh: penghalang };
            w.saudaraKandungLaki = 0;
            w.saudaraKandungPerempuan = 0;
        }

        const sKandungP_IsAshabahMaalGhair = (w.saudaraKandungPerempuan > 0) && (adaAnakP || w.cucuPerempuan > 0) && (!adaKeturunanLaki) && (!adaAyah);
        
        if (adaKeturunanLaki || adaAyah || w.saudaraKandungLaki > 0 || sKandungP_IsAshabahMaalGhair) {
            let penghalang = "Ayah / Anak-Cucu Laki / Saudara Kandung";
            h.saudaraSeayahLaki = { terhalang: true, oleh: penghalang };
            h.saudaraSeayahPerempuan = { terhalang: true, oleh: penghalang };
            w.saudaraSeayahLaki = 0;
            w.saudaraSeayahPerempuan = 0;
        } else if (w.saudaraKandungPerempuan >= 2 && w.saudaraSeayahLaki === 0) {
            h.saudaraSeayahPerempuan = { terhalang: true, oleh: "2+ Saudara Kandung Perempuan" };
            w.saudaraSeayahPerempuan = 0;
        }

        const sSeayahP_IsAshabahMaalGhair = (w.saudaraSeayahPerempuan > 0) && (adaAnakP || w.cucuPerempuan > 0) && (!adaKeturunanLaki) && (!adaAyah);
        const adaAshabahLakiLebihDekat = adaKeturunanLaki || adaAyah || w.kakek > 0 || w.saudaraKandungLaki > 0 || w.saudaraSeayahLaki > 0 || sKandungP_IsAshabahMaalGhair || sSeayahP_IsAshabahMaalGhair;

        if (adaAshabahLakiLebihDekat) {
            h.pamanKandung = { terhalang: true, oleh: "Garis Utama / Saudara Laki" };
            w.pamanKandung = 0;
        }

        if (adaAshabahLakiLebihDekat || w.pamanKandung > 0) {
            h.pamanSeayah = { terhalang: true, oleh: "Paman Kandung atau lebih dekat" };
            w.pamanSeayah = 0;
        }

        if (adaAshabahLakiLebihDekat || w.pamanKandung > 0 || w.pamanSeayah > 0) {
            h.anakPamanKandung = { terhalang: true, oleh: "Paman atau lebih dekat" };
            w.anakPamanKandung = 0;
        }

        if (adaAshabahLakiLebihDekat || w.pamanKandung > 0 || w.pamanSeayah > 0 || w.anakPamanKandung > 0) {
            h.anakPamanSeayah = { terhalang: true, oleh: "Sepupu Kandung atau lebih dekat" };
            w.anakPamanSeayah = 0;
        }
    }

    kalkulasi() {
        const raw = this.rawWaris;

        // ==========================================
        // CEK KASUS KHUSUS 1: GHARRAWAIN (UMARIYATAIN)
        // (Suami/Istri + Ibu + Ayah TANPA Keturunan/Saudara)
        // ==========================================
        const totalKeturunanRaw = raw.anakLaki + raw.anakPerempuan + raw.cucuLaki + raw.cucuPerempuan;
        const totalSaudaraRaw = raw.saudaraKandungLaki + raw.saudaraKandungPerempuan + raw.saudaraSeayahLaki + raw.saudaraSeayahPerempuan + raw.saudaraSeibu;
        
        if (totalKeturunanRaw === 0 && totalSaudaraRaw === 0 && raw.ibu === 1 && raw.ayah === 1 && (raw.suami === 1 || raw.istri > 0)) {
            this.terapkanHijab();
            let hasilNominal = {};
            let ket = {};

            if (raw.suami === 1) {
                let nominalSuami = 0.5 * this.hartaBersih;
                let sisa = this.hartaBersih - nominalSuami;
                let nominalIbu = sisa / 3; // 1/3 dari SISA (Gharrawain)
                let nominalAyah = sisa - nominalIbu; // Sisa akhir untuk Ayah

                hasilNominal.suami = nominalSuami;
                hasilNominal.ibu = nominalIbu;
                hasilNominal.ayah = nominalAyah;

                ket.suami = "1/2 (Porsi Fardh Suami)";
                ket.ibu = "1/3 dari SISA HARTA (Kasus Khusus Gharrawain/Umariyatain)";
                ket.ayah = "Ashabah Binafsihi (Menerima sisa harta)";
            } else {
                let nominalIstri = (0.25 * this.hartaBersih);
                let sisa = this.hartaBersih - nominalIstri;
                let nominalIbu = sisa / 3; // 1/3 dari SISA
                let nominalAyah = sisa - nominalIbu;

                hasilNominal.istri = nominalIstri;
                hasilNominal.ibu = nominalIbu;
                hasilNominal.ayah = nominalAyah;

                ket.istri = `1/4 (Dibagi ${raw.istri} Istri)`;
                ket.ibu = "1/3 dari SISA HARTA (Kasus Khusus Gharrawain/Umariyatain)";
                ket.ayah = "Ashabah Binafsihi (Menerima sisa harta)";
            }

            return {
                hartaKotor: this.hartaKotor, hutangBiaya: this.hutangBiaya, wasiatDiterima: this.wasiatDiterima,
                hartaBersih: this.hartaBersih, statusKalkulasi: "KASUS KHUSUS: GHARRAWAIN",
                rawInput: this.rawWaris, warisAktif: this.warisAktif, statusHijab: this.statusHijab,
                hasilNominal: hasilNominal, keterangan: ket
            };
        }

        // ==========================================
        // CEK KASUS KHUSUS 2: MUSYTARAKAH (HIMARIYAH)
        // (Suami + Ibu/Nenek + Saudara Seibu >= 2 + Saudara Kandung Laki >= 1)
        // ==========================================
        const adaIbuAtauNenek = (raw.ibu === 1 || raw.nenekIbu === 1 || raw.nenekAyah === 1);
        if (totalKeturunanRaw === 0 && raw.ayah === 0 && raw.kakek === 0 && raw.suami === 1 && adaIbuAtauNenek && raw.saudaraSeibu >= 2 && raw.saudaraKandungLaki >= 1) {
            this.terapkanHijab();
            let hasilNominal = {};
            let ket = {};

            let porsiSuami = 1/2;
            let porsiIbuNenek = 1/6;
            let porsiSeibu = 1/3; // Yang disyariatkan diserikatkan bersama Saudara Kandung

            hasilNominal.suami = porsiSuami * this.hartaBersih;
            ket.suami = "1/2 (Fardh Suami)";

            if (raw.ibu === 1) {
                hasilNominal.ibu = porsiIbuNenek * this.hartaBersih;
                ket.ibu = "1/6 (Fardh Ibu karena ada saudara >= 2)";
            } else {
                let totalNenek = raw.nenekIbu + raw.nenekAyah;
                hasilNominal.nenek = porsiIbuNenek * this.hartaBersih;
                ket.nenek = `1/6 (Dibagi untuk ${totalNenek} Nenek)`;
            }

            // Porsi 1/3 dibagi RATA secara gabungan untuk Saudara Seibu & Saudara Kandung
            let totalOrangSyarikat = raw.saudaraSeibu + raw.saudaraKandungLaki + raw.saudaraKandungPerempuan;
            let nominalSyarikat = porsiSeibu * this.hartaBersih;
            let perOrang = nominalSyarikat / totalOrangSyarikat;

            hasilNominal.saudaraSeibu = perOrang * raw.saudaraSeibu;
            ket.saudaraSeibu = `1/3 Gabungan Musytarakah (Dibagi rata untuk ${totalOrangSyarikat} saudara)`;

            hasilNominal.saudaraKandungLaki = perOrang * raw.saudaraKandungLaki;
            ket.saudaraKandungLaki = "Musytarakah (Diserikatkan membagi porsi 1/3 bersama Saudara Seibu)";

            if (raw.saudaraKandungPerempuan > 0) {
                hasilNominal.saudaraKandungPerempuan = perOrang * raw.saudaraKandungPerempuan;
                ket.saudaraKandungPerempuan = "Musytarakah (Diserikatkan membagi porsi 1/3)";
            }

            return {
                hartaKotor: this.hartaKotor, hutangBiaya: this.hutangBiaya, wasiatDiterima: this.wasiatDiterima,
                hartaBersih: this.hartaBersih, statusKalkulasi: "KASUS KHUSUS: MUSYTARAKAH (HIMARIYAH)",
                rawInput: this.rawWaris, warisAktif: this.warisAktif, statusHijab: this.statusHijab,
                hasilNominal: hasilNominal, keterangan: ket
            };
        }

        // ==========================================
        // CEK KASUS KHUSUS 3: AKDARIYAH
        // (Suami + Ibu + Kakek + 1 Saudara Kandung Perempuan)
        // ==========================================
        if (totalKeturunanRaw === 0 && raw.ayah === 0 && raw.suami === 1 && raw.ibu === 1 && raw.kakek === 1 && raw.saudaraKandungPerempuan === 1 && raw.saudaraKandungLaki === 0) {
            this.terapkanHijab();
            let hasilNominal = {};
            let ket = {};

            // Porsi Awal Fardh: Suami (3/6), Ibu (2/6), Kakek (1/6), Sdri P (3/6) -> Total 9/6 (Aul ke 27)
            // Hasil Akhir Akdariyah: Suami 9/27, Ibu 6/27, Kakek 8/27, Sdri P 4/27
            hasilNominal.suami = (9 / 27) * this.hartaBersih;
            hasilNominal.ibu = (6 / 27) * this.hartaBersih;
            hasilNominal.kakek = (8 / 27) * this.hartaBersih;
            hasilNominal.saudaraKandungPerempuan = (4 / 27) * this.hartaBersih;

            ket.suami = "9/27 (Kasus Akdariyah - Disesuaikan dari 1/2)";
            ket.ibu = "6/27 (Kasus Akdariyah - Disesuaikan dari 1/3)";
            ket.kakek = "8/27 (Kasus Akdariyah - Gabungan Fardh & Ashabah rasio 2:1 dengan Saudara)";
            ket.saudaraKandungPerempuan = "4/27 (Kasus Akdariyah - Gabungan Fardh & Ashabah rasio 1:2 dengan Kakek)";

            return {
                hartaKotor: this.hartaKotor, hutangBiaya: this.hutangBiaya, wasiatDiterima: this.wasiatDiterima,
                hartaBersih: this.hartaBersih, statusKalkulasi: "KASUS KHUSUS: AKDARIYAH",
                rawInput: this.rawWaris, warisAktif: this.warisAktif, statusHijab: this.statusHijab,
                hasilNominal: hasilNominal, keterangan: ket
            };
        }

        // ==========================================
        // KALKULASI WARIS STANDAR (JIKA BUKAN KASUS KHUSUS)
        // ==========================================
        this.terapkanHijab();
        const w = this.warisAktif;
        const p = {};
        const ket = {};

        const adaKeturunan = (w.anakLaki + w.anakPerempuan + w.cucuLaki + w.cucuPerempuan) > 0;
        const totalSaudara = w.saudaraKandungLaki + w.saudaraKandungPerempuan + w.saudaraSeayahLaki + w.saudaraSeayahPerempuan + w.saudaraSeibu;

        if (w.suami) {
            p.suami = adaKeturunan ? 1/4 : 1/2;
            ket.suami = adaKeturunan ? "1/4 (Ada keturunan)" : "1/2 (Tanpa keturunan)";
        }
        if (w.istri > 0) {
            p.istri = adaKeturunan ? 1/8 : 1/4;
            ket.istri = adaKeturunan ? `1/8 (Dibagi ${w.istri} istri)` : `1/4 (Dibagi ${w.istri} istri)`;
        }

        if (w.ibu) {
            p.ibu = (adaKeturunan || totalSaudara >= 2) ? 1/6 : 1/3;
            ket.ibu = (adaKeturunan || totalSaudara >= 2) ? "1/6 (Ada keturunan/2+ saudara)" : "1/3 (Tanpa keturunan & saudara < 2)";
        }

        let totalNenek = w.nenekIbu + w.nenekAyah;
        if (totalNenek > 0) {
            p.nenek = 1/6;
            ket.nenek = `1/6 (Dibagi rata untuk ${totalNenek} nenek)`;
        }

        if (w.ayah) {
            if (w.anakLaki > 0 || w.cucuLaki > 0) {
                p.ayah = 1/6;
                ket.ayah = "1/6 (Fardh murni karena ada keturunan laki-laki)";
            } else if (w.anakPerempuan > 0 || w.cucuPerempuan > 0) {
                p.ayah = 1/6;
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

        if (w.saudaraSeibu > 0) {
            if (w.saudaraSeibu === 1) {
                p.saudaraSeibu = 1/6;
                ket.saudaraSeibu = "1/6 (1 orang saudara seibu)";
            } else {
                p.saudaraSeibu = 1/3;
                ket.saudaraSeibu = `1/3 (Dibagi rata untuk ${w.saudaraSeibu} saudara seibu)`;
            }
        }

        if (w.anakLaki === 0) {
            if (w.anakPerempuan === 1) {
                p.anakPerempuan = 1/2;
                ket.anakPerempuan = "1/2 (Tunggal tanpa anak laki-laki)";
            } else if (w.anakPerempuan > 1) {
                p.anakPerempuan = 2/3;
                ket.anakPerempuan = `2/3 (Dibagi rata ${w.anakPerempuan} anak perempuan)`;
            }
        } else {
            ket.anakLaki = "Ashabah Binafsihi";
            ket.anakPerempuan = "Ashabah bil Ghair (Rasio 1 bersama Anak Laki-laki)";
        }

        if (w.cucuLaki === 0 && w.cucuPerempuan > 0) {
            if (w.anakPerempuan === 0) {
                p.cucuPerempuan = (w.cucuPerempuan === 1) ? 1/2 : 2/3;
                ket.cucuPerempuan = (w.cucuPerempuan === 1) ? "1/2" : `2/3 (Dibagi ${w.cucuPerempuan} cucu)`;
            } else if (w.anakPerempuan === 1) {
                p.cucuPerempuan = 1/6;
                ket.cucuPerempuan = "1/6 (Pelengkap 2/3 bersama 1 anak perempuan)";
            }
        } else if (w.cucuLaki > 0) {
            ket.cucuLaki = "Ashabah Binafsihi";
            if (w.cucuPerempuan > 0) ket.cucuPerempuan = "Ashabah bil Ghair";
        }

        const tidakAdaAshabahLaki = (w.anakLaki === 0 && w.cucuLaki === 0 && !w.ayah && !w.kakek);
        if (tidakAdaAshabahLaki) {
            if (w.saudaraKandungLaki === 0 && w.saudaraKandungPerempuan > 0) {
                if (w.anakPerempuan > 0 || w.cucuPerempuan > 0) {
                    ket.saudaraKandungPerempuan = "Ashabah Ma'al Ghair (Sisa harta bersama keturunan perempuan)";
                } else {
                    p.saudaraKandungPerempuan = (w.saudaraKandungPerempuan === 1) ? 1/2 : 2/3;
                    ket.saudaraKandungPerempuan = (w.saudaraKandungPerempuan === 1) ? "1/2" : `2/3 (Dibagi ${w.saudaraKandungPerempuan} orang)`;
                }
            } else if (w.saudaraKandungLaki > 0) {
                ket.saudaraKandungLaki = "Ashabah Binafsihi";
                if (w.saudaraKandungPerempuan > 0) ket.saudaraKandungPerempuan = "Ashabah bil Ghair";
            }

            if (w.saudaraSeayahLaki === 0 && w.saudaraSeayahPerempuan > 0) {
                if (w.anakPerempuan > 0 || w.cucuPerempuan > 0) {
                    ket.saudaraSeayahPerempuan = "Ashabah Ma'al Ghair";
                } else if (w.saudaraKandungPerempuan === 0) {
                    p.saudaraSeayahPerempuan = (w.saudaraSeayahPerempuan === 1) ? 1/2 : 2/3;
                    ket.saudaraSeayahPerempuan = (w.saudaraSeayahPerempuan === 1) ? "1/2" : "2/3";
                } else if (w.saudaraKandungPerempuan === 1) {
                    p.saudaraSeayahPerempuan = 1/6;
                    ket.saudaraSeayahPerempuan = "1/6 (Pelengkap 2/3)";
                }
            } else if (w.saudaraSeayahLaki > 0) {
                ket.saudaraSeayahLaki = "Ashabah Binafsihi";
                if (w.saudaraSeayahPerempuan > 0) ket.saudaraSeayahPerempuan = "Ashabah bil Ghair";
            }
        }

        let totalFardh = 0;
        for (let key in p) totalFardh += p[key];

        let hasilNominal = {};
        let statusKalkulasi = "PEMBAGIAN NORMAL";

        if (totalFardh > 1.0000001) {
            statusKalkulasi = "TERJADI 'AUL (Porsi disesuaikan)";
            for (let key in p) {
                let porsiAul = p[key] / totalFardh;
                hasilNominal[key] = porsiAul * this.hartaBersih;
                ket[key] += ` ['Aul: Disesuaikan dari ${(p[key]*100).toFixed(1)}% menjadi ${(porsiAul*100).toFixed(1)}%]`;
            }
        } else {
            let sisaHarta = this.hartaBersih * (1 - totalFardh);
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

            for (let key in p) {
                hasilNominal[key] = p[key] * this.hartaBersih;
            }

            if (penerimaAshabah && sisaHarta > 0) {
                switch (penerimaAshabah) {
                    case "ANAK_LAKI": {
                        let poin = (w.anakLaki * 2) + w.anakPerempuan;
                        let perPoin = sisaHarta / poin;
                        hasilNominal.anakLaki = (hasilNominal.anakLaki || 0) + (perPoin * 2 * w.anakLaki);
                        if (w.anakPerempuan > 0) hasilNominal.anakPerempuan = (hasilNominal.anakPerempuan || 0) + (perPoin * w.anakPerempuan);
                        break;
                    }
                    case "CUCU_LAKI": {
                        let poin = (w.cucuLaki * 2) + w.cucuPerempuan;
                        let perPoin = sisaHarta / poin;
                        hasilNominal.cucuLaki = (hasilNominal.cucuLaki || 0) + (perPoin * 2 * w.cucuLaki);
                        if (w.cucuPerempuan > 0) hasilNominal.cucuPerempuan = (hasilNominal.cucuPerempuan || 0) + (perPoin * w.cucuPerempuan);
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
                        if (w.saudaraKandungPerempuan > 0) hasilNominal.saudaraKandungPerempuan = perPoin * w.saudaraKandungPerempuan;
                        break;
                    }
                    case "SAUDARA_KANDUNG_P_MAAL_GHAIR":
                        hasilNominal.saudaraKandungPerempuan = (hasilNominal.saudaraKandungPerempuan || 0) + sisaHarta;
                        break;
                    case "SAUDARA_SEAYAH_LAKI": {
                        let poin = (w.saudaraSeayahLaki * 2) + w.saudaraSeayahPerempuan;
                        let perPoin = sisaHarta / poin;
                        hasilNominal.saudaraSeayahLaki = perPoin * 2 * w.saudaraSeayahLaki;
                        if (w.saudaraSeayahPerempuan > 0) hasilNominal.saudaraSeayahPerempuan = perPoin * w.saudaraSeayahPerempuan;
                        break;
                    }
                    case "SAUDARA_SEAYAH_P_MAAL_GHAIR":
                        hasilNominal.saudaraSeayahPerempuan = (hasilNominal.saudaraSeayahPerempuan || 0) + sisaHarta;
                        break;
                    case "PAMAN_KANDUNG": hasilNominal.pamanKandung = sisaHarta; break;
                    case "PAMAN_SEAYAH": hasilNominal.pamanSeayah = sisaHarta; break;
                    case "SEPUPU_KANDUNG": hasilNominal.anakPamanKandung = sisaHarta; break;
                    case "SEPUPU_SEAYAH": hasilNominal.anakPamanSeayah = sisaHarta; break;
                }
            } else if (!penerimaAshabah && sisaHarta > 0.01) {
                statusKalkulasi = "TERJADI RADD (Pengembalian Sisa Harta)";
                let totalFardhNonPasangan = 0;
                for (let key in p) {
                    if (key !== "suami" && key !== "istri") totalFardhNonPasangan += p[key];
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
                    hasilNominal.baitulMaal = sisaHarta;
                    ket.baitulMaal = "Diserahkan ke Baitul Maal (Sisa harta karena Suami/Istri tidak menerima Radd)";
                }
            }
        }

        return {
            hartaKotor: this.hartaKotor, hutangBiaya: this.hutangBiaya, wasiatDiterima: this.wasiatDiterima,
            hartaBersih: this.hartaBersih, statusKalkulasi: statusKalkulasi,
            rawInput: this.rawWaris, warisAktif: this.warisAktif, statusHijab: this.statusHijab,
            hasilNominal: hasilNominal, keterangan: ket
        };
    }
}

// CONTROLLER & INTEGRASI DOM HTML
function prosesHitungWaris() {
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

function renderHasilUI(hasil) {
    const container = document.getElementById('hasilOutput');
    if (!container) return;

    let fmt = (val) => "Rp " + Math.round(val).toLocaleString('id-ID');

    let html = `
        <div style="background:#fcf8f2; border:1px solid #e8dcc4; padding:18px; border-radius:10px; margin-bottom:20px;">
            <h3 style="margin-top:0; color:#9a7b38;">Ringkasan Kalkulasi Harta</h3>
            <p><strong>Total Harta Kotor:</strong> ${fmt(hasil.hartaKotor)}</p>
            <p><strong>Dipotong Hutang & Biaya Jenazah:</strong> ${fmt(hasil.hutangBiaya)}</p>
            <p><strong>Dipotong Wasiat (Maks 1/3):</strong> ${fmt(hasil.wasiatDiterima)}</p>
            <hr style="border:0; border-top:1px solid #e2d5bc; margin:12px 0;">
            <p style="font-size:1.15em; color:#7a6027;"><strong>Harta Bersih Siap Bagi:</strong> ${fmt(hasil.hartaBersih)}</p>
            <p><small>Status Kasus: <strong style="color:#b08d43;">${hasil.statusKalkulasi}</strong></small></p>
        </div>

        <h3 style="color:#2c2416; margin-bottom:12px;">Tabel Pembagian Ahli Waris</h3>
        <table style="width:100%; border-collapse:collapse; margin-top:10px;">
            <thead>
                <tr style="background-color:#9a7b38; color:white; text-align:left;">
                    <th style="padding:12px; border:1px solid #e8e2d5;">Ahli Waris</th>
                    <th style="padding:12px; border:1px solid #e8e2d5;">Status / Alasan / Porsi</th>
                    <th style="padding:12px; border:1px solid #e8e2d5;">Nominal Diterima</th>
                </tr>
            </thead>
            <tbody>
    `;

    const namaAhliWarisMap = {
        suami: "Suami", istri: "Istri", anakLaki: "Anak Laki-laki", anakPerempuan: "Anak Perempuan",
        cucuLaki: "Cucu Laki-laki (dari Anak Laki)", cucuPerempuan: "Cucu Perempuan (dari Anak Laki)",
        ayah: "Ayah", ibu: "Ibu", kakek: "Kakek (Ayah dari Ayah)", nenekIbu: "Nenek (Pihak Ibu)",
        nenekAyah: "Nenek (Pihak Ayah)", nenek: "Nenek (Gabungan)", saudaraKandungLaki: "Saudara Kandung Laki-laki",
        saudaraKandungPerempuan: "Saudara Kandung Perempuan", saudaraSeayahLaki: "Saudara Seayah Laki-laki",
        saudaraSeayahPerempuan: "Saudara Seayah Perempuan", saudaraSeibu: "Saudara Seibu",
        pamanKandung: "Paman Kandung", pamanSeayah: "Paman Seayah",
        anakPamanKandung: "Anak Paman Kandung (Sepupu)", anakPamanSeayah: "Anak Paman Seayah (Sepupu)",
        baitulMaal: "Baitul Maal / Kas Negara"
    };

    for (let key in namaAhliWarisMap) {
        let label = namaAhliWarisMap[key];
        let nominal = hasil.hasilNominal[key] || 0;
        let ket = hasil.keterangan[key] || "-";
        let isHijab = hasil.statusHijab[key] && hasil.statusHijab[key].terhalang;

        if (nominal > 0 || isHijab) {
            let rowBg = isHijab ? "#fff5f5" : "#ffffff";
            let statusText = isHijab ? `<span style="color:#dc2626; font-weight:bold;">Mahjub / Terhalang oleh ${hasil.statusHijab[key].oleh}</span>` : ket;

            html += `
                <tr style="background-color:${rowBg}; border-bottom:1px solid #e8e2d5;">
                    <td style="padding:10px; border:1px solid #e8e2d5;"><strong>${label}</strong></td>
                    <td style="padding:10px; border:1px solid #e8e2d5;">${statusText}</td>
                    <td style="padding:10px; border:1px solid #e8e2d5; font-weight:bold; color:${nominal > 0 ? '#7a6027' : '#94a3b8'};">
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
