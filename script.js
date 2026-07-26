/**
 * Engine Kalkulator Faraidh (Ilmu Waris Islam) - Mazhab Syafi'i (Versi 2.2 Fixed Ashabah Ratio 2:1)
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

        // Validasi: Tidak boleh ada Suami dan Istri bersamaan
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
            h.saudaraSeibu = { terhalang: true, oleh: "Keturunan atau Ayah/Kakek" };
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
        this.terapkanHijab();
        const w = this.warisAktif;
        const p = {};
        const ket = {};

        const adaKeturunan = (w.anakLaki + w.anakPerempuan + w.cucuLaki + w.cucuPerempuan) > 0;
        const totalSaudara = w.saudaraKandungLaki + w.saudaraKandungPerempuan + w.saudaraSeayahLaki + w.saudaraSeayahPerempuan + w.saudaraSeibu;

        // Fardh Pasangan
        if (w.suami) {
            p.suami = adaKeturunan ? 1/4 : 1/2;
            ket.suami = adaKeturunan ? "1/4 (Fardh - Ada keturunan)" : "1/2 (Fardh - Tanpa keturunan)";
        } else if (w.istri > 0) {
            p.istri = adaKeturunan ? 1/8 : 1/4;
            ket.istri = adaKeturunan ? `1/8 (Fardh - Dibagi ${w.istri} istri)` : `1/4 (Fardh - Dibagi ${w.istri} istri)`;
        }

        // Fardh Ibu & Nenek
        if (w.ibu) {
            p.ibu = (adaKeturunan || totalSaudara >= 2) ? 1/6 : 1/3;
            ket.ibu = (adaKeturunan || totalSaudara >= 2) ? "1/6 (Fardh - Ada keturunan/2+ saudara)" : "1/3 (Fardh - Tanpa keturunan)";
        }

        let totalNenek = w.nenekIbu + w.nenekAyah;
        if (totalNenek > 0) {
            p.nenek = 1/6;
            ket.nenek = `1/6 (Fardh - Dibagi ${totalNenek} nenek)`;
        }

        // Fardh Ayah & Kakek
        if (w.ayah) {
            if (w.anakLaki > 0 || w.cucuLaki > 0) {
                p.ayah = 1/6;
                ket.ayah = "1/6 (Fardh murni)";
            } else if (w.anakPerempuan > 0 || w.cucuPerempuan > 0) {
                p.ayah = 1/6;
                ket.ayah = "1/6 + Ashabah";
            } else {
                ket.ayah = "Ashabah Binafsihi";
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

        // Fardh Anak Perempuan & Cucu Perempuan (Jika Tidak Ada Anak Laki-laki)
        if (w.anakLaki === 0) {
            if (w.anakPerempuan === 1) {
                p.anakPerempuan = 1/2;
                ket.anakPerempuan = "1/2 (Fardh - Tunggal tanpa anak laki)";
            } else if (w.anakPerempuan > 1) {
                p.anakPerempuan = 2/3;
                ket.anakPerempuan = `2/3 (Fardh - Dibagi ${w.anakPerempuan} anak perempuan)`;
            }
        } else {
            ket.anakLaki = `Ashabah bil Ghair (Rasio 2:1 bersama Anak Perempuan)`;
            if (w.anakPerempuan > 0) {
                ket.anakPerempuan = `Ashabah bil Ghair (Menerima setengah dari bagian Anak Laki-Laki)`;
            }
        }

        // Hitung Total Porsi Fardh
        let totalFardh = 0;
        for (let key in p) totalFardh += p[key];

        let hasilNominal = {};
        let statusKalkulasi = "PEMBAGIAN NORMAL";

        // Masing-Masing Porsi Fardh Diubah ke Rupiah
        for (let key in p) {
            hasilNominal[key] = p[key] * this.hartaBersih;
        }

        // Hitung Sisa Harta Untuk Ashabah
        let sisaHarta = Math.max(0, this.hartaBersih * (1 - totalFardh));

        if (sisaHarta > 0) {
            if (w.anakLaki > 0) {
                // RASIO ASHABAH 2:1 UNTUK ANAK LAKI DAN ANAK PEREMPUAN
                let totalPoin = (w.anakLaki * 2) + (w.anakPerempuan * 1);
                let nilaiSatuPoin = sisaHarta / totalPoin;

                hasilNominal.anakLaki = nilaiSatuPoin * 2 * w.anakLaki;
                if (w.anakPerempuan > 0) {
                    hasilNominal.anakPerempuan = nilaiSatuPoin * 1 * w.anakPerempuan;
                }
            } else if (w.cucuLaki > 0) {
                let totalPoin = (w.cucuLaki * 2) + (w.cucuPerempuan * 1);
                let nilaiSatuPoin = sisaHarta / totalPoin;

                hasilNominal.cucuLaki = nilaiSatuPoin * 2 * w.cucuLaki;
                if (w.cucuPerempuan > 0) {
                    hasilNominal.cucuPerempuan = nilaiSatuPoin * 1 * w.cucuPerempuan;
                }
            } else if (w.ayah) {
                hasilNominal.ayah = (hasilNominal.ayah || 0) + sisaHarta;
            } else if (w.kakek) {
                hasilNominal.kakek = (hasilNominal.kakek || 0) + sisaHarta;
            } else if (w.saudaraKandungLaki > 0) {
                let totalPoin = (w.saudaraKandungLaki * 2) + (w.saudaraKandungPerempuan * 1);
                let nilaiSatuPoin = sisaHarta / totalPoin;
                hasilNominal.saudaraKandungLaki = nilaiSatuPoin * 2 * w.saudaraKandungLaki;
                if (w.saudaraKandungPerempuan > 0) {
                    hasilNominal.saudaraKandungPerempuan = nilaiSatuPoin * 1 * w.saudaraKandungPerempuan;
                }
            } else if (w.pamanKandung > 0) {
                hasilNominal.pamanKandung = sisaHarta;
            } else if (w.pamanSeayah > 0) {
                hasilNominal.pamanSeayah = sisaHarta;
            } else if (w.anakPamanKandung > 0) {
                hasilNominal.anakPamanKandung = sisaHarta;
            } else if (w.anakPamanSeayah > 0) {
                hasilNominal.anakPamanSeayah = sisaHarta;
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
