/* 요소 */
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
  document.getElementById("dot4")
];

/* 비밀번호 */
const PASSWORD = "4399";
let currentInput = "";

/* 화면 전환 설정 */
const SCREEN_TRANSITION_DELAY = 140;
let isTransitioning = false;

/* 실시간 날짜/시간 */
function updateDateTime() {
  const now = new Date();

  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");

  const month = now.getMonth() + 1;
  const day = now.getDate();

  const weekdayNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  const weekday = weekdayNames[now.getDay()];

  if (lockDate) lockDate.textContent = `${month}월 ${day}일 ${weekday}`;
  if (lockTime) lockTime.textContent = `${hour}:${minute}`;
  if (statusTime) statusTime.textContent = `${hour}:${minute}`;
}

updateDateTime();
setInterval(updateDateTime, 1000);

/* 공통 유틸 */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function switchScreen(fromScreen, toScreen) {
  if (!fromScreen || !toScreen) return;
  if (isTransitioning) return;

  isTransitioning = true;

  fromScreen.classList.remove("active");
  await wait(SCREEN_TRANSITION_DELAY);
  toScreen.classList.add("active");

  await wait(220);
  isTransitioning = false;
}

/* 잠금화면 -> 암호입력 */
async function openPasscodeScreen() {
  if (!lockScreen.classList.contains("active")) return;
  if (isTransitioning) return;

  await switchScreen(lockScreen, passcodeScreen);
}

/* 아무데나 탭 */
lockScreen.addEventListener("click", openPasscodeScreen);

/* 위로 드래그 */
let startY = 0;
let currentY = 0;
let dragging = false;

function getPointerY(event) {
  if (event.touches && event.touches[0]) return event.touches[0].clientY;
  if (event.changedTouches && event.changedTouches[0]) return event.changedTouches[0].clientY;
  return event.clientY;
}

function handleStart(event) {
  if (isTransitioning) return;
  dragging = true;
  startY = getPointerY(event);
  currentY = startY;
}

function handleMove(event) {
  if (!dragging) return;
  currentY = getPointerY(event);
}

function handleEnd() {
  if (!dragging) return;
  dragging = false;

  const diff = startY - currentY;
  if (diff > 20) {
    openPasscodeScreen();
  }
}

lockScreen.addEventListener("touchstart", handleStart, { passive: true });
lockScreen.addEventListener("touchmove", handleMove, { passive: true });
lockScreen.addEventListener("touchend", handleEnd);

lockScreen.addEventListener("mousedown", handleStart);
window.addEventListener("mousemove", handleMove);
window.addEventListener("mouseup", handleEnd);

/* 점 업데이트 */
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

/* 숫자 입력 */
function pressKey(num) {
  if (isTransitioning) return;
  if (currentInput.length >= 4) return;

  currentInput += num;
  updateDots();

  if (currentInput.length === 4) {
    setTimeout(checkPassword, 120);
  }
}

function deleteKey() {
  if (isTransitioning) return;
  if (currentInput.length === 0) return;

  currentInput = currentInput.slice(0, -1);
  updateDots();
}

/* 비밀번호 검사 */
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

/* 비밀번호 -> 홈화면 */
async function unlockToHome() {
  if (!passcodeScreen.classList.contains("active")) return;
  if (isTransitioning) return;

  await switchScreen(passcodeScreen, homeScreen);
}
