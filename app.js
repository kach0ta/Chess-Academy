import { Chess } from "https://esm.sh/chess.js@1.4.0";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let game=new Chess(),selected=null,targets=[],flipped=false,history=[],studyCount=0;
const glyph={w:{k:"♔",q:"♕",r:"♖",b:"♗",n:"♘",p:"♙"},b:{k:"♚",q:"♛",r:"♜",b:"♝",n:"♞",p:"♟"}};
const files="abcdefgh";
function toast(t){const e=$("#toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),2100)}
function showPage(name){$$(".page").forEach(p=>p.classList.toggle("visible",p.id==="page-"+name));$$(".nav").forEach(b=>b.classList.toggle("active",b.dataset.page===name));$("#sidebar").classList.remove("open")}
function render(){const board=$("#board");board.innerHTML="";let ranks=flipped?[1,2,3,4,5,6,7,8]:[8,7,6,5,4,3,2,1],cols=flipped?[...files].reverse():[...files];for(const rank of ranks)for(const file of cols){let sq=file+rank,p=game.get(sq),el=document.createElement("button");el.className="sq "+((files.indexOf(file)+rank)%2===0?"light":"dark");el.dataset.square=sq;if(selected===sq)el.classList.add("selected");if(targets.some(x=>x.to===sq))el.classList.add(p?"capture":"target");el.textContent=p?glyph[p.color][p.type]:"";el.setAttribute("aria-label",sq);el.addEventListener("click",()=>tap(sq));board.append(el)}$("#turnInfo").textContent=game.isGameOver()?(game.isCheckmate()?"Мат":game.isDraw()?"Ничья":"Партия завершена"):(game.turn()==="w"?"Ход белых":"Ход чёрных");const h=game.history({verbose:true});$("#moveList").innerHTML=h.length?h.map((m,i)=>(i%2===0?'<span class="num">'+(Math.floor(i/2)+1)+'.</span> ':"")+ '<span class="move">'+m.san+'</span>').join(" "):"Пока нет ходов";$("#gamesCount").textContent=history.length;$("#statGames").textContent=history.length;$("#statMoves").textContent=history.reduce((a,x)=>a+x.moves,0);$("#statStudy").textContent=studyCount}
function tap(sq){const piece=game.get(sq);if(selected){let move=null;try{move=game.move({from:selected,to:sq,promotion:"q"})}catch{}if(move){selected=null;targets=[];render();return}if(piece&&piece.color===game.turn()){select(sq);return}selected=null;targets=[];render();return}if(piece&&piece.color===game.turn())select(sq)}
function select(sq){selected=sq;targets=game.moves({square:sq,verbose:true});render()}
function newGame(){game=new Chess();selected=null;targets=[];render()}
function saveGame(){if(!game.history().length){toast("Сначала сделай несколько ходов");return}history.push({pgn:game.pgn(),moves:game.history().length,date:new Date().toLocaleString("ru-RU")});localStorage.setItem("ca_games",JSON.stringify(history));render();toast("Партия сохранена на устройстве")}
function exportPGN(){if(!game.history().length){toast("В партии пока нет ходов");return}const blob=new Blob([game.pgn()],{type:"text/plain"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="chess-academy-game.pgn";a.click();URL.revokeObjectURL(a.href)}
function loadPGN(pgn){try{const next=new Chess();next.loadPgn(pgn);if(!next.history().length)throw Error("PGN не распознан");game=next;selected=null;targets=[];render();$("#analysisResult").textContent="Партия загружена. Ходов: "+game.history().length+". Используй доску и список ходов для самостоятельного разбора.";showPage("analysis")}catch(e){$("#analysisResult").textContent="Не удалось загрузить PGN: проверь формат записи.";}}
$$(".nav").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));$$("[data-go]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.go)));$("#menuBtn").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));$("#undoBtn").addEventListener("click",()=>{game.undo();selected=null;targets=[];render()});$("#flipBtn").addEventListener("click",()=>{flipped=!flipped;render()});$("#newBtn").addEventListener("click",()=>{newGame();toast("Новая партия начата")});$("#saveBtn").addEventListener("click",saveGame);$("#exportBtn").addEventListener("click",exportPGN);$("#loadPgnBtn").addEventListener("click",()=>loadPGN($("#pgnInput").value));$("#pasteExampleBtn").addEventListener("click",()=>{$("#pgnInput").value='[Event "Opera Game"]\n[Site "Paris"]\n[Date "1858.??.??"]\n[White "Paul Morphy"]\n[Black "Duke Karl / Count Isouard"]\n[Result "1-0"]\n\n1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0'});$("#clearDataBtn").addEventListener("click",()=>{if(confirm("Удалить сохранённые партии и локальный прогресс?")){history=[];localStorage.removeItem("ca_games");render();toast("Локальные данные очищены")}}); 
const openings=[["Итальянская партия","1. e4 e5 2. Nf3 Nc6 3. Bc4","Быстрое развитие фигур, давление на f7 и контроль центра."],["Испанская партия","1. e4 e5 2. Nf3 Nc6 3. Bb5","Долгосрочное давление на коня c6 и борьба за центр."],["Ферзевый гамбит","1. d4 d5 2. c4","Борьба за центр с временной пешечной жертвой."],["Защита Каро—Канн","1. e4 c6 2. d4 d5","Прочная структура и активная контригра."],["Сицилианская защита","1. e4 c5","Асимметричная борьба и игра на победу чёрными."]];
$("#openingTiles").innerHTML=openings.map((o,i)=>'<article class="opening-item"><b>'+o[0]+'</b><p>'+o[1]+'</p><p class="muted">'+o[2]+'</p><button data-study="'+i+'">Изучено</button></article>').join("");$$("[data-study]").forEach(b=>b.addEventListener("click",()=>{studyCount++;render();b.textContent="Отмечено ✓";b.disabled=true;localStorage.setItem("ca_study",studyCount)}));
const motifs=[["Двойной удар","Одна фигура одновременно нападает на две цели. Часто конь создаёт такую угрозу."],["Связка","Фигура ограничена в движении, потому что за ней находится более ценная цель."],["Вскрытое нападение","Уход одной фигуры открывает линию атаки другой фигуры."],["Отвлечение","Защитника заставляют покинуть важное поле или линию."],["Матовая атака","Согласованные действия фигур создают угрозы королю."]];
$("#tacticCards").innerHTML=motifs.map(x=>'<article class="tactic-item"><b>'+x[0]+'</b><p class="muted">'+x[1]+'</p></article>').join("");
const classics=[["Морфи — герцог Брауншвейгский и граф Изуар","Париж, 1858","Атакующая игра и быстрое развитие."],["Фишер — Бирн","Нью-Йорк, 1956","Знаменитая партия с позиционной жертвой ферзя."],["Каспаров — Топалов","Вейк-ан-Зее, 1999","Динамическая игра и длительная комбинационная атака."]];
$("#gameLibrary").innerHTML=classics.map(x=>'<article class="library-item"><b>'+x[0]+'</b><p class="muted">'+x[1]+' · '+x[2]+'</p><span class="muted">Материал для изучения будет добавлен после проверки полной PGN-записи.</span></article>').join("");
try{history=JSON.parse(localStorage.getItem("ca_games")||"[]");studyCount=Number(localStorage.getItem("ca_study")||0)}catch{history=[]}render();$("#engineStatus").textContent="Доска готова · Stockfish не подключён";if("serviceWorker"in navigator)$("#engineStatus").title="Оболочка приложения кэшируется после первого посещения";


// --- Chess Academy 1.1: computer opponent, move-by-move review, and knowledge drills ---
let reviewMoves = [];
let reviewIndex = 0;
let reviewPgn = "";
let botThinking = false;

function evaluatePosition(position) {
  const values = { p: 100, n: 320, b: 335, r: 500, q: 900, k: 0 };
  let score = 0;
  const center = ["d4", "e4", "d5", "e5"];
  for (const file of files) for (let rank = 1; rank <= 8; rank++) {
    const sq = file + rank, piece = position.get(sq);
    if (!piece) continue;
    const sign = piece.color === "w" ? 1 : -1;
    score += sign * values[piece.type];
    const fileNo = files.indexOf(file), centerDistance = Math.abs(3.5-fileNo) + Math.abs(4.5-rank);
    if (piece.type === "n" || piece.type === "b") score += sign * Math.round((4-centerDistance) * 5);
    if (piece.type === "p") score += sign * (piece.color === "w" ? rank-2 : 7-rank) * 7;
    if (center.includes(sq)) score += sign * 7;
  }
  if (position.isCheck()) score += position.turn() === "w" ? -22 : 22;
  return score;
}
function searchPosition(position, depth, alpha, beta) {
  if (position.isCheckmate()) return -100000 - depth;
  if (position.isDraw()) return 0;
  if (depth <= 0) return (position.turn() === "w" ? 1 : -1) * evaluatePosition(position);
  const moves = position.moves({ verbose: true });
  if (!moves.length) return 0;
  let best = -Infinity;
  for (const m of moves) {
    const next = new Chess(position.fen());
    next.move({ from: m.from, to: m.to, promotion: m.promotion || "q" });
    const score = -searchPosition(next, depth - 1, -beta, -alpha);
    if (score > best) best = score;
    if (score > alpha) alpha = score;
    if (alpha >= beta) break;
  }
  return best;
}
function chooseComputerMove() {
  const depth = Number($("#botDepth")?.value || 2);
  const moves = game.moves({ verbose: true });
  let bestMove = null, bestScore = -Infinity;
  for (const m of moves) {
    const next = new Chess(game.fen());
    next.move({ from: m.from, to: m.to, promotion: m.promotion || "q" });
    const score = -searchPosition(next, Math.max(0, depth - 1), -Infinity, Infinity);
    if (score > bestScore) { bestScore = score; bestMove = m; }
  }
  return bestMove;
}
function computerReply() {
  if (!$("#botMode")?.checked || game.turn() !== "b" || game.isGameOver() || botThinking) return;
  botThinking = true;
  $("#turnInfo").textContent = "Компьютер думает…";
  setTimeout(() => {
    try {
      const move = chooseComputerMove();
      if (move) game.move({ from: move.from, to: move.to, promotion: move.promotion || "q" });
      selected = null; targets = []; render();
    } finally { botThinking = false; }
  }, 80);
}
function tap(sq) {
  if (botThinking || ($("#botMode")?.checked && game.turn() === "b")) return;
  const piece = game.get(sq);
  if (selected) {
    let move = null;
    try { move = game.move({ from: selected, to: sq, promotion: "q" }); } catch {}
    if (move) {
      selected = null; targets = []; render(); computerReply(); return;
    }
    if (piece && piece.color === game.turn()) { select(sq); return; }
    selected = null; targets = []; render(); return;
  }
  if (piece && piece.color === game.turn()) select(sq);
}
function renderReview() {
  if (!reviewPgn) return;
  const replay = new Chess();
  try {
    for (let i = 0; i < reviewIndex; i++) replay.move(reviewMoves[i].san);
    game = replay; selected = null; targets = []; render();
    $("#analysisPosition").textContent = reviewMoves.length
      ? "Позиция " + reviewIndex + " из " + reviewMoves.length + " полуходов · " + (reviewIndex ? reviewMoves[reviewIndex-1].san : "Начальная позиция")
      : "В записи нет ходов.";
  } catch { $("#analysisPosition").textContent = "Не удалось воспроизвести эту позицию."; }
}
function loadPGN(pgn) {
  try {
    const parsed = new Chess();
    parsed.loadPgn(pgn);
    if (!parsed.history().length) throw new Error("Пустая партия");
    reviewPgn = pgn;
    reviewMoves = parsed.history({ verbose: true });
    reviewIndex = 0;
    $("#analysisResult").textContent = "PGN принят: " + reviewMoves.length + " полуходов. Используй кнопки для пошагового просмотра.";
    showPage("analysis");
    renderReview();
  } catch {
    $("#analysisResult").textContent = "Не удалось загрузить PGN. Проверь формат записи и корректность ходов.";
  }
}
$("#analysisStart")?.addEventListener("click", () => { reviewIndex = 0; renderReview(); });
$("#analysisPrev")?.addEventListener("click", () => { reviewIndex = Math.max(0, reviewIndex-1); renderReview(); });
$("#analysisNext")?.addEventListener("click", () => { reviewIndex = Math.min(reviewMoves.length, reviewIndex+1); renderReview(); });
$("#analysisEnd")?.addEventListener("click", () => { reviewIndex = reviewMoves.length; renderReview(); });
$("#botMode")?.addEventListener("change", () => {
  if ($("#botMode").checked && game.turn() === "b") computerReply();
  toast($("#botMode").checked ? "Режим игры против компьютера включён" : "Режим компьютера выключен");
});

// Short theory checks: answers test standard opening principles, not engine-calculated tactics.
const drills = [
  {q:"Итальянская партия: 1. e4 e5 2. Nf3 Nc6. Как обычно продолжают белые?",a:["Bc4","Qh5","a3"],c:0,h:"Развиваем слона на активную диагональ c4, нацеливаясь на f7.",why:"3. Bc4 — классическое начало Итальянской партии."},
  {q:"Какой ход начинает Ферзевый гамбит?",a:["1. e4","1. d4 d5 2. c4","1. Nf3"],c:1,h:"Белые предлагают пешку c4 в борьбе за центр.",why:"Ходы 1. d4 d5 2. c4 определяют Ферзевый гамбит."},
  {q:"Какой принцип важнее всего в дебюте?",a:["Ранний выход ферзя","Развитие фигур и борьба за центр","Ходить одной фигурой много раз"],c:1,h:"Развивай лёгкие фигуры, контролируй центр и обеспечь безопасность короля.",why:"Развитие, центр и безопасность короля — базовые дебютные приоритеты."},
  {q:"Как называется ход короля и ладьи одним ходом?",a:["Рокировка","Вилка","Связка"],c:0,h:"Этот ход помогает обезопасить короля и активировать ладью.",why:"Это рокировка; она возможна только при соблюдении специальных правил."},
  {q:"Что такое связка?",a:["Нападение на две фигуры","Фигура не может безопасно уйти из-за более ценной фигуры за ней","Обмен ферзей"],c:1,h:"Представь слона, который атакует коня, а за конём стоит король.",why:"Связка ограничивает движение фигуры из-за угрозы более ценной цели."}
];
let drillIndex = -1, drillDone = 0;
function newDrill() {
  drillIndex = (drillIndex + 1) % drills.length;
  const d = drills[drillIndex];
  $("#quizQuestion").textContent = (drillIndex+1) + "/" + drills.length + " · " + d.q;
  $("#quizOptions").innerHTML = d.a.map((answer,i) => '<button class="quiz-option" data-answer="'+i+'">'+answer+'</button>').join("");
  $("#quizFeedback").textContent = "";
  $("#quizHint").disabled = false;
  document.querySelectorAll("[data-answer]").forEach(button => button.addEventListener("click", () => {
    if (button.disabled) return;
    document.querySelectorAll("[data-answer]").forEach(b => b.disabled = true);
    if (Number(button.dataset.answer) === d.c) {
      drillDone++; $("#quizFeedback").textContent = "Верно. " + d.why + " Правильных ответов: " + drillDone;
      button.classList.add("correct");
    } else {
      $("#quizFeedback").textContent = "Не совсем. " + d.why;
      button.classList.add("incorrect");
      document.querySelector('[data-answer="'+d.c+'"]')?.classList.add("correct");
    }
  }));
}
$("#quizNew")?.addEventListener("click", newDrill);
$("#quizHint")?.addEventListener("click", () => {
  if (drillIndex < 0) { $("#quizFeedback").textContent = "Сначала нажми «Новая позиция»."; return; }
  $("#quizFeedback").textContent = "Подсказка: " + drills[drillIndex].h;
});
$("#engineStatus").textContent = "Доска и локальный соперник готовы";
$("#engineStatus").title = "Компьютер использует встроенный поисковый алгоритм. Stockfish пока не подключён.";
