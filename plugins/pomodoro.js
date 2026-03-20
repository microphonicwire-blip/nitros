/* nitr0s-plugin
   name: Pomodoro Timer
   description: Focus timer with work and break sessions, visual countdown
   type: widget
*/
function run(container) {
  container.innerHTML = `
    <style>
      .p-wrap { display:flex; flex-direction:column; align-items:center; gap:20px; padding:20px 0; max-width:360px; margin:0 auto; }
      .p-mode { display:flex; gap:8px; }
      .p-mode-btn {
        font-family:var(--mono); font-size:10px; letter-spacing:2px;
        padding:6px 16px; border-radius:6px; cursor:pointer;
        border:1px solid #1a1a26; background:none; color:#44445a;
        transition:all 0.15s; text-transform:uppercase;
      }
      .p-mode-btn.active { border-color:rgba(124,58,237,0.5); color:#c084fc; background:rgba(124,58,237,0.1); }
      .p-ring-wrap { position:relative; width:200px; height:200px; }
      svg.p-ring { transform:rotate(-90deg); }
      .p-ring-bg { fill:none; stroke:#1a1a26; stroke-width:8; }
      .p-ring-fg { fill:none; stroke:#7c3aed; stroke-width:8; stroke-linecap:round;
        transition:stroke-dashoffset 1s linear; filter:drop-shadow(0 0 8px rgba(124,58,237,0.6)); }
      .p-ring-fg.break { stroke:#06b6d4; filter:drop-shadow(0 0 8px rgba(6,182,212,0.6)); }
      .p-time-display {
        position:absolute; inset:0; display:flex; flex-direction:column;
        align-items:center; justify-content:center;
      }
      .p-time {
        font-family:'Bebas Neue',sans-serif; font-size:54px; letter-spacing:3px;
        background:linear-gradient(135deg,#fff,#c084fc);
        -webkit-background-clip:text; -webkit-text-fill-color:transparent;
        line-height:1;
      }
      .p-label { font-family:var(--mono); font-size:10px; color:#44445a; letter-spacing:2px; margin-top:4px; }
      .p-controls { display:flex; gap:10px; }
      .p-btn {
        font-family:var(--mono); font-size:12px; letter-spacing:1px;
        padding:10px 24px; border-radius:8px; cursor:pointer;
        border:none; transition:all 0.15s; text-transform:uppercase;
      }
      .p-start { background:linear-gradient(135deg,#7c3aed,#9d5cff); color:#fff; }
      .p-start:hover { box-shadow:0 0 18px rgba(124,58,237,0.5); }
      .p-reset { background:rgba(255,255,255,0.05); border:1px solid #1a1a26; color:#8888aa; }
      .p-reset:hover { border-color:#7c3aed; color:#c084fc; }
      .p-sessions { font-family:var(--mono); font-size:11px; color:#44445a; letter-spacing:1px; }
      .p-dot { display:inline-block; width:8px; height:8px; border-radius:50%; background:#7c3aed; margin:0 2px; }
      .p-dot.done { background:#10b981; }
    </style>
    <div class="p-wrap">
      <div class="p-mode">
        <button class="p-mode-btn active" id="btn-work" onclick="setMode('work')">Work 25m</button>
        <button class="p-mode-btn" id="btn-short" onclick="setMode('short')">Short 5m</button>
        <button class="p-mode-btn" id="btn-long" onclick="setMode('long')">Long 15m</button>
      </div>
      <div class="p-ring-wrap">
        <svg class="p-ring" width="200" height="200" viewBox="0 0 200 200">
          <circle class="p-ring-bg" cx="100" cy="100" r="88"/>
          <circle class="p-ring-fg" id="p-fg" cx="100" cy="100" r="88"
            stroke-dasharray="553" stroke-dashoffset="0"/>
        </svg>
        <div class="p-time-display">
          <div class="p-time" id="p-time">25:00</div>
          <div class="p-label" id="p-lbl">FOCUS</div>
        </div>
      </div>
      <div class="p-controls">
        <button class="p-btn p-start" id="p-start-btn" onclick="toggleTimer()">START</button>
        <button class="p-btn p-reset" onclick="resetTimer()">RESET</button>
      </div>
      <div class="p-sessions" id="p-sessions">Sessions: <span id="p-dots"></span></div>
    </div>`;

  const modes = { work:25*60, short:5*60, long:15*60 };
  let mode = 'work', total = modes.work, remaining = total;
  let running = false, interval = null, sessions = 0;
  const CIRC = 553;

  function setMode(m) {
    mode = m; total = modes[m]; remaining = total;
    running = false; clearInterval(interval);
    document.getElementById('p-start-btn').textContent = 'START';
    document.querySelectorAll('.p-mode-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-' + m).classList.add('active');
    const fg = document.getElementById('p-fg');
    fg.className = 'p-ring-fg' + (m !== 'work' ? ' break' : '');
    render();
  }
  window.setMode = setMode;

  function render() {
    const m = Math.floor(remaining/60), s = remaining%60;
    document.getElementById('p-time').textContent =
      String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
    document.getElementById('p-lbl').textContent =
      mode === 'work' ? 'FOCUS' : mode === 'short' ? 'SHORT BREAK' : 'LONG BREAK';
    const pct = remaining / total;
    document.getElementById('p-fg').style.strokeDashoffset = CIRC * (1 - pct);

    let dots = '';
    for (let i=0;i<4;i++) dots += `<span class="p-dot${i<sessions?'':' done'}" style="${i<sessions?'':'background:#44445a'}"></span>`;
    document.getElementById('p-dots').innerHTML = dots;
  }

  window.toggleTimer = function() {
    if (running) {
      running = false; clearInterval(interval);
      document.getElementById('p-start-btn').textContent = 'RESUME';
    } else {
      running = true;
      document.getElementById('p-start-btn').textContent = 'PAUSE';
      interval = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
          clearInterval(interval); running = false;
          document.getElementById('p-start-btn').textContent = 'START';
          if (mode === 'work') sessions = Math.min(sessions+1, 4);
          remaining = 0;
        }
        render();
      }, 1000);
    }
  };

  window.resetTimer = function() {
    running = false; clearInterval(interval);
    remaining = total;
    document.getElementById('p-start-btn').textContent = 'START';
    render();
  };

  render();
}
