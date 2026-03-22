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
          <p>귀걸이<br>반지(너무티남)<br><strong>영양제?➡️홍삼(에브리타임)<br><strong>+ 파리 가서 둘러보기</strong><br><strong>케이크 - 롱이한테 물어보기 딸기생크림케이크</strong></p>
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
      name: "롱이♥️ ALD1",
      avatar: "롱",
      time: "어제",
      inputType: "iMessage",
      messages: [
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
        { type: "text-you", text: "..." }
      ]
    },
    {
      id: "zhouwanxin",
      name: "조우안신 ALD1",
      avatar: "조",
      time: "어제",
      inputType: "iMessage",
      messages: [
        { type: "text-you", text: "ㅇㅋ" }
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
  id: "irio",
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

    { type: "text-me", text: "좋네 너 최애 책 맞지? 읽어보고 싶었는데" },
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
            <img src="assets/icons/message_voice_you.png" alt="">
          </div>
        </div>
      `;
    }

    if (message.type === "voice-me") {
      return `
        <div class="messages-row me">
          <div class="messages-bubble voice-bubble">
            <img src="assets/icons/message_voice_me.png" alt="">
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
