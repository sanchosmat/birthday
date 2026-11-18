(function () {
  'use strict';
  // Authored 5×7 alphabet: Cyrillic stays sharp at every integer pixel scale.
  const letters = {
    А:'01110/10001/10001/11111/10001/10001/10001', Б:'11111/10000/10000/11110/10001/10001/11110',
    В:'11110/10001/10001/11110/10001/10001/11110', Г:'11111/10000/10000/10000/10000/10000/10000',
    Д:'00110/01010/01010/01010/10010/11111/10001', Е:'11111/10000/10000/11110/10000/10000/11111',
    '\u0401':'01010/00000/11111/10000/11110/10000/11111', Ж:'10101/10101/01110/00100/01110/10101/10101',
    З:'11110/00001/00001/01110/00001/00001/11110', И:'10001/10011/10101/10101/11001/10001/10001',
    Й:'01010/00100/10001/10011/10101/11001/10001', К:'10001/10010/10100/11000/10100/10010/10001',
    Л:'00111/01001/01001/01001/01001/10001/10001', М:'10001/11011/10101/10101/10001/10001/10001',
    Н:'10001/10001/10001/11111/10001/10001/10001', О:'01110/10001/10001/10001/10001/10001/01110',
    П:'11111/10001/10001/10001/10001/10001/10001', Р:'11110/10001/10001/11110/10000/10000/10000',
    С:'01111/10000/10000/10000/10000/10000/01111', Т:'11111/00100/00100/00100/00100/00100/00100',
    У:'10001/10001/10001/01111/00001/00001/11110', Ф:'00100/01110/10101/10101/01110/00100/00100',
    Х:'10001/10001/01010/00100/01010/10001/10001', Ц:'10010/10010/10010/10010/10010/11111/00001',
    Ч:'10001/10001/10001/01111/00001/00001/00001', Ш:'10101/10101/10101/10101/10101/10101/11111',
    Щ:'10101/10101/10101/10101/10101/11111/00001', Ъ:'11000/01000/01000/01110/01001/01001/01110',
    Ы:'10001/10001/10001/11101/10011/10011/11101', Ь:'10000/10000/10000/11110/10001/10001/11110',
    Э:'11110/00001/00001/01111/00001/00001/11110', Ю:'10010/10101/10101/11101/10101/10101/10010',
    Я:'01111/10001/10001/01111/00101/01001/10001',
    A:'01110/10001/10001/11111/10001/10001/10001', B:'11110/10001/10001/11110/10001/10001/11110',
    C:'01111/10000/10000/10000/10000/10000/01111', D:'11110/10001/10001/10001/10001/10001/11110',
    E:'11111/10000/10000/11110/10000/10000/11111', F:'11111/10000/10000/11110/10000/10000/10000',
    G:'01111/10000/10000/10111/10001/10001/01111', H:'10001/10001/10001/11111/10001/10001/10001',
    I:'11111/00100/00100/00100/00100/00100/11111', J:'00111/00010/00010/00010/10010/10010/01100',
    K:'10001/10010/10100/11000/10100/10010/10001', L:'10000/10000/10000/10000/10000/10000/11111',
    M:'10001/11011/10101/10101/10001/10001/10001', N:'10001/11001/10101/10011/10001/10001/10001',
    O:'01110/10001/10001/10001/10001/10001/01110', P:'11110/10001/10001/11110/10000/10000/10000',
    Q:'01110/10001/10001/10001/10101/10010/01101', R:'11110/10001/10001/11110/10100/10010/10001',
    S:'01111/10000/10000/01110/00001/00001/11110', T:'11111/00100/00100/00100/00100/00100/00100',
    U:'10001/10001/10001/10001/10001/10001/01110', V:'10001/10001/10001/10001/10001/01010/00100',
    W:'10001/10001/10001/10101/10101/10101/01010', X:'10001/10001/01010/00100/01010/10001/10001',
    Y:'10001/10001/01010/00100/00100/00100/00100', Z:'11111/00001/00010/00100/01000/10000/11111',
    '0':'01110/10001/10011/10101/11001/10001/01110', '1':'00100/01100/00100/00100/00100/00100/01110',
    '2':'01110/10001/00001/00110/01000/10000/11111', '3':'11110/00001/00001/01110/00001/00001/11110',
    '4':'00010/00110/01010/10010/11111/00010/00010', '5':'11111/10000/10000/11110/00001/00001/11110',
    '6':'01110/10000/10000/11110/10001/10001/01110', '7':'11111/00001/00010/00100/01000/01000/01000',
    '8':'01110/10001/10001/01110/10001/10001/01110', '9':'01110/10001/10001/01111/00001/00001/01110',
    '!':'00100/00100/00100/00100/00100/00000/00100', '?':'01110/10001/00010/00100/00100/00000/00100',
    '.':'00000/00000/00000/00000/00000/00100/00100', ',':'00000/00000/00000/00000/00100/00100/01000',
    ':':'00000/00100/00100/00000/00100/00100/00000', '-':'00000/00000/00000/11111/00000/00000/00000',
    '+':'00000/00100/00100/11111/00100/00100/00000', '*':'00000/10101/01110/11111/01110/10101/00000',
    '«':'00000/00101/01010/10100/01010/00101/00000', '»':'00000/10100/01010/00101/01010/10100/00000',
    '(':'00010/00100/01000/01000/01000/00100/00010', ')':'01000/00100/00010/00010/00010/00100/01000',
    '/':'00001/00010/00010/00100/01000/01000/10000', '%':'11001/11010/00010/00100/01000/01011/10011'
  };
  const glyphs = Object.fromEntries(Object.entries(letters).map(([key, rows]) => [key, rows.split('/')]));
  function bitmapText(ctx, text, x, y, size = 2, color = '#fff6d8') {
    ctx.fillStyle = color;
    let left = Math.round(x);
    for (const char of text.toUpperCase().replace(/[—–]/g, '-')) {
      const rows = glyphs[char] || (char === ' ' ? [] : glyphs['?']);
      rows.forEach((row, dy) => Array.from(row).forEach((pixel, dx) => {
        if (pixel === '1') ctx.fillRect(left + dx * size, Math.round(y) + dy * size, size, size);
      }));
      left += 6 * size;
    }
  }

  function paintTitle(canvas,text,maxWidth) {
    const lines=text==='ДИНАСТИЯ СОБРАНА!'?['ДИНАСТИЯ','СОБРАНА!']:[text.toUpperCase()];
    const longest=Math.max(...lines.map(line=>Array.from(line).length));
    const unit=Math.max(2,Math.min(12,Math.floor(Math.max(120,maxWidth)/(longest*6+1))));
    canvas.width=(longest*6+1)*unit;
    canvas.height=(lines.length*10-3)*unit+unit;
    const context=canvas.getContext('2d');context.imageSmoothingEnabled=false;
    lines.forEach((line,i)=>{
      bitmapText(context,line,unit,i*10*unit+unit,unit,'#10262e');
      bitmapText(context,line,0,i*10*unit,unit,'#d2ed86');
    });
  }

  function drawHero(ctx, state, time, reduced, sprites, placement) {
    return sprites.draw(ctx, state, time, reduced, placement);
  }

  function drawCoin(ctx, coin) {
    const x = Math.round(coin.x), y = Math.round(coin.y);
    for (let row = 0; row < 16; row++) {
      for (let column = 0; column < 16; column++) {
        const distance = Math.hypot(column - 7.5, row - 7.5);
        if (distance > 7.8) continue;
        ctx.fillStyle = distance > 6.6 ? '#80511d'
          : distance > 5.6 ? '#ffe79b'
          : column + row < 14 ? '#f8cf61' : '#dfa231';
        ctx.fillRect(x + column * 2, y + row * 2, 2, 2);
      }
    }
    ctx.fillStyle = '#a26820';
    ctx.fillRect(x + 14, y + 8, 4, 16);
    ctx.fillRect(x + 10, y + 10, 4, 4);
    ctx.fillRect(x + 10, y + 24, 12, 2);
    ctx.fillStyle = '#fff0b1';
    ctx.fillRect(x + 6, y + 8, 2, 6);
  }

  function create(canvas) {
    const ctx=canvas.getContext('2d');
    const sprites=window.SashaGameSprites.create(window.SashaSpriteConfig);
    const background=window.SashaGameBackground.create({stageId:()=>window.sashaGameOptions.stage});
    let scale=1;
    const particles=[];
    let feedback=null;
    function resize(width,height) {
      scale=Math.max(1,Math.min(Math.round(window.devicePixelRatio||1),2));
      canvas.width=Math.round(width*scale);canvas.height=Math.round(height*scale);
      ctx.setTransform(scale,0,0,scale,0,0);ctx.imageSmoothingEnabled=false;
    }
    function burst(event,reduced) {
      feedback={...event,life:.85,duration:.85};
      if(reduced)return;
      if(event.type==='catch'&&event.coin){
        const coin=event.coin;
        for(let i=0;i<18;i++){
          const angle=i/18*Math.PI*2, speed=55+Math.random()*70;
          const life=.35+Math.random()*.4;
          particles.push({x:coin.x+coin.w/2,y:coin.y+coin.h/2,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-70,life,maxLife:life,size:i%3?3:4,color:['#f8cf61','#dfa231','#fff0b1'][i%3]});
        }
      }else{
        for(let i=0;i<14;i++)particles.push({x:event.x,y:event.y,vx:(Math.random()-.5)*150,vy:-40-Math.random()*100,life:.65,maxLife:.65,size:4,color:'#ef8b72'});
      }
      if(particles.length>700)particles.splice(0,particles.length-700);
    }
    function draw(state,time,dt,reduced) {
      const {width:w,height:h,ground:g}=state;
      ctx.clearRect(0,0,w,h);
      background.draw(ctx,state,time,reduced);
      const d=state.drop;
      if(d) drawCoin(ctx,d);
      if(!['menu','victory','gameover'].includes(state.phase))background.drawShadow(ctx,state);
      if(['menu','victory','gameover'].includes(state.phase)){
        const mobile=w<600;
        const size=Math.max(2,Math.min(mobile?3:5,Math.floor(h/(mobile?190:105))));
        const x=(mobile?w*.5:w*.79)-20*size;
        drawHero(ctx,{...state,player:{...state.player,moving:false,vy:0,facing:mobile?1:-1}},time,reduced,sprites,{centerX:x+20*size,feetY:g,scale:size});
        if(!reduced)for(let i=0;i<15;i++){ctx.globalAlpha=.3+.4*Math.abs(Math.sin(time+i));ctx.fillStyle='#edfac3';ctx.fillRect(Math.round(x-30+(i*37)%(40*size+60)),Math.round(g-20-(time*15+i*29)%(64*size)),3,3)}ctx.globalAlpha=1;
      }else drawHero(ctx,state,time,reduced,sprites);
      for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;if(p.life<=0){particles.splice(i,1);continue}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=210*dt;ctx.globalAlpha=Math.min(1,p.life/p.maxLife*2);ctx.fillStyle=p.color;ctx.fillRect(Math.round(p.x),Math.round(p.y),p.size,p.size)}ctx.globalAlpha=1;
      if(feedback){
        feedback.life-=dt;
        if(feedback.life<=0)feedback=null;
        else{
          const e=feedback,age=e.duration-e.life;
          if(e.type==='catch'){
            if(!reduced&&age<.18){ctx.fillStyle='rgba(128,255,111,'+(.18*(1-age/.18))+')';ctx.fillRect(0,0,w,h)}
            const tx=Math.max(10,Math.min(w-154,e.x-72)),ty=Math.max(24,e.y-44-(reduced?0:age*18));
            bitmapText(ctx,'PERFECT!',tx+3,ty+3,3,'#10262e');
            bitmapText(ctx,'PERFECT!',tx,ty,3,'#f4ffbd');
            bitmapText(ctx,e.label,tx+38,ty+28,2,'#f4ffbd');
          }else bitmapText(ctx,e.label,Math.max(10,Math.min(w-100,e.x)),Math.max(20,e.y-24),2,'#fff2c3');
        }
      }
      if(state.phase==='victory'&&!reduced)for(let i=0;i<70;i++){ctx.fillStyle=['#d9ee8b','#f0ba7a','#71b7be','#f4eec5'][i%4];ctx.fillRect(Math.round((i*53+time*(i%2?15:-12)+w)%w),Math.round((time*46+i*29)%h),i%3?5:8,5)}
    }
    return {resize,draw,burst,ready:Promise.all([sprites.ready,background.ready]),clear:()=>{particles.length=0;feedback=null;sprites.reset()}};
  }
  window.SashaGameRenderer={create,paintTitle};
})();
