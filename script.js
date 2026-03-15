/* ===================== */
/* 비밀번호 설정 */
/* ===================== */

const PASSWORD = "4399"

let input = ""



/* ===================== */
/* 숫자 입력 */
/* ===================== */

function pressKey(num){

if(input.length >= 4) return

input += num

updateDots()

checkPassword()

}



/* ===================== */
/* 삭제 */
/* ===================== */

function deleteKey(){

input = input.slice(0,-1)

updateDots()

}



/* ===================== */
/* 점 표시 업데이트 */
/* ===================== */

function updateDots(){

for(let i=1;i<=4;i++){

const dot = document.getElementById("dot"+i)

if(i <= input.length){

dot.classList.add("filled")

}

else{

dot.classList.remove("filled")

}

}

}



/* ===================== */
/* 비밀번호 확인 */
/* ===================== */

function checkPassword(){

if(input.length === 4){

if(input === PASSWORD){

unlockPhone()

}

else{

wrongPassword()

}

}

}



/* ===================== */
/* 잠금 해제 */
/* ===================== */

function unlockPhone(){

const lockscreen = document.querySelector(".lockscreen")
const homescreen = document.querySelector(".homescreen")

lockscreen.style.display="none"
homescreen.style.display="block"

}



/* ===================== */
/* 틀린 비밀번호 */
/* ===================== */

function wrongPassword(){

const lockscreen = document.querySelector(".lockscreen")
const error = document.getElementById("error")

error.innerText = "Wrong Passcode"

lockscreen.classList.add("shake")

setTimeout(()=>{

lockscreen.classList.remove("shake")

},400)

input=""
updateDots()

}
