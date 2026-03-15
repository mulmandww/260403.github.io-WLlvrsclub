/* =========================
   요소 가져오기
========================= */
const lockScreen = document.getElementById("lockScreen");
const passcodeScreen = document.getElementById("passcodeScreen");
const homeScreen = document.getElementById("homeScreen");

const lockDate = document.getElementById("lockDate");
const lockTime = document.getElementById("lockTime");
const statusTime = document.getElementById("status-time");

const passcodeWrap = document.getElementById("passcodeWrap");

const dots = [
  document.getElementById("dot1"),
  document.getElementById("dot2"),
  document.getElementById("dot3"),
  document.getElementById("dot4"),
];

/* 비밀번호 */
const PASSWORD = "4399";
let currentInput = "";

/* =========================
   실시간 날짜 / 시간
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
   잠금화면 아무데나 탭 / 위로 드래그
   -> 암호 입력 화면으로 이동
========================= */
let startY = 0;
let currentY = 0;
let dragging = false;
let movedEnough = false;

function getPointerY(event) {
  if (event.touches && event.touches[0]) return event.touches[0].clientY;
  if (event.changedTouches && event.changedTouches[0]) return event.changedTouches[0].clientY;
  return event.clientY;
}

function openPasscodeScreen() {
  if (!lockScreen.classList.contains("active")) return;

  lockScreen.classList.remove("active");
  passcodeScreen.classList.add("active");
}

function handleStart(event) {
  dragging = true;
  movedEnough = false;
  startY = getPointerY(event);
  currentY = startY;
}

function handleMove(event) {
  if (!dragging) return;

  currentY = getPointerY(event);
  const diff = startY - currentY;

  if (diff > 20) {
    movedEnough = true;
  }
}

function handleEnd() {
  if (!dragging) return;
  dragging = false;

  const diff = startY - currentY;

  /* 위로 드래그 */
  if (diff > 20) {
    openPasscodeScreen();
    return;
  }

  /* 그냥 탭 */
  if (!movedEnough) {
    openPasscodeScreen();
  }
}

/* 모바일 */
lockScreen.addEventListener("touchstart", handleStart, { passive: true });
lockScreen.addEventListener("touchmove", handleMove, { passive: true });
lockScreen.addEventListener("touchend", handleEnd);

/* PC */
lockScreen.addEventListener("mousedown", handleStart);
window.addEventListener("mousemove", handleMove);
window.addEventListener("mouseup", handleEnd);

/* =========================
   점 업데이트
========================= */
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

/* =========================
   숫자 입력
========================= */
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

/* =========================
   비밀번호 검사
========================= */
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
