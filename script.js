/* =========================
   요소
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
  document.getElementById("dot4")
];

/* =========================
   비밀번호
========================= */
const PASSWORD = "4399";
let currentInput = "";

/* =========================
   화면 전환 설정
========================= */
const SCREEN_TRANSITION_DELAY = 140;
let isTransitioning = false;
let isAppAnimating = false;
let touchOpened = false;

/* =========================
   공통 유틸
========================= */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

  if (lockDate) lockDate.textContent = `${month}월 ${day}일 ${weekday}`;
  if (lockTime) lockTime.textContent = `${hour}:${minute}`;
  if (statusTime) statusTime.textContent = `${hour}:${minute}`;
}

updateDateTime();
setInterval(updateDateTime, 1000);

/* =========================
   공통 화면 전환
========================= */
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

/* =========================
   잠금화면 -> 암호입력
========================= */
async function openPasscodeScreen() {
  if (!lockScreen || !passcodeScreen) return;
  if (!lockScreen.classList.contains("active")) return;
  if (isTransitioning) return;

  await switchScreen(lockScreen, passcodeScreen);
}

/* 아무데나 탭 */
if (lockScreen) {
  lockScreen.addEventListener("click", openPasscodeScreen);
}

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

if (lockScreen) {
  lockScreen.addEventListener("touchstart", handleStart, { passive: true });
  lockScreen.addEventListener("touchmove", handleMove, { passive: true });
  lockScreen.addEventListener("touchend", handleEnd);

  lockScreen.addEventListener("mousedown", handleStart);
}

window.addEventListener("mousemove", handleMove);
window.addEventListener("mouseup", handleEnd);

/* =========================
   점 업데이트
========================= */
function updateDots() {
  dots.forEach((dot, index) => {
    if (!dot) return;

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
  if (isTransitioning || isAppAnimating) return;
  if (currentInput.length >= 4) return;

  currentInput += num;
  updateDots();

  if (currentInput.length === 4) {
    setTimeout(checkPassword, 120);
  }
}

function deleteKey() {
  if (isTransitioning || isAppAnimating) return;
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
    if (passcodeWrap) {
      passcodeWrap.classList.add("shake");
    }

    setTimeout(() => {
      if (passcodeWrap) {
        passcodeWrap.classList.remove("shake");
      }
      resetInput();
    }, 360);
  }
}

/* =========================
   비밀번호 -> 홈화면
========================= */
async function unlockToHome() {
  if (!passcodeScreen || !homeScreen) return;
  if (!passcodeScreen.classList.contains("active")) return;
  if (isTransitioning) return;

  await switchScreen(passcodeScreen, homeScreen);
}

/* =========================
   비밀번호 버튼 탭 효과
========================= */
const keypadButtons = document.querySelectorAll(".key");

keypadButtons.forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.remove("tap");
    void button.offsetWidth;
    button.classList.add("tap");

    setTimeout(() => {
      button.classList.remove("tap");
    }, 180);
  });
});

/* =========================
   앱 화면 관련 요소
========================= */
const openAppButtons = document.querySelectorAll(".app-icon.open-app, .dock-icon.open-app");
const backHomeButtons = document.querySelectorAll(".back-home");
const appScreens = document.querySelectorAll(".app-screen");

/* =========================
   앱 화면 보조 함수
========================= */
function hideAllAppScreens() {
  appScreens.forEach((screen) => {
    screen.classList.remove("active", "opening");
  });
}

async function openAppWithAnimation(button) {
  const targetId = button.dataset.screen;
  if (!targetId) return;

  const targetScreen = document.getElementById(targetId);
  if (!targetScreen) return;
  if (!homeScreen || !homeScreen.classList.contains("active")) return;
  if (isTransitioning || isAppAnimating) return;

  isAppAnimating = true;

  button.classList.add("launching");
  button.classList.add("touching");
  homeScreen.classList.add("app-opening");

  await wait(260);

  homeScreen.classList.remove("active", "app-opening");

  hideAllAppScreens();
  targetScreen.classList.add("active", "opening");

  setTimeout(() => {
    button.classList.remove("launching", "touching");
    targetScreen.classList.remove("opening");
    isAppAnimating = false;
  }, 340);
}

async function backToHomeFromApp() {
  if (!homeScreen) return;
  if (isTransitioning || isAppAnimating) return;

  const currentAppScreen = document.querySelector(".app-screen.active");
  if (!currentAppScreen) return;

  isAppAnimating = true;

  currentAppScreen.classList.remove("active");

  await wait(120);

  homeScreen.classList.add("active");

  setTimeout(() => {
    isAppAnimating = false;
  }, 220);
}

/* =========================
   앱 버튼 입력 처리
   모바일: touchstart -> touching
   모바일: touchend -> 잠깐 보여주고 열기
   PC: click -> 바로 열기
========================= */
openAppButtons.forEach((button) => {
  button.addEventListener(
    "touchstart",
    () => {
      if (!homeScreen || !homeScreen.classList.contains("active")) return;
      if (isTransitioning || isAppAnimating) return;

      button.classList.add("touching");
      touchOpened = false;
    },
    { passive: true }
  );

  button.addEventListener("touchend", async (event) => {
    if (!homeScreen || !homeScreen.classList.contains("active")) return;
    if (isTransitioning || isAppAnimating) return;

    event.preventDefault();
    touchOpened = true;

    await wait(90);
    await openAppWithAnimation(button);
  });

  button.addEventListener("touchcancel", () => {
    button.classList.remove("touching");
    touchOpened = false;
  });

  button.addEventListener("click", async (event) => {
    if (touchOpened) {
      touchOpened = false;
      event.preventDefault();
      return;
    }

    await openAppWithAnimation(button);
  });
});

/* =========================
   앱 화면 -> 홈화면 복귀
========================= */
backHomeButtons.forEach((button) => {
  button.addEventListener("click", backToHomeFromApp);
});
