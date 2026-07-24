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

        hasil = kpk(
            hasil,
            item.penyebut
        );

    });


    return hasil;

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



    const jenazah =
    Number(document.getElementById("jenazah").value) || 0;


    const utang =
    Number(document.getElementById("utang").value) || 0;


    const wasiat =
    Number(document.getElementById("wasiat").value) || 0;



    const suami =
    Number(document.getElementById("suami").value);


    const istri =
    Number(document.getElementById("istri").value);


    const ayah =
    Number(document.getElementById("ayah").value);


    const ibu =
    Number(document.getElementById("ibu").value);


    const anakLaki =
    Number(document.getElementById("anakLaki").value);


    const anakPerempuan =
    Number(document.getElementById("anakPerempuan").value);




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
    anakLaki > 0 || anakPerempuan > 0;




// =====================
// ISTRI
// =====================

if (istri > 0 && gender.value === "L") {


    let bagian =
    adaAnak ? 1/8 : 1/4;


    daftarBagian.push({

        nama:"Istri",
        pembilang:1,
        penyebut:adaAnak ? 8 : 4

    });



    hasilPembagian += `

    <p>
    <strong>👩 Istri</strong><br>

    Bagian:
    ${adaAnak ? "1/8" : "1/4"}

    <br>

    Nilai:
    ${formatRupiah(hartaBersih * bagian)}

    </p>

    `;

}




// =====================
// IBU
// =====================

if (ibu > 0) {


    let bagian =
    adaAnak ? 1/6 : 1/3;



    daftarBagian.push({

        nama:"Ibu",
        pembilang:1,
        penyebut:adaAnak ? 6 : 3

    });



    hasilPembagian += `

    <p>

    <strong>👩 Ibu</strong><br>

    Bagian:
    ${adaAnak ? "1/6" : "1/3"}

    <br>

    Nilai:
    ${formatRupiah(hartaBersih * bagian)}

    </p>

    `;


}





// =====================
// AYAH
// =====================

if (ayah > 0 && adaAnak) {


    daftarBagian.push({

        nama:"Ayah",
        pembilang:1,
        penyebut:6

    });



    hasilPembagian += `

    <p>

    <strong>👨 Ayah</strong><br>

    Bagian: 1/6

    <br>

    Nilai:
    ${formatRupiah(hartaBersih / 6)}

    </p>

    `;


}





// =====================
// ANAK PEREMPUAN
// =====================

if (anakPerempuan > 0 && anakLaki === 0) {


    let bagian;


    if (anakPerempuan === 1) {

        bagian = 1/2;

    } else {

        bagian = 2/3;

    }



    daftarBagian.push({

        nama:"Anak Perempuan",
        pembilang:
        anakPerempuan === 1 ? 1 : 2,

        penyebut:
        anakPerempuan === 1 ? 2 : 3

    });



    hasilPembagian += `

    <p>

    <strong>👧 Anak Perempuan</strong><br>

    Bagian:
    ${anakPerempuan === 1 ? "1/2" : "2/3"}

    <br>

    Nilai:
    ${formatRupiah(hartaBersih * bagian)}

    </p>

    `;


}




// =====================
// ASAL MASALAH
// =====================

let asalMasalah =
cariAsalMasalah(daftarBagian);



let dataAsal = [];

daftarBagian.forEach(item => {

    let bagian =
    (asalMasalah / item.penyebut) * item.pembilang;

    dataAsal.push({
        nama: item.nama,
        saham: bagian
    });

});


    let hasilAsal = "";

dataAsal.forEach(item => {

    hasilAsal += `
    <p>
        <strong>${item.nama}</strong><br>
        Bagian: ${item.saham}/${asalMasalah}
    </p>
    `;

});

// =====================
// HITUNG SISA ('ASHABAH)
// =====================

let totalSaham = 0;

dataAsal.forEach(item => {
    totalSaham += item.saham;
});

let sisaSaham = asalMasalah - totalSaham;

// Jika ada sisa dan ada ayah,
// ayah mendapat sisa sebagai 'ashabah.

if (sisaSaham > 0) {

    let ayahData = dataAsal.find(
        item => item.nama === "Ayah"
    );

    if (ayahData) {
        ayahData.saham += sisaSaham;
    }

}



// =====================
// TAMPIL HASIL
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



    




    
