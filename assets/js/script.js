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
    alert("Data peserta berhasil dimuat.");
    };

    reader.readAsArrayBuffer(file);
});

// function onScanSuccess(decodedText) {
//     beepSound.play().catch(e => console.log("Audio play error:", e)); // <-- di sini
//     document.getElementById("result").textContent = `Scanned: ${decodedText}`;

//     const peserta = pesertaList.find(p =>
//     p.nomor_peserta.toString().trim() === decodedText.trim()
//     );

//     const container = document.querySelector(".scan-data");

//     if (peserta) {
//     const row = document.createElement("div");
//     row.innerHTML = `✅ <strong>${peserta.nama}</strong> (ID: ${peserta.id}) - ${new Date().toLocaleTimeString()}`;
//     container.prepend(row);
//     } else {
//     const row = document.createElement("div");
//     row.innerHTML = `❌ Nomor ${decodedText} tidak ditemukan.`;
//     container.prepend(row);
//     }
// }

const scannedNomorSet = new Set(); 
const scannedRows = [];

function onScanSuccess(decodedText) {
    const nomor = decodedText.trim();

    if (scannedNomorSet.has(nomor)) {
        console.log(`Nomor ${nomor} sudah pernah discan, diabaikan.`);
        return;
    }

    const peserta = pesertaList.find(p =>
        p.nomor_peserta.toString().trim() === nomor
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

        if (scannedRows.length > 5) {
            const removedRow = scannedRows.pop();
            removedRow.remove(); 
        }
    } else {
        beepSound.play().catch(e => console.log("Audio play error:", e));
        console.warn(`Nomor ${nomor} tidak ditemukan di daftar.`);
        document.getElementById("result").textContent = `❌ Nomor ${nomor} tidak ditemukan.`;
    }
}

  function openTab() {
    window.open("screen.html", "_blank");
  }

