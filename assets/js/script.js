// Copyright 2025 ariefsetyonugroho
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     https://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Initialize the QR code scanner
const beepSound = new Audio('assets/sounds/beep-06.wav');
// function onScanSuccess(decodedText, decodedResult) {
//     beepSound.play().catch(e => console.log("Audio play error:", e));
//     document.getElementById('result').innerText = `${decodedText}`;
// }
function onScanFailure(error) {
    console.warn(`Code scan error = ${error}`);
}
let html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", 
    { fps: 10, qrbox: { width: 720, height: 200 } }, 
    false
    );
html5QrcodeScanner.render(onScanSuccess, onScanFailure);

// Update the current year in the footer
const yearSpan = document.getElementById('currentYear');
const currentYear = new Date().getFullYear();
yearSpan.textContent = currentYear;

// Handle file upload and parse Excel data
let pesertaList = [];

document.getElementById("uploadExcel").addEventListener("change", function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    pesertaList = XLSX.utils.sheet_to_json(sheet);
    pesertaList = pesertaList.map(p => ({
        ...p,
        nomor_peserta: p.nomor_peserta?.toString().trim(),
        nama: p.nama?.toString().trim(),
    }));
    alert("Data peserta berhasil dimuat.");
    };

    reader.readAsArrayBuffer(file);
});

const scannedNomorSet = new Set(); 
const scannedRows = [];


function onScanSuccess(decodedText) {
    const nomor = decodedText.trim();

    if (scannedNomorSet.has(nomor)) {
        console.log(`Nomor ${nomor} sudah pernah discan, diabaikan.`);
        return;
    }

    const peserta = pesertaList.find(p =>
        p.nomor_peserta.toString().trim().toUpperCase() === nomor.toUpperCase()
    );

    if (peserta) {
        scannedNomorSet.add(nomor);
        beepSound.play().catch(e => console.log("Audio play error:", e));

        document.getElementById("result").textContent = `${nomor}`;

        const container = document.querySelector(".scan-data");
        const row = document.createElement("div");
        row.innerHTML = `✅ <strong>${peserta.nama}</strong> - ${new Date().toLocaleTimeString()}`;
        container.prepend(row);
        scannedRows.unshift(row);

        const scanData = {
            nomor: nomor,
            nama: peserta.nama,
            waktu: new Date().toLocaleTimeString()
        };

        const today = new Date().toISOString().split("T")[0]; // contoh: 2025-06-29
        const key = `scanHistory-${today}`;

        let dailyHistory = JSON.parse(localStorage.getItem(key) || "[]");

        // Pastikan belum discan sebelumnya
        const sudahAda = dailyHistory.some(item => item.nomor === nomor);
        if (!sudahAda) {
            dailyHistory.unshift(scanData);
            localStorage.setItem(key, JSON.stringify(dailyHistory));
        }

        // Simpan untuk tampilkan di layar
        localStorage.setItem("currentScan", JSON.stringify({
            nomor: nomor,
            nama: peserta.nama
        }));

        if (scannedRows.length > 5) {
            scannedRows.pop()?.remove();
        }
    } else {
        beepSound.play().catch(e => console.log("Audio play error:", e));
        document.getElementById("result").textContent = `❌ Nomor ${nomor} tidak ditemukan.`;
    }
}


function clearScan() {
  document.getElementById("result").textContent = "Waiting...";
  document.querySelector(".scan-data").innerHTML = "";
  scannedNomorSet.clear();
  scannedRows.length = 0;
  localStorage.removeItem("currentScan"); 
}

function openTab() {
window.open("screen.html", "_blank");
}

function exportToExcel() {
    const today = new Date().toISOString().split("T")[0]; // "2025-06-29"
    const key = `scanHistory-${today}`;
    const scanHistory = JSON.parse(localStorage.getItem(key) || "[]");

    if (scanHistory.length === 0) {
        alert("Belum ada data scan hari ini.");
        return;
    }

    const worksheet = XLSX.utils.json_to_sheet(scanHistory);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ScanResult");

    // Nama file: scan-2025-06-29.xlsx
    XLSX.writeFile(workbook, `scan-${today}.xlsx`);
}
