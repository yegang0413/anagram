let selectedLevel = null;

document.querySelectorAll(".item").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".item").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        selectedLevel = btn.dataset.level;
        console.log("선택된 난이도:", selectedLevel)
    });
});

document.getElementById("goStart").addEventListener("submit", e => {
    e.preventDefault();

    if(!selectedLevel) {
        alert("난이도를 선택해주세요.");
        return;
    }

    const url = './gamepage.html?level=${encodeURICompoenent(selectedLevel)}';
    window.location.href = url;
});
