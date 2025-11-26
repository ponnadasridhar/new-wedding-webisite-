const sections=[...document.querySelectorAll('.section')];
const navLinks=[...document.querySelectorAll('.nav-link')];
const yearEl=document.getElementById('year');
const calendarEl=document.getElementById('calendar');
const bookingForm=document.getElementById('booking-form');
const contactForm=document.getElementById('contact-form');
const bookingMsg=document.getElementById('booking-message');
const adminMsg=document.getElementById('admin-message');
const contactMsg=document.getElementById('contact-message');
const dateInput=document.getElementById('date');
const searchInput=document.getElementById('search');
const tableBody=document.querySelector('#booking-table tbody');
const offerButtons=[...document.querySelectorAll('[data-nav="booking"]')];
const authModal=document.getElementById('admin-auth');
const authForm=document.getElementById('auth-form');
const authTitle=document.getElementById('auth-title');
const authHelp=document.getElementById('auth-help');
const authPassword=document.getElementById('auth-password');
const authCancel=document.getElementById('auth-cancel');
const logoutBtn=document.getElementById('logout');
const sliderLinks=[...document.querySelectorAll('.slider-track [data-type]')];
const heroArt=document.querySelector('.hero-art');
const sliderTrack=document.querySelector('.slider-track');
const prevBtn=document.querySelector('.slider-btn.prev');
const nextBtn=document.querySelector('.slider-btn.next');
let sliderStep=0;let loopLen=0;let offsetX=0;let speed=0.4;let rafId=null;

const calcModal=document.getElementById('calc-modal');
const calcModalBody=document.getElementById('calc-modal-body');
const calcModalClose=document.getElementById('calc-modal-close');
const calcForm=document.getElementById('price-calculator');
const calcType=document.getElementById('calcType');
const calcGuests=document.getElementById('calcGuests');
const calcResult=document.getElementById('calc-result');

function navigateTo(id){if(id==='admin'&&!isAuthed()){showAuth();return}sections.forEach(s=>s.classList.toggle('hidden',s.id!==id));navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+id));location.hash='#'+id}

navLinks.forEach(a=>a.addEventListener('click',e=>{e.preventDefault();navigateTo(a.getAttribute('href').slice(1))}));
offerButtons.forEach(b=>b.addEventListener('click',()=>navigateTo('booking')));
sliderLinks.forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const type=a.getAttribute('data-type');document.getElementById('eventType').value=type;navigateTo('booking')}));
function inr(n){try{return n.toLocaleString('en-IN',{style:'currency',currency:'INR'})}catch(e){return '₹'+String(n)}}
function computeCost(){const type=(calcType?.value)||'Wedding';const g=Number(calcGuests?.value||0);let base=0;let perGuest=0;if(type==='Wedding'){base=50000;perGuest=520}else if(type==='Birthday'){base=25000;perGuest=520}else{base=60000;perGuest=0}const food=perGuest*g;const total=base+food;const lines=[`Base: ${inr(base)}`];if(perGuest>0)lines.push(`Food (${g} × ${inr(perGuest)}): ${inr(food)}`);lines.push(`Total: ${inr(total)}`);const text=lines.join('  |  ');calcResult.textContent=text;calcResult.className='message ok';showCalcModal(text)}
function showCalcModal(text){calcModalBody.textContent=text;calcModal.classList.remove('hidden')}
function hideCalcModal(){calcModal.classList.add('hidden')}
calcModalClose&&calcModalClose.addEventListener('click',hideCalcModal)
calcForm&&calcForm.addEventListener('submit',e=>{e.preventDefault();computeCost()});
calcType&&calcType.addEventListener('change',computeCost);
calcGuests&&calcGuests.addEventListener('input',computeCost);
function calcStep(){const items=[...sliderTrack.children].filter(n=>n.tagName.toLowerCase()==='a');if(items.length<2)return 0;const r1=items[0].getBoundingClientRect();const r2=items[1].getBoundingClientRect();return Math.max(0,Math.round(Math.abs(r2.left-r1.left)))}
function calcLoop(){const total=[...sliderTrack.children].filter(n=>n.tagName.toLowerCase()==='a').length;const unique=Math.max(1,Math.floor(total/2));return unique*sliderStep}
function applyTransform(){sliderTrack.style.transform=`translateX(${-offsetX}px)`}
function tick(){offsetX+=speed;if(loopLen>0&&offsetX>=loopLen)offsetX-=loopLen;applyTransform();rafId=requestAnimationFrame(tick)}
function startAuto(){stopAuto();rafId=requestAnimationFrame(tick)}
function stopAuto(){if(rafId){cancelAnimationFrame(rafId);rafId=null}}
function nudge(dir){offsetX+=dir*sliderStep;if(offsetX<0)offsetX+=loopLen;if(offsetX>=loopLen)offsetX-=loopLen;applyTransform()}
prevBtn&&prevBtn.addEventListener('click',()=>{stopAuto();nudge(-1);startAuto()});
nextBtn&&nextBtn.addEventListener('click',()=>{stopAuto();nudge(1);startAuto()});
heroArt&&heroArt.addEventListener('mouseenter',stopAuto);
heroArt&&heroArt.addEventListener('mouseleave',startAuto);
window.addEventListener('hashchange',()=>{const id=location.hash.replace('#','')||'home';navigateTo(id)});
yearEl.textContent=new Date().getFullYear();

function today(){const d=new Date();d.setHours(0,0,0,0);return d}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
function ymd(d){const y=d.getFullYear();const m=String(d.getMonth()+1).padStart(2,'0');const day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`}

function loadBookings(){try{return JSON.parse(localStorage.getItem('bookings'))||[]}catch(e){return[]}}
function saveBookings(list){localStorage.setItem('bookings',JSON.stringify(list))}
function bookedDates(){return new Set(loadBookings().map(b=>b.date))}
function isAuthed(){return localStorage.getItem('admin_session')==='true'}
function hasAdminPassword(){return !!localStorage.getItem('admin_hash')}
function setSession(v){localStorage.setItem('admin_session',v?'true':'false')}
function hideAuth(){authModal.classList.add('hidden');authHelp.textContent='';authHelp.className='message';authPassword.value=''}
function showAuth(){authModal.classList.remove('hidden');authTitle.textContent=hasAdminPassword()?'Admin Login':'Set Admin Password';authHelp.textContent=hasAdminPassword()?'Enter your admin password to continue.':'Create an admin password.';authHelp.className='message'}
async function sha256(str){const enc=new TextEncoder().encode(str);const buf=await crypto.subtle.digest('SHA-256',enc);return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('')}

function initDateInput(){const min=today();const max=addDays(min,60);dateInput.min=ymd(min);dateInput.max=ymd(max)}

function monthMatrix(year,month){const first=new Date(year,month,1);const startDay=first.getDay();const days=new Date(year,month+1,0).getDate();const grid=[];const labels=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];grid.push(labels.map(x=>({label:x,type:'label'})));let row=[];for(let i=0;i<startDay;i++){row.push({type:'pad'})}
for(let d=1;d<=days;d++){row.push({type:'day',day:d})}
while(row.length){grid.push(row.splice(0,7))}
return grid}

function renderCalendar(){calendarEl.innerHTML='';const now=today();const max=addDays(now,60);const months=[new Date(now.getFullYear(),now.getMonth(),1),new Date(now.getFullYear(),now.getMonth()+1,1)];const booked=bookedDates();months.forEach(m=>{const y=m.getFullYear();const mo=m.getMonth();const mm=monthMatrix(y,mo);const wrap=document.createElement('div');wrap.className='cal-month';const head=document.createElement('div');head.className='cal-head';const title=document.createElement('div');title.className='cal-title';title.textContent=m.toLocaleString(undefined,{month:'long',year:'numeric'});head.appendChild(title);wrap.appendChild(head);const grid=document.createElement('div');grid.className='cal-grid';mm.forEach(row=>{row.forEach(cell=>{const el=document.createElement('div');if(cell.type==='label'){el.className='cal-cell label';el.textContent=cell.label;grid.appendChild(el);return}if(cell.type==='pad'){el.className='cal-cell disabled';grid.appendChild(el);return}const d=new Date(y,mo,cell.day);d.setHours(0,0,0,0);const iso=ymd(d);let cls='cal-cell';let selectable=false;const isPast=d<today();const isBeyond=d>max;const isBooked=booked.has(iso);if(isPast||isBeyond){cls+=' disabled'}else if(isBooked){cls+=' booked'}else{cls+=' available';selectable=true}
el.className=cls;el.textContent=cell.day.toString();if(selectable){el.addEventListener('click',()=>{dateInput.value=iso;highlightSelected(iso)})}
grid.appendChild(el)})});wrap.appendChild(grid);calendarEl.appendChild(wrap)})
highlightSelected(dateInput.value||'')}

function highlightSelected(iso){document.querySelectorAll('.cal-cell.selected').forEach(el=>el.classList.remove('selected'));if(!iso)return;const parts=iso.split('-');const y=parseInt(parts[0],10);const m=parseInt(parts[1],10)-1;const d=parseInt(parts[2],10);const months=[...calendarEl.querySelectorAll('.cal-month')];months.forEach((monthEl,i)=>{const base=new Date(today().getFullYear(),today().getMonth()+i,1);if(base.getFullYear()===y&&base.getMonth()===m){const cells=[...monthEl.querySelectorAll('.cal-grid .cal-cell')].filter(x=>!x.classList.contains('label'));let idx=0;const first=new Date(y,m,1).getDay();idx=first+d;const target=cells[idx-1];if(target)target.classList.add('selected')}})}

function renderTable(filter=''){const list=loadBookings();const f=filter.trim().toLowerCase();const rows=f?list.filter(b=>b.name.toLowerCase().includes(f)||b.date.includes(f)):list;tableBody.innerHTML='';rows.forEach(b=>{const tr=document.createElement('tr');const tds=[b.date,b.type,b.name,b.contact,String(b.guests)];tds.forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.appendChild(td)});const actions=document.createElement('td');const edit=document.createElement('button');edit.className='btn';edit.textContent='Edit';edit.addEventListener('click',()=>startEdit(b.id));const del=document.createElement('button');del.className='btn';del.textContent='Delete';del.addEventListener('click',()=>deleteBooking(b.id));actions.appendChild(edit);actions.appendChild(del);tr.appendChild(actions);tableBody.appendChild(tr)})}

function startEdit(id){const list=loadBookings();const idx=list.findIndex(x=>x.id===id);if(idx<0)return;const b=list[idx];adminMsg.textContent='';const tr=[...tableBody.children][idx];tr.innerHTML='';const cells=['date','type','name','contact','guests'].map(k=>{const td=document.createElement('td');const input=k==='type'?typeSelect(b.type):document.createElement('input');if(k==='guests')input.type='number';input.value=k==='date'?b.date:b[k];input.dataset.key=k;td.appendChild(input);return td});cells.forEach(td=>tr.appendChild(td));const actions=document.createElement('td');const save=document.createElement('button');save.className='btn primary';save.textContent='Save';save.addEventListener('click',()=>applyEdit(id,tr));const cancel=document.createElement('button');cancel.className='btn';cancel.textContent='Cancel';cancel.addEventListener('click',()=>renderTable(searchInput.value));actions.appendChild(save);actions.appendChild(cancel);tr.appendChild(actions)}

function typeSelect(val){const s=document.createElement('select');['Wedding','Birthday','Corporate','Baby Shower','Other'].forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;if(v===val)o.selected=true;s.appendChild(o)});return s}

function applyEdit(id,tr){const inputs=[...tr.querySelectorAll('input,select')];const data={};inputs.forEach(i=>data[i.dataset.key||'type']=i.value);if(!data.date||!data.name||!data.contact||!data.guests){adminMsg.textContent='Fill all fields';adminMsg.className='message err';return}
const min=ymd(today());const max=ymd(addDays(today(),60));if(data.date<min||data.date>max){adminMsg.textContent='Date out of allowed range';adminMsg.className='message err';return}
const list=loadBookings();const booked=bookedDates();booked.delete(list.find(x=>x.id===id).date);if(booked.has(data.date)){adminMsg.textContent='Selected date is already booked';adminMsg.className='message err';return}
const idx=list.findIndex(x=>x.id===id);list[idx]={...list[idx],date:data.date,type:data.type,name:data.name,contact:data.contact,guests:Number(data.guests)};saveBookings(list);adminMsg.textContent='Booking updated';adminMsg.className='message ok';renderTable(searchInput.value);renderCalendar()}

function deleteBooking(id){const list=loadBookings().filter(x=>x.id!==id);saveBookings(list);adminMsg.textContent='Booking deleted';adminMsg.className='message ok';renderTable(searchInput.value);renderCalendar()}

bookingForm.addEventListener('submit',e=>{e.preventDefault();bookingMsg.textContent='';bookingMsg.className='message';const date=dateInput.value;const type=document.getElementById('eventType').value;const name=document.getElementById('name').value.trim();const contact=document.getElementById('contact').value.trim();const guests=Number(document.getElementById('guests').value);
if(!date||!type||!name||!contact||!guests){bookingMsg.textContent='Fill all fields';bookingMsg.className='message err';return}
const min=ymd(today());const max=ymd(addDays(today(),60));if(date<min||date>max){bookingMsg.textContent='Date must be within the next two months';bookingMsg.className='message err';return}
const booked=bookedDates();if(booked.has(date)){bookingMsg.textContent='Selected date is already booked';bookingMsg.className='message err';return}
const list=loadBookings();const id=cryptoRandom();list.push({id,date,type,name,contact,guests});saveBookings(list);bookingMsg.textContent='Booking confirmed';bookingMsg.className='message ok';bookingForm.reset();dateInput.min=min;dateInput.max=max;renderTable(searchInput.value);renderCalendar()});

dateInput.addEventListener('change',()=>{const d=dateInput.value;const booked=bookedDates();if(booked.has(d)){bookingMsg.textContent='Selected date is already booked';bookingMsg.className='message err'}else{bookingMsg.textContent='';bookingMsg.className='message'}highlightSelected(d)});

searchInput.addEventListener('input',()=>renderTable(searchInput.value));

contactForm.addEventListener('submit',e=>{e.preventDefault();contactMsg.textContent='';const n=document.getElementById('c_name').value.trim();const em=document.getElementById('c_email').value.trim();const msg=document.getElementById('c_message').value.trim();if(!n||!em||!msg){contactMsg.textContent='Fill all fields';contactMsg.className='message err';return}contactMsg.textContent='Message sent';contactMsg.className='message ok';contactForm.reset()});

function cryptoRandom(){const s=window.crypto&&crypto.getRandomValues?crypto.getRandomValues(new Uint32Array(1))[0].toString(16):String(Math.random()).slice(2);return Date.now().toString(36)+s}

function init(){const hash=location.hash.replace('#','')||'home';initDateInput();renderCalendar();renderTable('');navigateTo(hash)}
window.addEventListener('load',()=>{sliderStep=calcStep();loopLen=calcLoop();offsetX=0;applyTransform();startAuto()});
window.addEventListener('resize',()=>{const prev=sliderStep;sliderStep=calcStep();loopLen=calcLoop();if(sliderStep!==prev)applyTransform()});

document.addEventListener('DOMContentLoaded',init)
authForm.addEventListener('submit',async e=>{e.preventDefault();authHelp.textContent='';authHelp.className='message';const pwd=authPassword.value.trim();if(!pwd){authHelp.textContent='Enter password';authHelp.className='message err';return}if(!hasAdminPassword()){const h=await sha256(pwd);localStorage.setItem('admin_hash',h);setSession(true);hideAuth();navigateTo('admin');return}const h=await sha256(pwd);if(h===localStorage.getItem('admin_hash')){setSession(true);hideAuth();navigateTo('admin')}else{authHelp.textContent='Incorrect password';authHelp.className='message err'}})
authCancel.addEventListener('click',()=>{hideAuth();navigateTo('home')})
logoutBtn.addEventListener('click',()=>{setSession(false);navigateTo('home')})
 
