/* =====================================================
   iPHONE WEB UI SCRIPT
   - 실시간 날짜 / 시간
   - 잠금화면 비밀번호 해제
   - 비밀번호 오류 시 shake 애니메이션
===================================================== */


/* =====================================================
   1️⃣ 실시간 날짜 + 시간
===================================================== */

function updateDateTime(){

    const now = new Date()

    /* 시간 */

    let hours = now.getHours().toString().padStart(2,'0')
    let minutes = now.getMinutes().toString().padStart(2,'0')

    /* 잠금화면 시간 */

    const timeElement = document.getElementById("time")
    if(timeElement){
        timeElement.innerText = hours + ":" + minutes
    }

    /* 상태바 시간 */

    const statusTime = document.getElementById("status-time")
    if(statusTime){
        statusTime.innerText = hours + ":" + minutes
    }


    /* 날짜 */

    let year = now.getFullYear()
    let month = now.getMonth() + 1
    let day = now.getDate()

    const dateElement = document.getElementById("date")
    if(dateElement){
        dateElement.innerText =
        year + "년 " + month + "월 " + day + "일"
    }

}


/* 페이지 열리면 바로 실행 */

updateDateTime()

/* 1초마다 업데이트 */

setInterval(updateDateTime,1000)




/* =====================================================
   2️⃣ 비밀번호 잠금 해제
===================================================== */

function unlockPhone(){

    /* 입력한 비밀번호 */

    const input = document.getElementById("passcode").value

    /* 실제 비밀번호 (원하는 값으로 수정 가능) */

    const correctPassword = "4399"


    /* 비밀번호 맞으면 */

    if(input === correctPassword){

        document.getElementById("lockscreen").style.display = "none"

        document.getElementById("home").style.display = "block"

    }

    /* 틀리면 */

    else{

        shakePhone()

    }

}




/* =====================================================
   3️⃣ 틀린 비밀번호 → 아이폰 shake 효과
===================================================== */

function shakePhone(){

    const phone = document.querySelector(".phone")

    phone.classList.add("shake")

    setTimeout(()=>{

        phone.classList.remove("shake")

    },400)

}




/* =====================================================
   4️⃣ Enter 키로 비밀번호 입력 가능
===================================================== */

const passInput = document.getElementById("passcode")

if(passInput){

passInput.addEventListener("keypress",function(e){

    if(e.key === "Enter"){

        unlockPhone()

    }

})

}
