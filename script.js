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


    // VALIDASI

    if (nama === "") {
        alert("Nama pewaris harus diisi.");
        return;
    }

    if (!gender) {
        alert("Pilih jenis kelamin pewaris.");
        return;
    }

    if (harta <= 0) {
        alert("Masukkan jumlah harta.");
        return;
    }


    const hartaBersih = harta - jenazah - utang - wasiat;

// ==============================
// PERHITUNGAN BAGIAN PASANGAN
// ==============================

let hasilPembagian = "";

const adaAnak = anakLaki > 0 || anakPerempuan > 0;


// Pewaris laki-laki → istri
if (gender.value === "L" && istri > 0) {

    let bagianIstri;

    if (adaAnak) {
        bagianIstri = hartaBersih * 1 / 8;
    } else {
        bagianIstri = hartaBersih * 1 / 4;
    }

    hasilPembagian += `
    <p>
    <strong>Istri (${istri} orang)</strong><br>
    Bagian: ${formatRupiah(bagianIstri)}<br>
    Dasar: QS. An-Nisa ayat 12
    </p>
    `;
}


// Pewaris perempuan → suami
if (gender.value === "P" && suami > 0) {

    let bagianSuami;

    if (adaAnak) {
        bagianSuami = hartaBersih * 1 / 4;
    } else {
        bagianSuami = hartaBersih * 1 / 2;
    }

    hasilPembagian += `
    <p>
    <strong>Suami (${suami} orang)</strong><br>
    Bagian: ${formatRupiah(bagianSuami)}<br>
    Dasar: QS. An-Nisa ayat 12
    </p>
    `;
}
    if (hartaBersih <= 0) {
        alert("Harta bersih tidak mencukupi.");
        return;
    }


    let daftarAhliWaris = "";


    if (suami > 0)
        daftarAhliWaris += "Suami: " + suami + " orang<br>";

    if (istri > 0)
        daftarAhliWaris += "Istri: " + istri + " orang<br>";

    if (ayah > 0)
        daftarAhliWaris += "Ayah: " + ayah + " orang<br>";

    if (ibu > 0)
        daftarAhliWaris += "Ibu: " + ibu + " orang<br>";

    if (anakLaki > 0)
        daftarAhliWaris += "Anak Laki-laki: " + anakLaki + " orang<br>";

    if (anakPerempuan > 0)
        daftarAhliWaris += "Anak Perempuan: " + anakPerempuan + " orang<br>";



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
    <strong>Harta Bersih Warisan:</strong><br>
    ${formatRupiah(hartaBersih)}
    </p>


    <p>
    <strong>Ahli Waris:</strong><br>
    ${daftarAhliWaris || "Belum ada data ahli waris"}
    </p>

<hr>

<h3>⚖️ Hasil Pembagian</h3>

${hasilPembagian || "Belum ada bagian yang dihitung"}
    <hr>

    <p style="color:green;">
    ✅ Data siap masuk tahap perhitungan faraidh.
    </p>

    `;


    document.getElementById("hasil").innerHTML = hasil;

}
