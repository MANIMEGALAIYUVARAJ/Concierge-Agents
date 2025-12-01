// app.js - frontend logic and API integration
const BASE_URL = "http://localhost:8000/api";

// Render sidebar into pages
function mountSidebar(){
  const tpl = document.getElementById('sidebar-template');
  if(!tpl) return;
  const html = tpl.innerHTML || '';
  document.querySelectorAll('#sidebar-root').forEach(el=>{
    el.innerHTML = html;
  });
  // attach nav handlers
  document.querySelectorAll('.sidebar-nav a').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const page = a.dataset.page;
      navigateTo(page);
      // mark active
      document.querySelectorAll('.sidebar-nav a').forEach(x=>x.classList.remove('active'));
      a.classList.add('active');
    });
  });
}

// Simple client-side navigation: show relevant sections or open HTML pages
function navigateTo(page){
  // if multi-page files (tasks.html etc.) exist, open them; otherwise if single-page, toggle sections.
  const mapping = {
    dashboard: '/index.html',
    tasks: '/tasks.html',
    mood: '/mood.html',
    planner: '/planner.html',
    chat: '/chat.html',
    motivation: '/motivation.html'
  };
  // If running as file://, opening path will try to load; if same page, we can just window.location
  if(window.location.pathname.endsWith(mapping[page]) || window.location.pathname.endsWith('/')){
    // already on index or same folder - navigate
    window.location.href = mapping[page];
  } else {
    window.location.href = mapping[page];
  }
}

// Chat handlers (works on pages that include chat elements)
document.addEventListener('click', (e)=>{
  if(e.target && e.target.id === 'sendBtn') sendMessage();
  if(e.target && e.target.id === 'addTaskBtn') addTask();
});

document.addEventListener('keydown', (e)=>{
  if(e.target && e.target.id === 'chatInput' && e.key === 'Enter') sendMessage();
  if(e.target && e.target.id === 'taskTitle' && e.key === 'Enter') addTask();
});

async function sendMessage(){
  const input = document.getElementById('chatInput');
  if(!input) return;
  const chatArea = document.getElementById('chatArea');
  const text = input.value.trim();
  if(!text) return;
  addUserMessage(text);
  input.value = '';
  try{
    const res = await fetch(`${BASE_URL}/chat`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({message:text})});
    const data = await res.json();
    addBotMessage(data.reply);
  }catch(err){
    addBotMessage('⚠️ Server not reachable');
  }
}

function addUserMessage(text){
  const chatArea = document.getElementById('chatArea');
  if(!chatArea) return;
  const d = document.createElement('div'); d.className='message user-message'; d.textContent = text;
  chatArea.appendChild(d); chatArea.scrollTop = chatArea.scrollHeight;
}
function addBotMessage(text){
  const chatArea = document.getElementById('chatArea');
  if(!chatArea) return;
  const d = document.createElement('div'); d.className='message'; d.textContent = text;
  chatArea.appendChild(d); chatArea.scrollTop = chatArea.scrollHeight;
}

// Tasks
async function loadTasksPage(){
  try{
    const res = await fetch(`${BASE_URL}/tasks`);
    const data = await res.json();
    const list = document.getElementById('tasksList') || document.getElementById('taskList');
    if(!list) return;
    list.innerHTML = '';
    if(!data.tasks || data.tasks.length === 0){
      list.innerHTML = '<li>No tasks</li>'; document.getElementById('tasksCount') && (document.getElementById('tasksCount').textContent = '0'); return;
    }
    document.getElementById('tasksCount') && (document.getElementById('tasksCount').textContent = data.tasks.length);
    data.tasks.forEach(t=>{
      const li = document.createElement('li');
      li.innerHTML = `<b>${escapeHtml(t.title)}</b> — ${t.status} <button onclick="markDone(${t.id})">✔</button>`;
      list.appendChild(li);
    });
  }catch(e){ console.error(e); }
}

async function addTask(){
  const input = document.getElementById('taskTitle');
  if(!input) return;
  const title = input.value.trim();
  if(!title) return;
  try{
    await fetch(`${BASE_URL}/tasks`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({title})});
    input.value = '';
    loadTasksPage();
  }catch(e){ console.error(e); }
}

async function markDone(id){
  try{
    await fetch(`${BASE_URL}/tasks/${id}/status`, {method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({status:'done'})});
    loadTasksPage();
  }catch(e){ console.error(e); }
}

// Mood
async function saveMood(mood){
  try{
    await fetch(`${BASE_URL}/mood`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({mood})});
    loadMoodPage();
  }catch(e){ console.error(e); }
}
async function loadMoodPage(){
  try{
    const res = await fetch(`${BASE_URL}/mood`);
    const data = await res.json();
    const area = document.getElementById('moodHistory') || document.getElementById('moodList');
    if(!area) return;
    if(!data.mood || data.mood.length === 0){ area.textContent = 'No moods yet'; return; }
    area.innerHTML = data.mood.slice(-7).map(m=>`${escapeHtml(m.mood)} — ${m.timestamp.split('T')[0]}`).join('<br>');
    const recent = data.mood.slice(-1)[0]; if(recent) document.getElementById('recentMood') && (document.getElementById('recentMood').textContent = recent.mood);
  }catch(e){ console.error(e); }
}

// Planner
async function loadPlannerPage(){
  try{
    const res = await fetch(`${BASE_URL}/planner`);
    const data = await res.json();
    const area = document.getElementById('plannerList');
    if(!area) return;
    if(!data.plan || data.plan.length === 0){ area.textContent = 'No plan yet'; return; }
    area.innerHTML = data.plan.map(p=>`${escapeHtml(p.start)} - ${escapeHtml(p.end)} : ${escapeHtml(p.title)}`).join('<br>');
  }catch(e){ console.error(e); }
}

// Goals & notifications & productivity
async function loadShared(){
  try{
    const res = await fetch(`${BASE_URL}/goals`);
    const g = await res.json();
    const area = document.getElementById('goalList');
    if(area && g.goals) area.innerHTML = g.goals.map(goal=>`<div><b>${escapeHtml(goal.title)}</b> — ${Math.round((goal.progress_minutes||0)/goal.target_minutes*100)}%</div>`).join('');
  }catch(e){ console.error(e); }

  try{
    const res = await fetch(`${BASE_URL}/notifications`);
    const n = await res.json();
    const area = document.getElementById('notifList');
    if(area && n.notifications) area.innerHTML = n.notifications.map(x=>`• ${escapeHtml(x.text)}`).join('<br>');
  }catch(e){ console.error(e); }

  try{
    const res = await fetch(`${BASE_URL}/productivity`);
    const p = await res.json();
    const bars = document.getElementById('prodBars');
    if(bars && p.bars){
      bars.innerHTML = '';
      p.bars.forEach(v=>{
        const b = document.createElement('div'); b.className='bar'; b.style.height = Math.max(8, v/100*80) + 'px'; b.textContent = v>10? v+'%':'';
        bars.appendChild(b);
      });
      document.getElementById('prodPercent') && (document.getElementById('prodPercent').textContent = p.percent + '%');
    }
  }catch(e){ console.error(e); }
}

function escapeHtml(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// Auto-init: mount sidebar and load data for the current page
document.addEventListener('DOMContentLoaded', ()=>{
  const tpl = document.getElementById('sidebar-template');
  if(tpl){
    document.querySelectorAll('#sidebar-root').forEach(el=>el.innerHTML = tpl.innerHTML);
    mountSidebar();
  }
  // load page specific data
  loadTasksPage(); loadMoodPage(); loadPlannerPage(); loadShared();
});
