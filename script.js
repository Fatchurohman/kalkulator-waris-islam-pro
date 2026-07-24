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

    
    let daftarBagian = [];


    let hasilPembagian = "";



    const adaAnak =
    anakLaki > 0 || anakPerempuan > 0;



    // LANJUT KE BAGIAN 2

    
    // =====================
// ISTRI
// =====================

if (istri > 0 && gender.value === "L") {

    daftarBagian.push({

        nama: "Istri",
        pembilang: 1,
        penyebut: adaAnak ? 8 : 4

    });

}




// =====================
// IBU
// =====================

if (ibu > 0) {

    daftarBagian.push({

        nama: "Ibu",
        pembilang: 1,
        penyebut: adaAnak ? 6 : 3

    });

}




// =====================
// AYAH
// =====================

if (ayah > 0 && adaAnak) {

    daftarBagian.push({

        nama: "Ayah",
        pembilang: 1,
        penyebut: 6

    });

}




// =====================
// ANAK PEREMPUAN
// =====================

if (anakPerempuan > 0 && anakLaki === 0) {


    if (anakPerempuan === 1) {

        daftarBagian.push({

            nama: "Anak Perempuan",
            pembilang: 1,
            penyebut: 2

        });


    } else {


        daftarBagian.push({

            nama: "Anak Perempuan",
            pembilang: 2,
            penyebut: 3

        });

    }

}





// =====================
// ASAL MASALAH
// =====================

let asalMasalah =
cariAsalMasalah(daftarBagian);



let dataAsal = [];



daftarBagian.forEach(item => {


    let saham =
    (asalMasalah / item.penyebut)
    *
    item.pembilang;



    dataAsal.push({

        nama: item.nama,
        saham: saham

    });


});





// =====================
// 'ASHABAH
// =====================

let totalSaham = 0;


dataAsal.forEach(item => {

    totalSaham += item.saham;

});



let sisaSaham =
asalMasalah - totalSaham;



if (sisaSaham > 0) {


    let ayahData =
    dataAsal.find(
        item => item.nama === "Ayah"
    );


    if (ayahData) {

        ayahData.saham += sisaSaham;

    }


}



// LANJUT KE BAGIAN 3

        // =====================
// TAMPIL HASIL
// =====================


let hasilAsal = "";


dataAsal.forEach(item => {


    hasilAsal += `

    <p>

    <strong>${item.nama}</strong><br>

    Bagian:
    ${item.saham}/${asalMasalah}

    </p>

    `;


});





dataAsal.forEach(item => {


    let nilai = 
    (item.saham / asalMasalah)
    *
    hartaBersih;



    hasilPembagian += `

    <p>

    <strong>${item.nama}</strong><br>

    Bagian:
    ${item.saham}/${asalMasalah}

    <br>

    Nilai:
    ${formatRupiah(nilai)}

    </p>

    `;


});






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
