let profilCount = 0;

function normalizeNumber(value) {
    if (!value) return 0;

    value = value.trim();

    if (value.includes(",") && !value.includes(".")) {
        value = value.replace(",", ".");
    }

    if (value.includes(".") && value.includes(",")) {
        value = value.replace(/\./g, "").replace(",", ".");
    }

    return parseFloat(value) || 0;
}

function addRow() {
    profilCount++;

    const row = document.createElement("tr");
    row.innerHTML = `
        <td>PR-${profilCount}</td>
        <td><input type="text" inputmode="decimal" class="form-control input-panjang"></td>
        <td><input type="text" inputmode="decimal" class="form-control input-l1"></td>
        <td><input type="text" inputmode="decimal" class="form-control input-l2"></td>
        <td class="luas-cell">0.00</td>
        <td>
            <button class="btn btn-sm btn-danger delete-row">Hapus</button>
        </td>
    `;

    document.getElementById("profilBody").appendChild(row);
}

function hitungSemua() {
    let totalPanjang = 0;
    let totalLuas = 0;

    document.querySelectorAll("#profilBody tr").forEach(row => {

        const panjang = normalizeNumber(row.querySelector(".input-panjang").value);
        const l1 = normalizeNumber(row.querySelector(".input-l1").value);
        const l2 = normalizeNumber(row.querySelector(".input-l2").value);

        const luas = panjang * (l1 + l2);

        totalPanjang += panjang;
        totalLuas += luas;

        row.querySelector(".luas-cell").textContent = luas.toFixed(2);
    });

    document.getElementById("totalPanjang").textContent = totalPanjang.toFixed(2);
    document.getElementById("totalLuas").textContent = totalLuas.toFixed(2);
}

document.getElementById("addRow").addEventListener("click", addRow);

document.addEventListener("input", function(e) {
    if (
        e.target.classList.contains("input-panjang") ||
        e.target.classList.contains("input-l1") ||
        e.target.classList.contains("input-l2")
    ) {
        hitungSemua();
    }
});

document.addEventListener("click", function(e) {
    if (e.target.classList.contains("delete-row")) {
        e.target.closest("tr").remove();
        hitungSemua();
    }
});

addRow();
