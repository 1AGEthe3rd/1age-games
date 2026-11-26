import * as THREE from '../shared/vendor/three.module.js';
import {mountDiscovery} from './metaverse/browser.mjs';
import {createWalker} from './walking.mjs';
import {createFloorMaterial,addArchitecture,addContactShade} from './architecture.mjs';
const $=s=>document.querySelector(s),stage=$('#scene'),status=$('#status'),panel=$('#panel'),body=$('#panel-body');
try{
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x03060d);
 const camera=new THREE.PerspectiveCamera(64,1,.08,260),renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power'});
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;stage.append(renderer.domElement);
 let quality=1.5;
 const std=(color,metalness=.2,roughness=.45)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
 const dark=std(0x17232e,.4),alloy=std(0xa6bac6,.38,.32),stone=createFloorMaterial(),ivory=std(0xe3dfd2,.08,.35),ebony=std(0x202733,.1,.35);
 const glow=c=>new THREE.MeshBasicMaterial({color:c}),cyan=glow(0x92e2ff),warm=glow(0xffe3b7),purple=glow(0xc1a6ff);
 const glass=new THREE.MeshPhysicalMaterial({color:0x9ddaff,transparent:true,opacity:.075,depthWrite:false,side:THREE.DoubleSide});
 const mesh=(g,m,x,y,z,parent=scene)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);parent.add(o);return o;};
 const box=(w,h,d,m,x,y,z,parent=scene)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z,parent);
 const cyl=(a,b,h,m,x,y,z,parent=scene)=>mesh(new THREE.CylinderGeometry(a,b,h,48),m,x,y,z,parent);
 const ring=(r,t,m,y,parent=scene)=>{const o=mesh(new THREE.TorusGeometry(r,t,8,96),m,0,y,0,parent);o.rotation.x=Math.PI/2;return o;};
 scene.add(new THREE.HemisphereLight(0xddefff,0x394653,1.65));const sun=new THREE.DirectionalLight(0xe0f0ff,1.7);sun.position.set(-12,14,-8);scene.add(sun);
 cyl(11.4,11.5,.32,stone,0,-.16,0);cyl(11.4,11.4,.35,dark,0,5.6,0);
 mesh(new THREE.CylinderGeometry(10.95,10.95,4.95,96,1,true),glass,0,2.72,0);ring(10.75,.045,cyan,.025);ring(7.45,.023,purple,.025);addArchitecture(scene);
 let seed=415;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const points=[];for(let i=0;i<2400;i++){const a=rand()*Math.PI*2,v=rand()*2-1,r=106+rand()*32;points.push(Math.cos(a)*Math.sqrt(1-v*v)*r,v*r,Math.sin(a)*Math.sqrt(1-v*v)*r);}
 const stars=new THREE.BufferGeometry();stars.setAttribute('position',new THREE.Float32BufferAttribute(points,3));scene.add(new THREE.Points(stars,new THREE.PointsMaterial({color:0xdceaff,size:.19})));
 const earthMat=std(0x447eb2,0,.9),earth=mesh(new THREE.SphereGeometry(14,48,32),earthMat,-18,9,-47);earth.rotation.z=.18;
 new THREE.TextureLoader().load(new URL('../shared/world-surface.png',import.meta.url).href,t=>{t.colorSpace=THREE.SRGBColorSpace;earthMat.map=t;earthMat.color.set(0xffffff);earthMat.needsUpdate=true;},undefined,()=>{});
 mesh(new THREE.SphereGeometry(2.6,24,16),std(0xa7abb5,0,1),21,9,-57);
 const records=[],targets=[],obstacles=[];
 function sign(g,title,subtitle,y=2.45){
 const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#0b1827';ctx.fillRect(0,0,1024,256);ctx.strokeStyle='#91cdeb';ctx.lineWidth=4;ctx.strokeRect(6,6,1012,244);ctx.fillStyle='#f1f7ff';ctx.textAlign='center';ctx.font='600 58px system-ui';ctx.fillText(title,512,105);ctx.fillStyle='#b5d0e4';ctx.font='31px system-ui';ctx.fillText(subtitle,512,183);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return mesh(new THREE.PlaneGeometry(3.2,.8),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}),0,y,-.12,g);
 }
 function register(g,d,r){records.push(d);obstacles.push({x:d.x,z:d.z,r});g.traverse(o=>{if(o.isMesh){o.userData.department=d;targets.push(o);}});}
 function pavilion(d){
 const g=new THREE.Group();g.position.set(d.x,0,d.z);g.rotation.y=Math.atan2(-d.x,-d.z);scene.add(g);addContactShade(scene,d.x,d.z,2.25);
 box(3.65,.18,1.8,dark,0,.09,0,g);box(3.5,.08,1.68,alloy,0,.22,0,g);
 for(const s of [-1,1]){box(.24,3.05,.34,alloy,s*1.63,1.76,-.5,g);box(.045,2.72,.05,d.accent,s*1.63,1.76,-.3,g);}
 box(3.5,.22,.38,dark,0,3.36,-.5,g);box(3.28,.045,.08,d.accent,0,3.23,-.28,g);sign(g,d.name,d.subtitle);
 box(2.55,.16,.72,alloy,0,.9,.35,g);box(2.4,.07,.62,dark,0,1.01,.35,g);for(const x of [-.75,0,.75])box(.3,.025,.21,d.accent,x,1.06,.35,g);
 if(d.id==='sports'){const ball=mesh(new THREE.SphereGeometry(.27,24,16),std(0xc97940,.03,.7),0,1.37,.35,g);}
 if(d.id==='worlds'||d.id==='blockchain'){mesh(new THREE.IcosahedronGeometry(.28,1),new THREE.MeshBasicMaterial({color:0x99dcff,wireframe:true}),0,1.45,.35,g);}
 register(g,d,1.96);
 }
 const depts=[
 {id:'sports',name:'GLOBAL SPORTS',subtitle:'Athlete gaming · concept',x:-6.8,z:-2.7,accent:warm,note:'Original sports simulations are planned. No athlete data, likenesses, youth ranking ingestion or live competition yet.',links:[]},
 {id:'originals',name:'1AGE ORIGINALS',subtitle:'Studio-produced games',x:6.8,z:-2.7,accent:purple,note:'Besuto Run is a proposed original game; it is not the NNB lifestyle space. No playable title is included in this prototype.',links:[]},
 {id:'blockchain',name:'BLOCKCHAIN GAMES',subtitle:'Discover independent games',x:-6.65,z:4.5,accent:cyan,note:'Browse the existing index. External games have their own accounts and rules.',links:[['Open game discovery','../application.html']]},
 {id:'worlds',name:'VIRTUAL WORLDS',subtitle:'Explore connected destinations',x:6.65,z:4.5,accent:purple,note:'Search public Decentraland places below or open independent worlds. No shared account, asset transfer or partnership is implied.',links:[['Decentraland','https://decentraland.org/'],['Upland','https://play.upland.me/']]}
 ];depts.forEach(pavilion);
 // Chess is the anchor department: an architectural display table with a full starting position.
 const chess=new THREE.Group();chess.position.set(0,0,-2.1);scene.add(chess);
 addContactShade(scene,0,-2.1,2.8);box(4.25,.2,3.7,dark,0,.1,0,chess);
 for(const x of [-.83,.83])box(.2,.8,1.5,alloy,x,.6,0,chess);
 box(2.3,.15,2.3,alloy,0,1.04,0,chess);
 const squares=new THREE.InstancedMesh(new THREE.BoxGeometry(.25,.035,.25),ivory,64),dummy=new THREE.Object3D();
 for(let i=0;i<64;i++){const col=i%8,row=Math.floor(i/8);dummy.position.set((col-3.5)*.25,1.132,(row-3.5)*.25);dummy.updateMatrix();squares.setMatrixAt(i,dummy.matrix);squares.setColorAt(i,new THREE.Color((col+row)%2?0x303e4a:0xffffff));}chess.add(squares);
 function piece(col,row,kind,mat){const x=(col-3.5)*.25,z=(row-3.5)*.25,base=1.15;const h={p:.15,r:.2,n:.23,b:.25,q:.29,k:.32}[kind];cyl(.079,.091,.035,mat,x,base+.018,z,chess);cyl(.046,.073,h*.68,mat,x,base+.035+h*.34,z,chess);if(kind==='r'){cyl(.075,.057,.055,mat,x,base+.035+h*.68,z,chess);}else if(kind==='n'){const head=box(.075,.09,.12,mat,x,base+.065+h*.68,z,chess);head.rotation.x=.23;}else{mesh(new THREE.SphereGeometry(kind==='p'?.047:.055,12,8),mat,x,base+.04+h*.68,z,chess);}if(kind==='k'){box(.025,.07,.025,mat,x,base+.13+h*.68,z,chess);box(.06,.022,.025,mat,x,base+.15+h*.68,z,chess);}}
 for(const [row,pawn,mat] of [[0,1,ebony],[7,6,ivory]]){[...'rnbqkbnr'].forEach((k,i)=>piece(i,row,k,mat));for(let i=0;i<8;i++)piece(i,pawn,'p',mat);}
 const signGroup=new THREE.Group();signGroup.position.set(0,0,-1.58);chess.add(signGroup);sign(signGroup,'CHESS','Global ratings · play planned',2.25);
 register(chess,{id:'chess',name:'Chess',x:0,z:-2.1,note:'Display board only. Official FIDE ratings and online platform ratings are separate. Playable rules, matchmaking and native ratings are future builds.',links:[['FIDE official ratings','https://ratings.fide.com/'],['Lichess','https://lichess.org/'],['Chess.com','https://www.chess.com/']]},2.85);
 let cancelDiscovery=()=>{};
 panel.addEventListener('close',()=>cancelDiscovery());
 function show(title,links,note='',settings=false,discovery=false){cancelDiscovery();cancelDiscovery=()=>{};$('#panel-title').textContent=title;body.replaceChildren();if(note){const p=document.createElement('p');p.textContent=note;body.append(p);}for(const [name,url] of links){const a=document.createElement('a');a.textContent=name;a.href=url;body.append(a);}if(settings){const select=document.createElement('select');select.setAttribute('aria-label','Graphics resolution');for(const [n,v] of [['Low','0.8'],['Balanced','1.5'],['High','2']])select.add(new Option(n,v));select.value=String(quality);select.onchange=()=>{quality=Number(select.value);resize();};body.append(select);}if(discovery)cancelDiscovery=mountDiscovery(body);walker.clear();if(!panel.open)panel.showModal();}
 const distance=d=>Math.hypot(camera.position.x-d.x,camera.position.z-d.z);
 function interact(d){if(!d||distance(d)>4.7){status.textContent='Walk closer to a department.';return;}status.textContent='';show(d.name,d.links,d.note,false,d.id==='worlds');}
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
 const walker=createWalker(camera,renderer.domElement,{radius:10.15,eyeHeight:1.75,spawn:[0,1.75,7.7],obstacles,paused:()=>panel.open,onTap:e=>{const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(targets,false)[0];if(hit)interact(hit.object.userData.department);}});
 $('#interact').onclick=()=>interact([...records].sort((a,b)=>distance(a)-distance(b))[0]);$('#menu').onclick=()=>show('1AGE',[['1AGE World','https://1age.world/'],['1AGE.com','https://1age.com/'],['Existing game discovery','../application.html']],'',true);$('#reset').onclick=()=>{walker.clear();walker.reset();status.textContent='';};
 addEventListener('keydown',e=>{if(e.code==='KeyE'&&!panel.open&&!e.repeat&&!e.target?.closest?.('input,textarea,select'))$('#interact').click();});
 function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,quality));renderer.setSize(innerWidth,innerHeight);}resize();addEventListener('resize',resize);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();renderer.setAnimationLoop(null);status.textContent='Graphics context lost. Reload or use the 1AGE menu.';});
 let last=performance.now();status.textContent='';renderer.setAnimationLoop(now=>{const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;walker.update(dt);earth.rotation.y+=dt*.025;renderer.render(scene,camera);});
}catch(error){console.error(error);status.textContent='3D could not start. Open game discovery using the center logo.';$('#menu').onclick=()=>location.href='../application.html';}
