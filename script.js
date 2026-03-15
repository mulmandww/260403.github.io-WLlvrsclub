/* =========================
   화면 요소
========================= */
const lockScreen = document.getElementById("lockScreen");
const passcodeScreen = document.getElementById("passcodeScreen");
const homeScreen = document.getElementById("homeScreen");

const lockDate = document.getElementById("lockDate");
const lockTime = document.getElementById("lockTime");
const statusTime = document.getElementById("status-time");

const swipeUpArea = document.getElementById("swipeUpArea");
const swipeHandle = document.getElementById("swipeHandle");

const passcodeWrap = document.getElementById("passcodeWrap");
const dots = [
  document.getElementById("dot1"),
  document.getElementById("dot2"),
  document.getElementById("dot3"),
  document.getElementById("dot4"),
];

/* =========================
   실시간 날짜/시간
========================= */
function updateDateTime() {
  const now = new Date();

  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");

  const month = now.getMonth() + 1;
  const day = now.getDate();

  const weekdayNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  const weekday = weekdayNames[now.getDay()];

  lockDate.textContent = `${month}월 ${day}일 ${weekday}`;
  lockTime.textContent = `${hour}:${minute}`;
  statusTime.textContent = `${hour}:${minute}`;
}

updateDateTime();
setInterval(updateDateTime, 1000);

/* =========================
   잠금화면 -> 위로 스와이프
   모바일/PC 둘 다 작동
========================= */
let startY = 0;
let currentY = 0;
let dragging = false;

function onSwipeStart(clientY) {
  dragging = true;
  startY = clientY;
  currentY = clientY;
}

function onSwipeMove(clientY) {
  if (!dragging) return;
  currentY = clientY;

  const diff = startY - currentY; /* 위로 올리면 + */
  const clamped = Math.max(0, Math.min(diff, 90));

  swipeUpArea.style.transform = `translateX(-50%) translateY(${-clamped}px)`;
  swipeUpArea.style.opacity = `${1 - clamped / 120}`;
}

function onSwipeEnd() {
  if (!dragging) return;
  dragging = false;

  const diff = startY - currentY;

  if (diff > 70) {
    openPasscodeScreen();
  } else {
    swipeUpArea.style.transform = "translateX(-50%) translateY(0)";
    swipeUpArea.style.opacity = "1";
  }
}

swipeUpArea.addEventListener("mousedown", (e) => {
  onSwipeStart(e.clientY);
});

window.addEventListener("mousemove", (e) => {
  onSwipeMove(e.clientY);
});

window.addEventListener("mouseup", () => {
  onSwipeEnd();
});

swipeUpArea.addEventListener("touchstart", (e) => {
  onSwipeStart(e.touches[0].clientY);
}, { passive: true });

window.addEventListener("touchmove", (e) => {
  onSwipeMove(e.touches[0].clientY);
}, { passive: true });

window.addEventListener("touchend", () => {
  onSwipeEnd();
});

function openPasscodeScreen() {
  lockScreen.classList.remove("active");
  passcodeScreen.classList.add("active");
  swipeUpArea.style.transform = "translateX(-50%) translateY(0)";
  swipeUpArea.style.opacity = "1";
}

/* =========================
   암호 입력
========================= */
const PASSWORD = "4399";
let currentInput = "";

function updateDots() {
  dots.forEach((dot, index) => {
    if (index < currentInput.length) {
      dot.classList.add("filled");
    } else {
      dot.classList.remove("filled");
    }
  });
}

function resetInput() {
  currentInput = "";
  updateDots();
}

function pressKey(num) {
  if (currentInput.length >= 4) return;

  currentInput += num;
  updateDots();

  if (currentInput.length === 4) {
    setTimeout(checkPassword, 120);
  }
}

function deleteKey() {
  if (currentInput.length === 0) return;
  currentInput = currentInput.slice(0, -1);
  updateDots();
}

function checkPassword() {
  if (currentInput === PASSWORD) {
    unlockToHome();
  } else {
    passcodeWrap.classList.add("shake");

    setTimeout(() => {
      passcodeWrap.classList.remove("shake");
      resetInput();
    }, 360);
  }
}

function unlockToHome() {
  passcodeScreen.classList.remove("active");
  homeScreen.classList.add("active");
}
