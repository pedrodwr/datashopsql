/**
 * ui.js — DataShop SQL
 */
const UI = (() => {
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
 
  // Loading
  function setLoadingMsg(msg) { const el=$('loading-msg'); if(el) el.textContent=msg; }
  function hideLoading() {
    const el=$('loading-overlay'); if(!el) return;
    el.classList.add('out'); setTimeout(()=>el.remove(),500);
  }
 
  // Panels
  const PANELS=['state-welcome','state-level-intro','state-exercise','state-level-complete','state-final','state-dashboard','state-livre'];
  function showPanel(id) { PANELS.forEach(p=>{ const el=$(p); if(el) el.hidden=(p!==id); }); }
 
  // Header
  function setHeader({pts,current,total,cargo,icon}) {
    const p=$('hd-pts'); if(p) p.textContent=`${pts} pts`;
    const f=$('hd-prog-fill'); if(f) f.style.width=`${Math.round((current/total)*100)}%`;
    const t=$('hd-prog-text'); if(t) t.textContent=`${current} / ${total}`;
    const c=$('hd-cargo-label'); if(c) c.textContent=cargo;
    const i=$('hd-cargo-icon'); if(i) i.textContent=icon;
  }
 
 
  // SQL Syntax Highlighting
  function _applyHL(code) {
    const ESC = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const MKW = ['ORDER BY','GROUP BY','LEFT JOIN','INNER JOIN','IS NOT NULL','IS NULL'];
    const SKW = ['SELECT','DISTINCT','FROM','WHERE','AND','OR','NOT','IN','IS','NULL',
      'HAVING','LIMIT','OFFSET','JOIN','ON','AS','ASC','DESC','COUNT','SUM','AVG',
      'MAX','MIN','ROUND','UPPER','LOWER','LIKE','BETWEEN'];
    const tokens = [];
    let i = 0;
    const U = code.toUpperCase();
    while(i < code.length) {
      if(code[i] === "'") {
        let j=i+1; while(j<code.length && code[j]!=="'") j++;
        tokens.push({t:'s',v:code.slice(i,j+1)}); i=j+1; continue;
      }
      if(code[i]==='-' && code[i+1]==='-') {
        let j=i; while(j<code.length && code.charCodeAt(j)!==10) j++;
        tokens.push({t:'c',v:code.slice(i,j)}); i=j; continue;
      }
      if(/[0-9]/.test(code[i]) && (i===0||!/\w/.test(code[i-1]))) {
        let j=i; while(j<code.length && /[0-9.]/.test(code[j])) j++;
        tokens.push({t:'n',v:code.slice(i,j)}); i=j; continue;
      }
      let found=false;
      for(const kw of MKW) {
        if(U.startsWith(kw,i)){
          const pre=i>0?code[i-1]:' ',post=i+kw.length<code.length?code[i+kw.length]:' ';
          if(!/\w/.test(pre)&&!/\w/.test(post)){tokens.push({t:'k',v:code.slice(i,i+kw.length)});i+=kw.length;found=true;break;}
        }
      }
      if(found) continue;
      if(/[A-Za-z_]/.test(code[i])) {
        for(const kw of SKW) {
          if(U.startsWith(kw,i)){
            const pre=i>0?code[i-1]:' ',post=i+kw.length<code.length?code[i+kw.length]:' ';
            if(!/\w/.test(pre)&&!/\w/.test(post)){tokens.push({t:'k',v:code.slice(i,i+kw.length)});i+=kw.length;found=true;break;}
          }
        }
      }
      if(found) continue;
      if(tokens.length&&tokens[tokens.length-1].t==='x') tokens[tokens.length-1].v+=code[i];
      else tokens.push({t:'x',v:code[i]});
      i++;
    }
    return tokens.map(tk=>{
      const v=ESC(tk.v);
      if(tk.t==='k') return '<span class="hl-kw">'+v+'</span>';
      if(tk.t==='s') return '<span class="hl-str">'+v+'</span>';
      if(tk.t==='n') return '<span class="hl-num">'+v+'</span>';
      if(tk.t==='c') return '<span class="hl-cmt">'+v+'</span>';
      return '<span class="hl-txt">'+v+'</span>';
    }).join('');
  }
 
  function _syncHighlight(editorId) {
    const ed=$(editorId), hl=$(editorId+'-hl');
    if(!ed||!hl) return;
    hl.innerHTML = _applyHL(ed.value)+'\x0a';
    requestAnimationFrame(()=>{
      hl.scrollTop  = ed.scrollTop;
      hl.scrollLeft = ed.scrollLeft;
    });
  }
 
  // Review mode
  let _reviewActive = false;
  function setReviewMode(on) {
    _reviewActive = on;
    const b=$('review-banner'); if(b) b.hidden=!on;
  }
 
  // Schema barra lateral
  function renderSchema(tables) {
    const el=$('schema-tree'); if(!el) return;
    el.innerHTML=tables.map(t=>`
      <div class="sch-table">
        <div class="sch-head">
          <span class="sch-dot" style="background:${t.cor}"></span>
          <span>${t.name}</span>
          <span class="sch-toggle">▶</span>
        </div>
        <div class="sch-fields" hidden>
          ${t.fields.map(f=>`<div class="sch-field">
            <span class="sch-fn">${f.name}</span>
            <span class="sch-ft">${f.type}</span>
            ${f.pk?'<span class="badge-pk">PK</span>':''}
            ${f.fk?'<span class="badge-fk">FK</span>':''}
          </div>`).join('')}
        </div>
      </div>`).join('');
    el.querySelectorAll('.sch-head').forEach(h=>{
      h.addEventListener('click',()=>{
        const f=h.nextElementSibling,t=h.querySelector('.sch-toggle');
        f.hidden=!f.hidden; t.textContent=f.hidden?'▶':'▼';
      });
    });
  }
 
  // Career (levels only)
  function renderCareer(levels, currentLevelId, solvedIds) {
    const el=$('career-track'); if(!el) return;
    const solved = solvedIds || [];
    el.innerHTML='<div class="career-levels">'+levels.map(lv=>{
      const total    = lv.exercicios.length;
      const solvedLv = lv.exercicios.filter(e=>solved.includes(e.id)).length;
      const allDone  = solvedLv === total;
      const active   = lv.id === currentLevelId && !allDone;
      const done     = allDone;
      const cls      = done?'done':active?'active':'locked';
      const pct      = total>0 ? Math.round((solvedLv/total)*100) : 0;
      const clickable = done || active;
      return `<div class="cl-item ${cls}${clickable?' cl-clickable':''}"
        ${clickable?`onclick="App.goToLevel(${lv.id})" title="Ver nível ${lv.id}"`:''}>
        <div class="cl-circle">${done?'':lv.id}</div>
        <div class="cl-label">Nível ${lv.id}</div>
        <div class="cl-bar"><div class="cl-bar-fill" style="width:${pct}%"></div></div>
      </div>`;
    }).join('')+'</div>';
  }
 
  // barra lateral exercise dots
  function renderSidebarDots(allEx,solvedIds,currentId) {
    const el=$('ex-dots-sidebar'); if(!el) return;
    el.innerHTML='<div class="ex-dots-sb">'+allEx.map((ex,i)=>{
      const done=solvedIds.includes(ex.id), active=ex.id===currentId;
      const cls=done?'done':active?'active':'locked';
      const click=done||active;
      return `<div class="sb-dot ${cls}${click?' clickable':''}"
        title="Ex.${i+1} · ${ex.titulo}${done?' (resolvido)':''}"
        ${click?`onclick="App.goToExercise('${ex.id}')"`:''}>
        ${done?'':i+1}
      </div>`;
    }).join('')+'</div>';
  }
 
  // Welcome
  function renderWelcome() {
    showPanel('state-welcome');
    window.scrollTo({top:0,behavior:'smooth'});
  }
 
  // Level intro
  function renderLevelIntro(lv) {
    const s=(id,v,html=false)=>{ const e=$(id); if(e){if(html)e.innerHTML=v;else e.textContent=v;} };
    s('li-num',`Nível ${lv.id}`);
    const iconEl=$('li-icon'); if(iconEl){iconEl.textContent=lv.icone||''; iconEl.style.display=lv.icone?'block':'none';}
    s('li-title',lv.titulo);
    s('li-ceo-msg',lv.mensagem_ceo,true);
    const concept=$('li-concept');
    if(concept&&lv.conceito) concept.innerHTML=`<div class="concept-h">${lv.conceito.titulo}</div><div class="concept-txt">${lv.conceito.texto}</div>`;
    const missions=$('li-missions');
    if(missions) missions.innerHTML='<div class="li-missions-title">Missões deste nível:</div>'+lv.exercicios.map(ex=>`<div class="li-mission-item"><span class="lmi-num">${ex.missao}</span><span class="lmi-text">${ex.narrativa}</span></div>`).join('');
    showPanel('state-level-intro');
    window.scrollTo({top:0,behavior:'smooth'});
  }
 
  // Exercise
  function renderExercise(ex,globalNum,totalEx,solved,hintsUsed) {
    const s=(id,v,html=false)=>{ const e=$(id); if(e){if(html)e.innerHTML=v;else e.textContent=v;} };
    s('ex-level-badge',`Nível ${ex.level.id}`);
    s('ex-counter',`${globalNum} / ${totalEx}`);
    s('ex-missao',ex.missao);
    s('ex-titulo',ex.titulo);
    s('ex-narrativa',ex.narrativa);
    s('ex-enunciado',ex.enunciado,true);
    s('ex-pts-badge',hintsUsed===0?'+15 pts':hintsUsed===1?'+10 pts':'+5 pts');
 
    const dotsEl=$('ex-progress-dots');
    if(dotsEl){
      const allEx=ALL_EX, idx=allEx.findIndex(e=>e.id===ex.id);
      dotsEl.innerHTML=allEx.map((e,i)=>{
        const done=App._solved(e.id), active=i===idx;
        const cls=done?'done':active?'active':'locked';
        return `<div class="ex-dot ${cls}${(done||active)?' ex-dot-click':''}" title="${e.titulo}" ${done?`onclick="App.goToExercise('${e.id}')"`:''}>
        </div>`;
      }).join('');
    }
 
    const hints=$('hints-area'); if(hints) hints.innerHTML='';
    const ed=$('sql-editor'); if(ed) ed.value=solved?ex.solucao:'';
    const sa=$('success-area'); if(sa) sa.hidden=!solved;
    if(solved) s('success-banner','Exercício já concluído. Você pode avançar.',true);
    _updateHintBtn(hintsUsed);
    clearResult();
    setTimeout(()=>_syncHighlight('sql-editor'), 80);
    showPanel('state-exercise');
    window.scrollTo({top:0,behavior:'smooth'});
  }
 
  function _updateHintBtn(used) {
    const btn=$('btn-hint'); if(!btn) return;
    const cost=$('hint-cost');
    if(used===0){
      btn.textContent='Dica 1'; btn.disabled=false;
      if(cost) cost.textContent='';
    } else if(used===1){
      btn.textContent='Ver solução'; btn.disabled=false;
      if(cost) cost.textContent='';
    } else {
      btn.textContent='Dicas esgotadas'; btn.disabled=true;
      if(cost) cost.textContent='';
    }
  }
 
  function showHint(text,step) {
    const area=$('hints-area'); if(!area) return;
    const div=document.createElement('div');
    div.className=`hint-bub h${step+1}`;
    div.innerHTML=text;
    area.appendChild(div);
  }
 
  function updateHintBtn(used) { _updateHintBtn(used); }
 
  function showSolved(acertoMsg,ptsGanho,isLastInLevel) {
    const banner=$('success-banner');
    if(banner) banner.innerHTML=`Query correta.${ptsGanho>0?` <strong>+${ptsGanho} pts</strong>`:''}`;
    const btn=$('btn-next-ex');
    if(btn) btn.textContent=isLastInLevel?'Encerrar Nível':'Próxima Missão';
    const sa=$('success-area'); if(sa) sa.hidden=false;
    const hb=$('btn-hint'); if(hb){hb.disabled=true;hb.textContent='Concluído';}
  }
 
  function showSolvedAgain(isLastInLevel) {
    const banner=$('success-banner');
    if(banner) banner.innerHTML='Exercício já resolvido. Você pode avançar.';
    const btn=$('btn-next-ex');
    if(btn) btn.textContent=isLastInLevel?'Encerrar Nível':'Próxima Missão';
    const sa=$('success-area'); if(sa) sa.hidden=false;
    const hb=$('btn-hint'); if(hb){hb.disabled=true;hb.textContent='Concluído';}
  }
 
  // Results
  function showResults({rows,cols,error,feedback,elapsed}) {
    const area=$('result-area'); if(!area) return;
    if(error){area.innerHTML=`<div class="result-error"><strong>Erro SQL:</strong><br>${esc(error)}</div>`;return;}
    let html=`<div class="result-meta"><span class="res-count">${rows.length} linha${rows.length!==1?'s':''}</span><span class="res-time">${elapsed}ms</span></div>`;
    if(feedback) html+=`<div class="${feedback.type==='success'?'feedback-ok':'feedback-err'}">${feedback.msg}</div>`;
    if(rows.length===0){html+=`<div class="result-placeholder">Nenhuma linha retornada.</div>`;area.innerHTML=html;return;}
    const thead=cols.map(c=>`<th>${esc(c)}</th>`).join('');
    const tbody=rows.slice(0,300).map(row=>'<tr>'+row.map(v=>`<td>${v===null?'<em class="nul">NULL</em>':esc(String(v))}</td>`).join('')+'</tr>').join('');
    html+=`<div class="result-table-wrap"><table class="res-table"><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>${rows.length>300?`<div style="padding:6px 14px;font-family:var(--mono);font-size:10px;color:var(--ink4)">Mostrando 300 de ${rows.length} linhas</div>`:''}</div>`;
    area.innerHTML=html;
  }
 
  function showResultFree({rows,cols,error,elapsed}) {
    const area=$('result-free'); if(!area) return;
    if(error){area.innerHTML=`<div class="result-error">${esc(error)}</div>`;return;}
    if(rows.length===0){area.innerHTML=`<div class="result-placeholder">Nenhuma linha.</div>`;return;}
    const thead=cols.map(c=>`<th>${esc(c)}</th>`).join('');
    const tbody=rows.slice(0,200).map(row=>'<tr>'+row.map(v=>`<td>${v===null?'<em class="nul">NULL</em>':esc(String(v))}</td>`).join('')+'</tr>').join('');
    area.innerHTML=`<div class="result-meta"><span class="res-count">${rows.length} linhas</span><span class="res-time">${elapsed}ms</span></div><div class="result-table-wrap"><table class="res-table"><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table></div>`;
  }
 
  function clearResult() {
    const area=$('result-area'); if(area) area.innerHTML='<div class="result-placeholder">Execute uma query para ver os resultados.</div>';
  }
 
  // Level complete
  function renderLevelComplete(nextLv, conclusaoMsg, isLast) {
    const s=(id,v,html=false)=>{ const e=$(id); if(e){if(html)e.innerHTML=v;else e.textContent=v;} };
    s('lc-cargo-icon', nextLv.icone);
    s('lc-cargo-title', nextLv.cargo);
    s('lc-conclusao', conclusaoMsg, true);
    const ptsEl=$('lc-pts'); if(ptsEl) ptsEl.hidden=true;
    const btn=$('btn-next-level'); if(btn) btn.textContent=isLast?'Ver Relatório Final':'Próximo Nível';
    showPanel('state-level-complete');
    window.scrollTo({top:0,behavior:'smooth'});
  }
 
  function renderFinal(lv,totalPts,totalSolved,hintCount) {
    const inner=$('final-inner'); if(inner) inner.innerHTML=lv.conclusao;
    showPanel('state-final');
    window.scrollTo({top:0,behavior:'smooth'});
  }
 
  // ── Dashboard ─────────────────────────────────────────────────────────────
  function renderDashboard(d) {
    const {pts,resolvidos,total_ex,total_hints,erros,tentativas,tempos,tempo_total,levels,all_ex}=d;
    const _tempos    = tempos || {};
    const totalErros = Object.values(erros).reduce((s,v)=>s+v,0);
    const totalSecs  = tempo_total || Object.values(_tempos).reduce((s,v)=>s+v,0);
    const totalTime  = totalSecs>=60?`${Math.floor(totalSecs/60)}min ${totalSecs%60}s`:`${totalSecs}s`;
    const _dicasUsadas = d.dicasUsadas || {};
    const semDica    = resolvidos.filter(id=>!(_dicasUsadas[id]>0)).length;
    const pct        = Math.round((resolvidos.length/total_ex)*100);
 
        // Summary — barra de progresso geral + 3 números simples
    const summary=$('dash-summary');
    if(summary) summary.innerHTML=`
      <div class="dash-progress-bar-wrap">
        <div class="dash-progress-label">
          <span class="dash-progress-title">Progresso geral</span>
          <span class="dash-progress-pct">${resolvidos.length} de ${total_ex} exercícios — ${pct}%</span>
        </div>
        <div class="dash-progress-track">
          <div class="dash-progress-fill" style="width:${pct}%"></div>
        </div>
      </div>
      <div class="dash-stats-row">
        <div class="dash-stat">
          <div class="ds-val">${pts}</div>
          <div class="ds-lbl">Pontos</div>
        </div>
        <div class="dash-stat">
          <div class="ds-val">${semDica}</div>
          <div class="ds-lbl">Resolvidos sem dica</div>
        </div>
        <div class="dash-stat">
          <div class="ds-val">${totalErros}</div>
          <div class="ds-lbl">Respostas incorretas</div>
        </div>
        ${totalSecs>0?`<div class="dash-stat">
          <div class="ds-val" style="font-size:18px;font-family:var(--mono)">${totalTime}</div>
          <div class="ds-lbl">Tempo total</div>
        </div>`:''}
      </div>`;
 
    // Competency summary banner
    const pctFinal = Math.round((resolvidos.length / total_ex) * 100);
    const compEl = $('dash-competencies');
    if (compEl) {
      const allConcepts = [
        { cmd:'SELECT',   mastered: resolvidos.some(id=>['e01','e02','e03','e04','e05'].includes(id)) },
        { cmd:'FROM',     mastered: resolvidos.some(id=>['e01','e02','e03','e04','e05'].includes(id)) },
        { cmd:'WHERE',    mastered: resolvidos.some(id=>['e09','e10','e11','e12','e13'].includes(id)) },
        { cmd:'ORDER BY', mastered: resolvidos.some(id=>['e14','e15'].includes(id)) },
        { cmd:'LIMIT',    mastered: resolvidos.some(id=>['e15','e16'].includes(id)) },
        { cmd:'JOIN',     mastered: resolvidos.some(id=>['e17','e18','e19','e20'].includes(id)) },
        { cmd:'GROUP BY', mastered: resolvidos.some(id=>['e21','e22','e23'].includes(id)) },
        { cmd:'AVG / SUM',mastered: resolvidos.some(id=>['e22','e23'].includes(id)) },
        { cmd:'LEFT JOIN',mastered: resolvidos.some(id=>['e24','e25'].includes(id)) },
        { cmd:'IS NULL',  mastered: resolvidos.includes('e24') },
      ];
      compEl.innerHTML = allConcepts.map(c =>
        `<span class="comp-tag ${c.mastered?'mastered':'pending'}">${c.cmd}</span>`
      ).join('');
    }
 
    // Progress by level
    const lvEl=$('dash-levels');
    if(lvEl) lvEl.innerHTML=levels.map(lv=>{
      const total=lv.exercicios.length;
      const solved=lv.exercicios.filter(e=>resolvidos.includes(e.id)).length;
      const lvErrs=lv.exercicios.reduce((s,e)=>s+(erros[e.id]||0),0);
      const pctLv=Math.round((solved/total)*100);
      const status=solved===total?'done':solved>0?'partial':'locked';
      return `<div class="dlv-row">
        <div class="dlv-meta">
          <span class="dlv-num">Nível ${lv.id}</span>
          <span class="dlv-name">${lv.titulo.replace(/Nível \d+ — /,'')}</span>
        </div>
        <div class="dlv-bar-wrap">
          <div class="dlv-bar"><div class="dlv-fill ${status}" style="width:${pctLv}%"></div></div>
        </div>
        <div class="dlv-right">
          <span class="dlv-count ${status}">${solved}/${total}</span>
          ${lvErrs>0?`<span class="dlv-errs">${lvErrs} erro${lvErrs>1?'s':''}</span>`:''}        </div>
      </div>`;
    }).join('');
 
    // Concept mastery
    const concepts=[
      {label:'SELECT e FROM',    ids:['e01','e02','e03','e04','e05','e06','e07','e08'],desc:'Consultas básicas e seleção de colunas'},
      {label:'WHERE',            ids:['e09','e10','e11','e12','e13'],                  desc:'Filtragem de dados com condições'},
      {label:'ORDER BY e LIMIT', ids:['e14','e15','e16'],                              desc:'Ordenação e limitação de resultados'},
      {label:'JOIN',             ids:['e17','e18','e19','e20'],                        desc:'Relacionamento entre tabelas'},
      {label:'GROUP BY',         ids:['e21','e22','e23'],                              desc:'Agrupamento e funções de agregação'},
      {label:'LEFT JOIN',        ids:['e24','e25'],                                    desc:'Identificação de registros ausentes'},
    ];
 
    const concEl=$('dash-concepts');
    if(concEl) concEl.innerHTML=concepts.map(c=>{
      const total=c.ids.length;
      const solved=c.ids.filter(id=>resolvidos.includes(id)).length;
      const errsC=c.ids.reduce((s,id)=>s+(erros[id]||0),0);
      const pctC=Math.round((solved/total)*100);
      const mastery=errsC===0&&solved===total?'Dominado'
        :errsC<=1&&solved===total?'Concluído'
        :solved===total?'Concluído com dificuldade'
        :solved>0?'Em progresso':'Não iniciado';
      const mClass=mastery==='Dominado'?'excelente'
        :mastery==='Concluído'?'bom'
        :mastery==='Concluído com dificuldade'?'regular'
        :mastery==='Em progresso'?'parcial':'bloqueado';
      const rec=errsC>2?'Recomenda-se revisar os exercícios deste conceito.'
        :errsC>0?'Pratique mais consultas com este conceito.'
        :solved<total?'Complete os exercícios restantes.'
        :'';
      return `<div class="dc-item">
        <div class="dc-header">
          <div class="dc-left">
            <span class="dc-concept">${c.label}</span>
            <span class="dc-desc">${c.desc}</span>
          </div>
          <span class="dc-mastery ${mClass}">${mastery}</span>
        </div>
        <div class="dc-bar"><div class="dc-fill ${mClass}" style="width:${pctC}%"></div></div>
        <div class="dc-footer">
          <span class="dc-stat">${solved}/${total} exercícios</span>
          ${errsC>0?`<span class="dc-stat err">${errsC} erro${errsC>1?'s':''}</span>`:''}
          ${rec?`<span class="dc-rec">${rec}</span>`:''}
        </div>
      </div>`;
    }).join('');
 
    // Hardest exercises
    const hardEl=$('dash-hardest');
    if(hardEl){
      const scored=all_ex
        .filter(ex=>(erros[ex.id]||0)>0||(tentativas[ex.id]||0)>1)
        .map(ex=>({ex,e:erros[ex.id]||0,t:tentativas[ex.id]||0}))
        .sort((a,b)=>(b.e*2+b.t)-(a.e*2+a.t))
        .slice(0,26); // mostra todos com dificuldade
      if(!scored.length){
        hardEl.innerHTML='<p class="dash-empty">Nenhuma dificuldade significativa registrada.</p>';
      } else {
        hardEl.innerHTML=scored.map(({ex,e,t})=>`
          <div class="dh-row">
            <div class="dh-info">
              <span class="dh-level">Nível ${ex.level.id} · ${ex.missao}</span>
              <span class="dh-title">${ex.titulo}</span>
            </div>
            <div class="dh-stats">
              ${e>0?`<span class="dh-tag err">${e} erro${e>1?'s':''}</span>`:''}
              ${t>0?`<span class="dh-tag neutral">${t} tentativa${t>1?'s':''}</span>`:''}
            </div>
          </div>`).join('');
      }
    }
 
    showPanel('state-dashboard');
    window.scrollTo({top:0,behavior:'smooth'});
  }
 
  // barra lateral tabs
  function toggleSbHelp() {
    const content = document.getElementById('sb-help-content');
    const arrow   = document.getElementById('sb-help-arrow');
    if(!content) return;
    content.hidden = !content.hidden;
    if(arrow) arrow.textContent = content.hidden ? '▶' : '▼';
  }
 
  function switchSbTab(tab) {
    $('sb-schema-panel').hidden=tab!=='schema';
    $('sb-diagram-panel').hidden=tab!=='diagram';
    document.querySelectorAll('.sb-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
    if(tab==='diagram'){
      const prev=$('schema-diagram-preview');
      if(prev&&!prev._drawn){
        prev.innerHTML='<div style="text-align:center"><div style="font-size:22px;margin-bottom:6px">&#9783;</div><div><strong>7 tabelas</strong> conectadas</div><div style="margin-top:4px;color:var(--ink3)">Clique em Abrir para ver o diagrama completo</div></div>';
        prev._drawn=true;
      }
    }
  }
 
  // Help modal
  function openHelp() {
    const m = document.getElementById('help-modal');
    if (m) {
      m.hidden = false;
      m.onclick = e => { if (e.target === m) closeHelp(); };
    }
  }
 
  function closeHelp() {
    const m = document.getElementById('help-modal');
    if (m) m.hidden = true;
  }
 
  function openGraphModal() {
    const modal=$('graph-modal');
    if(modal){
      modal.hidden=false;
      renderDiagram();
      modal.onclick=e=>{if(e.target===modal)closeGraphModal();};
    }
  }
 
  function closeGraphModal() {
    const modal=$('graph-modal'); if(modal) modal.hidden=true;
    const c=$('schema-diagram-container'); if(c) c.innerHTML='';
  }
 
  // ERD diagram (draggable nodes + crow's foot cardinalidades)
  function renderDiagram() {
    const container=$('schema-diagram-container'); if(!container) return;
 
    const _POS={
      clientes:{x:20,y:20},  pedidos:{x:20,y:200},   itens_pedido:{x:220,y:310},
      pagamentos:{x:220,y:110},produtos:{x:450,y:200},  categorias:{x:450,y:30},
      avaliacoes:{x:450,y:370}
    };
    const NODES = SCHEMA.tables.map(t=>({
      id:    t.name,
      label: t.name,
      color: t.cor,
      x:     (_POS[t.name]||{x:20,y:20}).x,
      y:     (_POS[t.name]||{x:20,y:20}).y,
      fields: t.fields,
    }));
 
    // cardinalidade: fromCard = lado "1", toCard = lado "N"
    // tipos suportados: 'one' | 'many' | 'one-only'
    const EDGES=[
      {from:'clientes',  to:'pedidos',      fromPort:'bottom',toPort:'top',    fromCard:'one', toCard:'many', label:'1:N'},
      {from:'pedidos',   to:'itens_pedido', fromPort:'right', toPort:'top',    fromCard:'one', toCard:'many', label:'1:N'},
      {from:'pedidos',   to:'pagamentos',   fromPort:'right', toPort:'left',   fromCard:'one', toCard:'many', label:'1:N'},
      {from:'produtos',  to:'itens_pedido', fromPort:'bottom',toPort:'right',  fromCard:'one', toCard:'many', label:'1:N'},
      {from:'categorias',to:'produtos',     fromPort:'bottom',toPort:'top',    fromCard:'one', toCard:'many', label:'1:N'},
      {from:'clientes',  to:'avaliacoes',   fromPort:'bottom',toPort:'top',    fromCard:'one', toCard:'many', label:'1:N'},
      {from:'produtos',  to:'avaliacoes',   fromPort:'bottom',toPort:'right',  fromCard:'one', toCard:'many', label:'1:N'},
      {from:'pedidos',   to:'avaliacoes',   fromPort:'left',  toPort:'left',   fromCard:'one', toCard:'many', label:'1:N'},
    ];
 
    const NW=170,HH=28,RH=17,PAD=6;
    const nh=n=>HH+n.fields.length*RH+PAD;
    const pp=(node,port)=>{const h=nh(node);const cx=node.x+NW/2;const cy=node.y+h/2;return port==='top'?{x:cx,y:node.y}:port==='bottom'?{x:cx,y:node.y+h}:port==='left'?{x:node.x,y:cy}:{x:node.x+NW,y:cy};};
    const ep=(p1,p2)=>{const dx=Math.abs(p2.x-p1.x),dy=Math.abs(p2.y-p1.y);const cx1=p1.x+(p1.port==='right'?dx*.5:p1.port==='left'?-dx*.5:0),cy1=p1.y+(p1.port==='bottom'?dy*.5:p1.port==='top'?-dy*.5:0);const cx2=p2.x+(p2.port==='left'?-dx*.5:p2.port==='right'?dx*.5:0),cy2=p2.y+(p2.port==='top'?-dy*.5:p2.port==='bottom'?dy*.5:0);return`M ${p1.x} ${p1.y} C ${cx1} ${cy1} ${cx2} ${cy2} ${p2.x} ${p2.y}`;};
 
    // Crow's foot: desenha símbolo de cardinalidade no ponto p, direção port, tipo card
    // Retorna string SVG de paths/lines
    function crowsFoot(p, port, card, color) {
      const S=10; // tamanho do símbolo
      const G=4;  // gap da aresta do nó
      const elems=[];
      // vetor unitário apontando para fora do nó (para onde a linha cresce)
      const dx=port==='left'?-1:port==='right'?1:0;
      const dy=port==='top'?-1:port==='bottom'?1:0;
      // ponto base afastado do nó
      const bx=p.x+dx*G, by=p.y+dy*G;
      // ponto externo (fim do símbolo)
      const ex=bx+dx*S, ey=by+dy*S;
      // perpendicular
      const px2=dy, py2=-dx; // rotação 90°
 
      if(card==='one'||card==='one-only') {
        // Traço perpendicular (1) — próximo ao nó
        const h=S*.55;
        elems.push(`<line x1="${bx+px2*h}" y1="${by+py2*h}" x2="${bx-px2*h}" y2="${by-py2*h}" stroke="${color}" stroke-width="1.8"/>`);
        if(card==='one-only') {
          // segundo traço ainda mais próximo
          const b2x=bx+dx*4, b2y=by+dy*4;
          elems.push(`<line x1="${b2x+px2*h}" y1="${b2y+py2*h}" x2="${b2x-px2*h}" y2="${b2y-py2*h}" stroke="${color}" stroke-width="1.8"/>`);
        }
      }
      if(card==='many') {
        // Crow's foot: 3 linhas divergentes a partir do ponto externo
        const h=S*.55;
        const tip=S*.85;
        // linha central
        elems.push(`<line x1="${ex}" y1="${ey}" x2="${bx}" y2="${by}" stroke="${color}" stroke-width="1.8"/>`);
        // ramos diagonais
        elems.push(`<line x1="${ex}" y1="${ey}" x2="${bx+px2*h}" y2="${by+py2*h}" stroke="${color}" stroke-width="1.8"/>`);
        elems.push(`<line x1="${ex}" y1="${ey}" x2="${bx-px2*h}" y2="${by-py2*h}" stroke="${color}" stroke-width="1.8"/>`);
        // traço perpendicular de obrigatoriedade
        elems.push(`<line x1="${ex+px2*h}" y1="${ey+py2*h}" x2="${ex-px2*h}" y2="${ey-py2*h}" stroke="${color}" stroke-width="1.8"/>`);
      }
      return elems.join('');
    }
 
    let maxX=0,maxY=0;NODES.forEach(n=>{maxX=Math.max(maxX,n.x+NW+30);maxY=Math.max(maxY,n.y+nh(n)+30);});
    container.innerHTML='';
    container.style.cssText=`position:relative;overflow:hidden;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;height:${maxY}px;width:100%`;
 
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.id='graph-edges-svg';
    svg.style.cssText=`position:absolute;top:0;left:0;width:${maxX}px;height:${maxY}px;pointer-events:none;overflow:visible`;
    svg.setAttribute('viewBox',`0 0 ${maxX} ${maxY}`);
    // sem markers de seta — cardinalidade é crow's foot
    svg.innerHTML='<defs></defs>';
    container.appendChild(svg);
 
    const CF_DEFAULT='#94a3b8';
    const CF_HOVER='#3b82f6';
 
    // Offset da linha para não sobrepor os símbolos crow's foot
    const LINE_OFFSET=14;
    function linePoints(p1,p2){
      const dx1=p1.port==='left'?-1:p1.port==='right'?1:0, dy1=p1.port==='top'?-1:p1.port==='bottom'?1:0;
      const dx2=p2.port==='left'?-1:p2.port==='right'?1:0, dy2=p2.port==='top'?-1:p2.port==='bottom'?1:0;
      return {
        lp1:{x:p1.x+dx1*LINE_OFFSET, y:p1.y+dy1*LINE_OFFSET, port:p1.port},
        lp2:{x:p2.x+dx2*LINE_OFFSET, y:p2.y+dy2*LINE_OFFSET, port:p2.port},
      };
    }
 
    EDGES.forEach(edge=>{
      const fn=NODES.find(n=>n.id===edge.from),tn=NODES.find(n=>n.id===edge.to);if(!fn||!tn)return;
      const p1={...pp(fn,edge.fromPort),port:edge.fromPort};
      const p2={...pp(tn,edge.toPort),port:edge.toPort};
      const {lp1,lp2}=linePoints(p1,p2);
 
      const g=document.createElementNS('http://www.w3.org/2000/svg','g');
      g.setAttribute('data-edge',`${edge.from}-${edge.to}`);
 
      // hit area
      const hit=document.createElementNS('http://www.w3.org/2000/svg','path');
      hit.setAttribute('d',ep(lp1,lp2));hit.setAttribute('stroke','transparent');
      hit.setAttribute('stroke-width','14');hit.setAttribute('fill','none');hit.style.pointerEvents='stroke';
 
      // linha principal
      const path=document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d',ep(lp1,lp2));path.setAttribute('stroke',CF_DEFAULT);
      path.setAttribute('stroke-width','1.5');path.setAttribute('fill','none');
 
      // crow's foot symbols — grupo SVG puro
      const cfGroup=document.createElementNS('http://www.w3.org/2000/svg','g');
      cfGroup.setAttribute('data-cf','');
      cfGroup.setAttribute('pointer-events','none');
      const updateCF=(color)=>{
        cfGroup.innerHTML=
          crowsFoot(p1,edge.fromPort,edge.fromCard,color)+
          crowsFoot(p2,edge.toPort,  edge.toCard,  color);
      };
      updateCF(CF_DEFAULT);
 
      // label de cardinalidade (1:N) no meio da curva
      const mx=(lp1.x+lp2.x)/2, my=(lp1.y+lp2.y)/2;
      const lblEl=document.createElementNS('http://www.w3.org/2000/svg','text');
      lblEl.setAttribute('x',String(mx));lblEl.setAttribute('y',String(my-5));
      lblEl.setAttribute('text-anchor','middle');lblEl.setAttribute('dominant-baseline','auto');
      lblEl.setAttribute('font-family','JetBrains Mono, monospace');
      lblEl.setAttribute('font-size','9');lblEl.setAttribute('fill',CF_DEFAULT);
      lblEl.setAttribute('pointer-events','none');
      lblEl.textContent=edge.label||'';
 
      hit.addEventListener('mouseenter',()=>{
        path.setAttribute('stroke',CF_HOVER);path.setAttribute('stroke-width','2');
        updateCF(CF_HOVER);
        lblEl.setAttribute('fill',CF_HOVER);
      });
      hit.addEventListener('mouseleave',()=>{
        path.setAttribute('stroke',CF_DEFAULT);path.setAttribute('stroke-width','1.5');
        updateCF(CF_DEFAULT);
        lblEl.setAttribute('fill',CF_DEFAULT);
      });
 
      g.appendChild(cfGroup);g.appendChild(hit);g.appendChild(path);g.appendChild(lblEl);
      svg.appendChild(g);
    });
 
    // função para re-renderizar arestas ao arrastar nós
    function redrawEdges(){
      EDGES.forEach(edge=>{
        const fn=NODES.find(n=>n.id===edge.from),tn=NODES.find(n=>n.id===edge.to);if(!fn||!tn)return;
        const p1={...pp(fn,edge.fromPort),port:edge.fromPort};
        const p2={...pp(tn,edge.toPort),port:edge.toPort};
        const {lp1,lp2}=linePoints(p1,p2);
        const g=svg.querySelector(`[data-edge="${edge.from}-${edge.to}"]`);if(!g)return;
        g.querySelectorAll('path[fill="none"]').forEach(p=>p.setAttribute('d',ep(lp1,lp2)));
        // hit
        g.querySelectorAll('path').forEach(p=>{ if(p.getAttribute('stroke')==='transparent') p.setAttribute('d',ep(lp1,lp2)); });
        // label
        const lbl=g.querySelector('text');
        if(lbl){ const mx=(lp1.x+lp2.x)/2,my=(lp1.y+lp2.y)/2; lbl.setAttribute('x',String(mx));lbl.setAttribute('y',String(my-5)); }
        // crow's foot
        const cf=g.querySelector('[data-cf]');
        if(cf){ cf.innerHTML=crowsFoot(p1,edge.fromPort,edge.fromCard,CF_DEFAULT)+crowsFoot(p2,edge.toPort,edge.toCard,CF_DEFAULT); }
      });
    }
 
    NODES.forEach(node=>{
      const h=nh(node);const el=document.createElement('div');el.className='graph-node';
      el.style.cssText=`position:absolute;left:${node.x}px;top:${node.y}px;width:${NW}px;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.10);border:1.5px solid ${node.color}22;cursor:grab;user-select:none;background:#fff;transition:box-shadow .15s,border-color .15s`;
      const hd=document.createElement('div');hd.style.cssText=`background:${node.color};padding:7px 10px;display:flex;align-items:center;gap:6px`;
      hd.innerHTML=`<span style="width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.5);display:inline-block"></span><span style="font-family:JetBrains Mono,monospace;font-size:11px;font-weight:600;color:#fff">${node.label}</span>`;
      const body=document.createElement('div');body.style.cssText='padding:4px 0';
      node.fields.forEach((f,i)=>{
        const fname = typeof f === 'string' ? f : f.name;
        const isPk  = typeof f === 'object' ? !!f.pk : fname==='id';
        const isFk  = typeof f === 'object' ? !!f.fk : (fname.startsWith('id_'));
        const color = isPk ? '#d97706' : isFk ? '#7c3aed' : '#64748b';
        const row=document.createElement('div');
        row.style.cssText=`display:flex;align-items:center;gap:4px;padding:2px 10px;font-family:JetBrains Mono,monospace;font-size:10px;${i>0?'border-top:1px solid #f1f5f9':''}`;
        const badges=(isPk?'<span style="font-size:8px;background:#fffbeb;color:#d97706;border:1px solid #fde68a;border-radius:2px;padding:0 3px">PK</span>':'')+(isFk?'<span style="font-size:8px;background:#f5f3ff;color:#7c3aed;border:1px solid #c4b5fd;border-radius:2px;padding:0 3px">FK</span>':'');
        row.innerHTML=`<span style="color:${color};flex:1">${fname}</span><span style="display:flex;gap:2px">${badges}</span>`;
        body.appendChild(row);
      });
      el.appendChild(hd);el.appendChild(body);container.appendChild(el);
      let drag=false,ox=0,oy=0;
      hd.addEventListener('mousedown',e=>{drag=true;const r=el.getBoundingClientRect();ox=e.clientX-r.left;oy=e.clientY-r.top;el.style.cursor='grabbing';el.style.zIndex='10';e.preventDefault();});
      document.addEventListener('mousemove',e=>{
        if(!drag)return;
        const cr=container.getBoundingClientRect();
        let nx=Math.max(0,Math.min(e.clientX-cr.left-ox,maxX-NW));
        let ny=Math.max(0,Math.min(e.clientY-cr.top-oy,maxY-h));
        el.style.left=nx+'px';el.style.top=ny+'px';node.x=nx;node.y=ny;
        redrawEdges();
      });
      document.addEventListener('mouseup',()=>{if(!drag)return;drag=false;el.style.cursor='grab';el.style.zIndex='';});
      el.addEventListener('mouseenter',()=>{el.style.borderColor=node.color;el.style.boxShadow=`0 4px 16px ${node.color}33`;});
      el.addEventListener('mouseleave',()=>{el.style.borderColor=`${node.color}22`;el.style.boxShadow='0 2px 8px rgba(0,0,0,.10)';});
    });
 
    // Legenda atualizada com cardinalidades
    const legend=document.createElement('div');
    legend.style.cssText='position:absolute;bottom:8px;right:8px;background:rgba(255,255,255,.95);border:1px solid #e2e8f0;border-radius:6px;padding:8px 12px;font-size:10px;font-family:JetBrains Mono,monospace;display:flex;flex-direction:column;gap:4px;pointer-events:none;box-shadow:0 2px 8px rgba(0,0,0,.06)';
    legend.innerHTML=`
      <div style="font-weight:600;color:#475569;margin-bottom:2px;font-size:9px;letter-spacing:.05em;text-transform:uppercase">Legenda</div>
      <span style="color:#d97706">PK — Chave primária</span>
      <span style="color:#7c3aed">FK — Chave estrangeira</span>
      <div style="border-top:1px solid #f1f5f9;margin:2px 0"></div>
      <div style="display:flex;align-items:center;gap:6px">
        <svg width="32" height="14" style="overflow:visible">
          <line x1="0" y1="7" x2="14" y2="7" stroke="#94a3b8" stroke-width="1.5"/>
          <line x1="2" y1="2" x2="2" y2="12" stroke="#94a3b8" stroke-width="1.8"/>
          <line x1="6" y1="2" x2="6" y2="12" stroke="#94a3b8" stroke-width="1.8"/>
        </svg>
        <span style="color:#64748b">Lado 1 (um)</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <svg width="32" height="14" style="overflow:visible">
          <line x1="18" y1="7" x2="32" y2="7" stroke="#94a3b8" stroke-width="1.5"/>
          <line x1="18" y1="7" x2="30" y2="2" stroke="#94a3b8" stroke-width="1.8"/>
          <line x1="18" y1="7" x2="30" y2="12" stroke="#94a3b8" stroke-width="1.8"/>
          <line x1="30" y1="2" x2="30" y2="12" stroke="#94a3b8" stroke-width="1.8"/>
        </svg>
        <span style="color:#64748b">Lado N (muitos)</span>
      </div>
      <div style="border-top:1px solid #f1f5f9;margin:2px 0"></div>
      <span style="color:#94a3b8;font-size:9px">Arraste os nós para reorganizar</span>`;
    container.appendChild(legend);
  }
 
  // Toast
  let _tq=[],_tb=false;
  function showToast({icon,label,title,desc}) { _tq.push({icon,label,title,desc}); if(!_tb)_nt(); }
  function _nt() {
    if(!_tq.length){_tb=false;return;} _tb=true;
    const d=_tq.shift(),t=$('toast'); if(!t) return;
    t.innerHTML=`<div class="toast-icon">${d.icon&&d.icon+' '||''}</div><div><div class="toast-label">${d.label}</div><div class="toast-title">${d.title}</div><div class="toast-desc">${d.desc}</div></div>`;
    requestAnimationFrame(()=>{t.classList.add('show');setTimeout(()=>{t.classList.remove('show');setTimeout(_nt,400);},3000);});
  }
 
  function getEditorVal()     { return ($('sql-editor')?.value||'').trim(); }
  function getEditorFreeVal() { return ($('sql-free')?.value||'').trim(); }
  function clearEditor()      { const e=$('sql-editor'); if(e){e.value='';e.focus();} }
 
  // Inicializa listeners de UI que antes eram inline no HTML
  function initUIListeners() {
    // Sidebar tabs
    $('tab-schema')?.addEventListener('click', () => switchSbTab('schema'));
    $('tab-diagram')?.addEventListener('click', () => switchSbTab('diagram'));
    // Expand graph button
    $('btn-expand-graph')?.addEventListener('click', openGraphModal);
    // Close buttons
    $('btn-close-graph')?.addEventListener('click', closeGraphModal);
    $('btn-close-help')?.addEventListener('click', closeHelp);
    // Help button in sidebar
    $('btn-sb-help')?.addEventListener('click', openHelp);
  }
 
  return {
    setLoadingMsg, hideLoading,
    setHeader, renderSchema, renderCareer, renderSidebarDots,
    renderWelcome, renderLevelIntro, renderExercise,
    showHint, updateHintBtn, showSolved, showSolvedAgain,
    showResults, showResultFree, clearResult,
    renderLevelComplete, renderFinal, renderDashboard,
    showToast,
    toggleSbHelp, setReviewMode, goPanel: showPanel, switchSbTab,
    _syncHL: ()=>_syncHighlight('sql-editor'), _applyHL,
    renderDiagram, openGraphModal, closeGraphModal, openHelp, closeHelp,
    getEditorVal, getEditorFreeVal, clearEditor,
    initUIListeners,
  };
})();