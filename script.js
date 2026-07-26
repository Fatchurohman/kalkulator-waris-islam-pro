/**
 * Engine Kalkulator Faraidh (Ilmu Waris Islam) - Mazhab Syafi'i (Versi 2.5 Perfect 'Aul Detection)
 * File: script.js
 */

class FaraidhEngineSyafii {
    constructor(inputData) {
        this.hartaKotor = parseFloat(inputData.hartaKotor) || 0;
        this.hutangBiaya = parseFloat(inputData.hutangBiaya) || 0;
        this.wasiat = parseFloat(inputData.wasiat) || 0;

        let hartaSisaHutang = Math.max(0, this.hartaKotor - this.hutangBiaya);
        let batasWasiat = hartaSisaHutang / 3;
        this.wasiatDiterima = Math.min(this.wasiat, batasWasiat);
        this.hartaBersih = Math.max(0, hartaSisaHutang - this.wasiatDiterima);

        let jmlSuami = inputData.suami ? 1 : 0;
        let jmlIstri = inputData.suami ? 0 : (parseInt(inputData.istri) || 0);

        this.rawWaris = {
            suami: jmlSuami,
            istri: jmlIstri,
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
            h.saudaraSeibu = { terhalang: true, oleh: "Keturunan / Ayah / Kakek" };
            w.saudaraSeibu = 0;
        }

        if (adaKeturunanLaki || adaAyah) {
            let penghalang = adaAyah ? "Ayah" : "Anak/Cucu Laki-laki";
            h.saudaraKandungLaki = { terhalang: true, oleh: penghalang };
            h.saudaraKandungPerempuan = { terhalang: true, oleh: penghalang };
            w.saudaraKandungLaki = 0;
            w.saudaraKandungPerempuan = 0;
        }

        const sKandungP_IsAshabahMaalGhair = (w.saudaraKandungPerempuan > 0) && (adaAnakP || w.cucuPerempuan > 0) && (!adaKeturunanLaki) && (!adaAyah);

        if (adaKeturunanLaki || adaAyah || w.saudaraKandungLaki > 0 || sKandungP_IsAshabahMaalGhair) {
            let penghalang = "Ayah / Keturunan Laki / Saudara Kandung";
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
            h.pamanSeayah = { terhalang: true, oleh: "Paman Kandung" };
            w.pamanSeayah = 0;
        }

        if (adaAshabahLakiLebihDekat || w.pamanKandung > 0 || w.pamanSeayah > 0) {
            h.anakPamanKandung = { terhalang: true, oleh: "Paman" };
            w.anakPamanKandung = 0;
        }

        if (adaAshabahLakiLebihDekat || w.pamanKandung > 0 || w.pamanSeayah > 0 || w.anakPamanKandung > 0) {
            h.anakPamanSeayah = { terhalang: true, oleh: "Sepupu Kandung" };
            w.anakPamanSeayah = 0;
        }
    }

    kalkulasi() {
        const raw = this.rawWaris;

        // KASUS GHARRAWAIN
        const totalKeturunanRaw = raw.anakLaki + raw.anakPerempuan + raw.cucuLaki + raw.cucuPerempuan;
        const totalSaudaraRaw = raw.saudaraKandungLaki + raw.saudaraKandungPerempuan + raw.saudaraSeayahLaki + raw.saudaraSeayahPerempuan + raw.saudaraSeibu;

        if (totalKeturunanRaw === 0 && totalSaudaraRaw === 0 && raw.ibu === 1 && raw.ayah === 1 && (raw.suami === 1 || raw.istri > 0)) {
            this.terapkanHijab();
            let hasilNominal = {};
            let ket = {};

            if (raw.suami === 1) {
                let nominalSuami = 0.5 * this.hartaBersih;
                let sisa = this.hartaBersih - nominalSuami;
                let nominalIbu = sisa / 3;
                let nominalAyah = sisa - nominalIbu;

                hasilNominal.suami = nominalSuami;
                hasilNominal.ibu = nominalIbu;
                hasilNominal.ayah = nominalAyah;

                ket.suami = "1/2 (Fardh Suami)";
                ket.ibu = "1/3 dari SISA HARTA (Kasus Khusus Gharrawain)";
                ket.ayah = "Ashabah bi Nafsihi (Sisa harta)";
            } else {
                let nominalIstri = 0.25 * this.hartaBersih;
                let sisa = this.hartaBersih - nominalIstri;
                let nominalIbu = sisa / 3;
                let nominalAyah = sisa - nominalIbu;

                hasilNominal.istri = nominalIstri;
                hasilNominal.ibu = nominalIbu;
                hasilNominal.ayah = nominalAyah;

                ket.istri = `1/4 (Dibagi ${raw.istri} Istri)`;
                ket.ibu = "1/3 dari SISA HARTA (Kasus Khusus Gharrawain)";
                ket.ayah = "Ashabah bi Nafsihi (Sisa harta)";
            }

            return {
                hartaKotor: this.hartaKotor, hutangBiaya: this.hutangBiaya, wasiatDiterima: this.wasiatDiterima,
                hartaBersih: this.hartaBersih, statusKalkulasi: "KASUS KHUSUS: GHARRAWAIN",
                rawInput: this.rawWaris, warisAktif: this.warisAktif, statusHijab: this.statusHijab,
                hasilNominal: hasilNominal, keterangan: ket
            };
        }

        // KASUS NORMAL / 'AUL / RADD
        this.terapkanHijab();
        const w = this.warisAktif;
        const p = {};
        const ket = {};

        const adaKeturunan = (w.anakLaki + w.anakPerempuan + w.cucuLaki + w.cucuPerempuan) > 0;
        const totalSaudara = w.saudaraKandungLaki + w.saudaraKandungPerempuan + w.saudaraSeayahLaki + w.saudaraSeayahPerempuan + w.saudaraSeibu;

        // 1. Suami / Istri
        if (w.suami) {
            p.suami = adaKeturunan ? 1/4 : 1/2;
            ket.suami = adaKeturunan ? "1/4 (Fardh - Ada keturunan)" : "1/2 (Fardh - Tanpa keturunan)";
        } else if (w.istri > 0) {
            p.istri = adaKeturunan ? 1/8 : 1/4;
            ket.istri = adaKeturunan ? `1/8 (Fardh - Dibagi ${w.istri} istri)` : `1/4 (Fardh - Dibagi ${w.istri} istri)`;
        }

        // 2. Ibu / Nenek
        if (w.ibu) {
            p.ibu = (adaKeturunan || totalSaudara >= 2) ? 1/6 : 1/3;
            ket.ibu = (adaKeturunan || totalSaudara >= 2) ? "1/6 (Fardh - Ada keturunan/2+ saudara)" : "1/3 (Fardh - Tanpa keturunan & saudara < 2)";
        }

        let totalNenek = w.nenekIbu + w.nenekAyah;
        if (totalNenek > 0 && w.ibu === 0) {
            p.nenek = 1/6;
            ket.nenek = `1/6 (Fardh - Dibagi ${totalNenek} nenek)`;
        }

        // 3. Ayah / Kakek
        if (w.ayah) {
            if (w.anakLaki > 0 || w.cucuLaki > 0) {
                p.ayah = 1/6;
                ket.ayah = "1/6 (Fardh murni)";
            } else if (w.anakPerempuan > 0 || w.cucuPerempuan > 0) {
                p.ayah = 1/6;
                ket.ayah = "1/6 + Ashabah";
            } else {
                ket.ayah = "Ashabah bi Nafsihi";
            }
        }

        if (w.kakek && w.ayah === 0) {
            if (w.anakLaki > 0 || w.cucuLaki > 0) {
                p.kakek = 1/6;
                ket.kakek = "1/6 (Fardh murni)";
            } else if (w.anakPerempuan > 0 || w.cucuPerempuan > 0) {
                p.kakek = 1/6;
                ket.kakek = "1/6 + Ashabah";
            } else {
                ket.kakek = "Ashabah bi Nafsihi";
            }
        }

        // 4. Saudara Seibu
        if (w.saudaraSeibu > 0) {
            if (w.saudaraSeibu === 1) {
                p.saudaraSeibu = 1/6;
                ket.saudaraSeibu = "1/6 (Fardh - 1 orang)";
            } else {
                p.saudaraSeibu = 1/3;
                ket.saudaraSeibu = `1/3 (Fardh - Dibagi ${w.saudaraSeibu} orang)`;
            }
        }

        // 5. Anak Perempuan
        if (w.anakLaki === 0 && w.anakPerempuan > 0) {
            if (w.anakPerempuan === 1) {
                p.anakPerempuan = 1/2;
                ket.anakPerempuan = "1/2 (Fardh - Tunggal)";
            } else {
                p.anakPerempuan = 2/3;
                ket.anakPerempuan = `2/3 (Fardh - Dibagi ${w.anakPerempuan} anak perempuan)`;
            }
        } else if (w.anakLaki > 0) {
            ket.anakLaki = "Ashabah bi Nafsihi (Menerima sisa harta dengan rasio 2:1)";
            if (w.anakPerempuan > 0) {
                ket.anakPerempuan = "Ashabah bil Ghair (Ditarik oleh Anak Laki-Laki, rasio 1:2)";
            }
        }

        // 6. Cucu Perempuan
        if (w.anakLaki === 0 && w.cucuLaki === 0 && w.cucuPerempuan > 0) {
            if (w.anakPerempuan === 0) {
                p.cucuPerempuan = (w.cucuPerempuan === 1) ? 1/2 : 2/3;
                ket.cucuPerempuan = (w.cucuPerempuan === 1) ? "1/2 (Fardh)" : `2/3 (Fardh - Dibagi ${w.cucuPerempuan} cucu)`;
            } else if (w.anakPerempuan === 1) {
                p.cucuPerempuan = 1/6;
                ket.cucuPerempuan = "1/6 (Fardh - Pelengkap 2/3)";
            }
        } else if (w.cucuLaki > 0 && w.anakLaki === 0) {
            ket.cucuLaki = "Ashabah bi Nafsihi";
            if (w.cucuPerempuan > 0) ket.cucuPerempuan = "Ashabah bil Ghair";
        }

        // 7. Saudara Kandung Perempuan
        if (w.anakLaki === 0 && w.cucuLaki === 0 && w.ayah === 0 && w.kakek === 0) {
            if (w.saudaraKandungLaki === 0 && w.saudaraKandungPerempuan > 0) {
                if (w.anakPerempuan > 0 || w.cucuPerempuan > 0) {
                    ket.saudaraKandungPerempuan = "Ashabah ma'al Ghair (Sisa harta bersama keturunan perempuan)";
                } else {
                    p.saudaraKandungPerempuan = (w.saudaraKandungPerempuan === 1) ? 1/2 : 2/3;
                    ket.saudaraKandungPerempuan = (w.saudaraKandungPerempuan === 1) ? "1/2 (Fardh)" : `2/3 (Fardh - Dibagi ${w.saudaraKandungPerempuan} orang)`;
                }
            } else if (w.saudaraKandungLaki > 0) {
                ket.saudaraKandungLaki = "Ashabah bi Nafsihi";
                if (w.saudaraKandungPerempuan > 0) ket.saudaraKandungPerempuan = "Ashabah bil Ghair";
            }

            // 8. Saudara Seayah Perempuan
            if (w.saudaraKandungLaki === 0 && w.saudaraSeayahLaki === 0 && w.saudaraSeayahPerempuan > 0) {
                if (w.anakPerempuan > 0 || w.cucuPerempuan > 0) {
                    ket.saudaraSeayahPerempuan = "Ashabah ma'al Ghair";
                } else if (w.saudaraKandungPerempuan === 0) {
                    p.saudaraSeayahPerempuan = (w.saudaraSeayahPerempuan === 1) ? 1/2 : 2/3;
                    ket.saudaraSeayahPerempuan = (w.saudaraSeayahPerempuan === 1) ? "1/2 (Fardh)" : `2/3 (Fardh - Dibagi ${w.saudaraSeayahPerempuan} orang)`;
                } else if (w.saudaraKandungPerempuan === 1) {
                    p.saudaraSeayahPerempuan = 1/6;
                    ket.saudaraSeayahPerempuan = "1/6 (Fardh - Pelengkap 2/3)";
                }
            } else if (w.saudaraSeayahLaki > 0 && w.saudaraKandungLaki === 0) {
                ket.saudaraSeayahLaki = "Ashabah bi Nafsihi";
                if (w.saudaraSeayahPerempuan > 0) ket.saudaraSeayahPerempuan = "Ashabah bil Ghair";
            }
        }

        // HITUNG TOTAL PORSI FARDH
        let totalFardh = 0;
        for (let key in p) {
            totalFardh += p[key];
        }

        let hasilNominal = {};
        let statusKalkulasi = "PEMBAGIAN NORMAL";

        // PENANGANAN 'AUL (JIKA TOTAL PORSI FARDH > 1)
        if (totalFardh > 1.000001) {
            statusKalkulasi = "TERJADI 'AUL (Total porsi melebihi 1, disesuaikan secara proporsional)";
            for (let key in p) {
                let porsiAul = p[key] / totalFardh;
                hasilNominal[key] = porsiAul * this.hartaBersih;
                ket[key] += ` ['Aul: Porsi disesuaikan dari ${(p[key]*100).toFixed(1)}% menjadi ${(porsiAul*100).toFixed(1)}%]`;
            }
        } else {
            let sisaHarta = Math.max(0, this.hartaBersih * (1 - totalFardh));

            for (let key in p) {
                hasilNominal[key] = p[key] * this.hartaBersih;
            }

            if (sisaHarta > 0.01) {
                let adaAshabah = false;

                if (w.anakLaki > 0) {
                    let totalPoin = (w.anakLaki * 2) + (w.anakPerempuan * 1);
                    let nilaiPoin = sisaHarta / totalPoin;
                    hasilNominal.anakLaki = (hasilNominal.anakLaki || 0) + (nilaiPoin * 2 * w.anakLaki);
                    if (w.anakPerempuan > 0) hasilNominal.anakPerempuan = (hasilNominal.anakPerempuan || 0) + (nilaiPoin * 1 * w.anakPerempuan);
                    adaAshabah = true;
                } else if (w.cucuLaki > 0) {
                    let totalPoin = (w.cucuLaki * 2) + (w.cucuPerempuan * 1);
                    let nilaiPoin = sisaHarta / totalPoin;
                    hasilNominal.cucuLaki = (hasilNominal.cucuLaki || 0) + (nilaiPoin * 2 * w.cucuLaki);
                    if (w.cucuPerempuan > 0) hasilNominal.cucuPerempuan = (hasilNominal.cucuPerempuan || 0) + (nilaiPoin * 1 * w.cucuPerempuan);
                    adaAshabah = true;
                } else if (w.ayah) {
                    hasilNominal.ayah = (hasilNominal.ayah || 0) + sisaHarta;
                    adaAshabah = true;
                } else if (w.kakek) {
                    hasilNominal.kakek = (hasilNominal.kakek || 0) + sisaHarta;
                    adaAshabah = true;
                } else if (w.saudaraKandungLaki > 0) {
                    let totalPoin = (w.saudaraKandungLaki * 2) + (w.saudaraKandungPerempuan * 1);
                    let nilaiPoin = sisaHarta / totalPoin;
                    hasilNominal.saudaraKandungLaki = nilaiPoin * 2 * w.saudaraKandungLaki;
                    if (w.saudaraKandungPerempuan > 0) hasilNominal.saudaraKandungPerempuan = nilaiPoin * 1 * w.saudaraKandungPerempuan;
                    adaAshabah = true;
                } else if (w.saudaraKandungPerempuan > 0 && (w.anakPerempuan > 0 || w.cucuPerempuan > 0)) {
                    hasilNominal.saudaraKandungPerempuan = (hasilNominal.saudaraKandungPerempuan || 0) + sisaHarta;
                    adaAshabah = true;
                } else if (w.pamanKandung > 0) {
                    hasilNominal.pamanKandung = sisaHarta;
                    adaAshabah = true;
                } else if (w.pamanSeayah > 0) {
                    hasilNominal.pamanSeayah = sisaHarta;
                    adaAshabah = true;
                } else if (w.anakPamanKandung > 0) {
                    hasilNominal.anakPamanKandung = sisaHarta;
                    adaAshabah = true;
                } else if (w.anakPamanSeayah > 0) {
                    hasilNominal.anakPamanSeayah = sisaHarta;
                    adaAshabah = true;
                }

                if (!adaAshabah && sisaHarta > 0.01) {
                    statusKalkulasi = "TERJADI RADD (Sisa harta dikembalikan secara proporsional)";
                    let totalFardhNonPasangan = 0;
                    for (let key in p) {
                        if (key !== "suami" && key !== "istri") totalFardhNonPasangan += p[key];
                    }

                    if (totalFardhNonPasangan > 0) {
                        for (let key in p) {
                            if (key !== "suami" && key !== "istri") {
                                let porsiRadd = (p[key] / totalFardhNonPasangan) * sisaHarta;
                                hasilNominal[key] += porsiRadd;
                                ket[key] += " + [Dapat Pengembalian Radd]";
                            }
                        }
                    } else {
                        hasilNominal.baitulMaal = sisaHarta;
                        ket.baitulMaal = "Baitul Maal (Sisa harta tidak dikembalikan ke Suami/Istri)";
                    }
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

function prosesHitungWaris() {
    const parseRupiah = (id) => {
        let val = document.getElementById(id)?.value || "0";
        let angkaBersih = val.toString().replace(/\./g, '');
        return parseFloat(angkaBersih) || 0;
    };

    const inputData = {
        hartaKotor: parseRupiah('hartaKotor'),
        hutangBiaya: parseRupiah('hutangBiaya'),
        wasiat: parseRupiah('wasiat'),
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

    let fmt = (val) => {
        let nominalUtuh = Math.round(val || 0);
        return "Rp " + nominalUtuh.toLocaleString('id-ID');
    };

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
        let nominalUtuh = hasil.hasilNominal[key] || 0;
        let ket = hasil.keterangan[key] || "-";
        let isHijab = hasil.statusHijab[key] && hasil.statusHijab[key].terhalang;

        if (nominalUtuh > 0 || isHijab) {
            let rowBg = isHijab ? "#fff5f5" : "#ffffff";
            let statusText = isHijab ? `<span style="color:#dc2626; font-weight:bold;">Mahjub / Terhalang oleh ${hasil.statusHijab[key].oleh}</span>` : ket;

            html += `
                <tr style="background-color:${rowBg}; border-bottom:1px solid #e8e2d5;">
                    <td style="padding:10px; border:1px solid #e8e2d5;"><strong>${label}</strong></td>
                    <td style="padding:10px; border:1px solid #e8e2d5;">${statusText}</td>
                    <td style="padding:10px; border:1px solid #e8e2d5; font-weight:bold; color:${nominalUtuh > 0 ? '#7a6027' : '#94a3b8'};">
                        ${fmt(nominalUtuh)}
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
