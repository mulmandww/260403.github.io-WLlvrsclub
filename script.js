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
].filter(Boolean);

/* 홈화면 앱 */
const openAppButtons = document.querySelectorAll(".app-icon.open-app, .dock-icon.open-app");
const popupAppButtons = document.querySelectorAll(".app-icon.popup-app, .dock-icon.popup-app");
const dummyAppButtons = document.querySelectorAll(".app-icon.dummy-app, .dock-icon.dummy-app");
const allTappableApps = document.querySelectorAll(".app-icon, .dock-icon");

const backHomeButtons = document.querySelectorAll(".back-home");
const appScreens = document.querySelectorAll(".app-screen");

const glassPopup = document.getElementById("glassPopup");
const glassPopupTitle = document.getElementById("glassPopupTitle");
const glassPopupText = document.getElementById("glassPopupText");
const glassPopupTime = document.getElementById("glassPopupTime");
const glassPopupIcon = document.getElementById("glassPopupIcon");

if (glassPopup) {
  glassPopup.classList.remove("show");
  glassPopup.setAttribute("aria-hidden", "true");
}

if (glassPopupTitle) glassPopupTitle.textContent = "";
if (glassPopupText) glassPopupText.textContent = "";
if (glassPopupTime) glassPopupTime.textContent = "";

/* =========================
   비밀번호
========================= */
const PASSWORD = "4399";
let currentInput = "";

/* =========================
   상태값
========================= */
let isTransitioning = false;
let isAppAnimating = false;
let touchHandled = false;

/* =========================
   시간
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
   유틸
========================= */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clearTouchClasses() {
  allTappableApps.forEach((el) => {
    el.classList.remove("touching", "launching");
  });
}

function hideAllScreens() {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active", "opening", "closing", "app-opening");
  });
}

function hideAllAppScreens() {
  appScreens.forEach((screen) => {
    screen.classList.remove("active", "opening", "closing");
  });
}

/* =========================
   잠금화면 -> 암호입력
========================= */
async function openPasscodeScreen() {
  if (!lockScreen || !passcodeScreen) return;
  if (!lockScreen.classList.contains("active")) return;
  if (isTransitioning) return;

  isTransitioning = true;

  lockScreen.classList.remove("active");
  lockScreen.classList.add("closing");

  await wait(220);

  lockScreen.classList.remove("closing");
  passcodeScreen.classList.add("active", "opening");

  await wait(280);

  passcodeScreen.classList.remove("opening");
  isTransitioning = false;
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
   비밀번호 점
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

  isTransitioning = true;

  passcodeScreen.classList.remove("active");
  passcodeScreen.classList.add("closing");

  await wait(240);

  passcodeScreen.classList.remove("closing");
  homeScreen.classList.add("active", "opening");

  await wait(320);

  homeScreen.classList.remove("opening");
  isTransitioning = false;
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
   팝업
========================= */
const popupTextMap = {
  weather: {
    title: "날씨",
    text: "사실 나는 비오는 날을 좋아한다. 습도가 자동으로 올라가는 천연 가습기이기 때문이다. 하지만 오늘은 왠지 다운되는 느낌이 들었다.",
    icon: "assets/icons/weather.png"
  },
  youtube: {
    title: "YouTube",
    text: "[입덕직캠] 알파드라이브원 건우 직캠 4K 'Cinnamon Shake' (ALD1 GEONWOO FanCam) | ALD1 DEBUT SHOW [THE FIRST ALARM]",
    icon: "assets/icons/gw_youtube.png"
  },
  spotify: {
    title: "spotify",
    text: "톡 쏘는 Cinnamon Shake🎶",
    icon: "assets/icons/gw_spotify.png"
  },
  x: {
    title: "X",
    text: "❕❕❕❕❕ ··· 🤫",
    icon: "assets/icons/x.png"
  },
  music: {
    title: "음악",
    text: "Us - Keshi",
    icon: "assets/icons/gw_music.png"
  },
  calculator: {
    title: "계산기",
    text: "411×(4+3+3)+43×(3+3)+(43−4×3)=?",
    icon: "assets/icons/calculator.png"
  },
};

function getCurrentNotifTime() {
  const now = new Date();
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}

function showPopup({ title, text, icon }) {
  if (!glassPopup || !glassPopupTitle || !glassPopupText || !glassPopupTime || !glassPopupIcon) return;

  glassPopupTitle.textContent = title || "";
  glassPopupText.textContent = text || "";
  glassPopupTime.textContent = getCurrentNotifTime();
  glassPopupIcon.src = icon || "assets/icons/messages.png";

  glassPopup.classList.remove("show");
  void glassPopup.offsetWidth;

  glassPopup.setAttribute("aria-hidden", "false");
  glassPopup.classList.add("show");

  clearTimeout(showPopup._timer);
  showPopup._timer = setTimeout(() => {
    glassPopup.classList.remove("show");
    glassPopup.setAttribute("aria-hidden", "true");

    setTimeout(() => {
      glassPopupTitle.textContent = "";
      glassPopupText.textContent = "";
      glassPopupTime.textContent = "";
    }, 260);
  }, 2200);
}

/* =========================
   앱 열기 애니메이션
========================= */
async function openAppWithAnimation(button) {
  const targetId = button.dataset.screen;
  if (!targetId) return;

  const targetScreen = document.getElementById(targetId);
  if (!targetScreen) return;
  if (!homeScreen || !homeScreen.classList.contains("active")) return;
  if (isTransitioning || isAppAnimating) return;

  isAppAnimating = true;

  button.classList.add("launching");
  homeScreen.classList.add("app-opening");

  await wait(320);

  homeScreen.classList.remove("active", "app-opening");

  hideAllAppScreens();
  targetScreen.classList.add("active", "opening");

  await wait(360);

  button.classList.remove("launching", "touching");
  targetScreen.classList.remove("opening");
  isAppAnimating = false;
}

/* =========================
   앱 화면 -> 홈화면
========================= */
async function backToHomeFromApp() {
  if (!homeScreen) return;
  if (isTransitioning || isAppAnimating) return;

  const currentAppScreen = document.querySelector(".app-screen.active");
  if (!currentAppScreen) return;

  isAppAnimating = true;

  currentAppScreen.classList.remove("active");
  currentAppScreen.classList.add("closing");

  await wait(180);

  currentAppScreen.classList.remove("closing");
  homeScreen.classList.add("active", "opening");

  await wait(260);

  homeScreen.classList.remove("opening");
  isAppAnimating = false;
}

backHomeButtons.forEach((button) => {
  button.addEventListener("click", backToHomeFromApp);
});

/* =========================
   공통 터치 피드백
========================= */
function attachTouchFeedback(button, action) {
  button.addEventListener(
    "touchstart",
    () => {
      if (!homeScreen || !homeScreen.classList.contains("active")) return;
      if (isTransitioning || isAppAnimating) return;

      button.classList.add("touching");
      touchHandled = false;
    },
    { passive: true }
  );

  button.addEventListener("touchend", async (event) => {
    if (!homeScreen || !homeScreen.classList.contains("active")) return;
    if (isTransitioning || isAppAnimating) return;

    event.preventDefault();
    touchHandled = true;

    await wait(120);
    await action(button);
  });

  button.addEventListener("touchcancel", () => {
    button.classList.remove("touching");
    touchHandled = false;
  });

  button.addEventListener("click", async (event) => {
    if (touchHandled) {
      touchHandled = false;
      event.preventDefault();
      return;
    }

    await action(button);
  });
}

/* =========================
   진입형 앱
========================= */
openAppButtons.forEach((button) => {
  attachTouchFeedback(button, openAppWithAnimation);
});

/* =========================
   반응형 앱
========================= */
popupAppButtons.forEach((button) => {
  attachTouchFeedback(button, async (btn) => {
    const popupKey = btn.dataset.popup;
    const popupData = popupTextMap[popupKey];

    await wait(40);
    btn.classList.remove("touching");

    if (popupData) {
      showPopup(popupData);
    }
  });
});

/* =========================
   장식형 앱
========================= */
dummyAppButtons.forEach((button) => {
  attachTouchFeedback(button, async (btn) => {
    await wait(60);
    btn.classList.remove("touching");
  });
});
