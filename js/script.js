/* Frontend logic:
   - Mode switch: luas manual or profil (PR)
   - Dynamic segmen table (add/remove)
   - Per-row: L1, L2, avg, P, luas
   - Auto-normalize numbers (., , and thousand separators)
   - Realtime validation + live preview
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

// Helper: parse numbers flexible (handles "1.234,56", "1,234.56", "1234,56", "1234.56", spaces)
function parseFlexibleNumber(value) {
    if (value === null || value === undefined) return NaN;
    if (typeof value !== "string") value = String(value);

    let v = value.trim();

    if (v === "") return NaN;

    // remove spaces
    v = v.replace(/\s/g, "");

    // if contains both '.' and ','
    if (v.includes(".") && v.includes(",")) {
        // determine which is decimal separator by last occurrence
        if (v.lastIndexOf(",") > v.lastIndexOf(".")) {
            // dot is thousand separator -> remove dots, replace last comma with dot
            v = v.replace(/\./g, "").replace(/,/g, ".");
        } else {
            // comma is thousand separator -> remove commas
            v = v.replace(/,/g, "");
        }
    } else {
        // only comma or only dot or none
        v = v.replace(/,/g, "."); // comma -> dot
    }

    const n = parseFloat(v);
    return isNaN(n) ? NaN : n;
}

// Format number for display (ID locale, auto thousands). Show up to 6 decimals for intermediate formatting.
function formatDisplay(num, maxFraction = 6) {
    if (num === "" || num === null || num === undefined) return "";
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("id-ID", { maximumFractionDigits: maxFraction }).format(num);
}

// Create a new segment row
let segIndex = 0;
function createSegRow(data = {}) {
    segIndex += 1;
    const tr = document.createElement("tr");
    tr.dataset.idx = segIndex;

    const idxCell = `<td class="small text-muted">${segIndex}</td>`;
    const profilAwal = `<td><input type="text" class="form-control form-control-sm" placeholder="PR..." value="${data.profilAwal||""}"></td>`;
    const profilAkhir = `<td><input type="text" class="form-control form-control-sm" placeholder="PR..." value="${data.profilAkhir||""}"></td>`;

    const l1 = `<td><input type="text" inputmode="decimal" class="form-control form-control-sm numeric-input seg-l1" value="${data.l1||""}" placeholder="L1"></td>`;
    const l2 = `<td><input type="text" inputmode="decimal" class="form-control form-control-sm numeric-input seg-l2" value="${data.l2||""}" placeholder="L2"></td>`;
    const avg = `<td class="text-end seg-avg small">0.00</td>`;
    const p = `<td><input type="text" inputmode="decimal" class="form-control form-control-sm numeric-input seg-p" value="${data.p||""}" placeholder="P"></td>`;
    const luas = `<td class="text-end seg-luas small">0.00</td>`;
    const aksi = `<td class="text-center"><button type="button" class="btn btn-sm btn-outline-danger btn-remove-row" title="Hapus"><span>&times;</span></button></td>`;

    tr.innerHTML = idxCell + profilAwal + profilAkhir + l1 + l2 + avg + p + luas + aksi;
    segTbody.appendChild(tr);

    // attach events
    const inputL1 = tr.querySelector(".seg-l1");
    const inputL2 = tr.querySelector(".seg-l2");
    const inputP  = tr.querySelector(".seg-p");
    const btnRemove = tr.querySelector(".btn-remove-row");

    function updateRow() {
        const n1 = parseFlexibleNumber(inputL1.value);
        const n2 = parseFlexibleNumber(inputL2.value);
        const np = parseFlexibleNumber(inputP.value);

        let avgv = NaN;
        if (!isNaN(n1) && !isNaN(n2)) {
            avgv = (n1 + n2) / 2;
        } else if (!isNaN(n1) && isNaN(n2)) {
            avgv = n1;
        } else if (isNaN(n1) && !isNaN(n2)) {
            avgv = n2;
        }

        const luasv = (!isNaN(avgv) && !isNaN(np)) ? (avgv * np) : NaN;

        tr.querySelector(".seg-avg").textContent = isNaN(avgv) ? "-" : formatDisplay(avgv, 4);
        tr.querySelector(".seg-luas").textContent = isNaN(luasv) ? "-" : formatDisplay(luasv, 4);

        // validation styles
        [inputL1, inputL2, inputP].forEach(inp => {
            const v = parseFlexibleNumber(inp.value);
            if (inp.value === "" || isNaN(v) || v < 0) {
                inp.classList.add("is-invalid");
                inp.classList.remove("is-valid");
            } else {
                inp.classList.remove("is-invalid");
                inp.classList.add("is-valid");
            }
        });

        updateTotalLuas();
        autoCalculatePreview(); // live preview
    }

    inputL1.addEventListener("input", updateRow);
    inputL2.addEventListener("input", updateRow);
    inputP.addEventListener("input", updateRow);

    // on blur: format nicely
    [inputL1, inputL2, inputP].forEach(inp => {
        inp.addEventListener("blur", () => {
            const n = parseFlexibleNumber(inp.value);
            if (!isNaN(n)) inp.value = formatDisplay(n, 4);
        });
    });

    btnRemove.addEventListener("click", () => {
        tr.remove();
        updateTotalLuas();
        autoCalculatePreview();
    });

    // initial update
    updateRow();
}

// Update total luas from table
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
    totalLuasCell.textContent = any ? formatDisplay(total, 4) : "0.00";
}

// Mode switch handlers
function setMode(mode) {
    if (mode === "luas") {
        boxLuas.classList.remove("d-none");
        boxPR.classList.add("d-none");
    } else {
        boxLuas.classList.add("d-none");
        boxPR.classList.remove("d-none");
    }
    // reset display
    hasilBox.classList.add("d-none");
}

modeLuas.addEventListener("change", () => setMode("luas"));
modePR.addEventListener("change", () => setMode("pr"));

// Add initial sample row for convenience
createSegRow({profilAwal: "PR0", profilAkhir: "PR1", l1: "", l2: "", p: ""});

// Buttons
addSegBtn.addEventListener("click", () => createSegRow({}));
clearSegBtn.addEventListener("click", () => {
    segTbody.innerHTML = "";
    segIndex = 0;
    updateTotalLuas();
    hasilBox.classList.add("d-none");
});

// Reset luas manual
resetLuasBtn.addEventListener("click", () => {
    luasManualInput.value = "";
    luasManualInput.classList.remove("is-valid","is-invalid");
    hasilBox.classList.add("d-none");
});

// common numeric input behavior: validation & formatting on blur + live validation
const commonNumericInputs = [luasManualInput, bjInput, tebalInput, wasteInput];
commonNumericInputs.forEach(inp => {
    inp.addEventListener("input", () => {
        const n = parseFlexibleNumber(inp.value);
        if (inp.value === "" || isNaN(n) || n < 0) {
            inp.classList.add("is-invalid");
            inp.classList.remove("is-valid");
        } else {
            inp.classList.remove("is-invalid");
            inp.classList.add("is-valid");
        }
        autoCalculatePreview();
    });
    inp.addEventListener("blur", () => {
        const n = parseFlexibleNumber(inp.value);
        if (!isNaN(n)) inp.value = formatDisplay(n, 4);
    });
});

// Compute total luas value (number)
function computeTotalLuasValue() {
    if (modeLuas.checked) {
        const n = parseFlexibleNumber(luasManualInput.value);
        return isNaN(n) ? NaN : n;
    } else {
        // sum from table
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
        return any ? total : NaN;
    }
}

// Shared calculation & validation logic
function validateCommonInputs() {
    const bj = parseFlexibleNumber(bjInput.value);
    const tebal = parseFlexibleNumber(tebalInput.value);
    const waste = parseFlexibleNumber(wasteInput.value);

    let ok = true;

    if (isNaN(bj) || bj < 0) { bjInput.classList.add("is-invalid"); ok = false; } else bjInput.classList.remove("is-invalid");
    if (isNaN(tebal) || tebal < 0) { tebalInput.classList.add("is-invalid"); ok = false; } else tebalInput.classList.remove("is-invalid");
    if (isNaN(waste) || waste < 0) { wasteInput.classList.add("is-invalid"); ok = false; } else wasteInput.classList.remove("is-invalid");

    const luasVal = computeTotalLuasValue();
    if (isNaN(luasVal) || luasVal < 0) {
        if (modeLuas.checked) luasManualInput.classList.add("is-invalid");
        ok = false;
    } else {
        if (modeLuas.checked) luasManualInput.classList.remove("is-invalid");
    }

    return ok;
}

// Core calc
function calculateAndShow() {
    if (!validateCommonInputs()) {
        hasilBox.classList.add("d-none");
        return;
    }

    const luasVal = computeTotalLuasValue();
    const bj = parseFlexibleNumber(bjInput.value);
    const tebalCm = parseFlexibleNumber(tebalInput.value);
    const waste = parseFlexibleNumber(wasteInput.value);

    const tebalMeter = tebalCm / 100;
    const volume = luasVal * tebalMeter; // m2 * m = m3
    const kebutuhanAwal = volume * bj; // m3 * ton/m3 = ton
    const tambahanWaste = kebutuhanAwal * (waste / 100);
    const totalHotmix = kebutuhanAwal + tambahanWaste;

    // display
    outLuas.textContent = formatDisplay(luasVal, 2);
    outAwal.textContent = kebutuhanAwal.toFixed(2);
    outWaste.textContent = tambahanWaste.toFixed(2);
    outTotal.textContent = totalHotmix.toFixed(2);

    hasilBox.classList.remove("d-none");
}

// Live preview auto-calc (called on many input events)
function autoCalculatePreview() {
    // show preview only when common inputs are valid-ish
    if (!validateCommonInputs()) {
        // we hide only the final box to avoid confusion
        hasilBox.classList.add("d-none");
        return;
    }
    calculateAndShow();
}

// Form submit (explicit calculate)
form.addEventListener("submit", function(e) {
    e.preventDefault();
    calculateAndShow();
});

// initialize
setMode("luas");
updateTotalLuas();
