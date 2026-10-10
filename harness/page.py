"""The owner's page: the inbox first, the board under it, a ticket's timeline behind a tap."""

PAGE = r"""<!doctype html>
<html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>harness</title>
<style>
body{font-family:system-ui,-apple-system,sans-serif;margin:0;background:#f4f5f7;color:#111}
header{padding:12px 16px;background:#1f2937;color:#fff;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0}
header a{color:#fff;text-decoration:none;font-weight:600}
main{padding:12px;max-width:960px;margin:auto}
h2{font-size:15px;text-transform:uppercase;letter-spacing:.06em;color:#555;margin:18px 0 6px}
.card{background:#fff;border-radius:12px;padding:14px;margin:10px 0;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.card h3{margin:0 0 4px;font-size:17px}
.muted{color:#666;font-size:13px}
.line{margin:6px 0;font-size:14px}
button{font-size:15px;padding:10px 14px;border-radius:9px;border:0;margin:8px 8px 0 0;background:#e5e7eb;cursor:pointer}
button.yes{background:#16a34a;color:#fff} button.no{background:#dc2626;color:#fff}
table{width:100%;border-collapse:collapse;font-size:14px;background:#fff;border-radius:12px;overflow:hidden}
td,th{padding:8px;border-bottom:1px solid #eee;text-align:left;vertical-align:top}
.pill{display:inline-block;padding:2px 9px;border-radius:999px;font-size:12px;background:#e5e7eb}
.pill.held{background:#fde68a}.pill.active{background:#bfdbfe}.pill.done{background:#bbf7d0}.pill.paused{background:#ddd}
.steps span{opacity:.35;margin-right:6px;font-size:12px}.steps span.now{opacity:1;font-weight:700}.steps span.past{opacity:.7;text-decoration:line-through}
pre{white-space:pre-wrap;word-break:break-word;font-size:12px;background:#f3f4f6;padding:8px;border-radius:8px;margin:4px 0}
.ev{font-size:13px;margin:4px 0}
.ok{color:#15803d}.bad{color:#b91c1c}
</style></head><body>
<header><a href="#">harness</a><span id="clock" class="muted"></span></header>
<main id="app">loading</main>
<script>
const app=document.getElementById('app');
async function api(p,o){
  const r=await fetch('/api/'+p,o?{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(o)}:{});
  const j=await r.json();
  if(!r.ok){alert(j.message||JSON.stringify(j));throw j}
  return j;
}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function ago(ts,now){const s=Math.max(0,Math.round(now-ts));return s<60?s+'s':s<3600?Math.round(s/60)+'m':Math.round(s/3600)+'h'}
function view(){return location.hash.startsWith('#t/')?decodeURIComponent(location.hash.slice(3)):null}
async function act(t,verb,ask){
  let body={};
  if(ask){const v=prompt(ask);if(v===null)return;body.note=v;body.text=v}
  if(verb==='approve'||verb==='reject'){body.verdict=verb;verb='decide'}
  await api('ticket/'+encodeURIComponent(t)+'/'+verb,body);render();
}
const ASK={reject:'Why? This lands in the next briefing.',answer:'Your answer. It lands in the next briefing.',note:'A note for the next attempt.',retry:'A note for the next attempt (optional).'};
function button(t,a){const cls=a==='approve'?'yes':a==='reject'?'no':'';return `<button class="${cls}" onclick="act('${esc(t)}','${a}',${ASK[a]?`'${ASK[a]}'`:'null'})">${a}</button>`}
function card(c,now){
  let ev='';
  if(c.evidence){const e=c.evidence;ev=`<div class="line">review: <b>${esc(e.review||'none')}</b> · last gate: ${esc(e.last_gate||'none')}</div>`+(e.files?`<div class="line muted">files: ${esc(e.files.join(', '))}</div>`:'')}
  if(c.handover){const h=c.handover;ev=`<div class="line"><b>last handover</b></div>`+['done','remaining','blockers','next'].filter(k=>h[k]).map(k=>`<div class="line">${k}: ${esc(h[k])}</div>`).join('')}
  return `<div class="card"><h3><a href="#t/${encodeURIComponent(c.ticket)}">${esc(c.ticket)}</a> · ${esc(c.step)} · <span class="pill held">${esc(c.reason)}</span></h3>
  <div class="muted">“${esc(c.goal)}” · waiting ${ago(c.since,now)}</div>
  ${c.detail?`<div class="line">${esc(c.detail)}</div>`:''}${ev}
  <div>${c.actions.map(a=>button(c.ticket,a)).join('')}</div></div>`;
}
function row(r,now){
  const steps=r.steps.map(s=>`<span class="${s===r.step?'now':(r.steps.indexOf(s)<r.steps.indexOf(r.step)||r.step==='done')?'past':''}">${esc(s)}</span>`).join('');
  const who=r.holder?`${esc(r.holder)} · lease ${r.lease_left}s · silent ${r.silent_for}s`:'';
  return `<tr><td><a href="#t/${encodeURIComponent(r.ticket)}">${esc(r.ticket)}</a><div class="muted">${esc(r.group||'')}</div></td>
  <td><span class="pill ${esc(r.state)}">${esc(r.state)}${r.held_for?' · '+esc(r.held_for):''}</span><div class="steps">${steps}</div></td>
  <td>${esc(r.attempts)} tries · ${r.fails} fails · ${r.stalls} stalls<div class="muted">${who}</div></td>
  <td>${r.state==='active'||r.state==='open'?button(r.ticket,'pause'):''}${r.state==='paused'?button(r.ticket,'resume'):''}${button(r.ticket,'note')}</td></tr>`;
}
async function render(){
  try{
    const t=view();
    if(t){return renderTicket(t)}
    const s=await api('state');
    document.getElementById('clock').textContent=new Date(s.now*1000).toLocaleTimeString();
    let h='<h2>Inbox · '+s.inbox.length+' waiting on you</h2>';
    h+=s.inbox.length?s.inbox.map(c=>card(c,s.now)).join(''):'<div class="card muted">Nothing waits on you.</div>';
    h+='<h2>Board</h2><table><tr><th>ticket</th><th>where</th><th>budget</th><th></th></tr>'+s.board.map(r=>row(r,s.now)).join('')+'</table>';
    app.innerHTML=h;
  }catch(e){app.innerHTML='<div class="card bad">'+esc(e.message||e)+'</div>'}
}
async function renderTicket(id){
  const d=await api('ticket/'+encodeURIComponent(id));const t=d.ticket;const now=Date.now()/1000;
  let h=`<div class="card"><h3>${esc(t.id)} <span class="pill ${esc(t.state)}">${esc(t.state)}${t.held_for?' · '+esc(t.held_for):''}</span></h3>
  <div class="line">${esc(t.goal)}</div><div class="muted">route ${esc(t.route)} · step <b>${esc(t.step)}</b> · branch ${esc(t.branch)} · ${t.stalls} stalls</div>
  <div>${button(t.id,'note')}${t.state==='active'||t.state==='open'?button(t.id,'pause'):''}${t.state==='paused'?button(t.id,'resume'):''}</div></div>`;
  h+='<h2>Gates</h2><div class="card">'+(d.gates.length?d.gates.map(g=>`<div class="ev"><b class="${g.verdict==='pass'?'ok':'bad'}">${esc(g.verdict)}</b> ${esc(g.step)} · attempt ${g.attempt==null?'owner':g.attempt}<pre>${esc(g.detail)}</pre></div>`).join(''):'<span class="muted">none yet</span>')+'</div>';
  h+='<h2>Evidence</h2><div class="card">'+(d.evidence.length?d.evidence.map(e=>`<div class="ev"><b>${esc(e.kind)}</b> on ${esc(e.step)} by attempt ${e.attempt} ${e.verified?'<span class="ok">verified '+esc(e.detail)+'</span>':''}<pre>${esc(JSON.stringify(e.body))}</pre></div>`).join(''):'<span class="muted">none yet</span>')+'</div>';
  h+='<h2>Handovers</h2><div class="card">'+(d.handovers.length?d.handovers.map(x=>`<div class="ev"><b>${esc(x.step)}</b> · ${x.synthesized?'synthesized by the harness':'attempt '+x.attempt}`+['done','remaining','blockers','files','next'].filter(k=>x[k]).map(k=>`<div class="line">${k}: ${esc(x[k])}</div>`).join('')+'</div>').join(''):'<span class="muted">none</span>')+'</div>';
  h+='<h2>Attempts</h2><table><tr><th>#</th><th>step</th><th>role</th><th>worker</th><th>calls</th><th>outcome</th></tr>'+d.attempts.map(a=>`<tr><td>${a.id}</td><td>${esc(a.step)}</td><td>${esc(a.role)}</td><td>${esc(a.worker)}</td><td>${a.calls}</td><td>${esc(a.outcome||'open')}</td></tr>`).join('')+'</table>';
  h+='<h2>Timeline</h2><div class="card">'+d.events.slice().reverse().map(e=>`<div class="ev"><span class="muted">${new Date(e.ts*1000).toLocaleTimeString()}</span> <b>${esc(e.kind)}</b> ${esc(JSON.stringify(e.body))}</div>`).join('')+'</div>';
  app.innerHTML=h;
}
setInterval(render,3000);window.addEventListener('hashchange',render);render();
</script></body></html>
"""
