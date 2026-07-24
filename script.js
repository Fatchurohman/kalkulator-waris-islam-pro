// =====================================
// KALKULATOR WARIS ISLAM BASIC v1.0
// Developer: Fatur Sky
// =====================================


// =====================
// FORMAT RUPIAH
// =====================

function formatRupiah(angka) {

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(Math.round(angka));

}


// =====================
// FPB & KPK
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


// =====================
// HITUNG WARIS
// =====================

function hitungWaris() {


    const nama =
    document.getElementById("namaPewaris").value;


    const gender =
    document.querySelector(
        'input[name="gender"]:checked'
    );


    const harta =
    Number(document.getElementById("harta").value);



    const suami =
    Number(document.getElementById("suami").value) || 0;


    const istri =
    Number(document.getElementById("istri").value) || 0;


    const ayah =
    Number(document.getElementById("ayah").value) || 0;


    const ibu =
    Number(document.getElementById("ibu").value) || 0;


    const anakLaki =
    Number(document.getElementById("anakLaki").value) || 0;


    const anakPerempuan =
    Number(document.getElementById("anakPerempuan").value) || 0;



    if (!nama || !gender) {

        alert("Lengkapi data pewaris");

        return;

    }


    if (harta <= 0) {

        alert("Masukkan harta warisan");

        return;

    }



    // =====================
    // CEK ANAK
    // =====================

    const adaAnak =
    anakLaki > 0 || anakPerempuan > 0;



    let bagian = [];



    // lanjut ke Bagian 2
