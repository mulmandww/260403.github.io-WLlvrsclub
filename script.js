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

const entryFlow = document.getElementById("entryFlow");
const entryIntroScreen = document.getElementById("entryIntroScreen");
const entryNoticeScreen = document.getElementById("entryNoticeScreen");
const entryGatePasscodeScreen = document.getElementById("entryGatePasscodeScreen");
const entrySelectScreen = document.getElementById("entrySelectScreen");

const entryIntroLaterBtn = document.getElementById("entryIntroLaterBtn");
const entryIntroConfirmBtn = document.getElementById("entryIntroConfirmBtn");
const entryNoticeConfirmBtn = document.getElementById("entryNoticeConfirmBtn");
const entrySelectGwBtn = document.getElementById("entrySelectGwBtn");
const entrySelectXlBtn = document.getElementById("entrySelectXlBtn");

const entryGatePasscodeWrap = document.getElementById("entryGatePasscodeWrap");
const entryGateDots = [
  document.getElementById("entryGateDot1"),
  document.getElementById("entryGateDot2"),
  document.getElementById("entryGateDot3"),
  document.getElementById("entryGateDot4")
].filter(Boolean);
const entryGateKeyButtons = document.querySelectorAll(".entry-gate-key");


/* 홈화면 앱 */
const openAppButtons = document.querySelectorAll(".app-icon.open-app, .dock-icon.open-app");
const popupAppButtons = document.querySelectorAll(".app-icon.popup-app, .dock-icon.popup-app");
const dummyAppButtons = document.querySelectorAll(".app-icon.dummy-app, .dock-icon.dummy-app");
const allTappableApps = document.querySelectorAll(".app-icon, .dock-icon");

const backHomeButtons = document.querySelectorAll(".back-home");
const appScreens = document.querySelectorAll(".app-screen");

const calendarLiveWeekday = document.getElementById("calendarLiveWeekday");
const calendarLiveDate = document.getElementById("calendarLiveDate");

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

let entryGateInput = "";
let selectedDataset = null;

/* =========================
   시간
========================= */
function updateDateTime() {
  const now = new Date();

  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");

  const month = now.getMonth() + 1;
  const day = now.getDate();
  const dayIndex = now.getDay();

  const weekdayNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  const weekday = weekdayNames[dayIndex];

  if (lockDate) lockDate.textContent = `${month}월 ${day}일 ${weekday}`;
  if (lockTime) lockTime.textContent = `${hour}:${minute}`;
  if (statusTime) statusTime.textContent = `${hour}:${minute}`;

  if (calendarLiveWeekday) {
    calendarLiveWeekday.textContent = weekday;
    calendarLiveWeekday.classList.toggle("is-holiday", dayIndex === 0 || dayIndex === 6);
  }

  if (calendarLiveDate) {
    calendarLiveDate.textContent = String(day);
  }
}
updateDateTime();
setInterval(updateDateTime, 1000);

/* =========================
   유틸
========================= */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hideAllAppScreens() {
  appScreens.forEach((screen) => {
    screen.classList.remove("active", "opening", "closing");
  });
}

/* =========================
   ENTRY FLOW
========================= */
async function setActiveEntryScreen(target) {
  const entryScreens = [
    entryIntroScreen,
    entryNoticeScreen,
    entryGatePasscodeScreen,
    entrySelectScreen
  ].filter(Boolean);

  const current = entryScreens.find((screen) => screen.classList.contains("active"));

  if (current === target) return;

  if (current) {
    current.classList.remove("active");
    await wait(180);
  }

  if (target) {
    target.classList.add("active");
    await wait(220);
  }
}

async function openEntryFlow() {
  if (!entryFlow) return;
  entryFlow.classList.add("active");
  await setActiveEntryScreen(entryIntroScreen);
}

function closeEntryFlow() {
  if (!entryFlow) return;
  entryFlow.classList.remove("active");
}

async function openEntryNoticeScreen() {
  await setActiveEntryScreen(entryNoticeScreen);
}

function shakeEntryIntroScreen() {
  if (!entryIntroScreen) return;

  entryIntroScreen.classList.remove("shake");
  void entryIntroScreen.offsetWidth;
  entryIntroScreen.classList.add("shake");

  setTimeout(() => {
    if (entryIntroScreen) {
      entryIntroScreen.classList.remove("shake");
    }
  }, 360);
}

async function openEntryGatePasscodeScreen() {
  entryGateResetInput();
  await setActiveEntryScreen(entryGatePasscodeScreen);
}

async function openEntrySelectScreen() {
  entryGateResetInput();
  await setActiveEntryScreen(entrySelectScreen);
}

function updateEntryGateDots() {
  entryGateDots.forEach((dot, index) => {
    if (index < entryGateInput.length) {
      dot.classList.add("filled");
    } else {
      dot.classList.remove("filled");
    }
  });
}

function entryGateResetInput() {
  entryGateInput = "";
  updateEntryGateDots();
}

function entryGatePressKey(num) {
  if (entryGateInput.length >= 4) return;

  entryGateInput += num;
  updateEntryGateDots();

  if (entryGateInput.length === 4) {
    setTimeout(checkEntryGatePassword, 120);
  }
}

function checkEntryGatePassword() {
  if (entryGateInput === PASSWORD) {
    openEntrySelectScreen();
    return;
  }

  if (entryGatePasscodeWrap) {
    entryGatePasscodeWrap.classList.add("shake");
  }

  setTimeout(() => {
    if (entryGatePasscodeWrap) {
      entryGatePasscodeWrap.classList.remove("shake");
    }
    entryGateResetInput();
  }, 360);
}

function enterSelectedDataset(datasetKey) {
  selectedDataset = datasetKey;
  window.SELECTED_DATASET = datasetKey;

  closeEntryFlow();

  if (lockScreen) {
    lockScreen.classList.add("active");
  }
}

if (entryIntroLaterBtn) {
  entryIntroLaterBtn.addEventListener("click", shakeEntryIntroScreen);
}

if (entryIntroConfirmBtn) {
  entryIntroConfirmBtn.addEventListener("click", openEntryNoticeScreen);
}

if (entryNoticeConfirmBtn) {
  entryNoticeConfirmBtn.addEventListener("click", openEntryGatePasscodeScreen);
}

if (entrySelectGwBtn) {
  entrySelectGwBtn.addEventListener("click", () => enterSelectedDataset("gw"));
}

if (entrySelectXlBtn) {
  entrySelectXlBtn.addEventListener("click", () => enterSelectedDataset("xl"));
}

entryGateKeyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.remove("tap");
    void button.offsetWidth;
    button.classList.add("tap");

    setTimeout(() => {
      button.classList.remove("tap");
    }, 180);
  });
});

window.entryGatePressKey = entryGatePressKey;

setTimeout(() => {
  openEntryFlow();
}, 40);


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
    text: "사실 나는 비오는 날을 좋아한다. 습도가 자동으로 올라가는 천연 가습기이기 때문이다.",
    icon: "assets/icons/weather.png"
  },
  youtube: {
    title: "YouTube",
    text: "[MPD직캠] 알파드라이브원 건우 직캠 4K 'Cinnamon Shake' (ALPHA DRIVE ONE···",
    icon: "assets/icons/gw_youtube.jpg"
  },
  spotify: {
    title: "spotify",
    text: "톡 쏘는 Cinnamon Shake🎶",
    icon: "assets/icons/gw_spotify.jpg"
  },
  x: {
    title: "X",
    text: "❕❕❕❕❕ ··· 🤫",
    icon: "assets/icons/x.png"
  },
  music: {
    title: "음악",
    text: "Us - Keshi",
    icon: "assets/icons/gw_music.jpg"
  },
  calculator: {
    title: "계산기",
    text: "411×(4+3+3)+43×(3+3)+(43−4×3) = ?",
    icon: "assets/icons/calculator.png"
  }
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

  if (targetScreen.id === "memoScreen") {
    targetScreen.classList.remove("detail-open");
  }

  if (targetScreen.id === "phoneScreen" && typeof window.resetPhoneAppState === "function") {
    window.resetPhoneAppState();
  }

   if (targetScreen.id === "messagesScreen" && typeof window.resetMessagesAppState === "function") {
    window.resetMessagesAppState();
  }

   if (targetScreen.id === "photosScreen" && typeof window.resetPhotosAppState === "function") {
  window.resetPhotosAppState();
}

  if (targetScreen.id === "calendarScreen" && typeof window.resetCalendarAppState === "function") {
    window.resetCalendarAppState();
  }

    if (targetScreen.id === "kakaoScreen" && typeof window.resetKakaoAppState === "function") {
    window.resetKakaoAppState();
  }

    if (targetScreen.id === "instagramScreen" && typeof window.resetInstagramAppState === "function") {
    window.resetInstagramAppState();
  }

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

    button.classList.add("touching");

    setTimeout(() => {
      button.classList.remove("touching");
    }, 150);

    await action(button);
  });
}

/* 진입형 앱 */
openAppButtons.forEach((button) => {
  attachTouchFeedback(button, openAppWithAnimation);
});

/* 반응형 앱 */
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

/* 장식형 앱 */
dummyAppButtons.forEach((button) => {
  attachTouchFeedback(button, async (btn) => {
    await wait(60);
    btn.classList.remove("touching");
  });
});

/* =========================
   MEMO APP
========================= */
(function initMemoApp() {
  const memoScreen = document.getElementById("memoScreen");
  const memoPinnedCard = document.getElementById("memoPinnedCard");
  const memo7DaysCard = document.getElementById("memo7DaysCard");
  const memo30DaysCard = document.getElementById("memo30DaysCard");
  const memoFebruaryCard = document.getElementById("memoFebruaryCard");
  const memo2025Card = document.getElementById("memo2025Card");

  const memoDetailTitle = document.getElementById("memoDetailTitle");
  const memoDetailDate = document.getElementById("memoDetailDate");
  const memoDetailBody = document.getElementById("memoDetailBody");
  const memoDetailBack = document.querySelector(".memo-detail-back");

  if (!memoScreen) return;

  const memoData = {
    pinned: [
      { id: "idpw", title: "아이디/비번", meta: "2025. 11. 04.  티빙 네이버 로그인" },
      { id: "cardnum", title: "카드번호", meta: "2025. 02. 20.  우리은행" }
    ],
    week7: [
      { id: "guangzhou", title: "광저우", meta: "토요일  옷 / 아우터" }
    ],
    days30: [
      { id: "shopping", title: "장보기", meta: "2026. 03. 24.  항정살" },
      { id: "japan", title: "일본", meta: "2026. 03. 16.  돈키호테" },
      { id: "longbirthday", title: "롱이생일!", meta: "2026. 03. 10  선물 후보" },
      { id: "paris", title: "파리", meta: "2026.03.01  옷 / 아우터(+코트)" }
    ],
    february: [
      { id: "shanghai", title: "상하이", meta: "2026. 02. 26.  옷" },
      { id: "partyshopping", title: "막방 기념 파티-장보기", meta: "2025. 02. 08.  삼겹살 8인분 몇키로?" }
    ],
    year2025: [
      { id: "mama2025", title: "MAMA2025", meta: "2025. 11. 24.  스킨케어(+브링그린)" },
      { id: "aglio", title: "알리오올리오 레시피", meta: "2025. 10. 20.  올리브오일 / 면 / 마늘 / 페페론치노" },
      { id: "todo", title: "할 것", meta: "2025. 9. 30.  보플 영상 모니터링? 다시 보기" },
      { id: "packing", title: "숙소 짐싸기", meta: "2025. 09. 26.  침구? (이불/베개/매트리스-?)" }
    ]
  };

  const memoDetailData = {
    guangzhou: {
      date: "2026년 3월 28일 21:35",
      title: "광저우",
      type: "checklist",
      items: [
        { text: "옷 / 아우터", checked: true },
        { text: "잠옷 / 양말 / 속옷", checked: true },
        { text: "운동화 / 슬리퍼", checked: true },
        { text: "츄리닝", checked: true },
        { text: "모자", checked: true },
        { text: "세면도구(쓰고 넣기)", checked: false },
        { text: "스킨케어(쓰고 넣기)", checked: false },
        { text: "붓기빼기", checked: true },
        { text: "충전기 / 에어팟 / 맥스", checked: false },
        { text: "영양제 / 약", checked: true },
        { text: "입 테이프", checked: true },
        { text: "악세사리(팔찌/반지 등 꺼내두기)", checked: true },
        { text: "선글라스", checked: true },
        { text: "기타 .. 생각나면 추가", checked: false }
      ]
    },
    shopping: {
      date: "2026년 3월 24일 13:31",
      title: "장보기",
      type: "checklist",
      items: [
        { text: "항정살", checked: false },
        { text: "통마늘", checked: false },
        { text: "청양고추", checked: false },
        { text: "파스타면(링귀니)", checked: false },
        { text: "과자", checked: false },
        { text: "딸기(있나?)", checked: false },
        { text: "우삼겹 팩", checked: false },
        { text: "양파", checked: false },
        { text: "바나나우유", checked: false },
        { text: "콘푸라이트", checked: false },
        { text: "칼빔면", checked: false }
      ]
    },
    japan: {
      date: "2026년 3월 16일 22:16",
      title: "일본",
      type: "text",
      html: `
        <div class="memo-text-block">
          <p>- 돈키호테</p>
          <p>안약 / 휴족시간 / 과자 유명한거 / 온열안대 / 컵라면</p>
          <p>- 기념품?</p>
          <p>인형 같은거</p>
          <p><a href="#">https://youtu.be/1c7_NYeUF1g?si=9J2VeKzTrzUdON_g</a></p>
          <p><a href="#">https://youtu.be/U_22eCKqBik?si=FXvPGkbMVdsAX2B-</a></p>
        </div>
      `
    },
    longbirthday: {
      date: "2026년 3월 10일 13:43",
      title: "롱이생일!",
      type: "text",
      html: `
        <div class="memo-text-block">
          <p>- 선물 후보</p>
          <p>귀걸이<br>반지(너무티남)<br><strong>영양제?➡️홍삼(에브리타임)</strong><br><strong>+ 파리 가서 둘러보기</strong><br><strong>케이크 - 롱이한테 물어보기 딸기생크림케이크</strong></p>
          <p>홍삼세트 주문 / 간식들이랑 같이 넣어두기</p>
          <p>축하메시지<br>우리 씬롱이! 항상 어른스럽고 듬직한 아이지만<br>오늘만큼은 그 누구보다 환하게 웃는 네 모습을 보고싶다 :3<br>생일 너무너무 축하해!!</p>
          <p>편지 따로 준비? 아니면 카톡으로?</p>
          <p><strong>선물 챙겨서 자정 전에 롱이 방으로 가기!! 서프라이즈</strong><br>+ 낮에 어머님 연락 같이 드리기</p>
          <p>점심 - 장수면 컨텐츠, 미역국 같이 끓여서 먹기<br>저녁 - 스케줄 끝나고 회사에서-시간 맞춰서 주문해두기</p>
        </div>
      `
    },
    paris: {
      date: "2026년 3월 1일 00:26",
      title: "파리",
      type: "checklist",
      items: [
        { text: "옷 / 아우터(+코트)", checked: true },
        { text: "잠옷 / 양말 / 속옷", checked: true },
        { text: "운동화 / 슬리퍼", checked: true },
        { text: "집업", checked: true },
        { text: "모자 - ?", checked: true },
        { text: "세면도구(쓰고 넣기)", checked: false },
        { text: "스킨케어(쓰고 넣기)", checked: false },
        { text: "붓기빼기", checked: true },
        { text: "충전기 / 에어팟 / 맥스", checked: false },
        { text: "영양제 / 약", checked: true },
        { text: "입 테이프", checked: true },
        { text: "선글라스", checked: true },
        { text: "필름카메라", checked: true }
      ],
      extraHtml: `<p>도착해서 롱이랑 영통하기<br>+ 롱이 선물 찾아보기</p>`
    },
    shanghai: {
      date: "2026년 2월 26일 23:10",
      title: "상하이",
      type: "checklist",
      items: [
        { text: "옷", checked: true },
        { text: "잠옷 / 양말 / 속옷", checked: true },
        { text: "운동화 / 슬리퍼", checked: true },
        { text: "편한 옷 상하이", checked: true },
        { text: "모자", checked: true },
        { text: "세면도구(쓰고 넣기)", checked: false },
        { text: "스킨케어(쓰고 넣기)", checked: false },
        { text: "붓기빼기", checked: true },
        { text: "충전기 / 에어팟 / 맥스", checked: false },
        { text: "영양제 / 약", checked: true },
        { text: "입 테이프", checked: true },
        { text: "선글라스", checked: true },
        { text: "목도리", checked: true }
      ]
    },
    partyshopping: {
      date: "2026년 2월 8일 16:13",
      title: "막방 기념 파티-장보기",
      type: "checklist",
      items: [
        { text: "삼겹살 8인분 몇키로?", checked: false },
        { text: "통마늘", checked: false },
        { text: "청양고추", checked: false },
        { text: "쌈장", checked: false },
        { text: "비빔면(or 칼빔면)", checked: false },
        { text: "쌈채소/버섯/양파", checked: false },
        { text: "제로콜라", checked: false },
        { text: "맥주", checked: false },
        { text: "바나나우유", checked: false },
        { text: "콘푸라이트", checked: false },
        { text: "딸기", checked: false },
        { text: "불닭소스", checked: false },
        { text: "훠궈 재료 - 청경채/목이버섯/", checked: false }
      ]
    },
    mama2025: {
      date: "2025년 11월 24일 20:41",
      title: "MAMA2025",
      type: "checklist",
      items: [
        { text: "스킨케어(+브링그린)", checked: false },
        { text: "세면도구", checked: false },
        { text: "운동화 / 슬리퍼", checked: false },
        { text: "트레이닝복", checked: false },
        { text: "모자", checked: false },
        { text: "옷 / 겉옷", checked: false },
        { text: "잠옷 / 양말 / 속옷", checked: false },
        { text: "붓기빼기", checked: false },
        { text: "충전기 / 에어팟 / 맥스", checked: false },
        { text: "영양제 / 약", checked: false },
        { text: "입 테이프", checked: false },
        { text: "선글라스 / 안경", checked: false },
        { text: "목도리", checked: false },
        { text: "가방(메신저백/", checked: false }
      ],
      extraHtml: `<p>캐리어 싸는거 브이로그 찍기</p>`
    },
    aglio: {
      date: "2025년 10월 20일 11:28",
      title: "알리오올리오 레시피",
      type: "text",
      html: `
        <div class="memo-text-block">
          <p>올리브오일 / 면 / 마늘 / 페페론치노</p>
          <p>면 8분 익히기(소금 살짝)<br>올리브오일 2/3컵(10큰술 정도), 다진마늘 1티스푼, 편마늘(4개 정도), 페페론치노 볶기<br>면, 면수 2국자 넣고 볶기 / 소금으로 간</p>
          <p>1인분 기준</p>
        </div>
      `
    },
    todo: {
      date: "2025년 9월 30일 23:45",
      title: "할 것",
      type: "checklist",
      items: [
        { text: "보플 영상 모니터링? 다시 보기", checked: true },
        { text: "옷장 정리", checked: true },
        { text: "챌린지, 신곡 안무 카피", checked: false },
        { text: "PT", checked: false },
        { text: "중국어 공부", checked: false },
        { text: "보컬룸 - 발성연습", checked: false },
        { text: "", checked: false }
      ],
      extraHtml: `
        <p>보플-티빙<br>3회 후반 - 첫만남 롱이 파트<br>4회 후반 - 위플래쉬<br>7회 후반 - 락<br>9회 - 럭키마초 / 체인스<br>10회, 11회</p>
        <p>유튜브 클립 모음<br><a href="#">https://youtube.com/playlist?list=PLTZxf74YKwfYCaAnRlOr3nDqvWD_2rvwm&si=pMevfXZR-hBa2bPc</a></p>
      `
    },
    packing: {
      date: "2025년 9월 26일 10:19",
      title: "숙소 짐싸기",
      type: "checklist",
      items: [
        { text: "침구? (이불/베개/매트리스-?)", checked: false },
        { text: "옷", checked: true },
        { text: "신발", checked: true },
        { text: "악세사리/모자/목도리/안경/가방 등", checked: true },
        { text: "화장품/스킨케어/헤어롤 등", checked: true },
        { text: "세면도구/화장실", checked: false },
        { text: "전자기기(에어팟, 맥스, 멀티탭, 충전기 등)", checked: false },
        { text: "상비약, 영양제", checked: true },
        { text: "텀블러", checked: true },
        { text: "쓰레기통/돌돌이/", checked: false },
        { text: "책(자료, 책, 앨범 등 지류)", checked: true },
        { text: "가습기", checked: true }
      ]
    }
  };

  function createMemoListItems(items) {
    return items.map((item) => `
      <button class="memo-list-item" type="button" data-memo-id="${item.id}">
        <div class="memo-item-title">${item.title}</div>
        <div class="memo-item-meta">${item.meta}</div>
      </button>
    `).join("");
  }

  function renderMemoLists() {
    if (memoPinnedCard) memoPinnedCard.innerHTML = createMemoListItems(memoData.pinned);
    if (memo7DaysCard) memo7DaysCard.innerHTML = createMemoListItems(memoData.week7);
    if (memo30DaysCard) memo30DaysCard.innerHTML = createMemoListItems(memoData.days30);
    if (memoFebruaryCard) memoFebruaryCard.innerHTML = createMemoListItems(memoData.february);
    if (memo2025Card) memo2025Card.innerHTML = createMemoListItems(memoData.year2025);
  }

  function renderChecklist(items) {
    return `
      <div class="memo-checklist">
        ${items.map((item) => `
          <div class="memo-check-item ${item.checked ? "checked" : "unchecked"}">
            <div class="memo-check-circle"></div>
            <div class="memo-check-text">${item.text || "&nbsp;"}</div>
          </div>
        `).join("")}
      </div>
    `;
  }

  function openMemoDetail(memoId) {
    const memo = memoDetailData[memoId];
    if (!memo || !memoDetailTitle || !memoDetailDate || !memoDetailBody) return;

    memoDetailDate.textContent = memo.date;
    memoDetailTitle.textContent = memo.title;

    if (memo.type === "checklist") {
      memoDetailBody.innerHTML = renderChecklist(memo.items) + (memo.extraHtml ? memo.extraHtml : "");
    } else {
      memoDetailBody.innerHTML = memo.html;
    }

    memoScreen.classList.add("detail-open");
  }

  function closeMemoDetail(event) {
    if (event) event.stopPropagation();
    memoScreen.classList.remove("detail-open");
  }

  memoScreen.addEventListener("click", (event) => {
    const item = event.target.closest(".memo-list-item");
    if (item && memoScreen.classList.contains("active")) {
      openMemoDetail(item.dataset.memoId);
    }
  });

  if (memoDetailBack) {
    memoDetailBack.addEventListener("click", closeMemoDetail);
  }

  renderMemoLists();
})();



/* =========================
   MESSAGES APP
========================= */
(function initMessagesApp() {
  const messagesScreen = document.getElementById("messagesScreen");
  if (!messagesScreen) return;

  const messagesThreadList = document.getElementById("messagesThreadList");
  const messagesDetailPage = document.getElementById("messagesDetailPage");
  const messagesConversation = document.getElementById("messagesConversation");
  const messagesDetailScroll = document.getElementById("messagesDetailScroll");
   const messagesListScroll = messagesScreen.querySelector(".messages-list-scroll");

  const messagesDetailBack = messagesScreen.querySelector(".messages-detail-back");
  const messagesDetailName = document.getElementById("messagesDetailName");
  const messagesDetailAvatar = document.getElementById("messagesDetailAvatar");
  const messagesDetailAvatarChar = document.getElementById("messagesDetailAvatarChar");
  const messagesInputPlaceholder = document.getElementById("messagesInputPlaceholder");

  if (!messagesThreadList || !messagesDetailPage || !messagesConversation) return;

  const messageThreads = [
{
  id: "longi",
  name: "롱이❤️ ALD1",
  avatar: "롱",
  time: "00:13",
  inputType: "iMessage",
  messages: [
    { type: "meta-center", text: "2월 26일 (목) 23:43" },

    { type: "voice-me" },
    { type: "text-you", text: "몇살이에요 형" },
    { type: "text-me", text: "스물넷이다 이제." },
    { type: "text-you", text: "天哪;;" },

    { type: "meta-center", text: "3월 1일 (일) 11:20" },

    { type: "text-me", text: "롱이보고싶따~~~~~" },
    { type: "text-me", text: "ㅠㅠ" },
    { type: "text-me", text: "롱아 나 안 보고싶어????" },
    { type: "text-you", text: "형 아직 한국이자나요..;;" },
    { type: "text-you", text: "비행기도 안탔는데 ㅋㅋㅋ" },
    { type: "text-me", text: "같이 가고 싶었는데ㅠㅠ" },
    { type: "text-you", text: "me too 근데 어쩔수없어요" },
    { type: "text-you", text: "저 대신 잘하고 와용 ㅜ.ㅜ" },
    { type: "text-me", text: "너가없는데어떻게해" },
    { type: "text-me", text: "아 롱이보고싶다아아아~~~~" },
    { type: "text-you", text: "😬😬😬" },
    { type: "image-you", src: "assets/pictures/message_image_1.JPEG" },
    { type: "text-me", text: "롱아아아아❤️❤️❤️❤️❤️" },
    { type: "text-me", text: "조금만 참아 알았지????? :3" },
    { type: "text-you", text: "형이나 좀 참아봐요.. ;;" },
    { type: "text-you", text: "너무 着急了" },
    { type: "text-you", text: "ㅋㅋ" },
    { type: "voice-you" },
    { type: "text-you", text: "조심히 다녀와요 530" },
    { type: "text-you", text: "我想你😬😬" },

    { type: "meta-center", text: "3월 4일 (수) 21:14" },

    { type: "image-me", src: "assets/pictures/message_image_2.jpg" },
    { type: "text-me", text: "아~롱이보고싶은날" },
    { type: "text-me", text: "롱이가 없으니까 즐겁지가 않네" },
    { type: "text-me", text: "ㅠ.ㅠ ❤️❤️" },
    { type: "text-you", text: "ㅋㅋ" },
    { type: "image-you", src: "assets/pictures/message_image_3.JPEG" },
    { type: "text-you", text: "상원형이 보내줬는데" },
    { type: "text-you", text: "되게 신나보이는데요" },
    { type: "text-you", text: "😬😬😬😬" },
    { type: "text-me", text: "아 뭐야" },
    { type: "text-me", text: "아니야" },
    { type: "text-me", text: "오해야 저거는" },
    { type: "text-me", text: "와 되게 절묘하게 찍혔네" },
    { type: "text-me", text: "ㅋㅋ" },
    { type: "text-you", text: "농담" },
    { type: "text-you", text: "더 즐겁게 보고와용" },
    { type: "text-you", text: "~~~~😬😎😎" },
    { type: "text-me", text: "🥹🥹내일 봐 롱아" },
    { type: "text-me", text: "형 없다고 울지 말구~~~~ㅋㅋ" },
    { type: "text-me", text: "스물넷이다." },
    { type: "text-you", text: "몇사리에요" },
    { type: "text-you", text: "wow" },
    { type: "text-you", text: "ㅋㅋ" },
    { type: "text-you", text: "통했네~" },
    { type: "text-me", text: "❤️❤️❤️❤️❤️" },

    { type: "meta-center", text: "3월 6일 (금) 20:19" },

    { type: "text-me", text: "롱아" },
    { type: "text-me", text: "생일 선물 뭐 갖고싶은 거 있어?" },
    { type: "text-you", text: "에" },
    { type: "text-you", text: "괜찮아용" },
    { type: "text-you", text: "다 갖고 잇어서 没关系~" },
    { type: "text-me", text: "아아아아아아롱아아아..........." },
    { type: "text-me", text: "형이 진짜진짜꼭ㄲ꼭 챙기고 싶어서 그래" },
    { type: "text-me", text: "내가 잘 챙겨주기로 했잖아" },
    { type: "text-you", text: "건우형 이미 너~~~~무 잘 챙겨줘서" },
    { type: "text-you", text: "갠찮아요 ㅎㅎ" },
    { type: "text-you", text: "진짜 really fine" },
    { type: "text-you", text: "스케줄 끝나고 맛있는거 먹으러가용" },
    { type: "text-you", text: "신난다야~~~~" },
    { type: "text-me", text: "롱아아아아................." },
    { type: "text-me", text: "나 눈물날 것 같애" },
    { type: "text-me", text: "ㅠ.ㅠ" },
    { type: "text-me", text: "내가 앞으로도 더더더더더더ㅓ더" },
    { type: "text-me", text: "잘 챙길게" },
    { type: "text-me", text: "알았지??!?!?????" },
    { type: "text-you", text: "넹.. 숙소가서 통화해용" },
    { type: "text-you", text: "加油!" },
    { type: "text-me", text: "❤️❤️❤️❤️❤️" },

    { type: "meta-center", text: "3월 9일 (월) 14:02" },

    { type: "text-you", text: "형" },
    { type: "text-you", text: "횽" },
    { type: "text-you", text: "집 앞에 붕어빵 가게? 왔어용" },
    { type: "text-you", text: "!!!!!!" },
    { type: "text-me", text: "오 날 풀렸는데도 아직 하시나보네?" },
    { type: "text-you", text: "근데 저 현금이 없어서 못샀어요" },
    { type: "text-you", text: "sorry" },
    { type: "text-you", text: "오다가 사와줘용" },
    { type: "text-me", text: "내가 배달의민족 라이더야??" },
    { type: "text-you", text: "형이랑 같이 나눠먹고 시펐는데" },
    { type: "text-me", text: "아주 형을 막 부려먹ㅇ" },
    { type: "text-me", text: "아아아앙롱아 형이랑 같이 먹고싶어서" },
    { type: "text-me", text: "형 생각한거야???????❤️❤️❤️❤️❤️" },
    { type: "text-me", text: "팥으로 다 사갈게에에에~~~~" },
    { type: "text-me", text: "❤️❤️❤️❤️❤️❤️" },
    { type: "text-me", text: "우리롱이 따뜻한거 먹여줘야지" },
    { type: "text-me", text: "품에 넣고 뛴다 이제" },
    { type: "text-you", text: "天哪" },
    { type: "text-you", text: "몇살이에요 대체;;" },

    { type: "meta-center", text: "3월 12일 (목) 00:00" },

    { type: "text-me", text: "생일 진짜진짜진짜 축하해" },
    { type: "text-me", text: "내가 처음 마지막 둘 다 축하해줌" },
    { type: "text-me", text: "맞지?????" },
    { type: "text-me", text: "잘 자고 내 꿈 꿔야 돼~~ :3" },
    { type: "text-me", text: "사롱롱해❤️❤️❤️" },
    { type: "text-you", text: "ㅋㅋㅋ챙겨줘서고마워요" },
    { type: "text-you", text: "형도 잘자용~" },
    { type: "text-you", text: "晚安" },
    { type: "text-you", text: "520😬" },
    { type: "text-me", text: "❤️❤️❤️❤️❤️❤️" },
    { type: "text-me", text: "나도 486~~~~" },
    { type: "text-me", text: "486 = 520 같은 뜻" },
    { type: "text-you", text: "oh 486 새로 알앗어요!! 신기하다" },
    { type: "text-you", text: "😬😬😬😬😬❤️" },

    { type: "meta-center", text: "3월 15일 (일) 21:35" },

    { type: "text-you", text: "키키치? 형" },
    { type: "text-me", text: "롱아" },
    { type: "text-me", text: "너도 이러기야........?" },
    { type: "text-me", text: "ㅠㅠㅠㅠㅠㅠㅠㅠ" },
    { type: "text-you", text: "형은 이거 닮았어요ㅋㅋ" },
    { type: "image-you", src: "assets/pictures/message_image_4.jpg" },
    { type: "text-me", text: "아아앙롱아내가왜저거야 ㅜ.ㅜ" },
    { type: "text-you", text: "상혀니가 보낸것중에 닮았어용 ㅎㅎ" },
    { type: "text-you", text: "물론 키키치 그 노란원숭이도 쫌" },
    { type: "text-me", text: "야 씬롱아" },
    { type: "text-me", text: "노란원숭이안닮았어나ㅠㅠㅠㅠㅠㅠㅠㅠ" },
    { type: "text-you", text: "아니아니아니" },
    { type: "text-you", text: "저 pink 닮았ㅅ어용" },
    { type: "text-me", text: "..그건쫌귀엽네ㅋㅋ" },
    { type: "text-me", text: "왜닮았는데??????" },  
    { type: "text-me", text: "형생각해준거야??저거보면앞으로도쭉내생각하겠네" },  
    { type: "text-me", text: "ㅎㅎㅎㅎㅎㅎ❤️❤️" },  
    { type: "text-you", text: "😬😬..." },
    { type: "text-me", text: "넌 완전 이거" },  
    { type: "image-me", src: "assets/pictures/message_image_5.jpg" },
    { type: "text-you", text: "....저 진짜 이거 닮앗어요?" },
    { type: "text-you", text: "진짜???" },
    { type: "text-me", text: "?????" },
    { type: "text-you", text: "天哪.." },
    { type: "text-you", text: "카톡사진바꿧네~ ㅋㅋㅋㅋㅋ" },

    { type: "meta-center", text: "3월 22일 (일) 20:15" },
    { type: "text-me", text: "롱아..... 다시 한 번 미안해" },
    { type: "text-me", text: "포장이 너무 비슷해서 헷갈렸ㅅ어ㅠㅠㅠ" },
    { type: "text-me", text: "괜찮아이제??" },
    { type: "text-you", text: "하.." },
    { type: "text-you", text: "됏어요.. 진짜매워" },
    { type: "text-you", text: "太辣了" },
    { type: "text-you", text: ";;;" },
    { type: "text-me", text: "ㅠㅠㅠㅠㅠㅠ미안해" },
    { type: "text-me", text: "真的对不起ㅠㅠㅠ" },
    { type: "text-you", text: "됐어요.." },
    { type: "text-you", text: "괜찮아졋어요 이제" },
    { type: "text-you", text: "ㅡㅡ" },
    { type: "text-me", text: "....🥹❤️❤️" },

    { type: "meta-center", text: "3월 23일 (월) 21:22" },

    { type: "text-me", text: "롱아" },
    { type: "text-me", text: "롱아아~~~~~" },
    { type: "text-me", text: "롱" },
    { type: "text-me", text: "아" },
    { type: "text-me", text: "롱롱" },
    { type: "text-me", text: "롱거야" },
    { type: "text-me", text: "롱띠야" },
    { type: "text-me", text: "ㅋㅋ" },
    { type: "text-me", text: "뭐해" },
    { type: "text-me", text: "왜안읽는데" },
    { type: "text-me", text: "?????????????????" },
    { type: "text-you", text: "형...몇살이에요 진짜" },
    { type: "text-you", text: "너무 시끄러" },
    { type: "text-me", text: "아아아아 롱아 나 지금 올라간다???" },
    { type: "text-you", text: "넹" },
    { type: "text-you", text: "재밌는거 봐요" },
    { type: "text-you", text: "오징어집 식탁에 있는거 갖고와용" },
    { type: "text-you", text: "신난다야~~~~~~" },

    { type: "meta-center", text: "3월 25일 (수) 23:35" },

    { type: "text-me", text: "롱아 잘 자 오늘도 내 꿈 꿔" },
    { type: "text-me", text: "롱쿨러~~~" },
    { type: "text-me", text: "롱나잇~~~~❤️❤️" },
    { type: "text-you", text: "晚安😬😬❤️" },

    { type: "meta-center", text: "3월 26일 (목) 21:25" },
    { type: "text-you", text: "거누형" },
    { type: "text-you", text: "저도 형 옛날사진 보고싶어요" },
    { type: "text-you", text: "저는 옛날사진 넘 많은데" },
    { type: "text-you", text: "형은 별로 없잖아요" },
    { type: "text-you", text: "이거 좀 불공평 이라고 생각해요" },
    { type: "text-you", text: "!!!!" },
    { type: "image-me", src: "assets/pictures/message_image_6.jpg" },
    { type: "text-me", text: "..선물🎁" },
    { type: "text-me", text: "ㅋㅋ" },
    { type: "text-you", text: "형 카페에서 일했었어요???" },
    { type: "text-you", text: "Wow 멋있다!" },
    { type: "text-me", text: "응 나 예전에 잠깐 알바..ㅎㅎ" },
    { type: "text-me", text: "내가 아아 만들어줄게 롱아🥰❤️" },
    { type: "text-you", text: "Oh 전 단게좋아요" },
    { type: "text-me", text: ".....나 딸기라떼도 잘 만들어." },
    { type: "text-you", text: "지짜요????" },
    { type: "text-you", text: "딸기 맛있겠다야~~~" },
    { type: "text-you", text: "딸기~ 딸기~🍓" },


    { type: "meta-center", text: "(어제) 19:34" },

    { type: "text-you", text: "형 저 못내려가용" },
    { type: "text-you", text: "상혀니 우리 방 온대요" },
    { type: "text-you", text: "동생들 놀아줘야 돼~~😎😎" },
    { type: "text-me", text: "헐" },
    { type: "text-me", text: "형은?" },
    { type: "text-me", text: "형은" },
    { type: "text-me", text: "형은." },
    { type: "text-me", text: "오기로 약속했잖아" },
    { type: "text-me", text: "진짜 완전 기대했는데" },
    { type: "text-me", text: "동생들만 놀아주고 형은 거들떠도 안보고" },
    { type: "text-me", text: "롱아 너무하다" },
    { type: "text-me", text: "너 우선순위가 누구야" },
    { type: "text-me", text: "오늘 이 시간만을 기다렸는데............" },
    { type: "text-you", text: "형 오버 좀 stop" },
    { type: "text-you", text: "어제도 내가 갔잖아요 ㅡㅡ" },
    { type: "text-me", text: "오늘도 내가 먼저 약속한거잖아" },
    { type: "text-me", text: "표에 먼저 적은거잖아" },
    { type: "text-me", text: "진짜 형을 이렇게 바람맞히고ㅠㅠ" },
    { type: "text-you", text: "바람맞히고?" },
    { type: "text-you", text: "그게 뭐ㅔ요" },
    { type: "text-you", text: "sorry" },
    { type: "text-you", text: "이따가 편의점 간다고 나올게용" },
    { type: "text-you", text: "😬😬😬" },
    { type: "text-me", text: "너 이러면 내가 풀릴 줄 알ㄱ" },
    { type: "text-you", text: "❤️❤️❤️" },
    { type: "text-me", text: "..연락해 맞춰서 나와있을게" },
    { type: "text-me", text: "롱이 좋아하는 과자 다 사줄게~~~" },
    { type: "text-me", text: "ㅎㅎ❤️" },

    { type: "meta-center", text: "(오늘) 00:00" },

    { type: "text-me", text: "롱아 오늘도 잘자고" },
    { type: "text-you", text: "네 형꿈꿀게요" },
    { type: "text-me", text: "뭐야" },
    { type: "text-me", text: "그래..." },
    { type: "text-me", text: "그럼 내가 晚安~~❤️" },
    { type: "read-status", text: "읽음: 00:13" },
    { type: "text-you", text: "ㅋㅋㅋ잘자용 형도" }
  ]
},
     
{
  id: "jungsanghyun",
  name: "정상현 ALD1",
  avatar: "정",
  time: "어제",
  inputType: "iMessage",
  messages: [
    { type: "meta-center", text: "3월 23일 (월) 21:22" },

    { type: "text-me", text: "윗층에 있던 오징어집" },
    { type: "text-me", text: "너가 먹었냐 상현아" },

    { type: "text-you", text: "므에엥?" },
    { type: "text-you", text: "왜요???" },
    { type: "text-you", text: "두 개 있길래 하나 먹었는데" },
    { type: "text-you", text: "근데 어떻게 알았지 소름" },

    { type: "text-me", text: "너밖에 없지 아무래도;;" },
    { type: "text-me", text: "하나 더 먹으려다가 없어서 롱이 개빡침" },

    { type: "text-you", text: "......." },
    { type: "text-you", text: ";;죄송.." },

    { type: "text-me", text: "아냐 내가 4개 사둘걸 그랬다.." },

    { type: "text-you", text: "글킨함 더 많이 사둬요 좀" },

    { type: "text-me", text: "야" },
    { type: "text-me", text: ";;" },

    { type: "text-you", text: "sorry..🙏🙏" },

    { type: "meta-center", text: "3월 25일 (수) 21:18" },

    { type: "text-you", text: "형 짐 다 쌌어여???" },
    { type: "text-you", text: "겉옷 뭐 챙기지" },
    { type: "text-you", text: "ㅠㅠㅠ" },
    { type: "text-you", text: "더우려나 거기...." },

    { type: "text-me", text: "21/27도라는데?" },
    { type: "text-me", text: "더울듯" },
    { type: "text-me", text: "난 그래서 셔츠 같은걸로 챙겼는데" },

    { type: "text-you", text: "그 파란색?????" },

    { type: "text-me", text: "응..;;" },

    { type: "text-you", text: "역시 애착 blue shirt~" },
    { type: "text-you", text: "Weather information 고마워용~~~~😽😽😽" },

    { type: "meta-center", text: "(어제) 20:55" },

    { type: "text-you", text: "형 편의점 가지" },
    { type: "text-you", text: "내것도 사다줘요" },
    { type: "text-you", text: "~~~~" },

    { type: "text-me", text: "뭐야 어떻게 알았어" },

    { type: "text-you", text: "나 지금 시니롱이방~" },
    { type: "text-you", text: "다 들음 오땅 사러 가는거" },

    { type: "text-me", text: "넌 뭐 맨날 거기 가있냐" },
    { type: "text-me", text: "거기서 살어라 아주.." },

    { type: "text-you", text: "에에엥" },
    { type: "text-you", text: "형 맨날 자잖아" },
    { type: "text-you", text: "!!!!! 혼자 심심하단말이에여" },
    { type: "text-you", text: "여기는 심심할 틈이 없음 그냥" },
    { type: "text-you", text: "와 롱이형 방금 또 윈드밀 시작" },
    { type: "text-you", text: "신기록" },
    { type: "text-you", text: "미쳤ㄷㅏ" },
    { type: "text-you", text: "와" },

    { type: "text-me", text: "...." },
    { type: "text-me", text: "그래보여..." },
    { type: "text-me", text: "뭐 사가?" },

    { type: "text-you", text: "ㅈㅔ로콜라랑 비쵸비랑" },
    { type: "text-you", text: "푸딩도 있으면 하나" },
    { type: "text-you", text: "꼬북칩 초코도" },
    { type: "text-you", text: "그리고 아이스크림?" },

    { type: "text-me", text: "..." },

    { type: "text-you", text: "또~~~" },

    { type: "text-me", text: "그만" },
    { type: "text-me", text: "내일 또 사줄테니까 그정도만 사자.." },
    { type: "text-me", text: "알겠지..?" },
    { type: "read-status", text: "읽음: 어제" },


    { type: "text-you", text: "네에.." },
    { type: "text-you", text: "빨리와여~~~🕺💃🕺💃" }
  ]
},
     
{
  id: "zhouanxin",
  name: "조우안신 ALD1",
  avatar: "조",
  time: "어제",
  inputType: "iMessage",
  messages: [
    { type: "meta-center", text: "3월 23일 (월) 21:52" },

    { type: "text-me", text: "안신아 롱이 뭐해" },
    { type: "text-you", text: "???" },
    { type: "text-me", text: "전화를 안 받는데" },
    { type: "text-you", text: "씬롱 지금 씻는 중" },
    { type: "text-me", text: "20분 뒤에 간다고 전해줘 ㅎㅎ" },
    { type: "text-you", text: "나 나갈래" },

    { type: "meta-center", text: "3월 24일 (화) 21:23" },

    { type: "text-me", text: "안신아" },
    { type: "text-you", text: "씬롱 샤워 중" },
    { type: "text-you", text: ";;" },
    { type: "text-me", text: "쎼쎼..ㅎㅎ" },

    { type: "meta-center", text: "3월 24일 (화) 16:48" },

    { type: "text-me", text: "안신아" },
    { type: "text-me", text: "상현이 아직도 너희 방에 있니" },

    { type: "text-you", text: "샤오쭈 데려가" },
    { type: "text-you", text: "이아라ㅜㄱㅍㅇ샤오쭈아니라ㄱ고!!" },
    { type: "text-you", text: "형저윗층에서노는중" },
    { type: "text-you", text: "우리저녁머먹어요??" },
    { type: "text-you", text: "방금 샤오쭈" },
    { type: "text-you", text: "역시샤오쭈.." },
    { type: "text-you", text: "그냥 씬롱 샤오쭈 다 데려가" },
    { type: "text-you", text: "제발" },

    { type: "text-me", text: "나도 갈게 안신아~" },

    { type: "text-you", text: "🤯🤯🤯🤯🤯" },

    { type: "meta-center", text: "3월 31일 (화) 20:12" },

    { type: "text-you", text: "ㅆㄹ ㅅㅇ ㅈ" },
    { type: "text-me", text: "간식 먹고 싶은 거 있어? 롱이한테도 물어봐봐" },
    { type: "text-you", text: "냉장고에 빙홍차 있어" },
    { type: "text-you", text: "갖다줘요 谢谢" },
    { type: "text-me", text: "씬롱이는? 오땅?" },
    { type: "text-you", text: "당연~" },

    { type: "meta-center", text: "(어제) 20:46" },

    { type: "text-you", text: "ㅆㄹㅅㅇㅈ" },
    { type: "text-you", text: "올 때 빙홍차" },
    { type: "text-me", text: "ㅇㅋ~" },

    { type: "read-status", text: "읽음: 어제" }
  ]
},
     
   {
  id: "kimjunseo",
  name: "김준서 ALD1",
  avatar: "김",
  time: "수요일",
  inputType: "iMessage",
  messages: [
    { type: "meta-center", text: "3월 22일 (일) 15:01" },

    { type: "text-you", text: "건우야" },
    { type: "text-you", text: "애들이 이따 훠궈 먹자는데" },
    { type: "text-you", text: "너희 층에서 다같이 먹을까?" },

    { type: "text-me", text: "좋아요~" },
    { type: "text-me", text: "여기도 물어볼게요" },
    { type: "text-me", text: "7시쯤??" },

    { type: "text-you", text: "오키 맞춰서 다같이 데리고 갈게" },

    { type: "text-me", text: "넹~" },
    { type: "text-me", text: "맛있겠다" },
    { type: "text-me", text: "재료 거기서 손질해서 올거에요??" },
    { type: "text-me", text: "아니 근데" },
    { type: "text-me", text: "왜 매번 훠궈는 우리층에서 먹는거지" },
    { type: "text-me", text: "루틴이 됐어 아주" },

    { type: "text-you", text: "ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ" },
    { type: "text-you", text: "여기서 다 해갈게.... ㅎㅎ" },
    { type: "text-you", text: "롱이 추천 맛집이야 윗층이" },
    { type: "text-you", text: "롱이는 안 내려오나?" },

    { type: "text-me", text: "아 롱이 여기 같이 있는데 지금" },
    { type: "text-me", text: "요리 너무 못하는 것 같다고 충격받아서" },
    { type: "text-me", text: "자긴 빠지겠다나 ..." },
    { type: "text-me", text: "하.. 너무 귀엽다" },

    { type: "text-you", text: ".........?" },
    { type: "text-you", text: "그래 7시까지 내려갈게 좀 이따 보자~" },

    { type: "meta-center", text: "4월 1일 (수) 17:46" },

    { type: "text-you", text: "야 건우야..." },
    { type: "text-you", text: "너가 안신이 준 선물 내가 한 번 던져봤다가" },
    { type: "text-you", text: "망가트렸는ㄷㅔ" },
    { type: "text-you", text: "너한테도 사과해야 할 것 같아서ㅠㅠㅜ" },
    { type: "text-you", text: "진짜 미안..............." },
    { type: "text-you", text: "아 왜 다 부숴먹지" },
    { type: "text-you", text: "진짜진짜너무미안..........." },
    { type: "text-you", text: "내가 새로 사주던지 할게 ㅠㅠㅠ" },

    { type: "text-me", text: "에? 괜찮아요" },
    { type: "text-me", text: "그거 2개라" },
    { type: "text-me", text: "안신이 갖고 싶어하면 하나 더 줘도 돼용" },
    { type: "text-me", text: "ㅋㅋㅋㅋㅋㅋㅋㅋㅋ" },
    { type: "text-me", text: "그리고 그거 테무에서 천원이래" },
    { type: "text-me", text: "난 오만원에 샀는데" },
    { type: "text-me", text: "................" },
    { type: "text-me", text: "암튼 괜찮아요.." },
     
    { type: "read-status", text: "읽음: 4월 1일" },

    { type: "text-you", text: "...응 사실 이미 알고 있긴 했어.." },
    { type: "text-you", text: "앞으로 같이 서치해줄게..ㅎㅎ" }
  ]
},
     
{
  id: "leeleo",
  name: "이리오 ALD1",
  avatar: "이",
  time: "화요일",
  inputType: "iMessage",
  messages: [
    { type: "meta-center", text: "3월 22일 (일) 15:08" },

    { type: "text-me", text: "형" },
    { type: "text-me", text: "윗층에서 이따 저녁에 훠궈먹자고" },
    { type: "text-me", text: "우리층에서 같이 먹자는데 어때요?" },
    { type: "text-me", text: "괜찮아요??" },

    { type: "text-you", text: "훠궈????" },
    { type: "text-you", text: "너무 좋은데??" },
    { type: "text-you", text: "몇시에 먹어 우리" },

    { type: "text-me", text: "음 저녁이니까 6-7시 쯤..?" },

    { type: "text-you", text: "좋다 7시 정도 ㅎㅎ" },

    { type: "text-me", text: "넹 연락할게요~~~" },
    { type: "text-me", text: "재료 준비해온다고 그냥 있으래요" },
    { type: "text-me", text: "ㅋㅋ 더 누워계십쇼." },

    { type: "text-you", text: "고맙다잉 ~~ㅎㅎ" },

    { type: "meta-center", text: "4월 1일 (수) 15:14" },

    { type: "text-me", text: "형" },
    { type: "text-me", text: "우리 카페 갔다가 이제 들어가는데" },
    { type: "text-me", text: "뭐 사갈까요?" },
    { type: "text-me", text: "여기 치즈케이크 있음" },

    { type: "text-you", text: "오" },
    { type: "text-you", text: "그럼 케이크 하나만 사와주라~!" },
    { type: "text-you", text: "Thanks 건우!!!!!!" },
    { type: "text-you", text: "좀 감동이다...ㅠㅠ" },

    {
      type: "text-me",
      text: "롱이가 먹고 너무 좋아해서 더 포장해갈까 하니까 다 사다주고 싶대요 ㅋㅋ"
    },

    { type: "text-you", text: "건우랑 롱이 키운 보람이 있네" },
    { type: "text-you", text: "🥹🥹🥹" },

    { type: "text-me", text: "횽 좀만 기다려줘요" },
    { type: "text-me", text: "cake party해용~~" },
    { type: "text-me", text: "딸기도 사고 치즈도 샀어용" },
    { type: "text-me", text: "신난다야~~~~" },

    { type: "read-status", text: "읽음: 4월 1일" },

    { type: "text-you", text: "빨리와 bro~ㅎㅎ" }
  ]
},
     
{
  id: "arno",
  name: "아르노 ALD1",
  avatar: "아",
  time: "월요일",
  inputType: "iMessage",
  messages: [
    { type: "meta-center", text: "3월 24일 (화) 13:14" },

    { type: "text-you", text: "건우" },
    { type: "text-you", text: "밀크티 시킬건데 먹을래?" },
    { type: "text-you", text: "茶百道" },

    { type: "text-me", text: "오 좋아요 감사합니다~~" },

    { type: "text-you", text: "메뉴 보고 알려줘~" },

    { type: "text-me", text: "차백도 뭐가 맛있지?" },
    { type: "text-me", text: "형은 뭐 골랐어요?" },

    { type: "text-you", text: "난 타로볼 밀크티~" },

    { type: "text-me", text: "그럼 저도 같은걸로 도전!" },

    { type: "text-you", text: "30분 정도 걸린대~" },

    { type: "text-me", text: "제가 가져올게요~" },
    { type: "text-me", text: "잘 먹을게요 감사해용~~ :3" },
    { type: "text-me", text: "오 이거 되게 맛있다" },

    { type: "text-you", text: "my bubble tea friend🧋🧋🧋" },

    { type: "meta-center", text: "3월 30일 (월) 13:10" },

    { type: "text-me", text: "아르거" },
    { type: "text-me", text: "차백도 또 시킬건데 같이 먹을래요?" },

    { type: "text-you", text: "좋아 고마워~~~" },

    { type: "text-me", text: "전 계화홍차라떼? 신메뉴 도전" },
    { type: "text-me", text: "롱이는 우롱라떼에 펄추가" },
    { type: "text-me", text: "메뉴 보고 골라주세요 하오거거~" },

    { type: "text-you", text: "난 저번이랑 같은거" },
    { type: "text-you", text: "타로볼 밀크티~🧋🧋" },

    { type: "text-me", text: "연습실이죠?" },
    { type: "text-me", text: "그쪽으로 갈게요~" },

    { type: "read-status", text: "읽음: 3월 30일" },

    { type: "text-you", text: "고마워 건우~~ㅎㅎ" }
  ]
},
     
{
  id: "leesangwon",
  name: "이상원 ALD1",
  avatar: "이",
  time: "일요일",
  inputType: "iMessage",
  messages: [
    { type: "meta-center", text: "3월 22일 (일) 23:16" },

    {
      type: "text-you",
      text:
`점심시간에 커다란 오렌지를 하나 샀어-
그 크기에 모두 웃음을 터뜨렸지.
난 껍질을 벗겨 로버트와 데이브에게 나눠 주었어-
그들이 사분의 일씩 가지고 나는 반쪽을 가졌지.

그 오렌지 덕분에 너무도 행복했어,
평범한 일들이 종종 그렇지,
특히나 요즘에는. 장을 보는 일도. 공원을 거니는 일도.
모든 게 평화롭고 만족스러워. 새삼스럽게도.

남은 하루도 편하게 흘려보냈어.
해야 할 일을 모두 하면서도
즐거웠고 나중에는 여유시간도 생겼지.
사랑해. 살아있어 참 좋다.


- 오렌지_Wendy Cope`
    },

    { type: "text-me", text: "너 맨날 들고 다니던 거 맞지? 읽어보고 싶었는데" },
    { type: "text-you", text: "내일 빌려줄게잉~" },
    { type: "text-me", text: "드디어 읽어보넹 ㅋㅋ" },
    { type: "text-me", text: "땡큐~~~ :3" },

    { type: "meta-center", text: "3월 25일 (수) 20:23" },

    {
      type: "text-you",
      text:
`흰 산으로 나아가는 검은 돌
흰 산으로 나아가는 검은 돌

검은 돌은 다리를 절룩인다
검은 돌이 다리를 절룩일 때 사람과 사물은 평등하고

검은 돌이 다리를 절룩일 때
너의 어깨 위로 한 줌의 먼지가 내려앉는다

그러니까 검은 돌은
사물의 기억을 등에 지고 천천히 나아가는 것이다
그러므로 흰 산은 검은 돌의 걸음만큼 조용히 물러나는 것이다

검은 돌이 다리를 절룩일 때
흰 산은 흐리게 흐리게 흐르고 있어

잠들지 못하는 검은 밤에 너는
잠들지 못하는 검은 돌이 되어
자꾸만 자꾸만 어딘가로 흘러가는 것이다


- 있지도 않은 문장은 아름답고_이제니`
    },

    { type: "text-me", text: "되게 심오하다" },
    { type: "text-me", text: "좋네.." },
    { type: "text-me", text: "이것도 책 있어???" },

    { type: "meta-center", text: "3월 29일 (일) 22:16" },

    {
      type: "text-you",
      text:
`올 것들은 돈 주지 않아도 온다. 밤이 그렇고 겨울이 그렇고 죽음 또한 그러할 것이다. 그땐 아득했고 지금은 막막한 이들 앞에, 예열하지 못한 작은 방 안 추위처럼 가만히 사랑이 당도하기를.

- 안녕, 나의 작은 테이블이여_김이듬`
    },

    { type: "text-you", text: "마지막 문장이 참 좋은 것 같아~" },
    { type: "text-me", text: "오 이건 산문집이네?" },
    { type: "text-me", text: "감성이 좋다" },
    { type: "text-you", text: "좀 낭만 있는걸로 보냈다잉" },
    { type: "text-me", text: "늘 내 감성을 채워줘서 고맙다잉.. :3" },
    { type: "read-status", text: "읽음: 3월 29일" },
    { type: "text-you", text: "Romantic & Energetic Vibe~🍃🍃" }
  ]
},
     
{
  id: "delivery",
  name: "+82 10-1140-5290",
  avatar: "",
  defaultAvatar: true,
  time: "2026. 3. 9.",
  inputType: "문자 메시지 · RCS",
  messages: [
    {
      type: "meta-center",
      text: "3월 9일 (월) 10:21"
    },
    {
      type: "text-you",
      text:
`[CJ대한통운]
[Web발신][CJ대한통운_배송출발]

반갑습니다, 고객님.
고객님의 소중한 상품이 배송 예정입니다.

· 보내는분 : 정관장
· 상품명 : 정관장_에브리타임_10ml_100포_1개[원산지:상세설명에_표시]_정관장브랜드스토어
· 배송예정시간 : 13-15시

※ 위탁장소 선택, 실시간 배송정보
https://www.cjlogistics.com/

※ 무인락커 사용안내
https://www.cjlogistics.com/

일요일에도 신속하게!!
모두를 위한 매일매일 배송
CJ대한통운 매일오네(O-NE)`
    },

    {
      type: "meta-center",
      text: "3월 9일 (월) 14:38"
    },
    {
      type: "text-you",
      text:
`[CJ대한통운]
[Web발신][CJ대한통운_배송완료]

일요일에도 신속하게!!
모두를 위한 매일매일 배송
CJ대한통운 매일오네(O-NE)

고객님의 상품이 배송 완료되었습니다.
ㆍ보내는분 : 정관장
ㆍ상품명 : 정관장 에브리타임 10ml 100포, 1개
ㆍ인수자(위탁장소) : 문앞
ㆍ운송장번호 : 211082089934

모두를 위한 단 하나의 배송!
CJ대한통운 오네

※ CJ대한통운 고객센터 : 1588-1255`
    }
  ]
},
     
  {
  id: "service0505",
  name: "#0505",
  avatar: "#",
  time: "2026. 1. 24.",
  inputType: "문자 메시지 · RCS",
  messages: [
    { type: "meta-center", text: "1월 24일 (토) 15:44" },
    { type: "text-me", text: "ALPHA DRIVE ONE" }
  ]
}
  ];

  let currentThreadId = null;

function getThreadPreview(thread) {
  if (!thread.messages || !thread.messages.length) return "";

  const last = thread.messages[thread.messages.length - 1];

  let text = "";

  if (last.type === "text-me" || last.type === "text-you") {
    text = last.text;
  } else if (last.type === "image-me" || last.type === "image-you") {
    return "사진";
  } else if (last.type === "voice-me" || last.type === "voice-you") {
    return "음성 메시지";
  } else if (last.type === "meta-center" || last.type === "read-status") {
    const textMessage = [...thread.messages].reverse().find(
      (item) => item.type === "text-me" || item.type === "text-you"
    );
    text = textMessage ? textMessage.text : "";
  }

  // 🔥 핵심: 줄 단위로 잘라서 2줄만 반환
  const lines = text.split("\n").filter(line => line.trim() !== "");
  return lines.slice(0, 2).join("\n");
}

  function createAvatarHTML(thread) {
    if (thread.defaultAvatar) {
      return `
        <div class="messages-thread-avatar messages-thread-avatar-default">
          <span class="messages-thread-avatar-head"></span>
          <span class="messages-thread-avatar-body"></span>
        </div>
      `;
    }

    return `
      <div class="messages-thread-avatar">
        <span class="messages-thread-avatar-char">${thread.avatar || ""}</span>
      </div>
    `;
  }

  function renderThreadList() {
    messagesThreadList.innerHTML = messageThreads.map((thread) => `
      <button class="messages-thread-row" type="button" data-thread-id="${thread.id}">
        ${createAvatarHTML(thread)}

        <div class="messages-thread-main">
          <div class="messages-thread-name">${thread.name}</div>
          <div class="messages-thread-preview">${getThreadPreview(thread)}</div>
        </div>

        <div class="messages-thread-time">${thread.time}</div>
        <div class="messages-thread-chevron"></div>
      </button>
    `).join("");
  }

  function setDetailHeader(thread) {
    if (messagesDetailName) {
      messagesDetailName.textContent = thread.name;
    }

    if (messagesInputPlaceholder) {
      messagesInputPlaceholder.textContent = thread.inputType || "iMessage";
    }

    if (messagesDetailAvatar) {
      messagesDetailAvatar.classList.toggle("is-default", !!thread.defaultAvatar);
    }

    if (messagesDetailAvatarChar) {
      messagesDetailAvatarChar.textContent = thread.defaultAvatar ? "" : (thread.avatar || "");
    }
  }

  function renderMessageItem(message) {
    if (message.type === "meta-center") {
      return `<div class="messages-meta-center">${message.text}</div>`;
    }

    if (message.type === "read-status") {
      return `<div class="messages-read-status">${message.text}</div>`;
    }

    if (message.type === "text-you") {
      return `
        <div class="messages-row you">
          <div class="messages-bubble">${message.text}</div>
        </div>
      `;
    }

    if (message.type === "text-me") {
      return `
        <div class="messages-row me">
          <div class="messages-bubble">${message.text}</div>
        </div>
      `;
    }

    if (message.type === "image-you") {
      return `
        <div class="messages-row you">
          <div class="messages-bubble image-bubble">
            <img src="${message.src}" alt="">
          </div>
        </div>
      `;
    }

    if (message.type === "image-me") {
      return `
        <div class="messages-row me">
          <div class="messages-bubble image-bubble">
            <img src="${message.src}" alt="">
          </div>
        </div>
      `;
    }

if (message.type === "voice-you") {
  return `
    <div class="messages-row you">
      <div class="messages-bubble voice-bubble">
        <img src="assets/icons/message_record_bubble_you.png" alt="">
      </div>
    </div>
  `;
}

if (message.type === "voice-me") {
  return `
    <div class="messages-row me">
      <div class="messages-bubble voice-bubble">
        <img src="assets/icons/message_record_bubble_me.png" alt="">
      </div>
    </div>
  `;
}

    return "";
  }

  function openThread(threadId) {
    const thread = messageThreads.find((item) => item.id === threadId);
    if (!thread) return;

    currentThreadId = threadId;
    setDetailHeader(thread);
    messagesConversation.innerHTML = thread.messages.map(renderMessageItem).join("");
    messagesScreen.classList.add("detail-open");

    requestAnimationFrame(() => {
      if (messagesDetailScroll) {
        messagesDetailScroll.scrollTop = messagesDetailScroll.scrollHeight;
      }
    });
  }

function closeThread() {
  currentThreadId = null;
  messagesScreen.classList.remove("detail-open");

  if (messagesListScroll) {
    messagesListScroll.scrollTop = 0;
  }
}

  messagesThreadList.addEventListener("click", (event) => {
    const row = event.target.closest(".messages-thread-row");
    if (!row || !messagesScreen.classList.contains("active")) return;
    openThread(row.dataset.threadId);
  });

  if (messagesDetailBack) {
    messagesDetailBack.addEventListener("click", (event) => {
      event.stopPropagation();
      closeThread();
    });
  }

window.resetMessagesAppState = function () {
  closeThread();

  if (messagesListScroll) {
    messagesListScroll.scrollTop = 0;
  }

  if (messagesDetailScroll) {
    messagesDetailScroll.scrollTop = 0;
  }
};

  renderThreadList();
})();



/* =========================
   PHONE APP
========================= */
(function initPhoneApp() {
  const phoneScreen = document.getElementById("phoneScreen");
  if (!phoneScreen) return;

  const phonePages = phoneScreen.querySelectorAll(".phone-page");
  const phoneTabButtons = phoneScreen.querySelectorAll(".phone-tab-btn");
  const phoneKeyButtons = phoneScreen.querySelectorAll(".phone-key-btn");
  const phoneContactsList = document.getElementById("phoneContactsList");
  const phoneRecentsList = document.getElementById("phoneRecentsList");
  const phoneScrollAreas = phoneScreen.querySelectorAll(".phone-scroll-area");

  const phoneDialDisplay = document.getElementById("phoneDialDisplay");
  const phoneDialEasteregg = document.getElementById("phoneDialEasteregg");
  const phoneClearBtn = document.getElementById("phoneClearBtn");

  let phoneDialValue = "";

  const phoneEasterEggMap = {
    "0311": "♡// •ω• //♡",
    "0411": "♥／≥w≤＼♥",
    "4399": "🍵🐯🐱💕",
    "250828": "선물!  홍... 홍생?  홍삼>w<",
    "250925": "꺼트릴수록 끝없이 Burn Burn",
    "520": "我아이你",
    "260112": "너희에게 행복이 늘 함께하길!",
    "17171771": "시랑해❄️🩵",
    "1004": "👼",
    "504": "오직 롱이만을 사랑해!",
    "555": "한줄기... 후우웅... ｡･ﾟ( ·‿‿· )ﾟ･｡",
    "530": "롱이가 보고 싶은 날..≥w≤",
    "486": "사롱해~💕 (...형은? 형은? 형은.)"
  };

  const contactNames = [
    "강덕철", "강영준", "강준혁", "강태훈", "강현우", "고승민 매니저님", "고승연", "고윤호", "고재원",
    "곽동욱", "곽승현", "곽지석", "구정우", "구태현", "구현호", "권도형", "권민규", "권성준", "권재성", "권찬",
    "김도훈", "김도훈(idntt)", "김동현", "김도현", "김민석", "김민석(큐브)", "김민아", "김민철", "김성민", "김영훈",
    "김우진", "김재형", "김준민", "김준수", "김지훈", "김춘심", "김태민", "김현준", "나윤서", "남기현",
    "남성호", "남재훈", "남주혁", "노재윤", "노현수", "누나", "리즈하오", "문동주", "문성윤", "문정민",
    "문진영", "문태섭", "박동욱", "박성호", "박승찬", "박영진", "박원준", "박준형", "박진수", "박한빈",
    "박현수", "박효정", "배준영", "백승호", "백성찬", "백재민", "변민규", "변성환", "서동윤", "서민주",
    "서재원", "서재원(빌)", "서진혁", "성한빈", "성현우", "신동현", "신민규", "신성우", "신재훈", "신태현",
    "아빠", "안동욱", "안현석", "양민재", "양재민", "양준혁 매니저님", "엄마", "오성준", "오재형", "오진수",
    "오태경", "오현수", "유강민", "유상현", "유상현(쏘스)", "유지혜", "유채아", "유태섭", "윤성환", "윤재성",
    "윤태웅", "윤현수", "이모", "이성준", "이연성", "이영우", "이재민", "이준서", "이준형", "이진수",
    "이진아", "이태경", "이현석", "임민규", "임상현", "장기현", "장성환", "장재성", "장준기", "장한음",
    "전이정", "전재민", "전진수", "전영우", "전태경", "정민규", "정재원", "정진영", "정예준", "조기현",
    "조영민", "천보원", "최경욱", "최립우", "최미정", "최성호", "최재민", "최재민(큐브)", "최진수", "최준형",
    "최태경", "최현석", "판저이", "한재원", "한태산", "허재성", "홍성준", "황재민",
    "김준서 ALD1", "롱이♥ ALD1", "이리오 ALD1", "이상원 ALD1", "아르노 ALD1", "정상현 ALD1", "조우안신 ALD1"
  ];

  const recentsData = [
    { name: "롱이♥ ALD1", sub: "↗ 휴대전화", date: "어제", missed: false },
    { name: "롱이♥ ALD1", sub: "↙ 휴대전화", date: "목요일", missed: false },
    { name: "롱이♥ ALD1", sub: "↙ 휴대전화", date: "수요일", missed: false },
    { name: "조우안신 ALD1", sub: "↗ 휴대전화 (2)", date: "수요일", missed: false },
    { name: "정상현 ALD1", sub: "↙ 휴대전화", date: "수요일", missed: false },
    { name: "롱이♥ ALD1", sub: "↗ 휴대전화", date: "수요일", missed: false },
    { name: "정상현 ALD1", sub: "↙ 휴대전화", date: "화요일", missed: false },
    { name: "02-2156-3520", sub: "↙ 대한민국", date: "월요일", missed: true, defaultAvatar: true },
    { name: "롱이♥ ALD1", sub: "↗ 휴대전화 (3)", date: "일요일", missed: false }
  ];

  function getInitialChar(name) {
    return name ? name.trim().charAt(0) : "";
  }

  function getGroupLabel(name) {
    if (!name) return "#";
    if (name.includes("ALD1")) return "A";

    const first = name.trim().charAt(0);

    if (/[가-힣]/.test(first)) {
      const code = first.charCodeAt(0) - 44032;
      const cho = Math.floor(code / 588);
      const choMap = [
        "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ",
        "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ",
        "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"
      ];
      return choMap[cho] || "#";
    }

    if (/[A-Za-z]/.test(first)) return first.toUpperCase();
    return "#";
  }

  function formatName(name, missed = false) {
    if (!name) return "";

    if (name.includes("ALD1")) {
      const plain = name.replace(/\s*ALD1/g, "").trim();
      return `
        <span class="phone-name-plain ${missed ? "is-missed" : ""}">${plain}</span>
        <strong class="phone-name-tag ${missed ? "is-missed" : ""}">ALD1</strong>
      `;
    }

    return `<span class="phone-name-plain ${missed ? "is-missed" : ""}">${name}</span>`;
  }

  function renderContacts() {
    if (!phoneContactsList) return;

    let html = `
      <div class="phone-my-card">
        <div class="phone-avatar phone-avatar-my">
          <span class="phone-mycard-head"></span>
          <span class="phone-mycard-body"></span>
        </div>
        <div class="phone-my-card-text">내 카드</div>
      </div>
    `;

    let currentGroup = "";

    contactNames.forEach((name) => {
      const group = getGroupLabel(name);

      if (group !== currentGroup) {
        currentGroup = group;
        html += `<div class="phone-contact-group-label">${group}</div>`;
      }

      html += `
        <div class="phone-contact-row">
          <div class="phone-avatar">
            <span class="phone-avatar-char">${getInitialChar(name)}</span>
          </div>
          <div class="phone-contact-main">
            <div class="phone-contact-name">${formatName(name)}</div>
          </div>
        </div>
      `;
    });

    html += `
      <div class="phone-contacts-count-row">
        <div class="phone-contacts-count-inline">155개의 연락처</div>
      </div>
    `;

    phoneContactsList.innerHTML = html;
  }

  function renderRecents() {
    if (!phoneRecentsList) return;

    phoneRecentsList.innerHTML = recentsData.map((item) => {
      const avatarHtml = item.defaultAvatar
        ? `
          <div class="phone-avatar phone-avatar-my">
            <span class="phone-mycard-head"></span>
            <span class="phone-mycard-body"></span>
          </div>
        `
        : `
          <div class="phone-avatar">
            <span class="phone-avatar-char">${getInitialChar(item.name)}</span>
          </div>
        `;

      return `
        <div class="phone-recents-row">
          ${avatarHtml}
          <div class="phone-recents-main">
            <div class="phone-recents-name">${formatName(item.name, item.missed)}</div>
            <div class="phone-recents-sub">${item.sub}</div>
          </div>
          <div class="phone-recents-date">${item.date}</div>
          <button class="phone-recent-call-btn" type="button" aria-label="통화">
            <img src="assets/icons/icon_call_blue.png" alt="" class="phone-recent-call-icon">
          </button>
        </div>
      `;
    }).join("");
  }

  function updatePhoneDialUI() {
    if (phoneDialDisplay) {
      phoneDialDisplay.textContent = phoneDialValue;
    }

    if (phoneDialEasteregg) {
      phoneDialEasteregg.textContent = phoneEasterEggMap[phoneDialValue] || "";
    }

    if (phoneClearBtn) {
      if (phoneDialValue.length > 0) {
        phoneClearBtn.classList.add("is-visible");
      } else {
        phoneClearBtn.classList.remove("is-visible");
      }
    }
  }

  function appendPhoneDialValue(value) {
    if (!value) return;
    if (phoneDialValue.length >= 12) return;
    phoneDialValue += value;
    updatePhoneDialUI();
  }

  function clearPhoneDialValue() {
    if (!phoneDialValue.length) return;
    phoneDialValue = phoneDialValue.slice(0, -1);
    updatePhoneDialUI();
  }

  function resetPhoneDialValue() {
    phoneDialValue = "";
    updatePhoneDialUI();
  }

  function setPhonePage(pageName) {
    phonePages.forEach((page) => {
      page.classList.toggle("active", page.dataset.phonePage === pageName);
    });

    phoneTabButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.phoneTab === pageName);
    });

    phoneScreen.dataset.phonePage = pageName;
  }

  phoneTabButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      setPhonePage(button.dataset.phoneTab);
    });
  });

  phoneKeyButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();

      const value = button.dataset.phoneValue || "";

      button.classList.remove("tap");
      void button.offsetWidth;
      button.classList.add("tap");

      appendPhoneDialValue(value);

      setTimeout(() => {
        button.classList.remove("tap");
      }, 140);
    });
  });

  if (phoneClearBtn) {
    let clearHoldTimer = null;
    let clearRepeatTimer = null;
    let clearHoldTriggered = false;

    const stopClearHold = () => {
      if (clearHoldTimer) {
        clearTimeout(clearHoldTimer);
        clearHoldTimer = null;
      }

      if (clearRepeatTimer) {
        clearInterval(clearRepeatTimer);
        clearRepeatTimer = null;
      }
    };

    phoneClearBtn.addEventListener("click", (event) => {
      event.stopPropagation();

      if (clearHoldTriggered) {
        clearHoldTriggered = false;
        return;
      }

      clearPhoneDialValue();
    });

    phoneClearBtn.addEventListener("mousedown", (event) => {
      event.stopPropagation();

      clearHoldTriggered = false;
      stopClearHold();

      clearHoldTimer = setTimeout(() => {
        clearHoldTriggered = true;

        clearRepeatTimer = setInterval(() => {
          if (!phoneDialValue.length) {
            stopClearHold();
            return;
          }
          clearPhoneDialValue();
        }, 80);
      }, 350);
    });

    phoneClearBtn.addEventListener("touchstart", (event) => {
      event.stopPropagation();

      clearHoldTriggered = false;
      stopClearHold();

      clearHoldTimer = setTimeout(() => {
        clearHoldTriggered = true;

        clearRepeatTimer = setInterval(() => {
          if (!phoneDialValue.length) {
            stopClearHold();
            return;
          }
          clearPhoneDialValue();
        }, 80);
      }, 350);
    }, { passive: true });

    ["mouseup", "mouseleave", "touchend", "touchcancel"].forEach((eventName) => {
      phoneClearBtn.addEventListener(eventName, stopClearHold);
    });
  }

  window.resetPhoneAppState = function () {
    setPhonePage("keypad");
    phoneScrollAreas.forEach((area) => {
      area.scrollTop = 0;
    });
    resetPhoneDialValue();
  };

  renderContacts();
  renderRecents();
  setPhonePage("keypad");
  updatePhoneDialUI();
})();



/* =========================
   PHOTOS APP
========================= */
(function initPhotosApp() {
  const photosScreen = document.getElementById("photosScreen");
  if (!photosScreen) return;

  const photosGrid = document.getElementById("photosGrid");
  const photosGridScroll = document.getElementById("photosGridScroll");
  const photosDetailScroll = document.getElementById("photosDetailScroll");
  const photosDetailStage = photosScreen.querySelector(".photos-detail-stage");
  const photosDetailBack = photosScreen.querySelector(".photos-detail-back");

  if (!photosGrid || !photosGridScroll || !photosDetailStage) return;

  const PHOTO_FILES = [
  "001.jpg",
"002.jpg",
"003.jpg",
"004.jpg",
"005.jpg",
"006.jpg",
"007.JPG",
"008.jpg",
"009.jpg",
"010.jpg",
"011.JPG",
"012.JPG",
"013.JPG",
"014.JPG",
"015.JPG",
"016.mp4",
"017.JPG",
"018.JPG",
"019.JPG",
"019_1.jpg",
"019_10.jpg",
"019_2.jpg",
"019_3.jpg",
"019_4.jpg",
"019_5.jpg",
"019_6.jpg",
"019_7.jpg",
"019_8.jpg",
"019_9.jpg",
"020.JPG",
"021.jpg",
"022.jpg",
"023.jpg",
"024.jpg",
"025.JPG",
"026.jpg",
"027.jpg",
"028.JPG",
"029.JPEG",
"030.JPG",
"031.PNG",
"032.PNG",
"033.jpeg",
"034.jpg",
"035.jpg",
"036.jpeg",
"037.jpeg",
"038.JPG",
"039.JPG",
"040.JPG",
"041.JPG",
"042.JPG",
"043.JPG",
"044.JPG",
"045.jpeg",
"046.jpeg",
"047.jpeg",
"048.jpeg",
"049.jpeg",
"050.jpeg",
"051.jpeg",
"052.jpeg",
"053.jpg",
"054.jpg",
"055.JPG",
"056.JPG",
"057.JPG",
"058.JPG",
"059.JPG",
"060.JPG",
"061.jpg",
"062.JPG",
"063.JPG",
"064.JPG",
"065.JPG",
"066.JPG",
"067.jpeg",
"068.jpeg",
"069.jpeg",
"070.jpeg",
"071.jpeg",
"072.jpeg",
"073.JPG",
"074.jpeg",
"075.jpeg",
"076.jpeg",
"077.jpeg",
"078.jpeg",
"079.jpeg",
"080.jpeg",
"081.jpeg",
"082.jpeg",
"083.jpeg",
"084.jpeg",
"085.jpeg",
"086.jpeg",
"087.JPEG",
"088.jpeg",
"089.JPG",
"090.JPG",
"091.JPG",
"092.JPG",
"093.JPG",
"094.JPG",
"095.jpeg",
"096.webp",
"097.JPG",
"098.JPG",
"099.JPG",
"100.jpeg",
"101.jpeg",
"102.jpeg",
"103.jpeg",
"104.JPG",
"105.JPG",
"106.JPG",
"107.jpeg",
"108.jpeg",
"109.jpeg",
"110.jpeg",
"111.JPG",
"112.JPG",
"113.JPG",
"114.JPG",
"115.JPG",
"116.JPG",
"117.JPG",
"118.jpg",
"119.JPG",
"120.JPG",
"121.JPG",
"122.jpeg",
"123.JPG",
"124.jpg",
"125.JPG",
"126.JPG",
"127.JPG",
"128.JPG",
"129.JPG",
"130.JPG",
"130_1.JPG",
"130_2.JPG",
"130_3.JPG",
"131.JPG",
"132.JPEG",
"133.jpg",
"134.JPG",
"135.JPG",
"136.jpeg",
"137.jpeg",
"137_1.JPG",
"138.jpg",
"139.JPG",
"140.JPG",
"141.JPG",
"142.JPG",
"143.jpeg",
"144.JPG",
"145.JPEG",
"146.JPG",
"147.JPG",
"148.JPG",
"149.JPG",
"150.JPG",
"151.jpeg",
"152.JPG",
"153.JPG",
"154.JPG",
"155.JPG",
"156.JPG",
"157.JPG",
"158.JPG",
"159.JPG",
"160.jpeg",
"161.JPG",
"162.jpeg",
"163.JPG",
"164.JPG",
"165.JPG",
"166.JPG",
"167.JPG",
"168.JPG",
"169.JPG",
"170.jpg",
"171.JPG",
"172.JPG",
"173.JPG",
"174.JPG",
"175.JPG",
"176.JPG",
"177.JPG",
"178.JPG",
"179.JPG",
"180.JPG",
"181.jpeg",
"182.JPG",
"183.jpeg",
"184.JPG",
"185.JPG",
"186.JPG",
"187.JPG",
"188.jpeg",
"189.jpeg",
"190.JPG",
"191.JPG",
"192.JPG",
"193.jpeg",
"194.jpeg",
"195.JPG",
"196.JPG",
"197.JPG",
"198.JPG",
"199.JPG",
"200.JPG",
"201.JPG",
"202.jpeg",
"203.jpeg",
"204.JPG",
"205.jpg",
"206.jpg",
"207.jpg",
"208.JPG",
"209.jpg",
"210.jpg",
"211.jpeg",
"212.jpeg",
"213.jpeg",
"214.jpeg",
"215.JPG",
"216.jpeg",
"217.JPG",
"218.JPG",
"219.JPG",
"220.jpeg",
"221.jpeg",
"222.jpeg",
"223.jpeg",
"224.jpeg",
"225.jpeg",
"226.jpeg",
"227.jpeg",
"228.JPG",
"229.jpg",
"230.jpeg",
"231.jpeg",
"232.jpeg",
"233.jpeg",
"234.jpeg",
"235.jpeg",
"236.jpg",
"237.jpeg",
"238.jpeg",
"239.jpeg",
"240.JPG",
"241.JPG",
"242.JPG",
"243.jpg",
"244.JPG",
"245.JPG",
"246.JPG",
"247.jpg",
"248.jpg",
"249.JPG",
"250.JPG",
"251.JPG",
"252.JPG",
"253.JPG",
"254.JPG",
"255.JPG",
"256.JPG",
"257.JPG",
"258.JPG",
"259.JPG",
"260.JPG",
"261.JPG",
"262.JPG",
"263.JPG",
"264.JPG",
"265.JPG",
"266.JPG",
"267.JPG",
"268.jpeg",
"269.jpeg",
"270.jpeg",
"271.jpeg",
"272.JPG",
"273.JPG",
"274.JPG",
"275.JPG",
"276.JPG",
"277.JPG",
"278.jpeg",
"279.JPG",
"280.JPG",
"281.jpeg",
"282.jpeg",
"283.jpeg",
"284.jpeg",
"285.jpeg",
"286.jpeg",
"287.jpeg",
"288.jpeg",
"289.jpeg",
"290.JPG",
"291.JPG",
"292.JPG",
"293.jpeg",
"294.jpeg",
"295.jpeg",
"296.jpeg",
"297.JPG",
"298.jpeg",
"299.jpeg",
"300.jpeg",
"301.jpeg",
"302.jpeg",
"303.jpeg",
"304.jpeg",
"305.jpeg",
"306.jpg",
"307.jpeg",
"308.JPG",
"309.JPG",
"310.JPG",
"311.JPG",
"312.jpg",
"313.jpg",
"314.jpg",
"315.jpeg",
"316.jpeg",
"317.JPG",
"318.JPG",
"319.jpeg",
"320.jpeg",
"321.JPG",
"322.jpeg",
"323.JPG"

    // 여기에 계속 추가
    // "004.png",
    // "005.jpeg",
    // "006.mp4"
  ];

  let currentPhotoIndex = null;
  let savedGridScrollTop = 0;

  function getPhotoSrc(index) {
const CURRENT_PROFILE = "gw";
return `assets/pictures/${CURRENT_PROFILE}/${PHOTO_FILES[index - 1]}`;
  }


  function getPhotoFile(index) {
    return PHOTO_FILES[index - 1] || "";
  }

  function isVideoFile(filename) {
    return /\.(mp4|webm|ogg)$/i.test(filename);
  }

  function createGridMediaHTML(index) {
    const file = getPhotoFile(index);
    const src = getPhotoSrc(index);

    if (isVideoFile(file)) {
      return `
        <video
          src="${src}"
          class="photos-thumb-image"
          muted
          playsinline
          preload="metadata"
        ></video>
      `;
    }

    return `<img src="${src}" alt="" class="photos-thumb-image" loading="lazy">`;
  }

  function createDetailMediaHTML(index) {
    const file = getPhotoFile(index);
    const src = getPhotoSrc(index);

    if (isVideoFile(file)) {
      return `
        <video
          src="${src}"
          class="photos-detail-image photos-detail-video"
          controls
          playsinline
          preload="metadata"
        ></video>
      `;
    }

    return `<img src="${src}" alt="" class="photos-detail-image">`;
  }

  function renderPhotosGrid() {
    let html = "";

    for (let i = 1; i <= PHOTO_FILES.length; i += 1) {
      html += `
        <button class="photos-thumb-btn" type="button" data-photo-index="${i}" aria-label="미디어 ${i}">
          ${createGridMediaHTML(i)}
        </button>
      `;
    }

    photosGrid.innerHTML = html;
  }

  function scrollPhotosToBottom() {
    const setBottom = () => {
      photosGridScroll.scrollTop = photosGridScroll.scrollHeight;
    };

    requestAnimationFrame(setBottom);
    setTimeout(setBottom, 0);
    setTimeout(setBottom, 120);
    setTimeout(setBottom, 320);
    setTimeout(setBottom, 700);
  }

  function openPhoto(index) {
    currentPhotoIndex = index;
    savedGridScrollTop = photosGridScroll.scrollTop;

    photosDetailStage.innerHTML = createDetailMediaHTML(index);
    photosScreen.classList.add("detail-open");

    if (photosDetailScroll) {
      photosDetailScroll.scrollTop = 0;
    }
  }

  function closePhoto() {
    photosScreen.classList.remove("detail-open");
    currentPhotoIndex = null;

    requestAnimationFrame(() => {
      photosGridScroll.scrollTop = savedGridScrollTop;
    });
  }

  photosGrid.addEventListener("click", (event) => {
    const thumb = event.target.closest(".photos-thumb-btn");
    if (!thumb || !photosScreen.classList.contains("active")) return;

    openPhoto(Number(thumb.dataset.photoIndex));
  });

  if (photosDetailBack) {
    photosDetailBack.addEventListener("click", (event) => {
      event.stopPropagation();
      closePhoto();
    });
  }

  window.resetPhotosAppState = function () {
    photosScreen.classList.remove("detail-open");
    currentPhotoIndex = null;
    scrollPhotosToBottom();
  };

  renderPhotosGrid();
  scrollPhotosToBottom();
})();


/* =========================
   CALENDAR APP
========================= */
(function initCalendarApp() {
  const calendarScreen = document.getElementById("calendarScreen");
  const calendarScroll = document.getElementById("calendarScroll");
  const calendarMonths = document.getElementById("calendarMonths");
  const calendarTodayBtn = calendarScreen?.querySelector(".calendar-today-btn");

  if (!calendarScreen || !calendarScroll || !calendarMonths) return;

  const CALENDAR_YEAR = 2026;
  const CALENDAR_MONTHS = [1, 2, 3, 4];
  const TODAY_MONTH = 4;
  const TODAY_DAY = 3;

  const HOLIDAYS = {
    "1-1": "새해",
    "2-16": "설날 연휴",
    "2-17": "설날",
    "2-18": "설날 연휴",
    "3-1": "삼일절",
    "3-2": "삼일절(대체 휴일)"
  };

  const CALENDAR_EVENTS = [
{ month: 1, day: 9, title: "멜론 채팅" },
{ month: 1, day: 11, title: "X 라이브", time: "20:00" },
{ month: 1, day: 12, title: "데뷔" },
{ month: 1, day: 12, title: "쇼케이스" },
{ month: 1, day: 12, title: "멜론 채팅" },
{ month: 1, day: 13, title: "쇼케이스" },
{ month: 1, day: 14, title: "정오의희망곡", time: "12:00" },
{ month: 1, day: 14, title: "개그콘서트" },
{ month: 1, day: 15, title: "엠카" },
{ month: 1, day: 16, title: "뮤뱅" },
{ month: 1, day: 16, title: "팬싸" },
{ month: 1, day: 17, title: "음중" },
{ month: 1, day: 17, title: "팬싸" },
{ month: 1, day: 18, title: "인가" },
{ month: 1, day: 18, title: "팬싸" },
{ month: 1, day: 19, title: "영스트리트", time: "20:00" },
{ month: 1, day: 21, title: "쇼챔" }, 
{ month: 1, day: 21, title: "아이돌라디오", time: "21:00" },
{ month: 1, day: 22, title: "엠카" },
{ month: 1, day: 23, title: "뮤뱅" },
{ month: 1, day: 23, title: "팬싸" },
{ month: 1, day: 24, title: "음중" },
{ month: 1, day: 24, title: "팬싸" },
{ month: 1, day: 25, title: "인가" },
{ month: 1, day: 25, title: "팬싸" },
{ month: 1, day: 27, title: "키스더라디오", time: "20:00" },
{ month: 1, day: 28, title: "쇼챔" },
{ month: 1, day: 28, title: "팬싸" },
{ month: 1, day: 29, title: "엠카" },
{ month: 1, day: 30, title: "뮤뱅" },
{ month: 1, day: 30, title: "팬싸" },
{ month: 1, day: 31, title: "음중" },
{ month: 2, day: 1, title: "인가/매점가요" },
{ month: 2, day: 4, title: "쇼챔" },
{ month: 2, day: 4, title: "팬싸" },
{ month: 2, day: 5, title: "엠카" },
{ month: 2, day: 6, title: "뮤뱅" },
{ month: 2, day: 7, title: "음중" },
{ month: 2, day: 8, title: "인가(막방)" },
{ month: 2, day: 8, title: "팬싸" },
{ month: 2, day: 12, title: "팬싸" },
{ month: 2, day: 14, title: "팬싸" },
{ month: 2, day: 22, title: "팬싸" },
{ month: 2, day: 27, title: "상하이" },
{ month: 3, day: 1, title: "파리" },
{ month: 3, day: 7, title: "공개팬싸" },
{ month: 3, day: 8, title: "공개팬싸" },
{ month: 3, day: 11, title: "롱🎂❤️" },
{ month: 3, day: 11, title: "팬싸" },
{ month: 3, day: 11, title: "생일 라이브", time: "22:00" },
{ month: 3, day: 12, title: "도쿄" },
{ month: 3, day: 28, title: "선전" }

  ];

  const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
  let lastCalendarScrollTop = 0;

  function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  function getFirstDayIndex(year, month) {
    return new Date(year, month - 1, 1).getDay();
  }

  function getEventsForDate(month, day) {
    return CALENDAR_EVENTS.filter((event) => event.month === month && event.day === day);
  }

  function createWeekdaysHTML() {
    return `
      <div class="calendar-weekdays">
        ${WEEKDAY_LABELS.map((label, index) => `
          <span class="calendar-weekday ${index === 0 ? "is-sunday" : ""}">
            ${label}
          </span>
        `).join("")}
      </div>
    `;
  }

  function createBadgeHTML(text) {
    return `<div class="calendar-badge">${text}</div>`;
  }

  function createEventHTML(event) {
    const timeHTML = event.time ? `<span class="calendar-event-time">${event.time}</span>` : "";
    return `
      <div class="calendar-event">
        <span class="calendar-event-title">${event.title}</span>
        ${timeHTML}
      </div>
    `;
  }

  function createEmptyCellHTML() {
    return `<div class="calendar-day is-empty" aria-hidden="true"></div>`;
  }

  function createDayCellHTML(month, day, weekdayIndex) {
    const holidayKey = `${month}-${day}`;
    const holidayText = HOLIDAYS[holidayKey];
    const events = getEventsForDate(month, day);
    const isToday = month === TODAY_MONTH && day === TODAY_DAY;
    const isSunday = weekdayIndex === 0;

    return `
      <div class="calendar-day ${isToday ? "is-today" : ""} ${isSunday ? "is-sunday" : ""}">
        <div class="calendar-day-number">${day}</div>
        ${holidayText ? createBadgeHTML(holidayText) : ""}
        ${events.map(createEventHTML).join("")}
      </div>
    `;
  }

  function createMonthHTML(month) {
    const daysInMonth = getDaysInMonth(CALENDAR_YEAR, month);
    const firstDayIndex = getFirstDayIndex(CALENDAR_YEAR, month);
    let cellsHTML = "";

    for (let i = 0; i < firstDayIndex; i += 1) {
      cellsHTML += createEmptyCellHTML();
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const weekdayIndex = new Date(CALENDAR_YEAR, month - 1, day).getDay();
      cellsHTML += createDayCellHTML(month, day, weekdayIndex);
    }

    return `
      <section class="calendar-month" id="calendarMonth${month}" data-month="${month}">
        <h2 class="calendar-month-title">${month}월</h2>
        ${createWeekdaysHTML()}
        <div class="calendar-month-grid">
          ${cellsHTML}
        </div>
      </section>
    `;
  }

  function renderCalendar() {
    calendarMonths.innerHTML = CALENDAR_MONTHS.map(createMonthHTML).join("");
  }

  function scrollCalendarToApril() {
    const aprilSection = document.getElementById("calendarMonth4");
    if (!aprilSection) return;

    const targetTop = aprilSection.offsetTop - 6;
    calendarScroll.scrollTop = targetTop;
    lastCalendarScrollTop = targetTop;

    requestAnimationFrame(() => {
      calendarScroll.scrollTop = targetTop;
      lastCalendarScrollTop = targetTop;
    });

    setTimeout(() => {
      calendarScroll.scrollTop = targetTop;
      lastCalendarScrollTop = targetTop;
    }, 120);

    setTimeout(() => {
      calendarScroll.scrollTop = targetTop;
      lastCalendarScrollTop = targetTop;
    }, 320);
  }

  function resetCalendarAppState() {
    scrollCalendarToApril();
  }

  calendarScroll.addEventListener("scroll", () => {
    lastCalendarScrollTop = calendarScroll.scrollTop;
  });

  if (calendarTodayBtn) {
    calendarTodayBtn.addEventListener("click", () => {
      scrollCalendarToApril();
    });
  }

  window.resetCalendarAppState = resetCalendarAppState;

  renderCalendar();
  scrollCalendarToApril();
})();


/* =========================
   KAKAO APP
========================= */
(function initKakaoApp() {
  const kakaoScreen = document.getElementById("kakaoScreen");
  const kakaoScroll = document.getElementById("kakaoScroll");
  const kakaoConversation = document.getElementById("kakaoConversation");

  if (!kakaoScreen || !kakaoScroll || !kakaoConversation) return;

  const KAKAO_PROFILES = {
    "준서": {
      name: "김준서 ALD1",
      image: "assets/icons/kakao_profile_js.jpg"
    },
    "아르노": {
      name: "아르노 ALD1",
      image: "assets/icons/kakao_profile_arno.jpg"
    },
    "리오": {
      name: "이리오 ALD1",
      image: "assets/icons/kakao_profile_leo.jpg"
    },
    "상원": {
      name: "이상원 ALD1",
      image: "assets/icons/kakao_profile_sw.jpg"
    },
    "씬롱": {
      name: "롱이❤️ ALD1",
      image: "assets/icons/kakao_profile_xl.jpg"
    },
    "안신": {
      name: "조우안신 ALD1",
      image: "assets/icons/kakao_profile_ax.jpg"
    },
    "상현": {
      name: "정상현 ALD1",
      image: "assets/icons/kakao_profile_sh.jpg"
    },
    "건우": {
      name: "김건우 ALD1",
      image: "assets/icons/kakao_profile_gw.jpg"
    }
  };

  const KAKAO_CHAT_DATA = [
    { type: "date", label: "2026년 3월 4일 수요일" },

    { sender: "상원", type: "image", time: "19:51", files: ["kakao_01.jpg"] },
    { sender: "상원", type: "text", time: "19:51", text: "우리 좀 이따 공항으로 출발" },
    { sender: "상원", type: "text", time: "19:51", text: "사진은 어제 ㅋㅋㅋ" },
    { sender: "리오", type: "text", time: "19:52", text: "We miss you guys" },
    { sender: "안신", type: "text", time: "19:55", text: "Oh me too!!!!!!" },
    { sender: "리오", type: "text", time: "19:55", text: "셋이 없어서 그냥 그랬다잉~" },
    { sender: "준서", type: "text", time: "19:55", text: "진짜" },
    { sender: "준서", type: "text", time: "19:56", text: "다같이 갈 기회가 또 있어야하는데..ㅠㅠ" },
    { sender: "상현", type: "text", time: "19:56", text: "당연히 다같이 또 가야죠!!!" },
    { sender: "상현", type: "text", time: "19:56", text: "셋이 뭐하고 있어요??" },
    { sender: "아르노", type: "text", time: "19:58", text: "우리 놀러간거 찍었어요" },
    { sender: "아르노", type: "text", time: "19:58", text: "v-log ㅋㅋ" },
    { sender: "씬롱", type: "text", time: "19:59", text: "저희 오늘 신발 만들었어요" },
    { sender: "씬롱", type: "text", time: "19:59", text: "😎😎😎" },
    { sender: "아르노", type: "image", time: "19:59", files: ["kakao_02.jpg"] },
    { sender: "나", type: "text", time: "20:00", text: "ㅋㅋㅋㅋㅋㅋ재밌었겠넹" },
    { sender: "나", type: "text", time: "20:00", text: "보고싶다 다들~~~~" },
    { sender: "나", type: "text", time: "20:00", text: "내일 가니까 조금만 참아 ㅎㅎ" },
    { sender: "아르노", type: "text", time: "20:01", text: "다들 조심히 와요~" },
    { sender: "준서", type: "text", time: "20:01", text: "셋이 뭐 잘 지내겠지만" },
    { sender: "준서", type: "text", time: "20:02", text: "싸우지말고 잘 챙겨먹고" },
    { sender: "상원", type: "text", time: "20:02", text: "ㅋㅋㅋㅋㅋㅋㅋㅋ" },
    { sender: "안신", type: "text", time: "20:02", text: "당연!!!!" },
    { sender: "안신", type: "text", time: "20:03", text: "내일봐요~" },
    { sender: "씬롱", type: "text", time: "20:03", text: "걱정 말아요 😬😬" },
    { sender: "상원", type: "text", time: "20:04", text: "내일 봐 🤍🤍" },

    { type: "date", label: "2026년 3월 6일 금요일" },

    { sender: "상현", type: "text", time: "20:16", text: "편의점 가는데 뭐 필요한 사람~" },
    { sender: "상현", type: "text", time: "20:16", text: "말해주세여" },
    { sender: "상현", type: "text", time: "20:17", text: "저랑 건우형 지금 편의점" },
    { sender: "준서", type: "text", time: "20:18", text: "ㅋㅋ난 괜찮아" },
    { sender: "준서", type: "text", time: "20:18", text: "조심해서 사와~" },
    { sender: "상원", type: "text", time: "20:19", text: "나두 괜찮" },
    { sender: "상원", type: "text", time: "20:19", text: "땡스~~" },
    { sender: "리오", type: "text", time: "20:21", text: "음 빼빼로랑 몽쉘 좀 사다줄 수 있을까.." },
    { sender: "리오", type: "text", time: "20:21", text: "Thanks!!!❤️❤️" },
    { sender: "씬롱", type: "text", time: "20:21", text: "나는 오땅이랑 오징어집 ㅎㅎ" },
    { sender: "나", type: "image", time: "20:24", files: ["kakao_03.jpg", "kakao_04.jpg"] },
    { sender: "나", type: "text", time: "20:24", text: "둘은 이제 대답 안 해도 돼..;;" },
    { sender: "안신", type: "text", time: "20:24", text: "ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ" },
    { sender: "안신", type: "text", time: "20:24", text: "저는 제로콜라 하나 plz~" },
    { sender: "아르노", type: "text", time: "20:25", text: "Im okay~" },
    { sender: "상현", type: "text", time: "20:29", text: "넹 곧 가요~~" },

  { type: "date", label: "2026년 3월 9일 월요일" },
  { sender: "준서", type: "image", time: "10:34", files: ["kakao_05.jpg"] },
  { sender: "상원", type: "text", time: "10:35", text: "크으" },
  { sender: "상원", type: "text", time: "10:35", text: "봄이 다 되었구만~🍃🍃" },
  { sender: "준서", type: "text", time: "10:36", text: "다들 이렇게 맑은 날에" },
  { sender: "준서", type: "text", time: "10:36", text: "하늘도 보고 쉼호흡도 하고 그러자" },
  { sender: "준서", type: "text", time: "10:36", text: "☺️☺️☺️" },
  { sender: "준서", type: "text", time: "10:36", text: "건강이 제~~~일 중요한거 알지?" },
  { sender: "리오", type: "text", time: "10:37", text: "넵 형님!" },
  { sender: "나", type: "text", time: "10:37", text: "🫡🫡🫡🫡🫡🫡🫡" },
  { sender: "씬롱", type: "text", time: "10:38", text: "ㅋㅋㅋ형들또 크으으으... 해용ㅋㅋ" },
  { sender: "나", type: "text", time: "10:38", text: "여긴 지금 점심 뭐 먹을지 고르는 중" },
  { sender: "나", type: "text", time: "10:38", text: "물론 상현이가" },
  { sender: "상현", type: "text", time: "10:38", text: "형들" },
  { sender: "상현", type: "text", time: "10:38", text: "뭐먹을래용우리????" },
  { sender: "상현", type: "text", time: "10:38", text: "깔끔하게 스시?" },
  { sender: "상현", type: "text", time: "10:38", text: "이탈리안 느낌으로다가 파스타?" },
  { sender: "안신", type: "text", time: "10:39", text: "역시 小猪🐷" },
  { sender: "상현", type: "text", time: "10:39", text: "아아아아나개냥이야" },
  { sender: "씬롱", type: "text", time: "10:40", text: "ㅋㅋㅋㅋ상혀니귀엽네~" },
  { sender: "상원", type: "text", time: "10:40", text: "건우 최애음식이잖아 스시" },
  { sender: "상원", type: "text", time: "10:40", text: "아이 라이크 스시!" },
  { sender: "준서", type: "text", time: "10:40", text: "ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ" },
  { sender: "준서", type: "text", time: "10:41", text: "돈까스도 시켜줘라 건우" },
  { sender: "나", type: "text", time: "10:41", text: "ㅎㅎ초밥 맛있긴해" },
  { sender: "나", type: "text", time: "10:41", text: "다들 뭐가 좋으신가요" },
  { sender: "나", type: "text", time: "10:41", text: "파스타 매콤한거 있나?" },
  { sender: "상현", type: "text", time: "10:42", text: "아 또 매운거" },
  { sender: "상현", type: "text", time: "10:42", text: "불닭파스타 틈새파스타 만들어야 돼 진심" },
  { sender: "나", type: "text", time: "10:43", text: "왜 매콤하고 맛있잖아" },
  { sender: "아르노", type: "text", time: "10:43", text: "파스타 괜찮다~" },
  { sender: "씬롱", type: "text", time: "10:43", text: "저두용" },
  { sender: "씬롱", type: "text", time: "10:44", text: "저는 크림 좋아용" },
  { sender: "씬롱", type: "text", time: "10:44", text: "매운건 no😬😬" },
  { sender: "아르노", type: "text", time: "10:45", text: "나도 안 매운걸로 ㅎㅎ" },
  { sender: "나", type: "text", time: "10:45", text: "ㅜ.ㅜ..." },

  // =========================
  // 2026.03.11 수
  // =========================
  { type: "date", label: "2026년 3월 11일 수요일" },
  { sender: "상원", type: "text", time: "00:00", text: "롱아 생일 축하해🎂🎉🎉" },
  { sender: "상원", type: "text", time: "00:00", text: "앞으로도 오래오래 행복하게 함께하자❤️" },
  { sender: "아르노", type: "text", time: "00:01", text: "祝你生日快乐隆隆🎉🎉" },
  { sender: "상현", type: "text", time: "00:01", text: "롱이형 생일 축하해용~~!! 🩷🩷🩷" },
  { sender: "상현", type: "text", time: "00:02", text: "전 전화로도 같이 축하해줌 ㅎㅎ" },
  { sender: "리오", type: "text", time: "00:03", text: "Happy birthday long~~❤️" },
  { sender: "리오", type: "text", time: "00:03", text: "생일 축하한다 롱아!!" },
  { sender: "안신", type: "text", time: "00:03", text: "전 룸메~" },
  { sender: "안신", type: "text", time: "00:04", text: "이미 축하 했어요 ㅋㅋㅋ" },
  { sender: "안신", type: "text", time: "00:04", text: "씬롱 생일 축하해!!! 祝你生日快乐" },
  { sender: "준서", type: "text", time: "00:06", text: "아 나 샤워ㅎㅏ느라 늦었어ㅠㅠ" },
  { sender: "준서", type: "text", time: "00:06", text: "롱아 생일 진짜진짜 진심으로 축하해❤️" },
  { sender: "준서", type: "text", time: "00:06", text: "행복한 하루 보내고 앞으로도 건강하고 즐겁게 같이 활동하자" },
  { sender: "준서", type: "text", time: "00:08", text: "이야 건우는 시간 맞춰서 올라왔네" },
  { sender: "준서", type: "text", time: "00:08", text: "역시.." },
  { sender: "나", type: "text", time: "00:09", text: "전 이미 다 준비했죠~ㅎㅎ" },
  { sender: "나", type: "text", time: "00:09", text: "롱아 생일 진심으로 축하해 🥰❤️❤️" },
  { sender: "안신", type: "text", time: "00:10", text: "맞아요 건우형 우리 방 딱 12시에 왔어요" },
  { sender: "씬롱", type: "text", time: "00:10", text: "다들 축하 감사합니다!!!!! ㅎㅎㅎㅎ" },
  { sender: "리오", type: "text", time: "00:11", text: "아 나도 올라갔어야 했는데..ㅎㅎ" },
  { sender: "리오", type: "text", time: "00:11", text: "롱아 내일 진짜 격하게!!!! 축하해줄게" },
  { sender: "씬롱", type: "text", time: "00:11", text: "진짜 감동이에용 ㅠㅠㅠㅠ" },
  { sender: "씬롱", type: "text", time: "00:12", text: "괜찮아요 마음 다 전해져요" },
  { sender: "씬롱", type: "text", time: "00:12", text: "❤️‍🔥❤️‍🔥❤️‍🔥" },
  { sender: "준서", type: "text", time: "00:13", text: "다들 이제 잘 자고 내일 보자잉" },
  { sender: "준서", type: "text", time: "00:13", text: "롱이 생일 축하해줘야지 다같이" },
  { sender: "리오", type: "text", time: "00:14", text: "good night and happy birthday~" },
  { sender: "상현", type: "text", time: "00:14", text: "생일 축하해용 형~~~🩷🩷 내일봐요 다들!!" },
  { sender: "상현", type: "text", time: "00:14", text: "Happy birthday bro~" },
  { sender: "아르노", type: "text", time: "00:15", text: "晚安~" },
  { sender: "상원", type: "text", time: "00:15", text: "그래 다들 잘 자구~" },
  { sender: "씬롱", type: "text", time: "00:16", text: "안녕히 주무세용 ㅎㅎ" },
  { sender: "나", type: "text", time: "00:16", text: "굿나잇!" },

  { type: "date", label: "2026년 3월 12일 목요일" },
  { sender: "상현", type: "image", time: "15:36", files: ["kakao_06.jpg"] },
  { sender: "상현", type: "text", time: "15:36", text: "막내즈😚😚🥰" },
  { sender: "나", type: "text", time: "15:37", text: "귀엽다잉?" },
  { sender: "씬롱", type: "text", time: "15:37", text: "상혀니너무귀여워요 ㅎㅎ" },
  { sender: "리오", type: "image", time: "15:40", files: ["kakao_08.jpg"] },
  { sender: "리오", type: "text", time: "15:40", text: "우리도 바로 찍었다잉" },
  { sender: "준서", type: "text", time: "15:41", text: "이제 다들 비행기모드로 바꾸고" },
  { sender: "준서", type: "text", time: "15:41", text: "도착해서 다시 봅시다~✈️✈️" },

  { type: "date", label: "2026년 3월 15일 일요일" },
  { sender: "상현", type: "image", time: "21:14", files: ["kakao_09.jpg", "kakao_10.jpg"] },
  { sender: "상현", type: "text", time: "21:14", text: "이거 우리 같다고 하던데" },
  { sender: "상현", type: "text", time: "21:14", text: "어때요??" },
  { sender: "리오", type: "text", time: "21:15", text: "준차코는 맞지" },
  { sender: "준서", type: "text", time: "21:15", text: "너가 제일이야 리오야." },
  { sender: "리오", type: "text", time: "21:15", text: "...ㅎㅎ" },
  { sender: "아르노", type: "text", time: "21:16", text: "헉 귀엽네잉~~" },
  { sender: "나", type: "text", time: "21:16", text: "시나모롤이다ㅎㅎ :3" },
  { sender: "상현", type: "text", time: "21:16", text: "다 좀 비슷한 것 같기도.." },
  { sender: "상현", type: "text", time: "21:17", text: "신기하네" },
  { sender: "상현", type: "text", time: "21:17", text: "스케쥴 끝나고 인형 다같이 사는거 어때요??" },
  { sender: "씬롱", type: "text", time: "21:19", text: "좋다 ㅎㅎ" },
  { sender: "씬롱", type: "text", time: "21:19", text: "상현거 내가 사줄게 ㅎㅎㅎ" },
  { sender: "안신", type: "text", time: "21:20", text: "씬롱 나도" },
  { sender: "나", type: "text", time: "21:20", text: "뭐야 나도" },
  { sender: "준서", type: "text", time: "21:20", text: "고마워 롱아 ㅎㅎ" },
  { sender: "상원", type: "text", time: "21:21", text: "ㅋㅋㅋㅋ롱이가 다 사주는거야?" },
  { sender: "씬롱", type: "text", time: "21:21", text: "엑" },
  { sender: "씬롱", type: "text", time: "21:22", text: "Okay~ 내가 사줄게요😎😎" },
  { sender: "상원", type: "text", time: "21:23", text: "롱이 너무 낭만 있는데??" },
  { sender: "상현", type: "image", time: "21:25", files: ["kakao_11.jpg"] },
  { sender: "상현", type: "text", time: "21:25", text: "이거는 어때요??" },
  { sender: "상현", type: "text", time: "21:25", text: "이것도 매칭되나?" },
  { sender: "상현", type: "text", time: "21:26", text: "일~단 건우형은 키키치 ㅋ" },
  { sender: "안신", type: "text", time: "21:27", text: "ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ" },
  { sender: "준서", type: "text", time: "21:27", text: "오 다마고치?" },
  { sender: "아르노", type: "text", time: "21:28", text: "wow cute~" },
  { sender: "리오", type: "text", time: "21:28", text: "상현아..ㅋㅋㅋㅋㅋㅋㅋㅋㅋ" },
  { sender: "상원", type: "text", time: "21:28", text: "저 노란 원숭이? 귀엽다" },
  { sender: "나", type: "text", time: "21:28", text: "야" },
  { sender: "나", type: "text", time: "21:28", text: "아니야" },
  { sender: "나", type: "text", time: "21:29", text: "나 시나모롤할래" },
  { sender: "씬롱", type: "text", time: "21:29", text: "ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ" },
  { sender: "나", type: "text", time: "21:29", text: "원숭이 아니라고" },
  { sender: "안신", type: "text", time: "21:30", text: "黄猴 vs 小猪" },
  { sender: "상현", type: "text", time: "21:30", text: "나는 또 왜" },
  { sender: "나", type: "text", time: "21:31", text: "뭐야 저게" },
  { sender: "나", type: "text", time: "21:31", text: "아 뭔 노란원숭이야" },
  { sender: "나", type: "text", time: "21:31", text: "난 진짜 아니라니까??" },
  { sender: "상현", type: "text", time: "21:32", text: "하.." },


    { type: "date", label: "2026년 3월 17일 화요일" },
  { sender: "준서", type: "text", time: "16:20", text: "어 리오다" },
  { sender: "준서", type: "image", time: "16:20", files: ["kakao_12.jpg"] },
  { sender: "상현", type: "text", time: "16:22", text: "리오형 상원이형 여기서 뭐해요~~" },
  { sender: "리오", type: "text", time: "16:23", text: "ㅋㅋㅋㅋㅋ뭐야" },
  { sender: "상원", type: "text", time: "16:24", text: "귀엽다" },
  { sender: "상원", type: "text", time: "16:24", text: "형 저거 같이 사자" },
  { sender: "나", type: "image", time: "16:25", files: ["kakao_13.jpg"] },
  { sender: "나", type: "text", time: "16:25", text: "리오천국" },
  { sender: "씬롱", type: "image", time: "16:26", files: ["kakao_14.JPG"] },
  { sender: "씬롱", type: "text", time: "16:26", text: "Iloveleo~" },
  { sender: "리오", type: "text", time: "16:27", text: "아니 왜이렇게 많아" },
  { sender: "안신", type: "image", time: "16:28", files: ["kakao_15.JPG"] },
  { sender: "안신", type: "text", time: "16:28", text: "이건 豪哥랑 상원형?" },
  { sender: "상원", type: "text", time: "16:30", text: "오 이것도 세트네 같이 사자 형" },
  { sender: "아르노", type: "text", time: "16:31", text: "😈😈😈💜" },
  { sender: "상현", type: "image", time: "16:33", files: ["kakao_16.jpg", "kakao_17.jpg"] },
  { sender: "상현", type: "text", time: "16:33", text: "어 건우형이다" },
  { sender: "상현", type: "text", time: "16:33", text: "물론 2 ㅋㅋ" },
  { sender: "나", type: "text", time: "16:34", text: "아 나 원숭이 안할래.." },
  { sender: "나", type: "text", time: "16:34", text: "나 시나모롤할래" },
  { sender: "아르노", type: "image", time: "16:36", files: ["kakao_18.jpg"] },
  { sender: "아르노", type: "text", time: "16:37", text: "hello kitty anxin~" },
  { sender: "안신", type: "text", time: "16:38", text: "那个在哪里买的？我也想买" },
  { sender: "준서", type: "image", time: "16:40", files: ["kakao_19.jpg"] },
  { sender: "준서", type: "text", time: "16:40", text: "롱이다" },
  { sender: "상현", type: "image", time: "16:41", files: ["kakao_20.JPG"] },
  { sender: "아르노", type: "image", time: "16:42", files: ["kakao_21.jpg"] },
  { sender: "나", type: "image", time: "16:44", files: ["kakao_22.jpg"] },
  { sender: "씬롱", type: "text", time: "16:45", text: "...😬😬" },


  { type: "date", label: "2026년 3월 22일 일요일" },
  { date: "2026.03.23 월", sender: "준서", type: "text", time: "19:40", text: "야 누가 롱이 매운거먹였냐" },
  { sender: "준서", type: "text", time: "19:40", text: "먹은지 10분 넘었다는데 아직도 애가 혼미한데?" },
  { sender: "상현", type: "text", time: "19:42", text: "ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ 💦💦💦" },
  { sender: "리오", type: "text", time: "19:43", text: "무슨일이야" },
  { sender: "아르노", type: "text", time: "19:43", text: "뭐 먹었어요?" },
  { sender: "준서", type: "text", time: "19:45", text: "틈새라면 매운거 오리지널 먹었대.." },
  { sender: "안신", type: "text", time: "19:45", text: "ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ " },
  { sender: "상원", type: "text", time: "19:46", text: "우유 아직도 먹는 중.." },
  { sender: "안신", type: "text", time: "19:46", text: "씬롱 맵찔이야" },
  { sender: "나", type: "text", time: "19:46", text: "..........다시 미안.." },
  { sender: "상현", type: "text", time: "19:47", text: "역시~.." },
  { sender: "상현", type: "text", time: "19:47", text: "매운건 건우형이지 뭐" },
  { sender: "리오", type: "text", time: "19:47", text: "ㅋㅋㅋㅋㅋㅋㅋ" },
  { sender: "리오", type: "text", time: "19:47", text: "이런.." },
  { sender: "나", type: "text", time: "19:49", text: "우유 사러 가는 중이야.." },
  { sender: "나", type: "text", time: "19:49", text: "빨리 사올게요..ㅠㅠㅠㅠㅠ" },


  { type: "date", label: "2026년 3월 26일 목요일" },
  { sender: "상현", type: "image", time: "20:52", files: ["kakao_23.jpg"] },
  { sender: "상현", type: "text", time: "20:52", text: "시니형이 기타 쳐줬으면 좋겠다~~~~" },
  { sender: "준서", type: "text", time: "20:53", text: "ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ" },
  { sender: "준서", type: "text", time: "20:53", text: "저건 언제 봐도 귀엽네" },
  { sender: "안신", type: "text", time: "20:55", text: "악뭐야" },
  { sender: "안신", type: "text", time: "20:55", text: "샤오쭈뭐해!!!" },
  { sender: "아르노", type: "text", time: "20:55", text: "ㅋㅋㅋㅋㅋㅋㅋㅋ귀엽다잉" },
  { sender: "리오", type: "text", time: "20:56", text: "baby anxini" },
  { sender: "리오", type: "text", time: "20:56", text: "아오 귀여워" },
  { sender: "안신", type: "image", time: "20:57", files: ["kakao_24.jpg"] },
  { sender: "안신", type: "text", time: "20:57", text: "小小小小猪" },
  { sender: "준서", type: "text", time: "20:57", text: "얘도 진짜 볼때마다 귀엽다" },
  { sender: "상현", type: "text", time: "20:58", text: "...." },
  { sender: "상현", type: "text", time: "20:58", text: "저 사진은 이제 너무 봐서 익숙해" },
  { sender: "상현", type: "text", time: "20:58", text: "I'm fine~" },
  { sender: "나", type: "image", time: "21:00", files: ["kakao_25.jpg"] },
  { sender: "나", type: "text", time: "21:00", text: "ㅋㅋ" },
  { sender: "나", type: "text", time: "21:00", text: "아기롱이" },
  { sender: "리오", type: "text", time: "21:02", text: "ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ아귀여워!!!" },
  { sender: "준서", type: "text", time: "21:02", text: "ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ" },
  { sender: "씬롱", type: "text", time: "21:04", text: "?????" },
  { sender: "씬롱", type: "text", time: "21:04", text: "天哪" },
  { sender: "상현", type: "text", time: "21:05", text: "ㅋㅋㅋㅋㅋㅋㅋ롱이형.." },
  { sender: "씬롱", type: "text", time: "21:05", text: "아뭐에ㅖ요" },
  { sender: "씬롱", type: "text", time: "21:05", text: "김건누형!!!!!!!!!!!!!!!!" },
  { sender: "씬롱", type: "text", time: "21:05", text: ";;;;;;;;;;" },
  { sender: "상원", type: "text", time: "21:06", text: "역시 막내들 다 귀엽구마잉~" },
  { sender: "상원", type: "text", time: "21:06", text: "고 구마잉~" },
  { sender: "나", type: "text", time: "21:06", text: "?" },
  { sender: "준서", type: "text", time: "21:07", text: "..." },
  { sender: "아르노", type: "text", time: "21:07", text: "crazy" },
  { sender: "나", type: "text", time: "21:09", text: "아귀여워서그랬엄미안ㄹ해" },
  { sender: "나", type: "text", time: "21:09", text: "아롱이가사람친다" },
  { sender: "나", type: "text", time: "21:09", text: "아아아악" },
  { sender: "리오", type: "text", time: "21:10", text: "아롱이 귀여워~~" },
  { sender: "씬롱", type: "text", time: "21:11", text: "😬😬😬😬😬😵😵" },
  { sender: "씬롱", type: "text", time: "21:12", text: "그럼 형들도 옛날 사진 보여줘용....ㅡㅡ" },
  { sender: "준서", type: "text", time: "21:12", text: "아~~쉽게 지금 사진이 없네ㅠ.ㅠ" },
  { sender: "상원", type: "text", time: "21:13", text: "ㅋㅋㅋㅋㅋㅋ" },
  { sender: "상원", type: "text", time: "21:13", text: "막내들만 보여주는걸로~" },
  { sender: "리오", type: "text", time: "21:13", text: "맞아 우린 아쉽게 없다 사진이 ㅎㅎ" },
  { sender: "상현", type: "text", time: "21:14", text: "뭐야 너무해" },
  { sender: "상현", type: "text", time: "21:14", text: "그냥 우리만 또 놀림당한거야" },
  { sender: "안신", type: "text", time: "21:16", text: "너가 시작했잔ㅎ아." },
  { sender: "씬롱", type: "text", time: "21:16", text: ".............." },


  { type: "date", label: "2026년 4월 1일 수요일" },
  { sender: "리오", type: "text", time: "13:05", text: "메가 주문받습니데이~" },
  { sender: "리오", type: "text", time: "13:05", text: "메뉴 보내주십쇼" },
  { sender: "나", type: "text", time: "13:06", text: "감사합니다~~" },
  { sender: "씬롱", type: "text", time: "13:07", text: "Love you leo!!!😬😬" },
  { sender: "준서", type: "text", time: "13:07", text: "나는 아이스녹차! 고마워ㅎㅎ" },
  { sender: "상현", type: "text", time: "13:07", text: "뭘 골라야 잘 골랐다고 소문이 날까!!" },
  { sender: "상원", type: "text", time: "13:07", text: "헉 나도 같은 고민중ㅋㅋ" },
  { sender: "나", type: "text", time: "13:08", text: "전 아아로 하겠습니다~~" },
  { sender: "나", type: "text", time: "13:08", text: "편하게 다들 복붙해서 적읍시다" },
  { sender: "나", type: "text", time: "13:08", text: "아이스 녹차1/아이스 아메리카노1/아이스 딸기라떼1" },
  { sender: "아르노", type: "text", time: "13:09", text: "아이스 녹차2/아이스 아메리카노1/아이스 딸기라떼1" },
  { sender: "아르노", type: "text", time: "13:09", text: "💜💜" },
  { sender: "상현", type: "text", time: "13:11", text: "딸기라떼 누구거야" },
  { sender: "씬롱", type: "text", time: "13:11", text: "나 ㅎㅎ" },
  { sender: "상현", type: "text", time: "13:12", text: "역시..🍓🍓" },
  { sender: "안신", type: "text", time: "13:13", text: "저는 bubble tea!!" },
  { sender: "상원", type: "text", time: "13:14", text: "아이스 녹차2/아이스 아메리카노2/아이스 딸기라떼1/흑당버블라떼1" },
  { sender: "상현", type: "text", time: "13:15", text: "므에엥 형 아아 마실거에요..?" },
  { sender: "상현", type: "text", time: "13:15", text: "배신이야ㅠㅠㅠㅠ" },
  { sender: "상원", type: "text", time: "13:16", text: "관리해야지 그래도 ㅎㅎ.." },
  { sender: "상현", type: "text", time: "13:16", text: "...." },
  { sender: "상현", type: "text", time: "13:17", text: "녹차3/아이스 아메리카노3/아이스 딸기라떼1/흑당버블라떼1" },
  { sender: "상현", type: "text", time: "13:17", text: "당 없으니까 두 잔 먹을래용ㅎㅎ" },
  { sender: "준서", type: "text", time: "13:17", text: "장하다 우리 막내! 🥹🥹" },
  { sender: "준서", type: "text", time: "13:17", text: "녹차가 깔끔하고 좋더라고" },
  { sender: "나", type: "text", time: "13:18", text: "너 디저트랑 먹을거지" },
  { sender: "나", type: "text", time: "13:18", text: "ㅋㅋㅋㅋㅋㅋ" },
  { sender: "리오", type: "text", time: "13:19", text: "좋다.. 같이먹자" },
  { sender: "리오", type: "text", time: "13:19", text: "올 때 몇 개 챙겨와~ㅎㅎ" },
  { sender: "상현", type: "text", time: "13:19", text: "합법디저트 인정?" },
  { sender: "나", type: "text", time: "13:20", text: "그래 같이 먹자 ㅋㅋㅋ" },
  { sender: "상현", type: "text", time: "13:20", text: "산도랑 이것저것 몇 개 챙겨갈게용~" }

  ];

  function getProfileData(sender) {
    return KAKAO_PROFILES[sender] || {
      name: `${sender} ALD1`,
      image: ""
    };
  }

  function getMessageImageSrc(filename) {
    return `assets/pictures/${filename}`;
  }

  function createAvatarHTML(sender) {
    const profile = getProfileData(sender);

    if (profile.image) {
      return `
        <div class="kakao-avatar">
          <img
            src="${profile.image}"
            alt="${profile.name}"
            onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;kakao-avatar-placeholder&quot;></div>';"
          >
        </div>
      `;
    }

    return `
      <div class="kakao-avatar">
        <div class="kakao-avatar-placeholder"></div>
      </div>
    `;
  }

  function createDateDividerHTML(label) {
    return `
      <div class="kakao-date-divider">
        <div class="kakao-date-pill">
          <img src="assets/icons/kakao_calendar.png" alt="" class="kakao-date-icon">
          <span>${label}</span>
          <span class="kakao-date-chevron">›</span>
        </div>
      </div>
    `;
  }

  function createBubbleHTML(message, isMe, isFirstInGroup) {
    const bubbleClass = [
      "kakao-bubble",
      isMe ? "is-me" : "",
      isFirstInGroup ? "is-first" : ""
    ].filter(Boolean).join(" ");

    return `<div class="${bubbleClass}">${message.text}</div>`;
  }

  function createMediaGroupHTML(files) {
    const layoutClass = `is-${Math.min(files.length, 4)}`;
    return `
      <div class="kakao-media-group ${layoutClass}">
        ${files.map((file) => `
          <div class="kakao-media-item">
            <img src="${getMessageImageSrc(file)}" alt="" loading="lazy">
          </div>
        `).join("")}
      </div>
    `;
  }

  function groupMessages(items) {
    const groups = [];
    let currentGroup = null;

    items.forEach((item) => {
      if (item.type === "date") {
        groups.push({ type: "date", label: item.label });
        currentGroup = null;
        return;
      }

      const canJoin =
        currentGroup &&
        currentGroup.type === "messageGroup" &&
        currentGroup.sender === item.sender &&
        currentGroup.time === item.time;

      if (!canJoin) {
        currentGroup = {
          type: "messageGroup",
          sender: item.sender,
          time: item.time,
          messages: [item]
        };
        groups.push(currentGroup);
        return;
      }

      currentGroup.messages.push(item);
    });

    return groups;
  }

 function createMessageGroupHTML(group) {
  const isMe = group.sender === "나";
  const profile = getProfileData(group.sender);
  const rowClass = isMe ? "kakao-message-row is-me" : "kakao-message-row";

  let bodyHTML = "";

  group.messages.forEach((message, index) => {
    const isLast = index === group.messages.length - 1;

    if (message.type === "text") {
      bodyHTML += `
        <div class="kakao-bubble-line">
          ${createBubbleHTML(message, isMe, false)}
          ${isLast ? `<span class="kakao-time">${group.time}</span>` : ""}
        </div>
      `;
      return;
    }

    if (message.type === "image") {
      bodyHTML += `
        <div class="kakao-media-block">
          <div class="kakao-media-wrap">
            ${createMediaGroupHTML(message.files)}
            ${!isMe ? `
              <button class="kakao-share-btn" type="button" aria-label="공유">
                <img src="assets/icons/kakao_share.png" alt="" class="kakao-share-icon">
              </button>
            ` : ""}
          </div>
          ${isLast ? `
            <div class="kakao-media-time-line">
              <span class="kakao-time">${group.time}</span>
            </div>
          ` : ""}
        </div>
      `;
    }
  });

  return `
    <div class="${rowClass}">
      ${!isMe ? createAvatarHTML(group.sender) : ""}
      <div class="kakao-message-main">
        ${!isMe ? `<div class="kakao-sender-name">${profile.name}</div>` : ""}
        <div class="kakao-bubble-stack">
          ${bodyHTML}
        </div>
      </div>
    </div>
  `;
}

  function renderKakaoConversation() {
    const groups = groupMessages(KAKAO_CHAT_DATA);
    kakaoConversation.innerHTML = groups.map((group) => {
      if (group.type === "date") {
        return createDateDividerHTML(group.label);
      }
      return createMessageGroupHTML(group);
    }).join("");
  }

  function scrollKakaoToBottom() {
    const setBottom = () => {
      kakaoScroll.scrollTop = kakaoScroll.scrollHeight;
    };

    requestAnimationFrame(setBottom);
    setTimeout(setBottom, 0);
    setTimeout(setBottom, 120);
    setTimeout(setBottom, 320);
    setTimeout(setBottom, 700);
  }

  window.resetKakaoAppState = function () {
    scrollKakaoToBottom();
  };

  renderKakaoConversation();
  scrollKakaoToBottom();
})();


/* =========================
   INSTAGRAM APP
========================= */
(function initInstagramApp() {
  const instagramScreen = document.getElementById("instagramScreen");
  if (!instagramScreen) return;

  const instagramProfilePage = document.getElementById("instagramProfilePage");
  const instagramStoryPage = document.getElementById("instagramStoryPage");
  const instagramPostDetailPage = document.getElementById("instagramPostDetailPage");

  const instagramPostGrid = document.getElementById("instagramPostGrid");

  const instagramStoryOpenBtn = document.getElementById("instagramStoryOpenBtn");
  const instagramStoryCloseBtn = document.getElementById("instagramStoryCloseBtn");
  const instagramStoryStage = document.getElementById("instagramStoryStage");
  const instagramStoryProgress = document.getElementById("instagramStoryProgress");
  const instagramStoryPrevHit = document.getElementById("instagramStoryPrevHit");
  const instagramStoryNextHit = document.getElementById("instagramStoryNextHit");

  const instagramPostDetailBack = document.getElementById("instagramPostDetailBack");
  const instagramPostDetailScroll = document.getElementById("instagramPostDetailScroll");
  const instagramPostSlider = document.getElementById("instagramPostSlider");
  const instagramPostDots = document.getElementById("instagramPostDots");
  const instagramPostCounter = document.getElementById("instagramPostCounter");
  const instagramPostTimeAgo = document.getElementById("instagramPostTimeAgo");
  const instagramPostCaption = document.getElementById("instagramPostCaption");

  const instagramHeartToggleBtn = document.getElementById("instagramHeartToggleBtn");
  const instagramHeartToggleIcon = document.getElementById("instagramHeartToggleIcon");

  if (
    !instagramProfilePage ||
    !instagramStoryPage ||
    !instagramPostDetailPage ||
    !instagramPostGrid ||
    !instagramStoryStage ||
    !instagramStoryProgress ||
    !instagramPostSlider ||
    !instagramPostDots ||
    !instagramPostCounter ||
    !instagramPostTimeAgo ||
    !instagramPostCaption ||
    !instagramHeartToggleBtn ||
    !instagramHeartToggleIcon
  ) return;

  let currentStoryIndex = 0;
  let currentPost = null;
  let currentPostIndex = 0;
  let currentHeartFilled = false;

  let isSliderDragging = false;
  let suppressGridClick = false;
  let dragStartX = 0;
  let dragStartScrollLeft = 0;

  function setActiveInstagramPage(targetPage) {
    [
      instagramProfilePage,
      instagramStoryPage,
      instagramPostDetailPage
    ].forEach((page) => {
      if (!page) return;
      page.classList.remove("active");
    });

    if (targetPage) {
      targetPage.classList.add("active");
    }
  }

  const INSTAGRAM_BASE_PATH = "assets/pictures/ig/gw";

const INSTAGRAM_STORIES = [
  { src: `${INSTAGRAM_BASE_PATH}/insta_story_1.jpg`, timeAgo: "5시간 전" },
  { src: `${INSTAGRAM_BASE_PATH}/insta_story_2.jpg`, timeAgo: "4시간 전" },
  { src: `${INSTAGRAM_BASE_PATH}/insta_story_3.jpg`, timeAgo: "3시간 전" },
  { src: `${INSTAGRAM_BASE_PATH}/insta_story_4.jpg`, timeAgo: "7분 전" }
];

const INSTAGRAM_POSTS = [
  { id: 14, type: "image", mediaCount: 14, timeAgo: "2026년 3월 22일", caption: "" },
  { id: 13, type: "image", mediaCount: 7, timeAgo: "2026년 3월 11일", caption: "❤️" },
  { id: 12, type: "image", mediaCount: 9, timeAgo: "2026년 3월 5일", caption: "" },
  { id: 11, type: "image", mediaCount: 10, timeAgo: "2026년 2월 24일", caption: "" },
  { id: 10, type: "image", mediaCount: 5, timeAgo: "2026년 2월 21일", caption: "" },
  { id: 9, type: "image", mediaCount: 7, timeAgo: "2026년 1월 25일", caption: "Bハ人드_Long" },
  { id: 8, type: "image", mediaCount: 10, timeAgo: "2026년 1월 11일", caption: "" },
  { id: 7, type: "image", mediaCount: 5, timeAgo: "2026년 1월 2일", caption: "" },
  { id: 6, type: "image", mediaCount: 6, timeAgo: "2025년 12월 21일", caption: "" },
  { id: 5, type: "image", mediaCount: 3, timeAgo: "2025년 12월 5일", caption: "" },
  { id: 4, type: "image", mediaCount: 3, timeAgo: "2025년 5월 7일", caption: "" },
  { id: 3, type: "video", mediaCount: 1, timeAgo: "2025년 4월 20일", caption: "" },
  { id: 2, type: "image", mediaCount: 2, timeAgo: "2025년 4월 20일", caption: "" },

  /* 1번 게시물: 사진+영상 혼합 */
  {
    id: 1,
    type: "image",
    mediaCount: 4,
    timeAgo: "2025년 4월 11일",
    caption: "",
    media: [
      { type: "image" },  // insta_post_1-1.jpg
      { type: "image" },  // insta_post_1-2.jpg
      { type: "image" },  // insta_post_1-3.jpg
      { type: "video" }   // insta_post_1-4.mp4
    ]
  }
];

const instagramStoryTime = instagramStoryPage.querySelector(".instagram-story-time");

function getFallbackPostMediaItems(post) {
  return Array.from({ length: post.mediaCount }, (_, index) => ({
    type: post.type,
    index: index + 1
  }));
}

function getPostMediaItems(post) {
  if (Array.isArray(post.media) && post.media.length) {
    return post.media.map((item, index) => ({
      type: item.type || "image",
      index: index + 1,
      src: item.src || "",
      poster: item.poster || ""
    }));
  }

  return getFallbackPostMediaItems(post);
}

function getPostMediaPath(postId, media) {
  if (media.src) return media.src;
  const ext = media.type === "video" ? "mp4" : "jpg";
  return `${INSTAGRAM_BASE_PATH}/insta_post_${postId}-${media.index}.${ext}`;
}

function getPostMediaPosterPath(postId, media) {
  if (media.poster) return media.poster;
  return `${INSTAGRAM_BASE_PATH}/insta_post_${postId}-${media.index}.jpg`;
}

function getGridCoverPath(post) {
  const firstMedia = getPostMediaItems(post)[0];
  if (!firstMedia) return "";

  if (firstMedia.type === "video") {
    return getPostMediaPosterPath(post.id, firstMedia);
  }

  return getPostMediaPath(post.id, firstMedia);
}

function getGridOverlayIconPath(post) {
  const mediaItems = getPostMediaItems(post);
  const hasVideo = mediaItems.some((item) => item.type === "video");

  if (hasVideo) return "assets/icons/insta_post_video.png";
  if (mediaItems.length > 1) return "assets/icons/insta_post_pictures.png";
  return "";
}

function renderInstagramGrid() {
  instagramPostGrid.innerHTML = INSTAGRAM_POSTS.map((post) => {
    const coverPath = getGridCoverPath(post);
    const overlayIconPath = getGridOverlayIconPath(post);

    const overlayIcon = overlayIconPath
      ? `
        <span class="instagram-grid-stack-badge">
          <img src="${overlayIconPath}" alt="" class="instagram-grid-stack-icon">
        </span>
      `
      : "";

    return `
      <button class="instagram-grid-item" type="button" data-instagram-post-id="${post.id}">
        <div class="instagram-grid-preview">
          <img src="${coverPath}" alt="" loading="lazy" class="instagram-grid-media">
        </div>
        ${overlayIcon}
      </button>
    `;
  }).join("");
}

function renderStoryProgress() {
  instagramStoryProgress.innerHTML = INSTAGRAM_STORIES.map((_, index) => {
    let stateClass = "";
    if (index < currentStoryIndex) stateClass = "is-done";
    if (index === currentStoryIndex) stateClass = "is-active";

    return `
      <div class="instagram-story-progress-bar ${stateClass}">
        <div class="instagram-story-progress-fill"></div>
      </div>
    `;
  }).join("");
}

function renderStory() {
  const story = INSTAGRAM_STORIES[currentStoryIndex];
  if (!story) return;

  instagramStoryStage.innerHTML = `<img src="${story.src}" alt="" class="instagram-story-image">`;

  if (instagramStoryTime) {
    instagramStoryTime.textContent = story.timeAgo;
  }

  renderStoryProgress();
}

function openStoryViewer() {
  currentStoryIndex = 0;
  renderStory();
  setActiveInstagramPage(instagramStoryPage);
}

function goToNextStory() {
  if (currentStoryIndex >= INSTAGRAM_STORIES.length - 1) {
    setActiveInstagramPage(instagramProfilePage);
    return;
  }

  currentStoryIndex += 1;
  renderStory();
}

function goToPrevStory() {
  if (currentStoryIndex <= 0) return;
  currentStoryIndex -= 1;
  renderStory();
}

function renderPostDots(count, activeIndex) {
  if (count <= 1) {
    instagramPostDots.innerHTML = "";
    return;
  }

  instagramPostDots.innerHTML = Array.from({ length: count }, (_, index) => `
    <span class="instagram-post-dot ${index === activeIndex ? "active" : ""}"></span>
  `).join("");
}

function updatePostCounter(count, activeIndex) {
  instagramPostCounter.textContent = `${activeIndex + 1}/${count}`;
}

function updateHeartIcon() {
  instagramHeartToggleIcon.src = currentHeartFilled
    ? "assets/icons/insta_heart_fill.png"
    : "assets/icons/insta_heart_empty.png";
}

function forceSliderToFirst() {
  if (!instagramPostSlider) return;

  currentPostIndex = 0;
  instagramPostSlider.scrollLeft = 0;
  instagramPostSlider.scrollTo({ left: 0, behavior: "auto" });

  requestAnimationFrame(() => {
    instagramPostSlider.scrollLeft = 0;
    instagramPostSlider.scrollTo({ left: 0, behavior: "auto" });
  });

  setTimeout(() => {
    instagramPostSlider.scrollLeft = 0;
    instagramPostSlider.scrollTo({ left: 0, behavior: "auto" });
    syncPostSliderState();
  }, 0);

  setTimeout(() => {
    instagramPostSlider.scrollLeft = 0;
    instagramPostSlider.scrollTo({ left: 0, behavior: "auto" });
    syncPostSliderState();
  }, 120);
}

function renderPostDetail(postId) {
  const post = INSTAGRAM_POSTS.find((item) => item.id === Number(postId));
  if (!post) return;

  currentPost = post;
  currentPostIndex = 0;
  currentHeartFilled = false;

  const mediaItems = getPostMediaItems(post);

  const slidesHTML = mediaItems.map((media) => {
    const src = getPostMediaPath(post.id, media);

    if (media.type === "video") {
      return `
        <div class="instagram-post-slide">
          <video
            src="${src}"
            poster="${getPostMediaPosterPath(post.id, media)}"
            controls
            playsinline
            preload="metadata"
          ></video>
        </div>
      `;
    }

    return `
      <div class="instagram-post-slide">
        <img src="${src}" alt="" loading="lazy">
      </div>
    `;
  }).join("");

  instagramPostSlider.innerHTML = slidesHTML;
  instagramPostTimeAgo.textContent = post.timeAgo;
  instagramPostCaption.innerHTML = post.caption
    ? `<strong>wxcyrcl</strong> ${post.caption}`
    : "";

  updateHeartIcon();
  renderPostDots(mediaItems.length, 0);
  updatePostCounter(mediaItems.length, 0);

  setActiveInstagramPage(instagramPostDetailPage);

  if (instagramPostDetailScroll) {
    instagramPostDetailScroll.scrollTop = 0;
  }

  forceSliderToFirst();
}

function syncPostSliderState() {
  if (!currentPost) return;

  const mediaCount = getPostMediaItems(currentPost).length;
  const slideWidth = instagramPostSlider.clientWidth || 1;
  const index = Math.round(instagramPostSlider.scrollLeft / slideWidth);

  currentPostIndex = Math.max(0, Math.min(index, mediaCount - 1));
  renderPostDots(mediaCount, currentPostIndex);
  updatePostCounter(mediaCount, currentPostIndex);
}

  function startSliderDrag(clientX) {
    isSliderDragging = true;
    suppressGridClick = false;
    dragStartX = clientX;
    dragStartScrollLeft = instagramPostSlider.scrollLeft;
    instagramPostSlider.classList.add("dragging");
  }

  function moveSliderDrag(clientX) {
    if (!isSliderDragging) return;

    const deltaX = clientX - dragStartX;
    if (Math.abs(deltaX) > 4) {
      suppressGridClick = true;
    }

    instagramPostSlider.scrollLeft = dragStartScrollLeft - deltaX;
  }

  function endSliderDrag() {
    if (!isSliderDragging) return;

    isSliderDragging = false;
    instagramPostSlider.classList.remove("dragging");
    requestAnimationFrame(syncPostSliderState);

    setTimeout(() => {
      suppressGridClick = false;
    }, 60);
  }

  function resetInstagramAppState() {
    setActiveInstagramPage(instagramProfilePage);
    currentStoryIndex = 0;
    currentPost = null;
    currentPostIndex = 0;
    currentHeartFilled = false;
    isSliderDragging = false;
    suppressGridClick = false;

    if (instagramPostSlider) {
      instagramPostSlider.scrollLeft = 0;
      instagramPostSlider.scrollTo({ left: 0, behavior: "auto" });
      instagramPostSlider.innerHTML = "";
      instagramPostSlider.classList.remove("dragging");
    }

    if (instagramPostDots) {
      instagramPostDots.innerHTML = "";
    }

    if (instagramPostCounter) {
      instagramPostCounter.textContent = "1/1";
    }

    if (instagramPostCaption) {
      instagramPostCaption.innerHTML = "";
    }

    updateHeartIcon();
  }

  instagramPostGrid.addEventListener("click", (event) => {
    if (suppressGridClick) return;

    const button = event.target.closest(".instagram-grid-item");
    if (!button) return;
    renderPostDetail(button.dataset.instagramPostId);
  });

  if (instagramStoryOpenBtn) {
    instagramStoryOpenBtn.addEventListener("click", openStoryViewer);
  }

  if (instagramStoryCloseBtn) {
    instagramStoryCloseBtn.addEventListener("click", () => {
      setActiveInstagramPage(instagramProfilePage);
    });
  }

  if (instagramStoryNextHit) {
    instagramStoryNextHit.addEventListener("click", goToNextStory);
  }

  if (instagramStoryPrevHit) {
    instagramStoryPrevHit.addEventListener("click", goToPrevStory);
  }

  if (instagramPostDetailBack) {
    instagramPostDetailBack.addEventListener("click", () => {
      setActiveInstagramPage(instagramProfilePage);
    });
  }

  if (instagramPostSlider) {
    instagramPostSlider.addEventListener("scroll", () => {
      requestAnimationFrame(syncPostSliderState);
    });

    instagramPostSlider.addEventListener("mousedown", (event) => {
      startSliderDrag(event.clientX);
    });

    window.addEventListener("mousemove", (event) => {
      moveSliderDrag(event.clientX);
    });

    window.addEventListener("mouseup", endSliderDrag);

    instagramPostSlider.addEventListener("mouseleave", endSliderDrag);

    instagramPostSlider.addEventListener("touchstart", (event) => {
      if (!event.touches[0]) return;
      startSliderDrag(event.touches[0].clientX);
    }, { passive: true });

    instagramPostSlider.addEventListener("touchmove", (event) => {
      if (!event.touches[0]) return;
      moveSliderDrag(event.touches[0].clientX);
    }, { passive: true });

    instagramPostSlider.addEventListener("touchend", endSliderDrag);
    instagramPostSlider.addEventListener("touchcancel", endSliderDrag);

    instagramPostSlider.addEventListener("dragstart", (event) => {
      event.preventDefault();
    });
  }

  if (instagramHeartToggleBtn) {
    instagramHeartToggleBtn.addEventListener("click", () => {
      currentHeartFilled = !currentHeartFilled;
      updateHeartIcon();
    });
  }

  window.resetInstagramAppState = resetInstagramAppState;

  renderInstagramGrid();
  resetInstagramAppState();
})();