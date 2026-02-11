/* =========================================
   ASPAL HOTMIX CALCULATOR - FINAL STABLE
   - Auto calculate realtime
   - Bootstrap validation
   - Stable numeric input (koma/titik aman)
   - Total panjang otomatis
========================================= */

const modeLuas = document.getElementById("modeLuas");
const modePR = document.getElementById("modePR");
const boxLuas = document.getElementById("boxLuas");
const boxPR = document.getElementById("boxPR");

const segTbody = document.getElementById("segTbody");
const addSegBtn = document.getElementById("addSegBtn");
const clearSegBtn = document.getElementById("clearSegBtn");
const totalLuasCell = document.getElementById("totalLuasCell");
const totalPanjangCell = document.getElementById("totalPanjangCell");

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

/* ===============================
   FLEXIBLE NUMBER PARSER (STABLE)
================================ */
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

    return parseFloat(v);
}

function formatDisplay(num, dec = 4) {
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: dec
    }).format(num);
}

/* ===============================
   SEGMENT SYSTEM
================================ */
let segIndex = 0;

function createSegRow() {
    segIndex++;
    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td class="small text-muted">${segIndex}</td>
        <td><input type="text" class="form-control form-control-sm" placeholder="PR..."></td>
        <td><input type="text" class="form-control form-control-sm" placeholder="PR..."></td>
        <td><input type="text" inputmode="decimal" class="form-control form-control-sm seg-l1" placeholder="L1"></td>
        <td><input type="text" inputmode="decimal" class="form-control form-control-sm seg-l2" placeholder="L2"></td>
        <td class="text-end seg-avg">-</td>
        <td><input type="text" inputmode="decimal" class="form-control form-control-sm seg-p" placeholder="Panjang"></td>
        <td class="text-end seg-luas">-</td>
        <td class="text-center">
            <button type="button" class="btn btn-sm btn-outline-danger btn-remove">&times;</button>
        </td>
    `;

    segTbody.appendChild(tr);

    const l1 = tr.querySelector(".seg-l1");
    const l2 = tr.querySelector(".seg-l2");
    const p = tr.querySelector(".seg-p");
    const avgCell = tr.querySelector(".seg-avg");
    const luasCell = tr.querySelector(".seg-luas");

    function updateRow() {
        const n1 = parseFlexibleNumber(l1.value);
        const n2 = parseFlexibleNumber(l2.value);
        const np = parseFlexibleNumber(p.value);

        let avg = NaN;

        if (!isNaN(n1) && !isNaN(n2)) avg = (n1 + n2) / 2;
        else if (!isNaN(n1)) avg = n1;
        else if (!isNaN(n2)) avg = n2;

        const luas = (!isNaN(avg) && !isNaN(np)) ? avg * np : NaN;

        avgCell.textContent = isNaN(avg) ? "-" : formatDisplay(avg);
        luasCell.textContent = isNaN(luas) ? "-" : formatDisplay(luas);

        validateInput(l1);
        validateInput(l2);
        validateInput(p);

        updateTotals();
        autoCalculate();
    }

    [l1, l2, p].forEach(input => {
        input.addEventListener("input", updateRow);
        input.addEventListener("blur", () => {
            const val = parseFlexibleNumber(input.value);
            if (!isNaN(val)) input.value = formatDisplay(val);
        });
    });

    tr.querySelector(".btn-remove").addEventListener("click", () => {
        tr.remove();
        updateTotals();
        autoCalculate();
    });
}

function updateTotals() {
    let totalLuas = 0;
    let totalPanjang = 0;

    segTbody.querySelectorAll("tr").forEach(tr => {
        const luas = parseFlexibleNumber(tr.querySelector(".seg-luas").textContent);
        const panjang = parseFlexibleNumber(tr.querySelector(".seg-p").value);

        if (!isNaN(luas)) totalLuas += luas;
        if (!isNaN(panjang)) totalPanjang += panjang;
    });

    if (totalLuasCell) totalLuasCell.textContent = formatDisplay(totalLuas);
    if (totalPanjangCell) totalPanjangCell.textContent = formatDisplay(totalPanjang);
}

/* ===============================
   VALIDATION
================================ */
function validateInput(input) {
    const val = parseFlexibleNumber(input.value);
    if (input.value === "" || isNaN(val) || val < 0) {
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");
    } else {
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");
    }
}

/* ===============================
   CORE CALCULATION
================================ */
function computeLuas() {
    if (modeLuas.checked) {
        return parseFlexibleNumber(luasManualInput.value);
    } else {
        return parseFlexibleNumber(totalLuasCell.textContent);
    }
}

function autoCalculate() {
    const luas = computeLuas();
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

    outLuas.textContent = formatDisplay(luas, 2);
    outAwal.textContent = awal.toFixed(2);
    outWaste.textContent = tambahan.toFixed(2);
    outTotal.textContent = total.toFixed(2);

    hasilBox.classList.remove("d-none");
}

/* ===============================
   EVENT BINDING
================================ */
addSegBtn.addEventListener("click", createSegRow);

clearSegBtn.addEventListener("click", () => {
    segTbody.innerHTML = "";
    segIndex = 0;
    updateTotals();
    autoCalculate();
});

resetLuasBtn.addEventListener("click", () => {
    luasManualInput.value = "";
    luasManualInput.classList.remove("is-valid", "is-invalid");
    autoCalculate();
});

[luasManualInput, bjInput, tebalInput, wasteInput].forEach(input => {
    input.addEventListener("input", () => {
        validateInput(input);
        autoCalculate();
    });

    input.addEventListener("blur", () => {
        const val = parseFlexibleNumber(input.value);
        if (!isNaN(val)) input.value = formatDisplay(val);
    });
});

modeLuas.addEventListener("change", () => {
    boxLuas.classList.remove("d-none");
    boxPR.classList.add("d-none");
    autoCalculate();
});

modePR.addEventListener("change", () => {
    boxLuas.classList.add("d-none");
    boxPR.classList.remove("d-none");
    autoCalculate();
});

/* INIT */
createSegRow();
