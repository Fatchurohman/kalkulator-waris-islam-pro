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

    const jenazah = Number(document.getElementById("jenazah").value);

    const utang = Number(document.getElementById("utang").value);

    const wasiat = Number(document.getElementById("wasiat").value);


    // VALIDASI

    if (nama === "") {
        alert("Nama pewaris harus diisi.");
        return;
    }

    if (!gender) {
        alert("Pilih jenis kelamin pewaris.");
        return;
    }

    if (harta <= 0 || isNaN(harta)) {
        alert("Masukkan jumlah harta yang benar.");
        return;
    }


    // HITUNG HARTA BERSIH

    const hartaBersih = harta - jenazah - utang - wasiat;


    if (hartaBersih <= 0) {
        alert("Harta bersih tidak mencukupi.");
        return;
    }


    // HASIL

    let hasil = `

    <h3>📊 Data Perhitungan</h3>

    <p>
    <strong>Nama Pewaris:</strong><br>
    ${nama}
    </p>

    <p>
    <strong>Jenis Kelamin:</strong><br>
    ${gender.value === "L" ? "Laki-laki" : "Perempuan"}
    </p>

    <hr>

    <p>
    Total Harta:<br>
    ${formatRupiah(harta)}
    </p>

    <p>
    Biaya Jenazah:<br>
    ${formatRupiah(jenazah)}
    </p>

    <p>
    Utang:<br>
    ${formatRupiah(utang)}
    </p>

    <p>
    Wasiat:<br>
    ${formatRupiah(wasiat)}
    </p>

    <hr>

    <h3>
    Harta Bersih Warisan:
    <br>
    ${formatRupiah(hartaBersih)}
    </h3>

    <p style="color:green;">
    ✅ Siap masuk tahap perhitungan faraidh.
    </p>

    `;


    document.getElementById("hasil").innerHTML = hasil;

}
