/* ULTRA STABLE VERSION
   - NO input reformatting
   - NO blur formatting
   - Raw user input never modified
   - Only parsed internally for calculation
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

/* =========================
   FLEXIBLE NUMBER PARSER
========================= */
function parseFlexibleNumber(value) {
    if (!value) return NaN;

    let v = String(value).trim().replace(/\s/g, "");

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

function formatNumber(num, digit = 4) {
    if (isNaN(num)) return "-";
    return num.toFixed(digit);
}

/* =========================
   SEGMENT TABLE
========================= */
let segIndex = 0;

function createSegRow() {
    segIndex++;

    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td class="small text-muted">${segIndex}</td>
        <td><input type="text" class="form-control form-control-sm"></td>
        <td><input type="text" class="form-control form-control-sm"></td>
        <td><input type="text" inputmode="decimal" class="form-control form-control-sm seg-l1"></td>
        <td><input type="text" inputmode="decimal" class="form-control form-control-sm seg-l2"></td>
        <td class="text-end seg-avg small">-</td>
        <td><input type="text" inputmode="decimal" class="form-control form-control-sm seg-p"></td>
        <td class="text-end seg-luas small">-</td>
        <td class="text-center">
            <button type="button" class="btn btn-sm btn-outline-danger btn-remove-row">&times;</button>
        </td>
    `;

    segTbody.appendChild(tr);

    const l1 = tr.querySelector(".seg-l1");
    const l2 = tr.querySelector(".seg-l2");
    const p  = tr.querySelector(".seg-p");

    function updateRow() {
        const n1 = parseFlexibleNumber(l1.value);
        const n2 = parseFlexibleNumber(l2.value);
        const np = parseFlexibleNumber(p.value);

        let avg = NaN;
        if (!isNaN(n1) && !isNaN(n2)) avg = (n1 + n2) / 2;
        else if (!isNaN(n1)) avg = n1;
        else if (!isNaN(n2)) avg = n2;

        const luas = (!isNaN(avg) && !isNaN(np)) ? avg * np : NaN;

        tr.querySelector(".seg-avg").textContent = formatNumber(avg, 4);
        tr.querySelector(".seg-luas").textContent = formatNumber(luas, 4);

        validateInput(l1);
        validateInput(l2);
        validateInput(p);

        updateTotalLuas();
        autoCalculate();
    }

    [l1, l2, p].forEach(inp => {
        inp.addEventListener("input", updateRow);
    });

    tr.querySelector(".btn-remove-row").addEventListener("click", () => {
        tr.remove();
        updateTotalLuas();
        autoCalculate();
    });
}

/* =========================
   TOTAL LUAS
========================= */
function updateTotalLuas() {
    let total = 0;
    segTbody.querySelectorAll("tr").forEach(tr => {
        const luasText = tr.querySelector(".seg-luas").textContent;
        const luasNum = parseFloat(luasText);
        if (!isNaN(luasNum)) total += luasNum;
    });

    totalLuasCell.textContent = total.toFixed(4);
}

/* =========================
   VALIDATION
========================= */
function validateInput(inp) {
    const val = parseFlexibleNumber(inp.value);
    if (inp.value === "" || isNaN(val) || val < 0) {
        inp.classList.add("is-invalid");
        inp.classList.remove("is-valid");
    } else {
        inp.classList.remove("is-invalid");
        inp.classList.add("is-valid");
    }
}

/* =========================
   MODE SWITCH
========================= */
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

/* =========================
   COMMON INPUT VALIDATION
========================= */
[luasManualInput, bjInput, tebalInput, wasteInput].forEach(inp => {
    inp.addEventListener("input", () => {
        validateInput(inp);
        autoCalculate();
    });
});

/* =========================
   CALCULATION
========================= */
function computeTotalLuasValue() {
    if (modeLuas.checked) {
        return parseFlexibleNumber(luasManualInput.value);
    } else {
        return parseFloat(totalLuasCell.textContent);
    }
}

function calculate() {
    const luas = computeTotalLuasValue();
    const bj = parseFlexibleNumber(bjInput.value);
    const tebal = parseFlexibleNumber(tebalInput.value);
    const waste = parseFlexibleNumber(wasteInput.value);

    if (isNaN(luas) || isNaN(bj) || isNaN(tebal) || isNaN(waste)) {
        hasilBox.classList.add("d-none");
        return;
    }

    const volume = luas * (tebal / 100);
    const awal = volume * bj;
    const tambahan = awal * (waste / 100);
    const total = awal + tambahan;

    outLuas.textContent = luas.toFixed(2);
    outAwal.textContent = awal.toFixed(2);
    outWaste.textContent = tambahan.toFixed(2);
    outTotal.textContent = total.toFixed(2);

    hasilBox.classList.remove("d-none");
}

function autoCalculate() {
    calculate();
}

form.addEventListener("submit", function(e) {
    e.preventDefault();
    calculate();
});

/* =========================
   BUTTONS
========================= */
addSegBtn.addEventListener("click", createSegRow);

clearSegBtn.addEventListener("click", () => {
    segTbody.innerHTML = "";
    segIndex = 0;
    updateTotalLuas();
    hasilBox.classList.add("d-none");
});

resetLuasBtn.addEventListener("click", () => {
    luasManualInput.value = "";
    luasManualInput.classList.remove("is-valid", "is-invalid");
    hasilBox.classList.add("d-none");
});

/* INIT */
createSegRow();
setMode("luas");
updateTotalLuas();
