/* =========================================================
   AKOBIR & ASAL — PREMIUM TO'Y TAKLIFNOMASI
   Faqat SOZLAMALAR qismini o'zgartirsangiz kifoya.
   ========================================================= */

const WEDDING = new Date("2026-10-18T15:00:00+05:00");
const MONTHS = ["yanvar","fevral","mart","aprel","may","iyun","iyul","avgust","sentabr","oktabr","noyabr","dekabr"];

const $ = id => document.getElementById(id);

/* Mehmon ismi: ?mehmon=Ali */
const guestName = new URLSearchParams(location.search).get("mehmon");
if (guestName) $("guest").textContent = "Hurmatli " + guestName.slice(0, 45);

/* Sana */
$("dt").textContent = `${WEDDING.getDate()} ${MONTHS[WEDDING.getMonth()]} ${WEDDING.getFullYear()}`;

function tick(){
  const seconds = Math.max(0, Math.floor((WEDDING - new Date()) / 1000));
  $("cd").textContent = Math.floor(seconds / 86400);
  $("ch").textContent = Math.floor((seconds % 86400) / 3600);
  $("cm").textContent = Math.floor((seconds % 3600) / 60);
  $("cs").textContent = seconds % 60;
}
tick();
setInterval(tick,1000);

/* Scroll animatsiyalari */
const observer = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting) entry.target.classList.add("in");
  });
},{threshold:.18});
document.querySelectorAll(".rv").forEach(el=>observer.observe(el));

/* =========================================================
   Sehrli zarrachalar: gullar, yulduzlar, yurakchalar
   ========================================================= */
const canvas = $("fx");
const ctx = canvas.getContext("2d");
let W=0,H=0,DPR=Math.min(devicePixelRatio||1,2);

function resize(){
  W=innerWidth; H=innerHeight;
  canvas.width=Math.floor(W*DPR);
  canvas.height=Math.floor(H*DPR);
  canvas.style.width=W+"px";
  canvas.style.height=H+"px";
  ctx.setTransform(DPR,0,0,DPR,0,0);
}
resize();
addEventListener("resize",resize);

const SYMBOLS=["✦","✧","·","♡","❀","✿"];
const particles=[];
const particleCount=innerWidth<600?35:65;

function particle(random=true){
  return {
    x:Math.random()*W,
    y:random?Math.random()*H:-20,
    size:5+Math.random()*12,
    speed:.15+Math.random()*.55,
    drift:Math.random()*Math.PI*2,
    rot:Math.random()*6.28,
    rotSpeed:(Math.random()-.5)*.015,
    alpha:.25+Math.random()*.55,
    symbol:SYMBOLS[(Math.random()*SYMBOLS.length)|0]
  };
}
for(let i=0;i<particleCount;i++) particles.push(particle(true));

const bursts=[];
function burst(x,y){
  for(let i=0;i<14;i++){
    const a=Math.random()*Math.PI*2;
    const speed=1.2+Math.random()*3.8;
    bursts.push({
      x,y,
      vx:Math.cos(a)*speed,
      vy:Math.sin(a)*speed-1,
      life:1,
      size:7+Math.random()*10,
      symbol:SYMBOLS[(Math.random()*SYMBOLS.length)|0]
    });
  }
}
addEventListener("pointerdown",e=>{
  if(e.target.closest("button,a")) return;
  burst(e.clientX,e.clientY);
});

function drawParticles(){
  ctx.clearRect(0,0,W,H);

  particles.forEach((p,i)=>{
    p.y+=p.speed;
    p.drift+=.012;
    p.rot+=p.rotSpeed;
    p.x+=Math.sin(p.drift)*.35;

    if(p.y>H+30) particles[i]=particle(false);

    ctx.save();
    ctx.globalAlpha=p.alpha;
    ctx.font=`${p.size}px serif`;
    ctx.translate(p.x,p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle="#f5d98b";
    ctx.fillText(p.symbol,0,0);
    ctx.restore();
  });

  for(let i=bursts.length-1;i>=0;i--){
    const b=bursts[i];
    b.x+=b.vx;b.y+=b.vy;b.vy+=.045;b.life-=.018;
    if(b.life<=0){bursts.splice(i,1);continue}
    ctx.save();
    ctx.globalAlpha=b.life;
    ctx.font=`${b.size}px serif`;
    ctx.fillStyle="#f5d98b";
    ctx.fillText(b.symbol,b.x,b.y);
    ctx.restore();
  }

  requestAnimationFrame(drawParticles);
}
drawParticles();

/* =========================================================
   ROMANTIK WEB AUDIO — tashqi MP3 shart emas.
   Foydalanuvchi tugmani bosgandan keyin ishlaydi.
   ========================================================= */
let ac=null, master=null, musicTimer=null, nextTime=0, bar=0, playing=false;

const CHORDS=[
  [261.63,329.63,392.00], // C
  [220.00,261.63,329.63], // Am
  [174.61,220.00,261.63], // F
  [196.00,246.94,293.66], // G
  [246.94,311.13,369.99], // Bdim-ish color
  [261.63,329.63,392.00]  // C
];

const MELODY=[
  [659,784,880,784,659,587,523,0],
  [523,659,784,659,587,523,494,0],
  [523,698,784,698,659,587,523,494],
  [587,784,880,784,740,659,587,0],
  [659,740,784,880,784,740,659,587],
  [659,784,880,988,880,784,659,0]
];

function note(freq,time,dur,type,vol){
  const osc=ac.createOscillator();
  const gain=ac.createGain();
  const filter=ac.createBiquadFilter();

  osc.type=type;
  osc.frequency.setValueAtTime(freq,time);
  filter.type="lowpass";
  filter.frequency.setValueAtTime(3200,time);

  gain.gain.setValueAtTime(0.0001,time);
  gain.gain.exponentialRampToValueAtTime(vol,time+.025);
  gain.gain.exponentialRampToValueAtTime(.0001,time+dur);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(master);

  osc.start(time);
  osc.stop(time+dur+.08);
}

function scheduleBar(time){
  const chord=CHORDS[bar%CHORDS.length];
  const melody=MELODY[bar%MELODY.length];
  const step=.34;

  /* yumshoq bass */
  note(chord[0]/2,time,2.55,"sine",.18);

  /* suzuvchi akkord */
  [0,1,2,1,2,1,2,1].forEach((n,i)=>{
    note(chord[n]*2,time+i*step,step*1.75,"triangle",.055);
  });

  /* asosiy ohang */
  melody.forEach((f,i)=>{
    if(f) note(f,time+i*step,step*1.65,"sine",.075);
  });

  /* juda yengil yuqori nota */
  if(bar%2===0) note(chord[2]*4,time+1.02,.9,"sine",.018);

  bar++;
  return step*8;
}

function pump(){
  while(nextTime<ac.currentTime+1.8){
    nextTime+=scheduleBar(nextTime);
  }
}

async function startMusic(){
  if(!ac){
    ac=new(window.AudioContext||window.webkitAudioContext)();
    master=ac.createGain();
    master.gain.value=.72;
    master.connect(ac.destination);
    nextTime=ac.currentTime+.1;
  }

  await ac.resume();
  pump();
  clearInterval(musicTimer);
  musicTimer=setInterval(pump,400);
  playing=true;
  $("mus").classList.add("on");
}

function stopMusic(){
  clearInterval(musicTimer);
  if(ac) ac.suspend();
  playing=false;
  $("mus").classList.remove("on");
}

$("mus").addEventListener("click",()=>playing?stopMusic():startMusic());

/* Ochish */
$("open").addEventListener("click",async()=>{
  try{await startMusic()}catch(e){}
  $("cover").classList.add("gone");
  document.body.classList.remove("lock");
  $("mus").style.display="block";

  /* Ochilganda katta romantik burst */
  setTimeout(()=>{
    burst(innerWidth/2,innerHeight*.42);
    for(let i=0;i<5;i++){
      setTimeout(()=>burst(
        innerWidth*.2+Math.random()*innerWidth*.6,
        innerHeight*.25+Math.random()*innerHeight*.45
      ),i*180);
    }
  },450);

  setTimeout(()=>$("cover").remove(),1300);
});
