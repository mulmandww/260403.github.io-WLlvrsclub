/* REALTIME TIME */

function updateTime(){

const now = new Date()

let h = now.getHours().toString().padStart(2,'0')
let m = now.getMinutes().toString().padStart(2,'0')

document.getElementById("time").innerText = h + ":" + m
document.getElementById("status-time").innerText = h + ":" + m

let y = now.getFullYear()
let mo = now.getMonth()+1
let d = now.getDate()

document.getElementById("date").innerText =
y+"년 "+mo+"월 "+d+"일"

}

setInterval(updateTime,1000)

updateTime()



/* SLIDE UNLOCK */

const sliderBtn = document.getElementById("sliderBtn")

let dragging=false

sliderBtn.addEventListener("mousedown",()=>{

dragging=true

})

document.addEventListener("mousemove",(e)=>{

if(!dragging) return

let slider = document.getElementById("slider")

let rect = slider.getBoundingClientRect()

let x = e.clientX - rect.left

if(x<0) x=0
if(x>210) x=210

sliderBtn.style.left = x+"px"

if(x>200){

unlockSlider()

}

})

document.addEventListener("mouseup",()=>{

dragging=false

sliderBtn.style.left="4px"

})



function unlockSlider(){

document.getElementById("lockscreen").style.display="none"

document.getElementById("passcodeScreen").style.display="flex"

}



/* PASSCODE */

let input=""

const password="4399"



function press(num){

input+=num

updateDots()

if(input.length===4){

check()

}

}



function deleteNum(){

input=input.slice(0,-1)

updateDots()

}



function updateDots(){

const dots=document.querySelectorAll(".dot")

dots.forEach((d,i)=>{

d.style.background=i<input.length?"white":"transparent"

})

}



function check(){

if(input===password){

document.getElementById("passcodeScreen").style.display="none"

document.getElementById("home").style.display="block"

}

else{

input=""

updateDots()

alert("비밀번호 틀림")

}

}
