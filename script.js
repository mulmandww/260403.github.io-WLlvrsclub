const lockScreen = document.getElementById("lockScreen");
const passcodeScreen = document.getElementById("passcodeScreen");
const homeScreen = document.getElementById("homeScreen");

const lockDate = document.getElementById("lockDate");
const lockTime = document.getElementById("lockTime");
const statusTime = document.getElementById("status-time");

const swipeUpArea = document.getElementById("swipeUpArea");

const passcodeWrap = document.getElementById("passcodeWrap");
const dots = [
  document.getElementById("dot1"),
  document.getElementById("dot2"),
  document.getElementById("dot3"),
  document.getElementById("dot4"),
];

const PASSWORD = "4399";
let currentInput = "";

/* 날짜/시간 */
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

/* 위로 스와이프 */
let startY = 0;
let currentY = 0;
let dragging = false;

function pointerYFromEvent(event) {
  if (event.touches && event.touches[0]) return event.touches[0].clientY;
  if (event.changedTouches && event.changedTouches[0]) return event.changedTouches[0].clientY;
  return event.clientY;
}

function onSwipeStart(event) {
  dragging = true;
  startY = pointerYFromEvent(event);
  currentY = startY;
}

function onSwipeMove(event) {
  if (!dragging) return;

  currentY = pointerYFromEvent(event);
  const diff = startY - currentY;
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

swipeUpArea.addEventListener("touchstart", onSwipeStart, { passive: true });
window.addEventListener("touchmove", onSwipeMove, { passive: true });
window.addEventListener("touchend", onSwipeEnd);

swipeUpArea.addEventListener("mousedown", onSwipeStart);
window.addEventListener("mousemove", onSwipeMove);
window.addEventListener("mouseup", onSwipeEnd);

function openPasscodeScreen() {
  lockScreen.classList.remove("active");
  passcodeScreen.classList.add("active");
  swipeUpArea.style.transform = "translateX(-50%) translateY(0)";
  swipeUpArea.style.opacity = "1";
}

/* 암호 입력 */
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
