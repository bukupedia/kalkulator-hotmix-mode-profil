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

const hasilBox = document.getElementById("hasilBox");
const outLuas = document.getElementById("outLuas");
const outAwal = document.getElementById("outAwal");
const outWaste = document.getElementById("outWaste");
const outTotal = document.getElementById("outTotal");

function parseFlexibleNumber(val) {
  if (!val) return NaN;
  val = val.replace(/\./g, "").replace(",", ".");
  return parseFloat(val);
}

function format(num) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2
  }).format(num);
}

function setMode(mode) {
  boxLuas.classList.toggle("d-none", mode === "pr");
  boxPR.classList.toggle("d-none", mode === "luas");
}

modeLuas.addEventListener("change", () => setMode("luas"));
modePR.addEventListener("change", () => setMode("pr"));

let segIndex = 0;

function createRow() {
  segIndex++;
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${segIndex}</td>
    <td><input type="text" class="form-control form-control-sm"></td>
    <td><input type="text" class="form-control form-control-sm"></td>
    <td><input type="text" class="form-control form-control-sm l1"></td>
    <td><input type="text" class="form-control form-control-sm l2"></td>
    <td class="avg text-end">0.00</td>
    <td><input type="text" class="form-control form-control-sm p"></td>
    <td class="luas text-end">0.00</td>
    <td><button class="btn btn-sm btn-danger">X</button></td>
  `;
  segTbody.appendChild(tr);

  const l1 = tr.querySelector(".l1");
  const l2 = tr.querySelector(".l2");
  const p = tr.querySelector(".p");
  const avgCell = tr.querySelector(".avg");
  const luasCell = tr.querySelector(".luas");

  function update() {
    const n1 = parseFlexibleNumber(l1.value);
    const n2 = parseFlexibleNumber(l2.value);
    const np = parseFlexibleNumber(p.value);

    const avg = (!isNaN(n1) && !isNaN(n2)) ? (n1 + n2) / 2 : NaN;
    const luas = (!isNaN(avg) && !isNaN(np)) ? avg * np : NaN;

    avgCell.textContent = isNaN(avg) ? "-" : format(avg);
    luasCell.textContent = isNaN(luas) ? "-" : format(luas);

    updateTotal();
  }

  l1.addEventListener("input", update);
  l2.addEventListener("input", update);
  p.addEventListener("input", update);

  tr.querySelector("button").addEventListener("click", () => {
    tr.remove();
    updateTotal();
  });
}

function updateTotal() {
  let totalLuas = 0;
  let totalPanjang = 0;

  segTbody.querySelectorAll("tr").forEach(tr => {
    const luas = parseFlexibleNumber(tr.querySelector(".luas").textContent);
    const p = parseFlexibleNumber(tr.querySelector(".p").value);

    if (!isNaN(luas)) totalLuas += luas;
    if (!isNaN(p)) totalPanjang += p;
  });

  totalLuasCell.textContent = format(totalLuas);
  totalPanjangCell.textContent = format(totalPanjang);
}

addSegBtn.addEventListener("click", createRow);

clearSegBtn.addEventListener("click", () => {
  segTbody.innerHTML = "";
  segIndex = 0;
  updateTotal();
});

document.getElementById("hotmixForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const luas = modeLuas.checked
    ? parseFlexibleNumber(luasManualInput.value)
    : parseFlexibleNumber(totalLuasCell.textContent);

  const bj = parseFlexibleNumber(bjInput.value);
  const tebal = parseFlexibleNumber(tebalInput.value) / 100;
  const waste = parseFlexibleNumber(wasteInput.value);

  if (isNaN(luas) || isNaN(bj) || isNaN(tebal) || isNaN(waste)) return;

  const volume = luas * tebal;
  const awal = volume * bj;
  const wasteTon = awal * (waste / 100);
  const total = awal + wasteTon;

  outLuas.textContent = format(luas);
  outAwal.textContent = format(awal);
  outWaste.textContent = format(wasteTon);
  outTotal.textContent = format(total);

  hasilBox.classList.remove("d-none");
});

createRow();
setMode("luas");
