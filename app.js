/**
 * app.js — DataShop SQL Academy
 * Lógica: SQL.js, fluxo de 7 níveis, 26 exercícios, pontuação, dicas
 */
const App = (() => {
  let _db = null;
  let _retrying = false; // usuário clicou em Tentar Novamente
 
  const KEY = 'datashop_v1';
  const PTS = { correto: 10, bonus_sem_dica: 5, dica2_custo: 5 };
 
  function _def() {
    return { pts: 0, resolvidos: [], nivel_atual: 1, ex_atual: 'e01', hints_usados: 0, hints_no_ex: 0, hints_score_ex: 0, total_hints: 0, erros: {}, tentativas: {}, tempos: {}, tempo_inicio: null, dicasUsadas: {}, tempo_acumulado: {} };
  }
 
  let _s = (() => {
    try { const r=localStorage.getItem(KEY); return r?{..._def(),...JSON.parse(r)}:_def(); }
    catch(_){ return _def(); }
  })();
 
  function _save() { try{localStorage.setItem(KEY,JSON.stringify(_s));}catch(_){} }
 
  window.addEventListener('beforeunload', () => {
    if(_s.tempo_inicio && _s.ex_atual && !_s.resolvidos.includes(_s.ex_atual)) {
      const elapsed = Math.round((Date.now() - _s.tempo_inicio) / 1000);
      if(elapsed > 0) {
        if(!_s.tempo_acumulado) _s.tempo_acumulado = {};
        _s.tempo_acumulado[_s.ex_atual] = (_s.tempo_acumulado[_s.ex_atual] || 0) + elapsed;
      }
    }
    _save();
  });
 
  // ── Init ───────────────────────────────────────────────────
  async function init() {
    try {
      UI.setLoadingMsg('Iniciando SQL.js...');
      const SQL = await initSqlJs({ locateFile: f=>`https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${f}` });
      UI.setLoadingMsg('Carregando databasetc.db...');
      const resp = await fetch('databasetc.db');
      if(!resp.ok) throw new Error(`databasetc.db não encontrado (HTTP ${resp.status}). Use: python3 -m http.server 8080`);
      const buf = await resp.arrayBuffer();
      _db = new SQL.Database(new Uint8Array(buf));
      UI.hideLoading();
      _build();
    } catch(err) {
      const m=document.getElementById('loading-msg');
      if(m){m.textContent=' '+err.message;m.style.color='#ef4444';}
      console.error('[App.init]',err);
    }
  }
 
  // ── Build UI ───────────────────────────────────────────────
  function _build() {
    UI.renderSchema(SCHEMA.tables);
    UI.renderCareer(LEVELS.map(l=>({...l})), _s.nivel_atual, _s.resolvidos); UI.renderDiagram();
    UI.renderSidebarDots(ALL_EX, _s.resolvidos, _s.ex_atual);
    _updateHeader();
 
    // Events
    _on('btn-welcome-start', ()=>{ const _stw=document.querySelector('.hd-session-timer-wrap'); if(_stw)_stw.style.display=''; _s.nivel_atual=1; _s.ex_atual='e01'; _save(); _showLevelIntro(1); });
    _on('btn-level-start',   ()=>{ _loadExercise(_s.ex_atual); });
    _on('btn-run',           runQuery);
    _on('btn-hint',          showHint);
    _on('btn-clear',         ()=>{ UI.clearEditor(); UI.clearResult(); UI._syncHL(); });
    _on('btn-retry',         ()=>{ _retrying=true; _s.hints_no_ex=0; /* hints_score_ex mantido — impede burlar pontos */ UI.clearEditor(); UI.clearResult(); const h=document.getElementById('hints-area'); if(h) h.innerHTML=''; UI._syncHL(); UI.updateHintBtn(0); const sa=document.getElementById('success-area'); if(sa) sa.hidden=true; document.getElementById('sql-editor')?.focus(); });
    _on('btn-next-ex',       goNext);
    _on('btn-next-level',    ()=>{ _showLevelIntro(_s.nivel_atual); });
    _on('btn-run-free',      runFree);
    _on('btn-run-livre',     runLivre);
    _on('btn-clear-livre',   ()=>{ const e=document.getElementById('sql-livre'); if(e){e.value=''; UI._syncHL2();} document.getElementById('result-livre').innerHTML='<div class="result-placeholder">Execute uma consulta para ver os resultados.</div>'; });
    _on('btn-livre-back', ()=>{
      const _tw=document.querySelector('.hd-session-timer-wrap'); if(_tw) _tw.style.display=''; const tw=document.querySelector('.hd-session-timer-wrap'); if(tw) tw.style.display='';
      const cargo=LEVELS.find(l=>l.id===_s.nivel_atual);
      if(cargo){const lbl=document.getElementById('hd-cargo-label');const ico=document.getElementById('hd-cargo-icon');if(lbl)lbl.textContent=cargo.cargo;if(ico)ico.textContent=cargo.icone;}
      if(_s.resolvidos.length===TOTAL_EX){
        // All done — go to dashboard
        goToDashboard();
      } else if(_s.resolvidos.length===0){
        // Never started — go to welcome
        const _tw=document.querySelector('.hd-session-timer-wrap');
        if(_tw) _tw.style.display='none'; // hide timer on welcome
        UI.goPanel('state-welcome');
      } else {
        // In progress — go back to current exercise
        _loadExercise(_s.ex_atual);
      }
    });
    _on('btn-reset-confirm', ()=>_confirmReset());
    _on('btn-reset-cancel',  ()=>{ const m=document.getElementById('reset-modal'); if(m) m.hidden=true; });
    _on('btn-dash-review',   ()=>App.goToReview());
    _on('btn-sb-livre',      ()=>App.goToReview());
    // Botão de reset no header (antes era onclick inline no HTML)
    _on('btn-reset-hd',      ()=>reset());
    // Inicializa listeners de UI que antes eram inline (tabs, modais, ajuda)
    UI.initUIListeners();
 
    // SQL highlight sync
    // Highlight sync for sql-livre
    const edL = document.getElementById('sql-livre');
    if(edL){
      const hlL = document.getElementById('sql-livre-hl');
      const syncL = ()=>{
        if(hlL){ hlL.innerHTML=UI._applyHL(edL.value)+'\x0a'; hlL.scrollTop=edL.scrollTop; hlL.scrollLeft=edL.scrollLeft; }
      };
      UI._syncHL2 = syncL;
      edL.addEventListener('input',  syncL);
      edL.addEventListener('keyup',  syncL);
      edL.addEventListener('paste',  ()=>setTimeout(syncL,10));
      edL.addEventListener('scroll', ()=>{ if(hlL){hlL.scrollTop=edL.scrollTop;hlL.scrollLeft=edL.scrollLeft;} });
      edL.addEventListener('keydown', e=>{ if(e.ctrlKey&&e.key==='Enter'){e.preventDefault();runLivre();} });
    }
    const ed = document.getElementById('sql-editor');
    if(ed){
      ed.addEventListener('input',  ()=>UI._syncHL());
      ed.addEventListener('scroll', ()=>{ const h=document.getElementById('sql-editor-hl'); if(h){h.scrollTop=ed.scrollTop;h.scrollLeft=ed.scrollLeft;} });
      ed.addEventListener('keyup',  ()=>UI._syncHL());
      ed.addEventListener('paste',  ()=>setTimeout(()=>UI._syncHL(),10));
    }
    _on('btn-dash-back',     ()=>{ _confirmReset(); });
 
    // Buttons that previously used inline onclick
    document.getElementById('btn-reset-hd')?.addEventListener('click', ()=>App.reset());
    document.getElementById('tab-schema')?.addEventListener('click', ()=>UI.switchSbTab('schema'));
    document.getElementById('tab-diagram')?.addEventListener('click', ()=>UI.switchSbTab('diagram'));
    document.getElementById('btn-expand-graph')?.addEventListener('click', ()=>UI.openGraphModal());
    document.getElementById('btn-close-graph')?.addEventListener('click', ()=>UI.closeGraphModal());
    document.getElementById('btn-sb-help')?.addEventListener('click', ()=>UI.openHelp());
    document.getElementById('btn-close-help')?.addEventListener('click', ()=>UI.closeHelp());
 
    // Escape closes graph modal
    document.addEventListener('keydown', e=>{
      if(e.key==='Escape'){
        const gm=document.getElementById('graph-modal');
        if(gm&&!gm.hidden) UI.closeGraphModal();
        const hm=document.getElementById('help-modal');
        if(hm&&!hm.hidden) UI.closeHelp();
      }
    });
 
    document.getElementById('sql-editor')?.addEventListener('keydown', e=>{
      if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();runQuery();}
      if(e.key==='Tab'){e.preventDefault();const el=e.target,s=el.selectionStart;el.value=el.value.slice(0,s)+'  '+el.value.slice(el.selectionEnd);el.selectionStart=el.selectionEnd=s+2;}
    });
    document.getElementById('sql-free')?.addEventListener('keydown', e=>{
      if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();runFree();}
    });
 
    // Restore state
    if(!_s.nivel_atual || _s.nivel_atual===1 && _s.resolvidos.length===0) {
      const _wtw=document.querySelector('.hd-session-timer-wrap');
      if(_wtw) _wtw.style.display='none';
      UI.renderWelcome();
    } else if(_s.resolvidos.length===TOTAL_EX) {
      goToDashboard();
    } else {
      _loadExercise(_s.ex_atual);
    }
  }
 
  function _on(id,fn){ document.getElementById(id)?.addEventListener('click',fn); }
 
  // ── Navigation ─────────────────────────────────────────────
  function _showLevelIntro(levelId) {
    const lv = LEVELS.find(l=>l.id===levelId); if(!lv) return;
    _s.nivel_atual = levelId;
    // set ex_atual to first unsolved in this level
    const firstUnsolved = lv.exercicios.find(ex=>!_s.resolvidos.includes(ex.id));
    if(firstUnsolved) _s.ex_atual = firstUnsolved.id;
    else _s.ex_atual = lv.exercicios[0].id;
    _save();
    UI.renderLevelIntro(lv);
    UI.renderCareer(LEVELS.map(l=>({...l})), levelId, _s.resolvidos);
  }
 
  // ── Session timer ──────────────────────────────────────────
  let _globalInterval = null;
 
  function _fmtTime(t) {
    if(!t||t<=0) return '';
    return t>=60 ? Math.floor(t/60)+'min '+t%60+'s' : t+'s';
  }
 
  function _startGlobalTimer() {
    if(_globalInterval) return;
    if(_s.resolvidos && _s.resolvidos.length >= TOTAL_EX) {
      // All done — just show saved time, don't restart
      const el = document.getElementById('session-timer');
      if(el && _s.tempo_total > 0) {
        el.textContent = _fmtTime(_s.tempo_total);
        el.hidden = false;
      }
      return;
    }
    _globalInterval = setInterval(()=>{
      _s.tempo_total = (_s.tempo_total||0) + 1;
      if(_s.tempo_total % 10 === 0) _save();
      const el = document.getElementById('session-timer');
      if(el) el.textContent = _fmtTime(_s.tempo_total);
    }, 1000);
  }
 
  function _stopGlobalTimer() {
    if(_globalInterval){ clearInterval(_globalInterval); _globalInterval=null; }
  }
 
  function _loadExercise(exId) {
    const ex = ALL_EX.find(e=>e.id===exId); if(!ex) return;
    _s.ex_atual = exId;
    _s.hints_no_ex = 0;
    _s.hints_score_ex = 0;
    _s.tempo_inicio = Date.now();
    _retrying = false;
    _save();
    const solved = _s.resolvidos.includes(exId);
    const _ltw=document.querySelector('.hd-session-timer-wrap');
    if(_ltw) _ltw.style.display=''; // show timer when exercise loads
    UI.renderExercise(ex, ex.numGlobal, TOTAL_EX, solved, _s.hints_no_ex);
    _startGlobalTimer();
    UI.renderSidebarDots(ALL_EX, _s.resolvidos, exId);
    _updateHeader();
  }
 
  function goNext() {
    const ex = ALL_EX.find(e=>e.id===_s.ex_atual); if(!ex) return;
    const idxGlobal = ALL_EX.findIndex(e=>e.id===ex.id);
    const next = ALL_EX[idxGlobal+1];
 
    if(!next) {
      // All done — show dashboard
      goToDashboard();
      return;
    }
 
    // Level change?
    if(next.level.id !== ex.level.id) {
      const curLevel = ex.level;
      _save();
      UI.renderLevelComplete(next.level, curLevel.conclusao, !ALL_EX[idxGlobal+2]);
      _s.nivel_atual = next.level.id;
      _s.ex_atual = next.id;
      _save();
      UI.renderCareer(LEVELS.map(l=>({...l})), next.level.id, _s.resolvidos);
      UI.showToast({ icon:'', label: 'Promoção!', title: next.level.cargo, desc: `Nível ${next.level.id} desbloqueado!` });
    } else {
      _loadExercise(next.id);
    }
  }
 
  // ── Executa a solução oficial ──────────────────────────────
  function _runSolution(ex) {
    if (!_db || !ex.solucao) return null;
    try {
      const st = _db.prepare(ex.solucao);
      const cols = st.getColumnNames();
      const rows = [];
      while (st.step()) rows.push(st.get());
      st.free();
      return { cols, rows };
    } catch(_) { return null; }
  }
 
  // ── Compara resultado do usuário com a solução oficial ─────
  // Exercícios com ORDER BY: comparação em sequência
  // Demais: comparação como multiset (qualquer ordem)
  const _ORDERED_EX = new Set(['e14','e15','e16','e21','e22','e23']);
 
  function _validateResult(userRows, userCols, ex) {
    const sol = _runSolution(ex);
    if (!sol) return { ok: false, msg: 'Não foi possível verificar a resposta.' };
 
    const { cols: solCols, rows: solRows } = sol;
 
    // 1. Número de colunas
    if (userCols.length !== solCols.length) {
      return {
        ok: false,
        msg: `Número de colunas incorreto — sua query retornou <strong>${userCols.length}</strong> coluna${userCols.length!==1?'s':''}, mas o exercício espera <strong>${solCols.length}</strong>.`
      };
    }
 
    // 2. Número de linhas
    if (userRows.length !== solRows.length) {
      return {
        ok: false,
        msg: `Número de linhas incorreto — sua query retornou <strong>${userRows.length}</strong> linha${userRows.length!==1?'s':''}, mas o exercício espera <strong>${solRows.length}</strong>.`
      };
    }
 
    // 3. Nomes das colunas — comparação posicional (ordem importa)
    const uCols = userCols.map(c => c.toLowerCase()).join(',');
    const sCols = solCols.map(c => c.toLowerCase()).join(',');
    if (uCols !== sCols) {
      return {
        ok: false,
        msg: `As colunas retornadas não correspondem — esperado em ordem: <strong>${solCols.join(', ')}</strong>.`
      };
    }
 
    // 4. Valores
    if (userRows.length === 0) return { ok: true };
 
    const rowKey = row =>
      row.map(v => v === null ? 'NULL' : String(v).trim().toLowerCase()).join('');
 
    if (_ORDERED_EX.has(ex.id)) {
      // Comparação em ordem
      for (let i = 0; i < solRows.length; i++) {
        if (rowKey(userRows[i]) !== rowKey(solRows[i])) {
          return {
            ok: false,
            msg: `Os dados retornados estão incorretos ou fora da ordem esperada. Verifique o <code>ORDER BY</code>.`
          };
        }
      }
    } else {
      // Comparação como multiset
      const toMultiset = rows => {
        const m = {};
        rows.forEach(r => { const k = rowKey(r); m[k] = (m[k]||0)+1; });
        return m;
      };
      const uSet = toMultiset(userRows);
      const sSet = toMultiset(solRows);
      const allKeys = new Set([...Object.keys(uSet), ...Object.keys(sSet)]);
      for (const k of allKeys) {
        if ((uSet[k]||0) !== (sSet[k]||0)) {
          return {
            ok: false,
            msg: `Os dados retornados não correspondem ao resultado esperado. Verifique a tabela, as colunas e os filtros da sua query.`
          };
        }
      }
    }
 
    return { ok: true };
  }
 
    // ── Query ──────────────────────────────────────────────────
  function runQuery() {
    const sql = UI.getEditorVal(); if(!sql||!_db) return;
    const _sqlClean=sql.replace(/--[^\n]*/g,'').replace(/\/\*[\s\S]*?\*\//g,'').trim();
    const _secErr=_checkSQL(_sqlClean);
    if(_secErr){
      UI.showResults({rows:[],cols:[],elapsed:0,error:null,feedback:{type:'error',msg:_secErr}});
      return;
    }
    const t0=performance.now(); let cols=[],rows=[];
    try { const st=_db.prepare(sql); cols=st.getColumnNames(); while(st.step()) rows.push(st.get()); st.free(); }
    catch(err){ UI.showResults({error:err.message,rows:[],cols:[],elapsed:0,feedback:null}); return; }
    const elapsed=Math.round(performance.now()-t0);
 
    let feedback=null;
    const ex=ALL_EX.find(e=>e.id===_s.ex_atual);
    if(ex){
      const jaSolvido = _s.resolvidos.includes(ex.id);
 
      // Sempre valida — exercício resolvido ou não
      const validation = _validateResult(rows, cols, ex);
 
      if(validation.ok){
        if(jaSolvido){
          // Revisitando exercício já resolvido — mostra confirmação, sem pontos
          const idxInLevel = ex.level.exercicios.findIndex(e=>e.id===ex.id);
          const isLastInLevel = !ex.level.exercicios[idxInLevel+1];
          UI.showSolvedAgain(isLastInLevel);
          feedback={type:'success',msg:'Query correta.'};
          _retrying = false;
        } else {
          // Primeira vez acertando — registra e dá pontos
          const _hScore = _s.hints_score_ex||0;
          const pts = _hScore===0 ? PTS.correto+PTS.bonus_sem_dica : _hScore===1 ? PTS.correto : PTS.correto-5;
          const ptsGanho = Math.max(pts,5);
          _markSolved(ex, ptsGanho);
          feedback={type:'success',msg:`Query correta. Relatório aprovado pelo CEO Ricardo. <strong>+${ptsGanho} pts</strong>`};
        }
      } else {
        // Errou — esconde botão de avançar se estava visível
        const sa=document.getElementById('success-area'); if(sa) sa.hidden=true;
        if(!jaSolvido){
          _s.erros[ex.id] = (_s.erros[ex.id]||0) + 1;
        }
        feedback={type:'error',msg:validation.msg};
      }
 
      // Tracking de tentativas — só conta antes de resolver
      if (!jaSolvido) {
        _s.tentativas[ex.id] = (_s.tentativas[ex.id] || 0) + 1;
        _save();
      }
    }
    UI.showResults({rows,cols,elapsed,feedback,error:null});
  }
 
  function runFree(){
    const sql=UI.getEditorFreeVal(); if(!sql||!_db) return;
    const _fkw=sql.replace(/--[^\n]*/g,'').trim().match(/^\w+/)?.[0]?.toUpperCase(); if(_fkw!=='SELECT') return;
    const t0=performance.now(); let cols=[],rows=[];
    try{const st=_db.prepare(sql);cols=st.getColumnNames();while(st.step())rows.push(st.get());st.free();}
    catch(err){UI.showResultFree({error:err.message,rows:[],cols:[],elapsed:0});return;}
    UI.showResultFree({rows,cols,elapsed:Math.round(performance.now()-t0)});
  }
 
  // ── Mark solved ────────────────────────────────────────────
  function _markSolved(ex, ptsGanho) {
    if(_s.resolvidos.includes(ex.id)) return;
    _s.resolvidos.push(ex.id);
    _s.pts += ptsGanho;
    const _acc = (_s.tempo_acumulado&&_s.tempo_acumulado[ex.id])||0;
    const _cur = _s.tempo_inicio ? Math.round((Date.now()-_s.tempo_inicio)/1000) : 0;
    if(_acc+_cur > 0) _s.tempos[ex.id] = _acc + _cur;
    if(_s.tempo_acumulado) delete _s.tempo_acumulado[ex.id];
    _s.tempo_inicio = null; // clear so header timer stops for this exercise
    _save();
    _updateHeader();
    UI.renderSidebarDots(ALL_EX, _s.resolvidos, ex.id);
 
    const idxInLevel = ex.level.exercicios.findIndex(e=>e.id===ex.id);
    const nextInLevel = ex.level.exercicios[idxInLevel+1];
    const isLastInLevel = !nextInLevel;
    UI.showSolved(ex.titulo, ptsGanho, isLastInLevel);
 
    UI.showToast({ icon:'', label:'Missão concluída', title:`+${ptsGanho} pts`, desc:ex.missao });
  }
 
  // ── Hints ──────────────────────────────────────────────────
  function showHint() {
    const ex = ALL_EX.find(e=>e.id===_s.ex_atual); if(!ex) return;
    if(_s.hints_no_ex>=2) return;
 
    const jaSolvido = _s.resolvidos.includes(ex.id);
 
    if(_s.hints_no_ex===1 && jaSolvido){
      UI.showToast({icon:'',label:'Revisão',title:'Dica gratuita',desc:'Exercício já concluído'});
    }
    // Sem deducão antecipada — a pontuação menor já reflete o uso de dicas ao acertar
 
    _s.total_hints++;
    if(!_s.resolvidos.includes(ex.id)){
      _s.dicasUsadas[ex.id] = (_s.dicasUsadas[ex.id]||0)+1;
    }
    const isLast = _s.hints_no_ex === 1;
    const texto = isLast ? ex.dica2 : ex.dica1;
    UI.showHint(texto, _s.hints_no_ex);
    // Dica 2 = solução completa carregada no editor
    if(isLast){
      const ed = document.getElementById('sql-editor');
      if(ed){ ed.value = ex.solucao; UI._syncHL(); }
    }
    _s.hints_no_ex++;
    if(_s.hints_no_ex > (_s.hints_score_ex||0)) _s.hints_score_ex = _s.hints_no_ex;
    _s.hints_usados++;
    _save();
    UI.updateHintBtn(_s.hints_no_ex);
    _updateHeader();
  }
 
  // ── Helpers ────────────────────────────────────────────────
  function _solved(id) { return _s.resolvidos.includes(id); }
  function _updateHeader(){
    const ex=ALL_EX.find(e=>e.id===_s.ex_atual);
    const lv=ex?ex.level:LEVELS[0];
    UI.setHeader({pts:_s.pts, current:_s.resolvidos.length, total:TOTAL_EX, cargo:lv.cargo, icon:''});
  }
 
  function reset() {
    const modal = document.getElementById('reset-modal');
    if (modal) {
      modal.hidden = false;
    } else {
      _confirmReset();
    }
  }
 
  function _confirmReset() {
    try { localStorage.removeItem(KEY); } catch (_) {}
 
    _s = _def();
    _retrying = false;
 
    _stopGlobalTimer();
 
    const modal = document.getElementById('reset-modal');
    if (modal) modal.hidden = true;
 
    const timer = document.querySelector('.hd-session-timer-wrap');
    if (timer) timer.style.display = 'none';
 
    const editor = document.getElementById('sql-editor');
    if (editor) editor.value = '';
 
    const livre = document.getElementById('sql-livre');
    if (livre) livre.value = '';
 
    const success = document.getElementById('success-area');
    if (success) success.hidden = true;
 
    const hints = document.getElementById('hints-area');
    if (hints) hints.innerHTML = '';
 
    UI.clearResult();
    UI.setReviewMode(false);
 
    UI.renderCareer(
      LEVELS.map(l => ({ ...l })),
      1,
      []
    );
 
    UI.renderSidebarDots(
      ALL_EX,
      [],
      'e01'
    );
 
    _updateHeader();
 
    UI.renderWelcome();
 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
 
    function goToExercise(exId) { _retrying = false; _loadExercise(exId); }
 
  function goToLevel(levelId) {
    const lv = LEVELS.find(l=>l.id===levelId); if(!lv) return;
    // Set ex_atual to first exercise of that level for context
    _s.ex_atual = lv.exercicios[0].id;
    _save();
    UI.renderLevelIntro(lv);
    UI.renderCareer(LEVELS.map(l=>({...l})), _s.nivel_atual, _s.resolvidos);
  }
 
  function goToDashboard() {
    _stopGlobalTimer(); // timer stops on report
    const lbl=document.getElementById('hd-cargo-label');
    const ico=document.getElementById('hd-cargo-icon');
    if(lbl) lbl.textContent='';
    if(ico) ico.textContent='';
    const tw=document.querySelector('.hd-session-timer-wrap');
    if(tw) tw.style.display=''; // show timer on dashboard
    const data = {
      pts:       _s.pts,
      resolvidos: _s.resolvidos,
      total_ex:  TOTAL_EX,
      total_hints: _s.total_hints,
      erros:     _s.erros     || {},
      tentativas:_s.tentativas|| {},
      tempos:    _s.tempos    || {},
      tempo_total: _s.tempo_total || 0,
      dicasUsadas: _s.dicasUsadas || {},
      nivel_atual: _s.nivel_atual,
      levels:    LEVELS,
      all_ex:    ALL_EX,
    };
    // Update career sidebar so all completed levels show green
    UI.renderCareer(LEVELS.map(l=>({...l})), _s.nivel_atual, _s.resolvidos);
    // Clear cargo from header on dashboard
    const _lbl=document.getElementById('hd-cargo-label');
    const _ico=document.getElementById('hd-cargo-icon');
    if(_lbl) _lbl.textContent='Relatório de Aprendizagem';
    if(_ico) _ico.textContent='';
    UI.renderDashboard(data);
  }
 
  function goToReview() {
    const lbl=document.getElementById('hd-cargo-label');
    const ico=document.getElementById('hd-cargo-icon');
    const tw=document.querySelector('.hd-session-timer-wrap');
    if(lbl) lbl.textContent='Modo livre';
    if(ico) ico.textContent='';
    if(tw) tw.style.display='none'; // hide timer in Modo livre
    const _tw=document.querySelector('.hd-session-timer-wrap'); if(_tw) _tw.style.display='none';
    UI.goPanel('state-livre');
    setTimeout(()=>{ const e=document.getElementById('sql-livre'); if(e) e.focus(); }, 100);
  }
 
  function runLivre() {
    const sql = (document.getElementById('sql-livre')?.value||'').trim();
    if(!sql) return;
    const clean = sql.replace(/--[^\n]*/g,'').replace(/\/\*[\s\S]*?\*\//g,'').trim();
    const resultEl = document.getElementById('result-livre');
    const secErr = _checkSQL(clean);
    if(secErr){ if(resultEl) resultEl.innerHTML='<div class="result-error">'+secErr+'</div>'; return; }
    try {
      const st = _db.prepare(sql);
      const cols = st.getColumnNames();
      const rows = [];
      while(st.step()) rows.push(st.get());
      st.free();
      if(resultEl) {
        if(!rows.length){ resultEl.innerHTML='<div class="result-placeholder">Consulta executada. Nenhum resultado encontrado.</div>'; return; }
        let html='<div class="result-table-wrap"><table class="result-table"><thead><tr>'+cols.map(c=>'<th>'+c+'</th>').join('')+'</tr></thead><tbody>';
        rows.forEach(r=>{ html+='<tr>'+r.map(v=>'<td>'+(v===null?'<span class="null-val">NULL</span>':v)+'</td>').join('')+'</tr>'; });
        html+='</tbody></table></div><div class="result-meta">'+rows.length+' linha'+(rows.length!==1?'s':'')+'</div>';
        resultEl.innerHTML=html;
      }
    } catch(err){
      if(resultEl) resultEl.innerHTML='<div class="result-error">'+err.message+'</div>';
    }
  }
 
  function _checkSQL(clean) {
    const fkw = (clean.match(/^[A-Za-z]+/)||[''])[0].toUpperCase();
    // Must start with SELECT
    if(fkw !== 'SELECT') return 'Apenas consultas SELECT são permitidas.';
    // Blocked commands anywhere in the query
    const blockedCmds = ['INSERT','UPDATE','DELETE','DROP','CREATE','ALTER','ATTACH',
      'DETACH','PRAGMA','VACUUM','REINDEX','ANALYZE','SAVEPOINT','ROLLBACK',
      'COMMIT','BEGIN','REPLACE'];
    for(const cmd of blockedCmds){
      if(new RegExp('\\b'+cmd+'\\b','i').test(clean))
        return 'Comando não permitido: ' + cmd + '. Use apenas SELECT.';
    }
    // Allow trailing semicolon, block multiple statements
    const noTrail = clean.replace(/;\s*$/, '');
    if((noTrail.match(/;/g)||[]).length > 0)
      return 'Múltiplas instruções não são permitidas.';
    // No internal SQLite tables
    if(/sqlite_/i.test(clean))
      return 'Acesso a tabelas internas do SQLite não é permitido.';
    // No file system functions
    if(/\b(load_extension|readfile|writefile)\b/i.test(clean))
      return 'Funções de sistema não são permitidas.';
    // No dangerous functions
    if(/\b(fts[0-9]|rtree|zipfile)\b/i.test(clean))
      return 'Módulo não permitido nesta plataforma.';
    return null; // OK
  }
 
  return { init, reset, _confirmReset, _solved, goToExercise, goToLevel, goToDashboard, goToReview };
})();
 
document.addEventListener('DOMContentLoaded', ()=>App.init());