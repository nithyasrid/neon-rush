const C=document.getElementById('c'),x=C.getContext('2d');
const menu=document.getElementById('menu'),game=document.getElementById('game'),win=document.getElementById('win');
const lv=document.getElementById('lv'),scoreEl=document.getElementById('score'),bestEl=document.getElementById('best'),timeEl=document.getElementById('time'),fuel=document.getElementById('fuel'),hint=document.getElementById('hint');
let level=1,score=+localStorage.neonScore||0,best=+localStorage.neonBest||0,unlocked=+localStorage.neonUnlocked||1;
let p,track,obs=[],enemies=[],keys={},start,finished=false,boost=100,last=0;
const img={};["player","enemy","boost","cone","finish","barrier"].forEach(n=>{img[n]=new Image();img[n].src="assets/"+n+".png"});
function show(a){[menu,game,win].forEach(e=>e.classList.add("hide"));a.classList.remove("hide")}
function save(){localStorage.neonScore=score;localStorage.neonBest=best;localStorage.neonUnlocked=unlocked}
function startGame(n){level=Math.min(n,unlocked);const L=LEVELS[level-1];p={x:400,y:510,a:-Math.PI/2,v:0};track={off:0,width:L.width};obs=[];enemies=[];boost=100;finished=false;start=performance.now();lv.textContent=level;scoreEl.textContent=score;bestEl.textContent=best;fuel.style.width="100%";hint.textContent="Reach the finish before time runs out!";show(game);requestAnimationFrame(loop)}
function rnd(seed){let z=Math.sin(seed*999)*43758.5453;return z-Math.floor(z)}
function spawn(){const L=LEVELS[level-1];obs=[];enemies=[];for(let i=0;i<L.obstacles;i++){let y=80+i*210+(rnd(level*31+i)*100);let side=rnd(level*77+i)>.5?1:-1;obs.push({x:400+side*(L.width/2-18),y:y%1500,w:28,h:70})}for(let i=0;i<L.enemies;i++)enemies.push({x:400+(rnd(level*91+i)-.5)*L.width,y:-(i+1)*300-100,v:1.5+i*.25})}
spawn();
function roadX(y){return 400+Math.sin((y+track.off)*.004+(level%5))*120}
function update(dt){const L=LEVELS[level-1];let left=keys.ArrowLeft||keys.a,right=keys.ArrowRight||keys.d,up=keys.ArrowUp||keys.w,down=keys.ArrowDown||keys.s,space=keys[" "];
p.a+=(right-left)*L.turn*dt*2;
let target=up?L.speed*2.5:down?-L.speed*.8:L.speed*.45;
if(space&&boost>0){target*=1.8;boost-=.8*dt}else boost=Math.min(100,boost+.25*dt);
p.v+=(target-p.v)*.05*dt;p.x+=Math.cos(p.a)*p.v*dt;p.y+=Math.sin(p.a)*p.v*dt;
p.x=Math.max(80,Math.min(720,p.x));track.off+=Math.max(0,p.v)*dt*1.4;
for(const o of obs){o.y+=Math.max(0,p.v)*dt*1.5;if(o.y>650)o.y=-100}
for(const e of enemies){e.y+=Math.max(0,p.v)*dt*1.25-e.v*dt;if(e.y>680)e.y=-200;if(Math.abs(e.x-p.x)<30&&Math.abs(e.y-p.y)<42){p.v*=.35;hint.textContent="TRAFFIC HIT — slow down!"}}
if(level>45 && Math.abs(p.x-roadX(p.y))>L.width/2){p.v*=.82;hint.textContent="OFF TRACK!"}
for(const o of obs)if(Math.abs(o.x-p.x)<34&&Math.abs(o.y-p.y)<45){p.v*=.25;o.y=-120;hint.textContent="OBSTACLE HIT!"}
let elapsed=(performance.now()-start)/1000,time=L.time-elapsed;timeEl.textContent=time>0?time.toFixed(1):"0.0";fuel.style.width=boost+"%";
if(time<=0)lose();if(p.y<40)winLevel()}
function draw(){const L=LEVELS[level-1];x.clearRect(0,0,800,600);x.fillStyle="#070a13";x.fillRect(0,0,800,600);
for(let y=0;y<600;y+=10){let cx=roadX(y),w=L.width;x.fillStyle=(Math.floor((y+track.off)/50)%2)?"#10172a":"#0e1525";x.fillRect(0,y,800,10);x.fillStyle="#252e42";x.fillRect(cx-w/2,y,w,10)}
// lane dashes
x.strokeStyle="#5d6b85";x.lineWidth=3;x.setLineDash([25,25]);x.beginPath();x.moveTo(400,0);x.lineTo(400,600);x.stroke();x.setLineDash([]);
// finish
if(p.y<100){x.fillStyle="#fff";for(let i=0;i<10;i++)for(let j=0;j<3;j++)if((i+j)%2)x.fillRect(250+i*30,35+j*20,30,20)}
obs.forEach(o=>x.drawImage(img.barrier,o.x-25,o.y-35,50,70));enemies.forEach(e=>x.drawImage(img.enemy,e.x-28,e.y-35,56,70));
x.save();x.translate(p.x,p.y);x.rotate(p.a+Math.PI/2);x.shadowBlur=20;x.shadowColor="#55e7ff";x.drawImage(img.player,-28,-38,56,76);x.restore();
x.fillStyle="#fff";x.font="900 13px system-ui";x.fillText("LEVEL "+level,20,28)}
function loop(t){let dt=Math.min(2,(t-last)/16.67||1);last=t;if(!finished){update(dt);draw();requestAnimationFrame(loop)}}
function winLevel(){if(finished)return;finished=true;let t=(performance.now()-start)/1000,bonus=Math.max(100,Math.floor((LEVELS[level-1].time-t)*50));score+=1000+bonus+level*20;if(score>best)best=score;if(level===unlocked&&unlocked<100)unlocked++;save();document.getElementById("wt").textContent="LEVEL "+level+" CLEARED";document.getElementById("wd").textContent=`Time: ${t.toFixed(1)}s · +${1000+bonus+level*20} points`;document.getElementById("next").textContent=level>=100?"FINISH":"NEXT LEVEL";show(win)}
function lose(){if(finished)return;finished=true;document.getElementById("wt").textContent="TIME OUT";document.getElementById("wd").textContent="You can retry the level and beat your score.";document.getElementById("next").textContent="RETRY";show(win)}
addEventListener("keydown",e=>{keys[e.key]=true;if(e.key.toLowerCase()==="r"&&!game.classList.contains("hide"))startGame(level);if([" ","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key))e.preventDefault()});
addEventListener("keyup",e=>keys[e.key]=false);
document.querySelectorAll(".mobile button").forEach(b=>{b.onpointerdown=()=>keys[b.dataset.k]=true;b.onpointerup=()=>keys[b.dataset.k]=false;b.onpointerleave=()=>keys[b.dataset.k]=false});
document.getElementById("play").onclick=()=>startGame(1);document.getElementById("continue").onclick=()=>startGame(unlocked);document.getElementById("home").onclick=()=>show(menu);
document.getElementById("next").onclick=()=>{if(level>=100){score=0;unlocked=1;save();show(menu)}else if(document.getElementById("next").textContent==="RETRY")startGame(level);else startGame(level+1)};
bestEl.textContent=best;scoreEl.textContent=score;show(menu);
