function formatRupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(angka);
}

function hitungWaris() {

    const harta = Number(document.getElementById("harta").value);

    if (harta <= 0 || isNaN(harta)) {
        alert("Silakan masukkan jumlah harta warisan.");
        return;
    }

    let ahliWaris = [];

    if (document.getElementById("suami").checked)
        ahliWaris.push("Suami");

    if (document.getElementById("istri").checked)
        ahliWaris.push("Istri");

    if (document.getElementById("ayah").checked)
        ahliWaris.push("Ayah");

    if (document.getElementById("ibu").checked)
        ahliWaris.push("Ibu");

    if (document.getElementById("anakLaki").checked)
        ahliWaris.push("Anak Laki-laki");

    if (document.getElementById("anakPerempuan").checked)
        ahliWaris.push("Anak Perempuan");

    if (ahliWaris.length === 0) {
        alert("Pilih minimal satu ahli waris.");
        return;
    }

    let hasil = `
        <h3>Data Berhasil Dibaca</h3>

        <p><strong>Total Harta:</strong><br>
        ${formatRupiah(harta)}</p>

        <p><strong>Ahli Waris:</strong><br>
        ${ahliWaris.join(", ")}</p>

        <hr>

        <p style="color:green;">
        ✅ Sistem siap untuk melakukan perhitungan faraidh.
        </p>

        <p>
        Versi: 1.0 (Fondasi)
        </p>
    `;

    document.getElementById("hasil").innerHTML = hasil;
}
