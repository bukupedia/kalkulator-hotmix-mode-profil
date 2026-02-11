/* 
   FINAL STABLE VERSION
   - No aggressive re-formatting on input fields
   - Mobile portrait safe
   - Auto total panjang
   - Clean numeric parsing
*/

const modeLuas = document.getElementById("modeLuas");
const modePR = document.getElementById("modePR");
const boxLuas = document.getElementById("boxLuas");
const boxPR = document.getElementById("boxPR");

const segTbody = document.getElementById("segTbody");
const addSegBtn = document.getElementById("addSegBtn");
const clearSegBtn = document.getElementById("clearSegBtn");
const totalLuasCell = document.getElementById("totalLuasCell");

const luasManualInput = document.getElementById("luasManual");
const bjInput = document.getElementById("bj");
const tebalInput = document.getElementById("tebal");
const wasteInput = document.getElementById("waste");
const form = document.getElementById("hotmixForm");

const hasilBox = document.getElementById("hasilBox");
const outLuas = document.getElementById("outLuas");
const outAwal = document.getElementById("outAwal");
const outWaste = document.getElementById("outWaste");
const outTotal = document.getElementById("outTotal");
const resetLuasBtn = document.getElementById("resetLuasBtn");

let totalPanjangCell = null;

/* ===========================
   FLEXIBLE NUMBER PARSER
=========================== */
function parseFlexibleNumber(value) {
    if (value === null || value === undefined) return NaN;
    if (typeof value !== "string") value = String(value);

    let v = value.trim();
    if (v === "") return NaN;

    v = v.replace(/\s/g, "");

    if (v.includes(".") && v.includes(",")) {
        if (v.lastIndexOf(",") > v.lastIndexOf(".")) {
            v = v.replace(/\./g, "").replace(",", ".");
        } else {
            v = v.replace(/,/g, "");
        }
    } else {
        v = v.replace(",", ".");
    }

    const n = parseFloat(v);
    return isNaN(n) ? NaN : n;
}

/* ===========================
   SEGMENT ROW
=========================== */

let segIndex = 0;

function createSegRow(data = {}) {
    segIndex++;

    const tr = document.createElement("tr");
    tr.dataset.idx = segIndex;

    tr.innerHTML = `
        <td class="small text-muted">${segIndex}</td>
        <td><input type="text" class="form-control form-control-sm" value="${data.profilAwal||""}"></td>
        <td><input type="text" class="form-control form-control-sm" value="${data.profilAkhir||""}"></td>
        <td><input type="text" inputmode="decimal" class="form-control form-control-sm numeric-input seg-l1" value="${data.l1||""}"></td>
        <td><input type="text" inputmode="decimal" class="form-control form-control-sm numeric-input seg-l2" value="${data.l2||""}"></td>
        <td class="text-end seg-avg small">0.00</td>
        <td><input type="text" inputmode="decimal" class="form-control form-control-sm numeric-input seg-p" value="${data.p||""}"></td>
        <td class="text-end seg-luas small">0.00</td>
        <td class="text-center">
            <button type="button" class="btn btn-sm btn-outline-danger btn-remove-row">&times;</button>
        </td>
    `;

    segTbody.appendChild(tr);

    const inputL1 = tr.querySelector(".seg-l1");
    const inputL2 = tr.querySelector(".seg-l2");
    const inputP  = tr.querySelector(".seg-p");
    const btnRemove = tr.querySelector(".btn-remove-row");

    function updateRow() {
        const n1 = parseFlexibleNumber(inputL1.value);
        const n2 = parseFlexibleNumber(inputL2.value);
        const np = parseFlexibleNumber(inputP.value);

        let avg = NaN;
        if (!isNaN(n1) && !isNaN(n2)) avg = (n1 + n2) / 2;
        else if (!isNaN(n1)) avg = n1;
        else if (!isNaN(n2)) avg = n2;

        const luas = (!isNaN(avg) && !isNaN(np)) ? avg * np : NaN;

        tr.querySelector(".seg-avg").textContent =
            isNaN(avg) ? "-" : avg.toFixed(4);

        tr.querySelector(".seg-luas").textContent =
            isNaN(luas) ? "-" : luas.toFixed(4);

        updateTotalLuas();
        updateTotalPanjang();
        autoCalculatePreview();
    }

    inputL1.addEventListener("input", updateRow);
    inputL2.addEventListener("input", updateRow);
    inputP.addEventListener("input", updateRow);

    btnRemove.addEventListener("click", () => {
        tr.remove();
        updateTotalLuas();
        updateTotalPanjang();
        autoCalculatePreview();
    });

    updateRow();
}

/* ===========================
   TOTAL LUAS & PANJANG
=========================== */

function updateTotalLuas() {
    let total = 0;
    let any = false;

    segTbody.querySelectorAll("tr").forEach(tr => {
        const luasText = tr.querySelector(".seg-luas").textContent;
        const luasNum = parseFlexibleNumber(luasText);
        if (!isNaN(luasNum)) {
            any = true;
            total += luasNum;
        }
    });

    totalLuasCell.textContent = any ? total.toFixed(4) : "0.00";
}

function updateTotalPanjang() {
    if (!totalPanjangCell) return;

    let total = 0;
    let any = false;

    segTbody.querySelectorAll("tr").forEach(tr => {
        const pInput = tr.querySelector(".seg-p");
        const pVal = parseFlexibleNumber(pInput.value);
        if (!isNaN(pVal)) {
            any = true;
            total += pVal;
        }
    });

    totalPanjangCell.textContent = any ? total.toFixed(2) : "0.00";
}

/* ===========================
   MODE SWITCH
=========================== */

function setMode(mode) {
    if (mode === "luas") {
        boxLuas.classList.remove("d-none");
        boxPR.classList.add("d-none");
    } else {
        boxLuas.classList.add("d-none");
        boxPR.classList.remove("d-none");
    }
    hasilBox.classList.add("d-none");
}

modeLuas.addEventListener("change", () => setMode("luas"));
modePR.addEventListener("change", () => setMode("pr"));

/* ===========================
   CALCULATION
=========================== */

function computeTotalLuasValue() {
    if (modeLuas.checked) {
        return parseFlexibleNumber(luasManualInput.value);
    } else {
        return parseFlexibleNumber(totalLuasCell.textContent);
    }
}

function calculateAndShow() {
    const luasVal = computeTotalLuasValue();
    const bj = parseFlexibleNumber(bjInput.value);
    const tebalCm = parseFlexibleNumber(tebalInput.value);
    const waste = parseFlexibleNumber(wasteInput.value);

    if ([luasVal, bj, tebalCm, waste].some(v => isNaN(v) || v < 0)) {
        hasilBox.classList.add("d-none");
        return;
    }

    const tebalMeter = tebalCm / 100;
    const volume = luasVal * tebalMeter;
    const kebutuhanAwal = volume * bj;
    const tambahanWaste = kebutuhanAwal * (waste / 100);
    const totalHotmix = kebutuhanAwal + tambahanWaste;

    outLuas.textContent = luasVal.toFixed(2);
    outAwal.textContent = kebutuhanAwal.toFixed(2);
    outWaste.textContent = tambahanWaste.toFixed(2);
    outTotal.textContent = totalHotmix.toFixed(2);

    hasilBox.classList.remove("d-none");
}

function autoCalculatePreview() {
    calculateAndShow();
}

form.addEventListener("submit", function(e) {
    e.preventDefault();
    calculateAndShow();
});

/* ===========================
   INIT
=========================== */

createSegRow({});
setMode("luas");
updateTotalLuas();

/* create total panjang row dynamically */
const tfootRow = document.createElement("tr");
tfootRow.className = "table-secondary fw-bold";
tfootRow.innerHTML = `
    <td colspan="6" class="text-end">Total Panjang (m)</td>
    <td id="totalPanjangCell">0.00</td>
    <td></td>
    <td></td>
`;
document.querySelector("#segTable tfoot").prepend(tfootRow);
totalPanjangCell = document.getElementById("totalPanjangCell");
