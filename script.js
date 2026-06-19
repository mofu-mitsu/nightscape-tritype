let scores = { '1':0, '2':0, '3':0, '4':0, '5':0, '6':0, '7':0, '8':0, '9':0, 'sp':0, 'sx':0, 'so':0 };
let p1PageIndex = 0; 
const p1PerPage = 10;
let p2Index = 0; 
let p2History = []; 
let pickedStars = [];
let myChartInstance = null;

let p1Answers = {}; 

// 🚀 GAS（Google Apps Script）連携用WebアプリURL
// みつきがGAS側で「デプロイ」したWebアプリのURLをここに貼り付けてね！
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwTAr8fTysJuNsk1mUSVkakakH1kXC65p6SRrDdQWgWG1Ryo4I8VLf79__x6RwySkrgtQ/exec"; 

let actionHistory = {
  selfType: "",
  checkedCount: {},
  p2Answers: [],
  starResult: "",
  rainResult: "",
  wishText: ""
};

let hasNotified = false; 
const triggerIndex = 5; 

// アプリ起動
function initApp() {
  initWindows();
  initStars();
  setInterval(createShootingStar, 7000); 
  setTimeout(() => {
    const loader = document.getElementById('loading-screen');
    if(loader) loader.classList.add('hidden');
    switchScreen('start-screen');
  }, 2500);
}

if (document.readyState === 'loading') { document.addEventListener("DOMContentLoaded", initApp); }
else { initApp(); }

function switchScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  
  const homeLink = document.getElementById('home-link-container');
  if(id === 'start-screen' || id === 'result-screen') {
    homeLink.classList.remove('hidden-link');
  } else {
    homeLink.classList.add('hidden-link');
  }

  const container = document.getElementById('app-container');
  if(container) container.scrollTop = 0;
}

// 星空
function initStars() {
  const container = document.getElementById('stars-container');
  for(let i=0; i<80; i++) {
    let star = document.createElement('div');
    star.className = 'star-bg';
    star.style.width = star.style.height = `${Math.random()*3}px`;
    star.style.top = `${Math.random()*100}%`;
    star.style.left = `${Math.random()*100}%`;
    star.style.animationDuration = `${Math.random()*2 + 1}s`;
    container.appendChild(star);
  }
}

// 彗星
function createShootingStar() {
  const container = document.getElementById('night-sky');
  const star = document.createElement('div');
  star.className = 'shooting-star';
  star.style.top = `${Math.random()*25}%`;
  star.style.left = `${Math.random()*80 + 20}%`;
  container.appendChild(star);
  setTimeout(() => star.remove(), 1500);
}

// 窓
function initWindows() {
  document.querySelectorAll('.windows').forEach(container => {
    for(let i=0; i<15; i++) {
      let w = document.createElement('div');
      w.className = 'window'; 
      container.appendChild(w);
    }
  });
}

let lightedWindows = [];
function turnOnLights(count) {
  const darks = Array.from(document.querySelectorAll('.window:not(.light-on)'));
  for(let i=0; i<count && darks.length>0; i++) {
    let w = darks.splice(Math.floor(Math.random()*darks.length), 1)[0];
    w.classList.add('light-on');
    lightedWindows.push(w);
  }
}
function turnOffLights(count) {
  for(let i=0; i<count && lightedWindows.length>0; i++) {
    let w = lightedWindows.pop();
    w.classList.remove('light-on');
  }
}

// エニアグラム解説モーダル
document.getElementById('show-explain-btn').addEventListener('click', () => {
  document.getElementById('explain-modal').classList.remove('hidden');
});
document.getElementById('close-explain-btn').addEventListener('click', () => {
  document.getElementById('explain-modal').classList.add('hidden');
});

// --- Phase 1: チェックボックス ---
document.getElementById('start-btn').addEventListener('click', () => {
  actionHistory.selfType = document.getElementById('self-type-input').value || "未入力";
  switchScreen('phase1-screen');
  renderPhase1Page();
});

function saveCurrentPageAnswers() {
  const start = p1PageIndex * p1PerPage;
  const end = Math.min(start + p1PerPage, phase1Questions.length);
  for (let i = start; i < end; i++) {
    const chk = document.getElementById(`chk-global-${i}`);
    if (chk) { p1Answers[i] = chk.checked; }
  }
}

function renderPhase1Page() {
  const container = document.getElementById('checkbox-container');
  container.innerHTML = '';
  const start = p1PageIndex * p1PerPage;
  const end = Math.min(start + p1PerPage, phase1Questions.length);
  const totalPages = Math.ceil(phase1Questions.length / p1PerPage);
  
  document.getElementById('p1-page-text').innerText = `(${p1PageIndex + 1}/${totalPages})`;
  document.getElementById('p1-progress').style.width = `${((p1PageIndex + 1) / totalPages) * 100}%`;

  for (let i = start; i < end; i++) {
    const q = phase1Questions[i];
    const div = document.createElement('div');
    div.className = 'check-item';
    const isChecked = p1Answers[i] ? 'checked' : '';
    
    div.innerHTML = `<input type="checkbox" id="chk-global-${i}" value="${q.type}" ${isChecked}>
                     <span style="width:100%; font-size: 14px; padding-left: 5px;">${q.text}</span>`;
    
    div.addEventListener('click', (e) => {
      const chk = div.querySelector('input');
      if (e.target !== chk) { chk.checked = !chk.checked; }
    });

    container.appendChild(div);
    if ((i - start + 1) === 5 && i !== end - 1) {
      const divider = document.createElement('div'); divider.className = 'check-divider'; container.appendChild(divider);
    }
  }
  document.getElementById('app-container').scrollTop = 0;
  document.getElementById('prev-phase1-btn').style.display = p1PageIndex === 0 ? 'none' : 'inline-block';
}

document.getElementById('prev-phase1-btn').addEventListener('click', () => {
  if (p1PageIndex > 0) { 
    saveCurrentPageAnswers(); 
    p1PageIndex--; 
    renderPhase1Page(); 
  }
});

document.getElementById('next-phase1-btn').addEventListener('click', () => {
  saveCurrentPageAnswers(); 
  p1PageIndex++;
  
  if (p1PageIndex * p1PerPage >= phase1Questions.length) {
    Object.keys(p1Answers).forEach(index => {
      if (p1Answers[index]) {
        const q = phase1Questions[index];
        scores[q.type] += 3; 
        actionHistory.checkedCount[q.type] = (actionHistory.checkedCount[q.type] || 0) + 1;
      }
    });

    switchScreen('phase2-screen');
    showP2Question();
  } else {
    renderPhase1Page();
  }
});

// --- Phase 2: 5段階評価 ---
function showP2Question() {
  if (p2Index === triggerIndex && !hasNotified) {
    const selectedMsg = messages[Math.floor(Math.random() * messages.length)];
    showNotification(selectedMsg);
    hasNotified = true;
  }

  showCaterpillar();

  if (p2Index >= questions.length) {
    switchScreen('star-gimmick-screen');
    initStarGimmick();
    return;
  }
  
  const q = questions[p2Index];
  document.getElementById('p2-progress').style.width = `${((p2Index) / questions.length) * 100}%`;
  document.getElementById('question-text').innerHTML = `<p style="font-size: 16px; margin-bottom: 20px;">Q${p2Index + 1}.<br>${q.text}</p>`;
  
  const opts = document.getElementById('options-container');
  opts.innerHTML = '';
  
  [ {l:"そう思う",v:2}, {l:"ややそう思う",v:1}, {l:"どちらともいえない",v:0}, {l:"あまり思わない",v:-1}, {l:"そう思わない",v:-2} ].forEach(opt => {
    let btn = document.createElement('button');
    btn.innerHTML = `<i class="fa-solid fa-star-of-life" style="margin-right:10px; opacity:0.5;"></i> ${opt.l}`;
    btn.style.display = "block"; btn.style.width = "100%";
    btn.addEventListener('click', () => {
      p2History.push({ type: q.type, instinct: q.instinct, value: opt.v });
      if(q.type) scores[q.type] += opt.v;
      if(q.instinct) scores[q.instinct] += opt.v;
      
      actionHistory.p2Answers.push({ q: q.text, ans: opt.l });

      turnOnLights(2);
      p2Index++;
      showP2Question();
    });
    opts.appendChild(btn);
  });
  
  document.getElementById('prev-phase2-btn').style.display = p2Index === 0 ? 'none' : 'inline-block';
}

document.getElementById('prev-phase2-btn').addEventListener('click', () => {
  if (p2Index > 0) {
    const last = p2History.pop();
    if(last.type) scores[last.type] -= last.value;
    if(last.instinct) scores[last.instinct] -= last.value;
    actionHistory.p2Answers.pop(); 
    turnOffLights(2);
    p2Index--;
    showP2Question();
  }
});

function showCaterpillar() {
  const caterpillar = document.getElementById('lsi-caterpillar');
  if(!caterpillar) return;
  const oldSpeech = document.querySelector('.lsi-speech');
  if(oldSpeech) oldSpeech.remove();

  if(Math.random() < 0.25) { 
    caterpillar.classList.remove('hidden');
  } else {
    caterpillar.classList.add('hidden');
  }
}

document.getElementById('lsi-caterpillar').addEventListener('click', function() {
  if(document.querySelector('.lsi-speech')) return; 
  const speech = document.createElement('div');
  speech.className = 'lsi-speech';
  speech.innerText = "……順序を守って進め給え。感情より構造が優先だ。";
  this.parentElement.appendChild(speech);
  
  setTimeout(() => {
    speech.remove();
    this.classList.add('hidden');
  }, 3000);
});

// --- 📳 スマホ風通知機能 ---
function showNotification(msg) {
  const popup = document.getElementById('notification-popup');
  const previewState = document.getElementById('noti-preview-state');
  const detailState = document.getElementById('noti-detail-state');
  
  detailState.classList.add('hidden');
  previewState.classList.remove('hidden');
  detailState.querySelector('.noti-icon').innerText = "";
  detailState.querySelector('.noti-text').innerText = "";
  
  popup.classList.remove('hidden');

  document.getElementById('noti-open').onclick = () => {
    previewState.classList.add('hidden'); 
    detailState.classList.remove('hidden'); 
    detailState.querySelector('.noti-icon').innerText = msg.icon;
    detailState.querySelector('.noti-text').innerText = msg.text;
  };
  
  const closeNoti = () => { popup.classList.add('hidden'); };
  document.getElementById('noti-close').onclick = closeNoti;
  document.getElementById('noti-ok').onclick = closeNoti;
}

// --- Phase 3: 星ギミック ---
function initStarGimmick() {
  const field = document.getElementById('star-field');
  field.innerHTML = ''; pickedStars = [];
  for(let i=0; i<40; i++) {
    let star = document.createElement('div');
    star.className = 'pickable-star';
    star.innerHTML = '✦'; 
    star.style.top = `${Math.random()*80 + 10}%`;
    star.style.left = `${Math.random()*80 + 10}%`;
    star.addEventListener('click', function() {
      if(this.classList.contains('selected') || pickedStars.length >= 3) return;
      this.classList.add('selected');
      pickedStars.push({ x: parseFloat(this.style.left), y: parseFloat(this.style.top) });
      if(pickedStars.length === 3) analyzeStars();
    });
    field.appendChild(star);
  }
}

function analyzeStars() {
  let d1 = Math.hypot(pickedStars[0].x - pickedStars[1].x, pickedStars[0].y - pickedStars[1].y);
  let d2 = Math.hypot(pickedStars[1].x - pickedStars[2].x, pickedStars[1].y - pickedStars[2].y);
  let d3 = Math.hypot(pickedStars[2].x - pickedStars[0].x, pickedStars[2].y - pickedStars[0].y);
  let maxD = Math.max(d1, d2, d3);
  
  if (maxD < 20) { 
    scores['sp'] += 0.5; scores['5'] += 0.5; 
    actionHistory.starResult = "密集(中心寄り/sp・5補正)";
  } else if (maxD > 60) { 
    scores['sx'] += 0.5; scores['7'] += 0.5; 
    actionHistory.starResult = "分散(端寄り/sx・7補正)";
  } else {
    actionHistory.starResult = "通常分布(補正なし)";
  }
  
  setTimeout(() => { startRain(); switchScreen('rain-gimmick-screen'); }, 1000);
}

// --- Phase 3: 雨ギミック ---
function startRain() {
  const weather = document.getElementById('weather-layer'); 
  weather.innerHTML = ''; 
  for(let i=0; i<45; i++) {
    let drop = document.createElement('div'); 
    drop.className = 'raindrop'; 
    drop.style.left = `${Math.random()*100}%`; 
    drop.style.animationDuration = `${Math.random()*0.3 + 0.4}s`; 
    weather.appendChild(drop);
  }
  
  const opts = document.getElementById('rain-options'); 
  opts.innerHTML = '';
  [ {t:"傘を探す", s:'6', i:'sp'}, {t:"そのまま歩く", s:'9', i:null}, {t:"雨宿りする", s:'5', i:'sp'}, {t:"走る", s:'3', i:null}, {t:"空を見る", s:'4', i:'sx'} ].forEach(opt => {
    let btn = document.createElement('button'); btn.innerText = opt.t; btn.style.display = "block"; btn.style.width = "100%";
    btn.addEventListener('click', () => {
      scores[opt.s] += 0.5; if(opt.i) scores[opt.i] += 0.5;
      actionHistory.rainResult = `${opt.t}(タイプ${opt.s}・本能${opt.i || "なし"}補正)`;
      document.getElementById('weather-layer').innerHTML = ''; 
      switchScreen('wish-screen');
    });
    opts.appendChild(btn);
  });
}

// --- 自由入力 & 結果 ---
document.getElementById('wish-btn').addEventListener('click', () => {
  const wish = document.getElementById('wish-input').value;
  actionHistory.wishText = wish || "未入力";
  
  for(const [k, v] of Object.entries(wishKeywords)) { 
    v.forEach(w => { if(wish.includes(w)) scores[k] += 0.5; }); 
  }
  calculateResult();
});

function calculateResult() {
  const head = ['5','6','7'].sort((a,b) => scores[b] - scores[a]);
  const heart = ['2','3','4'].sort((a,b) => scores[b] - scores[a]);
  const gut = ['8','9','1'].sort((a,b) => scores[b] - scores[a]);
  const topTypes = [head[0], heart[0], gut[0]].sort((a,b) => scores[b] - scores[a]);
  
  const getWing = (t) => {
    const num = parseInt(t); const w1 = num === 1 ? 9 : num - 1; const w2 = num === 9 ? 1 : num + 1;
    return scores[w1] >= scores[w2] ? `${t}w${w1}` : `${t}w${w2}`;
  };

  const tritypeWings = topTypes.map(t => getWing(t)).join(' / ');
  const instincts = ['sp', 'sx', 'so'].sort((a,b) => scores[b] - scores[a]);

  const finalTritype = `△${topTypes.join('')} (${tritypeWings})`;
  const finalInstinct = `${instincts[0]}/${instincts[1]}`;

  document.getElementById('tritype-result').innerText = finalTritype;
  document.getElementById('instinct-result').innerText = finalInstinct;
  
  turnOnLights(100);
  switchScreen('result-screen');
  drawChart(); 
  
  const logText = generateActionLog(); // 📋 ログ生成
  
  // 🚀 GASへデータ送信
  sendDataToGAS(finalTritype, finalInstinct, logText);
}

// 📊 棒グラフ
function drawChart() {
  const ctx = document.getElementById('resultChart').getContext('2d');
  const dataValues = ['1','2','3','4','5','6','7','8','9'].map(t => scores[t]);
  
  if (myChartInstance) { myChartInstance.destroy(); }

  myChartInstance = new Chart(ctx, {
    type: 'bar', 
    data: {
      labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9'],
      datasets: [{
        data: dataValues,
        backgroundColor: 'rgba(244, 232, 193, 0.6)', 
        borderColor: '#FFE066',
        borderWidth: 1.5,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#F4E8C1', font: { family: 'Noto Serif JP', size: 12 } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.08)' },
          ticks: { color: '#F4E8C1', precision: 0 }
        }
      },
      plugins: { legend: { display: false } }
    }
  });
}

// 行動ログ生成
function generateActionLog() {
  let logText = `【Nightscape Tritype 診断行動ログ】\n`;
  logText += `------------------------------------\n`;
  logText += `自認タイプ: ${actionHistory.selfType}\n\n`;
  logText += `■ Phase 1: タイプ別チェック数 (1チェック=+3点)\n`;
  for(let i=1; i<=9; i++) {
    logText += `  Type ${i}: ${actionHistory.checkedCount[i] || 0}個\n`;
  }
  logText += `\n■ Phase 2: 5段階評価の回答履歴\n`;
  actionHistory.p2Answers.forEach((ans, idx) => {
    logText += `  Q${idx+1}. [${ans.ans}] ${ans.q}\n`;
  });
  logText += `\n■ Phase 3: 星ギミック結果\n`;
  logText += `  ${actionHistory.starResult}\n`;
  logText += `\n■ Phase 3: 雨ギミック結果\n`;
  logText += `  ${actionHistory.rainResult}\n`;
  logText += `\n■ Phase 4: 流れ星への願い事\n`;
  logText += `  「${actionHistory.wishText}」\n`;
  logText += `------------------------------------\n`;
  logText += `【最終エニアスコア】\n`;
  for(let i=1; i<=9; i++) { logText += `  Type ${i}: ${scores[i]}点\n`; }
  logText += `【最終生得本能スコア】\n`;
  logText += `  sp: ${scores['sp']}点 | sx: ${scores['sx']}点 | so: ${scores['so']}点\n`;

  document.getElementById('action-log-textarea').value = logText;
  return logText;
}

// 🚀 GASにデータをPOSTする関数
function sendDataToGAS(tritype, instinct, logText) {
  if (GAS_WEB_APP_URL.includes("XXXXX")) {
    console.log("GAS_URLがデフォルト値のままのため、送信をスキップします。");
    return;
  }

  const payload = {
    selfType: actionHistory.selfType,
    tritype: tritype,
    instinct: instinct,
    wish: actionHistory.wishText,
    t1: scores['1'], t2: scores['2'], t3: scores['3'], t4: scores['4'], t5: scores['5'], t6: scores['6'], t7: scores['7'], t8: scores['8'], t9: scores['9'],
    sp: scores['sp'], sx: scores['sx'], so: scores['so'],
    log: logText
  };

  fetch(GAS_WEB_APP_URL, {
    method: "POST",
    mode: "no-cors", // CORSエラーを回避
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(() => console.log("GASへのデータ送信に成功しました。"))
  .catch(err => console.error("GAS送信エラー:", err));
}

// ログコピー
document.getElementById('copy-log-btn').addEventListener('click', () => {
  const textarea = document.getElementById('action-log-textarea');
  textarea.select();
  document.execCommand('copy');
  const btn = document.getElementById('copy-log-btn');
  btn.innerHTML = `<i class="fa-solid fa-check"></i> コピーしました！`;
  setTimeout(() => { btn.innerHTML = `<i class="fa-solid fa-copy"></i> ログをコピー`; }, 2000);
});

// 画像保存
document.getElementById('save-img-btn').addEventListener('click', () => {
  const captureArea = document.getElementById('capture-area');
  html2canvas(captureArea, { backgroundColor: '#11052C', scale: 2 }).then(canvas => {
    const link = document.createElement('a');
    link.download = 'nightscape_tritype_result.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
});

// 共有
document.getElementById('share-btn').addEventListener('click', () => {
  const tritype = document.getElementById('tritype-result').innerText;
  const instinct = document.getElementById('instinct-result').innerText;
  const shareText = `夜景を紡ぐ診断「Nightscape Tritype」で、私のトライタイプは【${tritype}】生得本能は【${instinct}】でした！🌌✨ #NightscapeTritype`;
  const shareUrl = window.location.href;

  if (navigator.share) {
    navigator.share({ title: 'Nightscape Tritype 診断結果', text: shareText, url: shareUrl }).catch(err => console.log('共有エラー:', err));
  } else {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  }
});

document.getElementById('restart-btn').addEventListener('click', () => location.reload());
