(function () {
  'use strict';
  const core=window.SashaGameCore;
  const dialog=document.getElementById('sasha-game-dialog');
  const el=id=>document.getElementById('sasha-game-'+id);
  const stageGround=()=>window.SashaGameStages.groundY(window.SashaGameStages.getStage(window.sashaGameOptions.stage),width,height);
  const renderer=window.SashaGameRenderer.create(el('canvas'));
  const panel=el('panel'), title=el('panel-title-text'), copy=el('panel-copy');
  const bestKey='sasha-dynasty-best-score';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let state=null, frame=0, previousTime=null, observer=null, session=null, invoker=null;
  let width=960, height=540, countdown=0, pausedPhase='playing', best=readBest(), visualTime=0;
  let sound=true, audioContext=null, music=null, victoryAudio=null, nextBeat=0, melodyStep=0;
  let victoryRequest=0, shownScore=0, scoreFrom=0, scoreTarget=0, scoreElapsed=0, scorePop=null;
  let savedScroll=0, savedOverflow='', savedPosition='', savedTop='', savedWidth='';
  const held=new Set();
  let targetX=null;

  function readBest() {
    try { const value=Number(localStorage.getItem(bestKey)); return Number.isFinite(value)&&value>0?value:0; } catch { return 0; }
  }
  function saveBest() {
    best=Math.max(best,state.score);
    try { localStorage.setItem(bestKey,String(best)); } catch { /* Storage may be disabled. */ }
  }
  function tone(frequency,duration=.09,volume=.035) {
    if(!sound||!audioContext||audioContext.state!=='running')return;
    const oscillator=audioContext.createOscillator(), gain=audioContext.createGain();
    oscillator.type='triangle';oscillator.frequency.value=frequency;
    gain.gain.setValueAtTime(volume,audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+duration);
    oscillator.connect(gain);gain.connect(audioContext.destination);
    oscillator.start();oscillator.stop(audioContext.currentTime+duration);
    oscillator.onended=()=>{oscillator.disconnect();gain.disconnect()};
  }
  function prepareAudio(restart=false) {
    if(!sound)return;
    try {
      if(!audioContext)audioContext=new (window.AudioContext||window.webkitAudioContext)();
      audioContext.resume().catch(()=>{});
    } catch { audioContext=null; }
    const source=window.sashaGameOptions?.audioSrc;
    if(source&&!music){
      const track=new Audio(source);music=track;
      track.preload='auto';track.volume=.55;track.loop=true;
      track.addEventListener('error',()=>{if(music===track)music=null},{once:true,signal:session.signal});
    }
    if(!victoryAudio&&window.sashaGameOptions?.victoryAudioSrc){
      victoryAudio=new Audio(window.sashaGameOptions.victoryAudioSrc);
      victoryAudio.preload='auto';victoryAudio.volume=.85;
      victoryAudio.load();
    }
    if(music){if(restart)music.currentTime=0;music.play().catch(()=>{})}
  }
  function playVictory(restart=true) {
    if(!sound||!window.sashaGameOptions?.victoryAudioSrc)return;
    let needsSeek=restart;
    if(!victoryAudio){
      victoryAudio=new Audio(window.sashaGameOptions.victoryAudioSrc);
      victoryAudio.preload='auto';victoryAudio.volume=.85;
      needsSeek=true;
    }
    const track=victoryAudio, request=++victoryRequest;
    const play=()=>{
      if(request!==victoryRequest||!session||!sound||state?.phase!=='victory'||track!==victoryAudio)return;
      if(needsSeek){
        const start=Math.max(0,Number(window.sashaGameOptions.victoryStartTime)||0);
        track.currentTime=Number.isFinite(track.duration)?Math.min(start,Math.max(0,track.duration-.1)):start;
      }
      if(needsSeek||!track.ended)track.play().catch(()=>{});
    };
    if(track.readyState>=1)play();
    else track.addEventListener('loadedmetadata',play,{once:true,signal:session.signal});
  }
  function silence() {
    victoryRequest++;
    if(music)music.pause();
    if(victoryAudio)victoryAudio.pause();
    if(audioContext?.state==='running')audioContext.suspend().catch(()=>{});
  }
  function setScore(target) {
    if(target===scoreTarget)return;
    scoreFrom=shownScore;scoreTarget=target;scoreElapsed=0;
    if(reduced.matches){shownScore=target;el('score').textContent=target.toLocaleString('ru-RU');return}
    scorePop?.cancel();
    scorePop=el('score').animate([
      {transform:'scale(1)',color:'#d2ed86'},
      {transform:'scale(1.24)',color:'#fffbd5',offset:.35},
      {transform:'scale(1)',color:'#d2ed86'}
    ],{duration:360,easing:'cubic-bezier(.16,1,.3,1)'});
  }
  function animateScore(dt) {
    if(shownScore===scoreTarget)return;
    scoreElapsed=Math.min(.38,scoreElapsed+dt);
    const t=1-Math.pow(1-scoreElapsed/.38,3);
    shownScore=Math.round(scoreFrom+(scoreTarget-scoreFrom)*t);
    el('score').textContent=shownScore.toLocaleString('ru-RU');
  }
  function updateHud() {
    setScore(state.score);
    el('combo').textContent=state.combo+(state.combo>=10?' ×2':'');
    el('record').textContent=best.toLocaleString('ru-RU');
    el('speed').textContent='СКОРОСТЬ ×'+(state.speed/core.BASE_SPEED).toFixed(2);
    el('progress-label').textContent=state.index+' / '+state.totalCoins+' МОНЕТ';
    el('progress-fill').style.width=(state.index/state.totalCoins*100)+'%';
    el('progress').setAttribute('aria-valuenow',state.index);
    el('progress').setAttribute('aria-valuemax',state.totalCoins);
    el('hearts').setAttribute('aria-label','Жизни: '+state.lives+' из 3');
    el('hearts').querySelectorAll('svg').forEach((heart,i)=>heart.classList.toggle('is-empty',i>=state.lives));
    el('pause').disabled=!['playing','countdown','paused'].includes(state.phase);
    el('pause').setAttribute('aria-label',state.phase==='paused'?'Продолжить игру':'Пауза');
    el('pause').setAttribute('aria-pressed',String(state.phase==='paused'));
  }
  function showPanel(view,heading,description,action) {
    panel.hidden=false;panel.dataset.view=view;title.textContent=heading;copy.textContent=description;copy.hidden=!description;
    dialog.dataset.screen=view;
    el('subtitle').hidden=view!=='menu';
    el('start').textContent=action;
    el('result').hidden=!['victory','gameover'].includes(view);
    resize();
  }
  function showMenu() {
    showPanel('menu','ДИНАСТИЯ','Собери минимум 23 из 26 монеток, чтобы пройти игру. После трех пропусков раунд закончится.','ИГРАТЬ');
  }
  function start() {
    renderer.clear();state=core.createState(window.sashaGameOptions.coinCount,width,height,stageGround());
    state.phase='countdown';countdown=2.1;nextBeat=0;melodyStep=0;held.clear();targetX=null;
    victoryRequest++;
    scorePop?.cancel();shownScore=scoreFrom=scoreTarget=scoreElapsed=0;el('score').textContent='0';
    dialog.dataset.screen='countdown';
    panel.hidden=true;el('countdown').hidden=false;el('status').textContent='Приготовься ловить монетки';
    if(music)music.currentTime=0;
    if(victoryAudio){victoryAudio.pause();victoryAudio.currentTime=0}
    prepareAudio(true);updateHud();resize();
  }
  function togglePause() {
    if(!state)return;
    held.clear();targetX=null;
    el('controls').querySelectorAll('button').forEach(button=>button.classList.remove('is-held'));
    if(state.phase==='paused') {
      state.phase=pausedPhase;panel.hidden=true;previousTime=null;
      dialog.dataset.screen=state.phase;
      if(['playing','countdown'].includes(state.phase))prepareAudio();
    } else if(['playing','countdown'].includes(state.phase)) {
      pausedPhase=state.phase;state.phase='paused';silence();
      el('countdown').hidden=true;
      showPanel('paused','Пауза','Монетка подождет. Продолжи с того же места или вернись на сайт.','ПРОДОЛЖИТЬ');
      el('start').focus({preventScroll:true});
    }
    updateHud();
  }
  function end() {
    silence();saveBest();held.clear();targetX=null;updateHud();
    const won=state.phase==='victory';
    if(won)playVictory();
    showPanel(state.phase,won?'ДИНАСТИЯ СОБРАНА!':'GAME OVER',won?'Этот танец в твою честь!':'Три монетки ушли мимо. Попробуй еще — скорость снова начнется с первой.','ИГРАТЬ СНОВА');
    el('result-score').textContent=state.score.toLocaleString('ru-RU');
    el('result-combo').textContent=state.maxCombo;
    el('result-percent').textContent=Math.round(state.caught/Math.max(1,state.index)*100)+'%';
    el('result-best').textContent=best.toLocaleString('ru-RU');
    el('status').textContent=(won?'Победа. ':'Игра окончена. ')+'Счет: '+state.score;
    el('start').focus({preventScroll:true});
  }
  function resize() {
    const rect=el('stage').getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    const ratio=Math.max(rect.width/960,Math.min(1,rect.height/300));
    width=Math.round(rect.width/ratio);height=Math.round(rect.height/ratio);
    renderer.resize(width,height);
    if(state)core.resize(state,width,height,stageGround());
    if(!panel.hidden)window.SashaGameRenderer.paintTitle(el('heading'),title.textContent,el('panel-title').clientWidth);
  }
  function loop(time) {
    if(!dialog.open)return;
    const dt=previousTime===null?0:Math.min((time-previousTime)/1000,.04);
    previousTime=time;
    if(state.phase==='countdown') {
      countdown-=dt;el('countdown').hidden=false;
      el('countdown').textContent=countdown>1.4?'3':countdown>.7?'2':'1';
      if(countdown<=0){state.phase='playing';dialog.dataset.screen='playing';el('countdown').hidden=true;prepareAudio();updateHud()}
    }
    if(state.phase==='playing') {
      let left=held.has('KeyA')||held.has('ArrowLeft')||held.has('left');
      let right=held.has('KeyD')||held.has('ArrowRight')||held.has('right');
      if(targetX!==null){const distance=targetX-(state.player.x+20);left=distance< -8;right=distance>8}
      core.update(state,dt,{left,right});
      if(state.event) {
        renderer.burst(state.event,reduced.matches);
        tone(state.event.type==='catch'?660:160,.12);
        el('status').textContent=state.event.type==='catch'?'Поймано. Счет: '+state.score:'Пропущено. Осталось жизней: '+state.lives;
        updateHud();
      }
      // An original quiet 8-bit accompaniment when no local recording is configured.
      if(!music&&state.elapsed>=nextBeat){nextBeat=state.elapsed+.32;tone([196,247,294,392,294,247,220,294][melodyStep++%8],.12,.012)}
      if(['victory','gameover'].includes(state.phase))end();
    }
    if(state.phase!=='paused')visualTime+=dt;
    animateScore(state.phase==='paused'?0:dt);
    renderer.draw(state,visualTime,state.phase==='paused'?0:dt,reduced.matches);
    frame=requestAnimationFrame(loop);
  }
  function cleanup() {
    if(!session)return;
    cancelAnimationFrame(frame);frame=0;previousTime=null;
    victoryRequest++;scorePop?.cancel();scorePop=null;
    observer?.disconnect();observer=null;
    session.abort();session=null;held.clear();targetX=null;renderer.clear();
    if(music){music.pause();music.removeAttribute('src');music.load();music=null}
    if(victoryAudio){victoryAudio.pause();victoryAudio.removeAttribute('src');victoryAudio.load();victoryAudio=null}
    if(audioContext){audioContext.close().catch(()=>{});audioContext=null}
    document.documentElement.classList.remove('sasha-game-root');
    document.body.classList.remove('sasha-game-open');
    Object.assign(document.body.style,{overflow:savedOverflow,position:savedPosition,top:savedTop,width:savedWidth});
    window.scrollTo({top:savedScroll,behavior:'instant'});
    invoker?.focus({preventScroll:true});state=null;
  }
  function close() { dialog.close();cleanup(); }
  function bind() {
    session=new AbortController();const options={signal:session.signal};
    const on=(target,type,callback)=>target.addEventListener(type,callback,options);
    on(el('close'),'click',close);on(el('back'),'click',close);on(el('pause'),'click',togglePause);
    on(el('start'),'click',()=>{
      if(state.phase==='paused')togglePause();
      else start();
    });
    on(el('sound'),'click',()=>{
      sound=!sound;el('sound').setAttribute('aria-pressed',String(sound));
      el('sound').setAttribute('aria-label',sound?'Выключить звук':'Включить звук');
      el('sound').querySelector('span').textContent=sound?'Звук вкл.':'Звук выкл.';
      if(!sound)silence();
      else if(['playing','countdown'].includes(state.phase))prepareAudio();
      else if(state.phase==='victory')playVictory(false);
    });
    on(dialog,'cancel',event=>{event.preventDefault();if(['playing','paused','countdown'].includes(state.phase))togglePause();else close()});
    on(dialog,'close',cleanup);
    on(document,'keydown',event=>{
      if(event.code==='Escape')return; // Native dialog cancel handles Escape exactly once.
      if(!['playing','countdown'].includes(state.phase))return;
      if(['KeyA','KeyD','ArrowLeft','ArrowRight','Space'].includes(event.code)){
        event.preventDefault();if(event.code==='Space'){if(!event.repeat)core.jump(state)}else held.add(event.code);
      }
    });
    on(document,'keyup',event=>held.delete(event.code));
    for(const direction of ['left','right','jump']) {
      const button=el(direction);
      on(button,'pointerdown',event=>{
        event.preventDefault();button.setPointerCapture(event.pointerId);
        if(state.phase!=='playing')return;
        button.classList.add('is-held');targetX=null;
        if(direction==='jump')core.jump(state);else held.add(direction);
      });
      const release=()=>{button.classList.remove('is-held');held.delete(direction)};
      on(button,'pointerup',release);on(button,'pointercancel',release);on(button,'lostpointercapture',release);
    }
    const canvas=el('canvas');let pointer=null;
    const aim=event=>{const rect=canvas.getBoundingClientRect();targetX=(event.clientX-rect.left)/rect.width*width};
    on(canvas,'pointerdown',event=>{if(state.phase!=='playing'||pointer!==null)return;event.preventDefault();pointer=event.pointerId;canvas.setPointerCapture(pointer);aim(event)});
    on(canvas,'pointermove',event=>{if(event.pointerId===pointer)aim(event)});
    const release=event=>{if(event.pointerId===pointer){pointer=null;targetX=null}};
    on(canvas,'pointerup',release);on(canvas,'pointercancel',release);on(canvas,'lostpointercapture',release);
    const autoPause=()=>{held.clear();targetX=null;if(['playing','countdown'].includes(state.phase))togglePause()};
    on(window,'blur',autoPause);on(document,'visibilitychange',()=>{if(document.hidden)autoPause()});
    on(dialog,'contextmenu',event=>event.preventDefault());
  }
  function open(button) {
    if(dialog.open)return;
    invoker=button;best=readBest();
    savedScroll=window.scrollY;
    ({overflow:savedOverflow,position:savedPosition,top:savedTop,width:savedWidth}=document.body.style);
    Object.assign(document.body.style,{overflow:'hidden',position:'fixed',top:-savedScroll+'px',width:'100%'});
    document.documentElement.classList.add('sasha-game-root');
    document.body.classList.add('sasha-game-open');
    dialog.showModal();bind();
    shownScore=scoreFrom=scoreTarget=scoreElapsed=0;el('score').textContent='0';
    state=core.createState(window.sashaGameOptions.coinCount,width,height,stageGround());state.phase='menu';
    resize();showMenu();updateHud();el('countdown').hidden=true;
    observer=new ResizeObserver(resize);observer.observe(el('stage'));
    previousTime=null;visualTime=0;frame=requestAnimationFrame(loop);
    el('start').focus({preventScroll:true});
  }
  window.SashaGame={open,close};
})();
