/* nitr0s-plugin
   name: Quick Notes
   description: Persistent notepad that saves to localStorage on this PC
   type: widget
*/
function run(container) {
  container.innerHTML = `
    <style>
      .n-wrap { display:flex; flex-direction:column; gap:10px; height:420px; max-width:600px; }
      .n-bar { display:flex; justify-content:space-between; align-items:center; }
      .n-title { font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:2px; color:#c084fc; }
      .n-actions { display:flex; gap:6px; }
      .n-btn {
        background:none; border:1px solid #1a1a26; border-radius:6px;
        padding:5px 12px; color:#8888aa; font-family:var(--mono);
        font-size:10px; cursor:pointer; letter-spacing:1px; transition:all 0.15s;
      }
      .n-btn:hover { border-color:#7c3aed; color:#c084fc; }
      .n-btn.save { background:rgba(124,58,237,0.15); border-color:rgba(124,58,237,0.4); color:#c084fc; }
      .n-btn.save:hover { background:rgba(124,58,237,0.25); }
      .n-area {
        flex:1; background:#08080c; border:1px solid #1a1a26;
        border-radius:10px; padding:16px;
        color:#ddddf0; font-family:'IBM Plex Mono',monospace;
        font-size:13px; line-height:1.7;
        resize:none; outline:none; transition:border-color 0.2s;
      }
      .n-area:focus { border-color:rgba(124,58,237,0.4); }
      .n-footer { font-family:var(--mono); font-size:9px; color:#44445a; letter-spacing:1px; }
    </style>
    <div class="n-wrap">
      <div class="n-bar">
        <div class="n-title">QUICK NOTES</div>
        <div class="n-actions">
          <button class="n-btn" onclick="clearNote()">CLEAR</button>
          <button class="n-btn" onclick="copyNote()">COPY</button>
          <button class="n-btn save" onclick="saveNote()">SAVE</button>
        </div>
      </div>
      <textarea class="n-area" id="n-text" placeholder="Start typing... notes are saved to this PC."></textarea>
      <div class="n-footer" id="n-status">UNSAVED</div>
    </div>`;

  const ta = document.getElementById('n-text');
  const status = document.getElementById('n-status');
  const KEY = 'nitr0s_notes';

  // Load saved note
  try { ta.value = localStorage.getItem(KEY) || ''; } catch(e) {}
  updateStatus();

  ta.addEventListener('input', () => {
    status.textContent = 'UNSAVED · ' + ta.value.length + ' chars';
    status.style.color = '#f59e0b';
  });

  window.saveNote = function() {
    try {
      localStorage.setItem(KEY, ta.value);
      updateStatus();
      status.style.color = '#10b981';
    } catch(e) { status.textContent = 'Save failed'; }
  };

  window.clearNote = function() {
    if (confirm('Clear all notes?')) { ta.value = ''; saveNote(); }
  };

  window.copyNote = function() {
    navigator.clipboard.writeText(ta.value).then(() => {
      const old = status.textContent;
      status.textContent = 'COPIED TO CLIPBOARD';
      status.style.color = '#06b6d4';
      setTimeout(() => { status.textContent = old; status.style.color = ''; }, 1500);
    });
  };

  function updateStatus() {
    status.textContent = 'SAVED · ' + ta.value.length + ' chars';
    status.style.color = '#44445a';
  }

  // Ctrl+S to save
  ta.addEventListener('keydown', e => { if ((e.ctrlKey||e.metaKey) && e.key==='s') { e.preventDefault(); saveNote(); } });
}
