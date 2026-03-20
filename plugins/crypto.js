/* nitr0s-plugin
   name: Crypto Ticker
   description: Live prices for BTC, ETH, SOL and more via CoinGecko
   type: widget
*/
function run(container) {
  container.innerHTML = `
    <style>
      .ct-wrap { display:flex; flex-direction:column; gap:10px; max-width:500px; }
      .ct-bar { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; }
      .ct-title { font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:2px; color:#c084fc; }
      .ct-refresh {
        background:none; border:1px solid #1a1a26; border-radius:6px;
        padding:5px 12px; color:#8888aa; font-family:var(--mono);
        font-size:10px; cursor:pointer; letter-spacing:1px;
      }
      .ct-refresh:hover { border-color:#7c3aed; color:#c084fc; }
      .ct-row {
        background:#0c0c12; border:1px solid #1a1a26; border-radius:10px;
        padding:14px 16px; display:flex; align-items:center; justify-content:space-between;
        transition:border-color 0.2s;
      }
      .ct-row:hover { border-color:rgba(124,58,237,0.35); }
      .ct-left { display:flex; align-items:center; gap:12px; }
      .ct-symbol { font-family:'Bebas Neue',sans-serif; font-size:20px; letter-spacing:1px; min-width:50px; }
      .ct-name { font-size:11px; color:#44445a; }
      .ct-price { font-family:var(--mono); font-size:16px; color:#ddddf0; }
      .ct-change { font-family:var(--mono); font-size:12px; padding:3px 8px; border-radius:5px; }
      .ct-change.up { color:#10b981; background:rgba(16,185,129,0.1); }
      .ct-change.dn { color:#f43f5e; background:rgba(244,63,94,0.1); }
      .ct-loading { color:#8888aa; font-family:var(--mono); font-size:12px; }
      .ct-updated { font-family:var(--mono); font-size:9px; color:#44445a; letter-spacing:1px; margin-top:4px; }
    </style>
    <div class="ct-wrap">
      <div class="ct-bar">
        <div class="ct-title">CRYPTO TICKER</div>
        <button class="ct-refresh" onclick="loadCrypto()">↻ REFRESH</button>
      </div>
      <div id="ct-list"><div class="ct-loading">Loading prices...</div></div>
      <div class="ct-updated" id="ct-time"></div>
    </div>`;

  const coins = [
    { id:'bitcoin', sym:'BTC', name:'Bitcoin' },
    { id:'ethereum', sym:'ETH', name:'Ethereum' },
    { id:'solana', sym:'SOL', name:'Solana' },
    { id:'dogecoin', sym:'DOGE', name:'Dogecoin' },
    { id:'cardano', sym:'ADA', name:'Cardano' },
  ];

  window.loadCrypto = async function() {
    const list = document.getElementById('ct-list');
    list.innerHTML = '<div class="ct-loading">Fetching...</div>';
    try {
      const ids = coins.map(c=>c.id).join(',');
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
      const data = await res.json();
      list.innerHTML = '';
      coins.forEach(c => {
        const d = data[c.id];
        if (!d) return;
        const chg = d.usd_24h_change?.toFixed(2) ?? '0.00';
        const up = parseFloat(chg) >= 0;
        const row = document.createElement('div');
        row.className = 'ct-row';
        row.innerHTML = `
          <div class="ct-left">
            <div class="ct-symbol">${c.sym}</div>
            <div class="ct-name">${c.name}</div>
          </div>
          <div style="display:flex;align-items:center;gap:12px">
            <div class="ct-price">$${d.usd.toLocaleString()}</div>
            <div class="ct-change ${up?'up':'dn'}">${up?'+':''}${chg}%</div>
          </div>`;
        list.appendChild(row);
      });
      document.getElementById('ct-time').textContent =
        'UPDATED: ' + new Date().toLocaleTimeString('en-GB', { hour12:false });
    } catch(e) {
      list.innerHTML = `<div class="ct-loading" style="color:#f43f5e">Error: ${e.message}</div>`;
    }
  };

  loadCrypto();
  const interval = setInterval(loadCrypto, 30000);
  // cleanup if rerun
  window._nitr0s_cleanup = () => clearInterval(interval);
}
