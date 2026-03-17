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
    text: "[MPD직캠] 알파드라이브원 건우 직캠 4K 'Cinnamon Shake' (ALPHA DRIVE ONE GEONWOO FanCam) | @MCOUNTDOWN_2026.1.22",
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
          <p><a href="#">https://youtu.be/43ilgl-PIAg?si=BUZ78RmA8mwLdiv_</a></p>
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
          <p>귀걸이<br>반지(너무티남)<br>옷?<br><strong>향수 - 파리 가서 구매</strong><br><strong>케이크 - 롱이한테 물어보기 딸기생크림케이크</strong></p>
          <p>Tea & Rock'n Roll - 그린, 베르가못, 레더</p>
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
