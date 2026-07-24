function formatRupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(angka);
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


function cariAsalMasalah(data) {

    let hasil = 1;

    data.forEach(item => {
        hasil = kpk(hasil, item.penyebut);
    });

    return hasil;
}



function hitungWaris() {


    const nama = document.getElementById("namaPewaris").value;

    const gender = document.querySelector(
        'input[name="gender"]:checked'
    );


    const harta = Number(
        document.getElementById("harta").value
    );


    const jenazah = Number(
        document.getElementById("jenazah").value
    ) || 0;


    const utang = Number(
        document.getElementById("utang").value
    ) || 0;


    const wasiat = Number(
        document.getElementById("wasiat").value
    ) || 0;



    const suami =
        document.getElementById("suami").checked;

    const istri =
        document.getElementById("istri").checked;

    const ayah =
        document.getElementById("ayah").checked;

    const ibu =
        document.getElementById("ibu").checked;

    const anakLaki =
        document.getElementById("anakLaki").checked;

    const anakPerempuan =
        document.getElementById("anakPerempuan").checked;



    if (!nama || !gender) {
        alert("Lengkapi data pewaris");
        return;
    }


    if (harta <= 0) {
        alert("Masukkan total harta");
        return;
    }



    const hartaBersih =
        harta - jenazah - utang - wasiat;



    let hasilPembagian = "";

    let daftarBagian = [];



    const adaAnak =
        anakLaki || anakPerempuan;



// =====================
// ISTRI
// =====================

if (istri && gender.value === "L") {


    let pecahan =
        adaAnak ? "1/8" : "1/4";


    let nilai =
        adaAnak ?
        hartaBersih / 8 :
        hartaBersih / 4;



    daftarBagian.push({
        nama:"Istri",
        pembilang:1,
        penyebut:adaAnak ? 8 : 4
    });



    hasilPembagian += `
    <p>
    <strong>👩 Istri</strong><br>
    Bagian: ${pecahan}<br>
    Nilai: ${formatRupiah(nilai)}
    </p>
    `;
}



// =====================
// IBU
// =====================

if (ibu) {


    let pecahan =
    adaAnak ? "1/6" : "1/3";


    let nilai =
    adaAnak ?
    hartaBersih / 6 :
    hartaBersih / 3;



    daftarBagian.push({
        nama:"Ibu",
        pembilang:1,
        penyebut:adaAnak ? 6 : 3
    });



    hasilPembagian += `
    <p>
    <strong>👩 Ibu</strong><br>
    Bagian: ${pecahan}<br>
    Nilai: ${formatRupiah(nilai)}
    </p>
    `;
}



// =====================
// AYAH
// =====================

if (ayah && adaAnak) {


    let nilai =
    hartaBersih / 6;



    daftarBagian.push({
        nama:"Ayah",
        pembilang:1,
        penyebut:6
    });



    hasilPembagian += `
    <p>
    <strong>👨 Ayah</strong><br>
    Bagian: 1/6<br>
    Nilai: ${formatRupiah(nilai)}
    </p>
    `;
}



// =====================
// ANAK PEREMPUAN
// =====================

if (anakPerempuan && !anakLaki) {


    let pecahan =
    "1/2";


    let nilai =
    hartaBersih / 2;



    daftarBagian.push({
        nama:"Anak Perempuan",
        pembilang:1,
        penyebut:2
    });



    hasilPembagian += `
    <p>
    <strong>👧 Anak Perempuan</strong><br>
    Bagian: ${pecahan}<br>
    Nilai: ${formatRupiah(nilai)}
    </p>
    `;
}



// =====================
// ASAL MASALAH
// =====================

let asalMasalah =
cariAsalMasalah(daftarBagian);



let hasilAsal = "";

daftarBagian.forEach(item => {

    let bagian =
    (asalMasalah / item.penyebut) * item.pembilang;


    hasilAsal += `

    <p>
    <strong>${item.nama}</strong><br>
    Bagian: ${bagian}/${asalMasalah}
    </p>

    `;

});



// =====================
// HASIL AKHIR
// =====================

let hasil = `

<h3>📊 Data Perhitungan</h3>

<p>
<strong>Pewaris:</strong><br>
${nama}
</p>

<p>
<strong>Harta Bersih:</strong><br>
${formatRupiah(hartaBersih)}
</p>


<hr>

<h3>⚖️ Hasil Pembagian</h3>

${hasilPembagian}


<hr>

<h3>📐 Asal Masalah</h3>

<p>
Penyebut Bersama:
<strong>${asalMasalah}</strong>
</p>

${hasilAsal}

`;



document.getElementById("hasil").innerHTML = hasil;


}

    

    
