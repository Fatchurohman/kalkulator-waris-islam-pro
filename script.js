// =====================
// FUNGSI FPB DAN KPK
// =====================

function fpb(a, b) {
    while (b !== 0) {
        let sisa = a % b;
        a = b;
        b = sisa;
    }
    return a;
}


function kpk(a, b) {
    return (a * b) / fpb(a, b);
}


// Mencari asal masalah dari semua penyebut

function cariAsalMasalah(daftar) {

    let hasil = 1;

    daftar.forEach(item => {
        hasil = kpk(hasil, item.penyebut);
    });

    return hasil;
}
function formatRupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(angka);
}


function hitungWaris() {

    const nama = document.getElementById("namaPewaris").value.trim();

    const gender = document.querySelector('input[name="gender"]:checked');

    const harta = Number(document.getElementById("harta").value);

    const jenazah = Number(document.getElementById("jenazah").value) || 0;
    const utang = Number(document.getElementById("utang").value) || 0;
    const wasiat = Number(document.getElementById("wasiat").value) || 0;


    const suami = Number(document.getElementById("suami").value) || 0;
    const istri = Number(document.getElementById("istri").value) || 0;

    const ayah = Number(document.getElementById("ayah").value) || 0;
    const ibu = Number(document.getElementById("ibu").value) || 0;

    const anakLaki = Number(document.getElementById("anakLaki").value) || 0;
    const anakPerempuan = Number(document.getElementById("anakPerempuan").value) || 0;


    if (nama === "") {
        alert("Nama pewaris harus diisi.");
        return;
    }

    if (!gender) {
        alert("Pilih jenis kelamin pewaris.");
        return;
    }

    if (harta <= 0) {
        alert("Masukkan total harta.");
        return;
    }


    const hartaBersih = harta - jenazah - utang - wasiat;


    if (hartaBersih <= 0) {
        alert("Harta bersih tidak mencukupi.");
        return;
    }


    let hasilPembagian = "";
let daftarBagian = [];
    const adaAnak = anakLaki > 0 || anakPerempuan > 0;



    // =====================
    // ISTRI
    // =====================

    if (gender.value === "L" && istri > 0) {

        let bagianIstri;

        if (adaAnak) {
            bagianIstri = hartaBersih * 1 / 8;
        } else {
            bagianIstri = hartaBersih * 1 / 4;
        }

daftarBagian.push({
    nama: "Istri",
    pembilang: 1,
    penyebut: adaAnak ? 8 : 4
});
        hasilPembagian += `
        <p>
        <strong>👩 Istri</strong><br>
        Bagian: ${adaAnak ? "1/8" : "1/4"}<br>
        Nilai: ${formatRupiah(bagianIstri)}<br>
        Dasar: QS. An-Nisa ayat 12
        </p>
        `;
    }



    // =====================
    // SUAMI
    // =====================

    if (gender.value === "P" && suami > 0) {

        let bagianSuami;

        if (adaAnak) {
            bagianSuami = hartaBersih * 1 / 4;
        } else {
            bagianSuami = hartaBersih * 1 / 2;
        }


        hasilPembagian += `
        <p>
        <strong>👨 Suami</strong><br>
        Bagian: ${adaAnak ? "1/4" : "1/2"}<br>
        Nilai: ${formatRupiah(bagianSuami)}<br>
        Dasar: QS. An-Nisa ayat 12
        </p>
        `;
    }



    // =====================
    // IBU
    // =====================

    if (ibu > 0) {

        let bagianIbu;

        if (adaAnak) {
            bagianIbu = hartaBersih * 1 / 6;
        } else {
            bagianIbu = hartaBersih * 1 / 3;
        }

daftarBagian.push({
    nama: "Ibu",
    pembilang: 1,
    penyebut: adaAnak ? 6 : 3
});
        hasilPembagian += `
        <p>
        <strong>👩 Ibu</strong><br>
        Bagian: ${adaAnak ? "1/6" : "1/3"}<br>
        Nilai: ${formatRupiah(bagianIbu)}<br>
        Dasar: QS. An-Nisa ayat 11
        </p>
        `;
    }



    // =====================
    // AYAH
    // =====================

    if (ayah > 0 && adaAnak) {

        let bagianAyah = hartaBersih * 1 / 6;

// =====================
// AYAH
// =====================
        hasilPembagian += `
        <p>
        <strong>👨 Ayah</strong><br>
        Bagian: 1/6<br>
        Nilai: ${formatRupiah(bagianAyah)}<br>
        Dasar: QS. An-Nisa ayat 11
        </p>
        `;
    }

// =====================
// ANAK PEREMPUAN
// =====================

if (anakPerempuan > 0 && anakLaki === 0) {

    let bagianAnakPerempuan;
    let pecahan;

    if (anakPerempuan === 1) {
        bagianAnakPerempuan = hartaBersih * 1 / 2;
        pecahan = "1/2";
    } else {
        bagianAnakPerempuan = hartaBersih * 2 / 3;
        pecahan = "2/3";
    }
daftarBagian.push({
    nama: "Anak Perempuan",
    pembilang: anakPerempuan === 1 ? 1 : 2,
    penyebut: anakPerempuan === 1 ? 2 : 3
});
    hasilPembagian += `
    <p>
    <strong>👧 Anak Perempuan (${anakPerempuan})</strong><br>
    Bagian: ${pecahan}<br>
    Nilai: ${formatRupiah(bagianAnakPerempuan)}<br>
    Dasar: QS. An-Nisa ayat 11
    </p>
    `;
}

    let hasil = `

    <h3>📊 Data Perhitungan</h3>

    <p>
    <strong>Pewaris:</strong><br>
    ${nama}
    </p>

    <p>
    <strong>Jenis Kelamin:</strong><br>
    ${gender.value === "L" ? "Laki-laki" : "Perempuan"}
    </p>

    <hr>

    <p>
    <strong>Harta Bersih:</strong><br>
    ${formatRupiah(hartaBersih)}
    </p>

    <hr>

    <h3>⚖️ Hasil Pembagian</h3>

    ${hasilPembagian || "Belum ada ahli waris yang dihitung."}

    `;

let asalMasalah = cariAsalMasalah(daftarBagian);

hasil += `

<hr>

<h3>📐 Asal Masalah</h3>

<p>
Penyebut bersama: <strong>${asalMasalah}</strong>
</p>

`;
    document.getElementById("hasil").innerHTML = hasil;

}


    
