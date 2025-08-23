// ===== 공용 전역 변수 선언 =====
let datalist = [];
let selectedLevel = null;
let currentIndex = 0;
let isAnswering = false;
let correct = 0;
let allowExit = false;
let score = 0;

// ===== 페이지 구분 =====
document.addEventListener("DOMContentLoaded", () => {
    const page = window.location.pathname;

    if (page.includes("mainpage.html")) {
        initMainPage();
    } 
    else if (page.includes("gamepage.html")) {
        initGamePage();
    }
    else if (page.includes("finishpage.html")) {
        initFinishPage();
    }
});

// ===== mainpage.html 전용 =====
function initMainPage() {
    const levelBtns = document.querySelectorAll(".item");
    const formEl = document.getElementById("goStart");
    const explanationBtn = document.getElementById("explanationBtn");
    allowExit = true;

    if (levelBtns.length) {
        levelBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".item").forEach(b => b.classList.remove("selected"));
                btn.classList.add("selected");
                selectedLevel = btn.dataset.level;
                console.log("선택된 난이도:", selectedLevel);
            });
        });
    }

    if (formEl) {
        formEl.addEventListener("submit", e => {
            e.preventDefault();
            if (!selectedLevel) {
                alert("난이도를 선택해주세요.");
                return;
            }
            const url = `./gamepage.html?level=${encodeURIComponent(selectedLevel)}`;
            window.location.href = url;
        });
    }

    if (explanationBtn) {
        explanationBtn.addEventListener("click", () => {
            window.location.href = './howtoplaypage.html';
        });
    }
}

// ===== gamepage.html 전용 =====
function initGamePage() {
    const params = new URLSearchParams(window.location.search);
    const level = params.get("level");
    allowExit = false;

    if (!level) {
        alert("난이도를 선택해주세요.");
        window.location.href = "./mainpage.html";
        return;
    }

    selectedLevel = level;
    fetchData(level);

    const enterBtn = document.getElementById("enterBtn");
    const hintBtn = document.getElementById("hintBtn");
    const answerInput = document.getElementById("answer");

    if (enterBtn) enterBtn.addEventListener("click", checkAnswer);
    if (hintBtn) hintBtn.addEventListener("click", showHint);
    if (answerInput) {
        answerInput.addEventListener("keydown", e => {
            if (e.key === "Enter") checkAnswer();
        });
    }
}

// ===== finishpage.html 전용 =====
function initFinishPage() {
    allowExit = true;

    const params = new URLSearchParams(window.location.search);
    const score = params.get("score") || 0;
    const level = params.get("level") || "";

    const countEl = document.querySelector(".count");
    if (countEl) {
        countEl.textContent = score;
    }

    const tryAgainBtn = document.getElementById("tryAgain");
    if (tryAgainBtn) {
        tryAgainBtn.addEventListener("click", () => {
            if (!level) {
                alert("난이도 정보가 없습니다. 처음으로 돌아갑니다.");
                window.location.href = "mainpage.html";
            } else {
                window.location.href = `gamepage.html?level=${encodeURIComponent(level)}`;
            }
        });
    }

    const goHomeBtn = document.getElementById("goHome");
    if (goHomeBtn) {
        goHomeBtn.addEventListener("click", () => {
            window.location.href = "mainpage.html";
        });
    }
}

// ===== CSV 파싱 =====
function parseCSV(text) {
    return text.trim().split("\n").map(line =>
        line.split(",").map(cell => cell.trim().replace(/^"|"$/g, ""))
    );
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// ===== 데이터 로드 =====
async function fetchData(selectedLevel) {
    const response = await fetch("data.csv");
    if (!response.ok) {
        alert("데이터 파일을 불러오는 데 실패했습니다.");
        location.href = "./mainpage.html";
        return;
    }
    const text = await response.text();
    let allData = parseCSV(text);

    datalist = allData.filter(row => row[0].trim() === selectedLevel);

    if (datalist.length === 0) {
        alert(`${selectedLevel} 난이도의 문제가 없습니다.`);
        window.location.href = "mainpage.html";
        return;
    }

    datalist = shuffle(datalist);
    startGame();
}

// ===== 게임 시작 =====
function startGame() {
    currentIndex = 0;
    showQuiz();
    allowExit = false;
}

function beforeUnloadHandler(e) {
    if (allowExit) return;
    e.preventDefault();
    e.returnValue = '';
    return '작성 중인 내용이 저장되지 않을 수 있습니다. 정말 페이지를 떠나시겠습니까?'
}

// ===== 문제 표시 =====
function showQuiz() {
    if (!datalist[currentIndex]) return;

    const quizEl = document.getElementById("quiz");
    const answerEl = document.getElementById("answer");
    const feedbackEl = document.getElementById("feedback");
    const hintEl = document.getElementById("hint");
    const progressEl = document.getElementById("progress");

    if (!quizEl || !answerEl || !feedbackEl || !hintEl || !progressEl) {
        console.error("필요한 요소를 찾을 수 없습니다.");
        return;
    }

    const [level, quiz, answer, hint] = datalist[currentIndex];

    quizEl.textContent = quiz;
    answerEl.value = "";
    feedbackEl.textContent = "";
    hintEl.textContent = "";
    progressEl.textContent = `${currentIndex + 1} / 5`;
    answerEl.focus();
}

// ===== 정답 확인 =====
function checkAnswer() {
    if (isAnswering) return;
    isAnswering = true;

    const userInput = document.getElementById("answer").value.trim();
    const correctAnswer = datalist[currentIndex][2];
    const feedbackEl = document.getElementById("feedback");

    if (userInput === correctAnswer) {
        feedbackEl.textContent = "✅ 정답입니다!";
        score++;
    } else {
        feedbackEl.textContent = `❌ 오답입니다! 정답: ${correctAnswer}`;
    }

    currentIndex++;

    if (currentIndex < 5) {
        setTimeout(() => {
            showQuiz();
            isAnswering = false;
        }, 1500);
    } else {
        setTimeout(endGame, 1500);
    }
}

// ===== 힌트 표시 =====
function showHint() {
    const hint = datalist[currentIndex][datalist[currentIndex].length - 1];
    document.getElementById("hint").textContent = hint;
}

// ===== 게임 종료 =====
function endGame() {
    allowExit = true;
    window.location.href = `finishpage.html?score=${score}&level=${encodeURIComponent(selectedLevel)}`;
}
