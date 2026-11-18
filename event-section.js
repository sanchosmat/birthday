(() => {
  'use strict';
  const c = eventConfig;
  const root = document.getElementById('event-guide');
  const paths = {
    calendar: 'M4 5h16v16H4z M8 3v4 M16 3v4 M4 11h16',
    clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v5l4 2',
    pin: 'M12 21s7-6.6 7-12a7 7 0 1 0-14 0c0 5.4 7 12 7 12z M12 6.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
    image: 'M3 3h18v18H3z M3 16l6-6 5 5 3-3 4 4 M15 7h.01',
    diamond: 'M3 8l4-5h10l4 5-9 13z M3 8h18 M8 8l4 13 4-13 M7 3l1 5 4-5 4 5 1-5',
    theatre: 'M3 4l8 2v7c0 4-4 6-4 6s-4-2-4-6z M6 9h2 M6 13h2 M14 6l7-2v9c0 4-4 6-4 6 M16 9h2 M16 13h2',
    trend: 'M3 19l6-7 4 3 8-10 M15 5h6v6',
    star: 'M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z',
    arrow: 'M3 12h18 M15 6l6 6-6 6',
    chevron: 'M8 10l4 4 4-4',
    device: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z M10 18h4',
    close: 'M6 6l12 12 M18 6 6 18'
  };
  const icon = name => `<svg class="guide-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.star}"/></svg>`;
  const el = (tag, cls, text) => { const n=document.createElement(tag); if(cls)n.className=cls; if(text)n.textContent=text; return n; };
  const parse = value => {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2})$/.test(value || '')) return null;
    const date = new Date(value); return Number.isNaN(+date) ? null : date;
  };
  let zoneValid=true;
  try { new Intl.DateTimeFormat('ru', {timeZone:c.timezone}).format(); } catch { zoneValid=false; }
  const format = (date, options) => date && zoneValid ? new Intl.DateTimeFormat('ru-RU', {timeZone:c.timezone,...options}).format(date) : '';
  const start=parse(c.startDateTime), end=parse(c.endDateTime);
  const dateLabel=format(start,{day:'numeric',month:'long',year:'numeric'}).replace(/\s*г\.$/,'');
  const timeLabel=format(start,{hour:'2-digit',minute:'2-digit'});
  const validEnd=end && start && end>start;
  const calendarReady=Boolean(zoneValid && start && validEnd && c.eventName.trim());
  root.innerHTML=`<div class="guide-inner">
    <div class="guide-card guide-info">
      <div class="guide-fact">${icon('calendar')}<div><small>Дата</small><strong id="guide-date"></strong></div></div>
      <div class="guide-fact">${icon('clock')}<div><small>Время</small><strong id="guide-time"></strong><p id="guide-time-note"></p></div></div>
      <div class="guide-fact">${icon('pin')}<div><small>Место</small><strong id="guide-venue"></strong><p id="guide-address"></p></div></div>
      <div class="guide-actions"><div class="guide-calendar-picker"><button class="guide-button guide-calendar-trigger" id="guide-calendar" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="guide-calendar-menu" aria-describedby="guide-calendar-note"><span class="guide-calendar-label">${icon('calendar')}<span>Добавить в календарь</span></span>${icon('chevron')}</button><div class="guide-calendar-menu" id="guide-calendar-menu" role="menu" hidden><a id="guide-calendar-device" role="menuitem">${icon('device')}<span><strong>На устройстве</strong><small>Apple Calendar, Outlook и другие</small></span></a><a id="guide-calendar-google" role="menuitem" target="_blank" rel="noopener noreferrer">${icon('calendar')}<span><strong>Google Календарь</strong><small>Открыть в новой вкладке</small></span></a></div></div><p class="guide-note" id="guide-calendar-note"></p></div>
    </div>
    <div class="guide-columns"><article class="guide-card guide-legend" id="guide-legend"><div class="guide-legend-copy" id="guide-legend-copy"></div><div class="guide-legend-image" id="guide-legend-image" hidden></div></article><article class="guide-card guide-dress"><div id="guide-dress-copy"></div><aside class="guide-dress-gallery"><div class="guide-dress-moodboard" id="guide-dress-moodboard" aria-label="Референсы дресс-кода"></div></aside></article><article class="guide-card guide-special" aria-labelledby="guide-special-title"><header class="guide-special-header"><div><h3 id="guide-special-title"></h3><p id="guide-special-description"></p><p class="guide-special-task" id="guide-special-task"></p></div><span class="guide-special-tag" id="guide-special-tag"></span></header><ul class="guide-special-steps" id="guide-special-steps"></ul><p class="guide-special-conditions" id="guide-special-conditions"></p><p class="guide-special-accent" id="guide-special-accent"></p><figure class="guide-special-example"><figcaption><strong id="guide-special-example-title"></strong></figcaption><div class="guide-special-previews" id="guide-special-previews"></div></figure></article></div>
    <section class="guide-plan" aria-labelledby="guide-program-title"><h3 id="guide-program-title"></h3><ol class="guide-plan-steps" id="guide-plan-steps"></ol></section>
  </div>`;
  const put=(id,text)=>document.getElementById(id).textContent=text;
  put('guide-date',dateLabel || 'Дата уточняется');
  put('guide-time',timeLabel || 'Время уточняется');
  put('guide-time-note',timeLabel ? '' : 'Сообщим ближе к встрече');
  put('guide-venue',c.locationNotice || 'Место встречи отписал в личке');put('guide-address','');
  put('guide-program-title',c.programTitle);
  put('guide-special-title',c.specialAssignment.title);put('guide-special-description',c.specialAssignment.description);put('guide-special-tag',c.specialAssignment.tag);
  put('guide-special-accent',c.specialAssignment.accent);
  put('guide-special-example-title',c.specialAssignment.example.title);
  function localImage(src) {
    if(typeof src!=='string' || !src.trim())return null;
    try {const url=new URL(src,location.href);return url.origin===location.origin && ['http:','https:','file:'].includes(url.protocol) ? url.href : null;}catch{return null;}
  }
  function media(host,src,alt,label,loading='lazy') {
    host.classList.add('guide-media');
    const placeholder=el('div','guide-placeholder');placeholder.innerHTML=icon('image');placeholder.append(el('span','',label));host.append(placeholder);
    const url=localImage(src);if(!url)return;
    const img=el('img');img.alt=alt;img.loading=loading;img.decoding='async';img.src=url;
    img.addEventListener('load',async()=>{try{await img.decode();}catch{}placeholder.hidden=true;img.classList.add('is-loaded');});
    img.addEventListener('error',()=>{img.remove();placeholder.hidden=false;placeholder.lastChild.textContent='Фото скоро появится';if(host.tagName==='BUTTON')host.disabled=true;});
    host.append(img);
  }
  function appendInline(host,text){String(text).split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean).forEach(part=>{if(part.startsWith('**'))host.append(el('strong','',part.slice(2,-2)));else if(part.startsWith('*')){const highlight=el('mark','guide-highlight',part.slice(1,-1));host.append(highlight);}else host.append(document.createTextNode(part));});}
  appendInline(document.getElementById('guide-special-task'),c.specialAssignment.task);
  appendInline(document.getElementById('guide-special-conditions'),c.specialAssignment.conditions);
  const specialSteps=document.getElementById('guide-special-steps');
  c.specialAssignment.steps.forEach(item=>{const step=el('li');step.append(el('h4','',item.title),el('p','',item.description));specialSteps.append(step);});
  function copy(host,data,icons) {
    const heading=el('div','guide-card-heading');heading.append(el('h3','',data.title));if(data.tag)heading.append(el('span','guide-card-tag',data.tag));host.append(heading);const body=el('div','guide-copy');data.paragraphs.forEach(text=>{const paragraph=el('p');appendInline(paragraph,text);body.append(paragraph);});
    if(data.accent){const accent=el('p','guide-accent');appendInline(accent,data.accent);body.append(accent);}host.append(body);
    if(data.tags?.length){const tags=el('ul','guide-tags');data.tags.forEach((text,i)=>{const tag=el('li');if(icons)tag.innerHTML=icon(icons[i]);tag.append(document.createTextNode(text));tags.append(tag);});host.append(tags);}
  }
  const dressCopy=document.getElementById('guide-dress-copy');
  copy(dressCopy,c.dressCode);
  const dressCue=el('p','guide-dress-gallery-title');dressCue.append(el('span','',c.dressCode.galleryTitle));dressCue.firstChild.id='guide-dress-gallery-title';dressCue.insertAdjacentHTML('beforeend','<svg viewBox="0 0 150 52" aria-hidden="true" focusable="false"><path class="guide-cue-arrow-desktop" d="M4 18C48 39 99 38 140 17M126 14C131 14 136 15 140 17C138 22 135 27 131 31"/><path class="guide-cue-arrow-mobile" d="M5 10C30 6 57 13 78 35M67 32C71 32.5 75 33.5 78 35C76.5 39 74 42.5 71 46"/></svg>');dressCopy.append(dressCue);
  const dressMoodboard=document.getElementById('guide-dress-moodboard');
  c.dressCodeImages.slice(0,6).forEach((item,i)=>{
    const tile=el('figure','guide-dress-tile');
    const imageHost=el('div','guide-dress-image');
    media(imageHost,item.src,item.alt,`Образ ${i+1}`);
    const image=imageHost.querySelector('img');if(image && item.position)image.style.objectPosition=item.position;
    tile.append(imageHost,el('figcaption','',item.label));dressMoodboard.append(tile);
  });
  const legendCard=document.getElementById('guide-legend');
  const legendCopy=document.getElementById('guide-legend-copy');
  const legendTitle=el('h3','',c.legend.title);
  legendTitle.id='guide-legend-title';
  legendCard.setAttribute('aria-labelledby',legendTitle.id);
  const legendHeading=el('div','guide-card-heading');legendHeading.append(legendTitle);if(c.legend.tag)legendHeading.append(el('span','guide-card-tag',c.legend.tag));legendCard.prepend(legendHeading);
  function appendLegendInline(host,text){
    String(text).split(/(\*\*[^*]+\*\*|_[^_]+_)/g).filter(Boolean).forEach(part=>{
      if(part.startsWith('**'))host.append(el('strong','guide-legend-lead',part.slice(2,-2)));
      else if(part.startsWith('_'))host.append(el('span','guide-legend-underline',part.slice(1,-1)));
      else host.append(document.createTextNode(part));
    });
  }
  c.legend.paragraphs.forEach(text=>{
    const paragraph=el('p');
    appendLegendInline(paragraph,text);
    legendCopy.append(paragraph);
  });
  if(c.legend.questionLead || c.legend.question){const question=el('p','guide-legend-question');question.append(el('span','',c.legend.questionLead || ''),el('strong','',c.legend.question || ''));legendCopy.append(question);}
  if(c.legend.accent)legendCard.append(el('p','guide-legend-accent',c.legend.accent));
  if(c.legend.tags?.length){const legendTags=el('ul','guide-tags');c.legend.tags.forEach((text,i)=>{const tag=el('li');tag.innerHTML=icon(['diamond','theatre','trend','star'][i]);tag.append(el('span','',text));legendTags.append(tag);});legendCard.append(legendTags);}
  const legendHost=document.getElementById('guide-legend-image'),legendUrl=localImage(c.legendImage);
  if(legendUrl){const image=el('img'),legendCard=document.getElementById('guide-legend');image.alt='Соник и надпись «Позволь этому случиться, это будет оооч вайбово»';image.loading='lazy';image.decoding='async';legendHost.hidden=false;legendCard.classList.add('has-image');image.addEventListener('error',()=>{legendHost.hidden=true;legendCard.classList.remove('has-image');image.remove();});legendHost.append(image);image.src=legendUrl;}
  function dialog(cls,label) {
    const d=el('dialog','guide-dialog '+cls);d.setAttribute('aria-label',label);
    const close=el('button','guide-close');close.type='button';close.setAttribute('aria-label','Закрыть');close.innerHTML=icon('close');close.onclick=()=>d.close();d.append(close);document.body.append(d);
    let outside=false;d.addEventListener('pointerdown',e=>{outside=e.target===d;});d.addEventListener('click',e=>{if(outside && e.target===d)d.close();outside=false;});return d;
  }
  const lightbox=dialog('guide-lightbox','Просмотр фотографии');const fullImage=el('img'),caption=el('p');lightbox.append(fullImage,caption);
  let invoker=null;
  lightbox.addEventListener('close',()=>{fullImage.removeAttribute('src');invoker?.focus({preventScroll:true});});
  const openLightbox=(button,url,alt)=>{invoker=button;fullImage.src=url;fullImage.alt=alt;caption.textContent=alt;lightbox.showModal();};
  const specialPreviews=document.getElementById('guide-special-previews');
  c.specialAssignment.example.images.forEach((item,i)=>{
    const preview=el('button','guide-special-preview');preview.type='button';preview.id=`guide-special-preview-${i+1}`;
    preview.setAttribute('aria-describedby','guide-special-example-title');preview.setAttribute('aria-label',`Увеличить: ${item.alt}`);
    media(preview,item.src,item.alt,'Пример презентации','eager');
    const url=localImage(item.src);if(url)preview.onclick=()=>openLightbox(preview,url,item.alt);
    specialPreviews.append(preview);
  });
  const calendar=document.getElementById('guide-calendar');calendar.disabled=!calendarReady;
  put('guide-calendar-note',calendarReady ? '' : 'Добавление станет доступно после уточнения времени.');
  if(calendarReady){
    const stamp=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
    const url=new URL('https://calendar.google.com/calendar/render');
    Object.entries({action:'TEMPLATE',text:c.eventName,dates:stamp(start)+'/'+stamp(end),ctz:c.timezone}).forEach(([k,v])=>url.searchParams.set(k,v));
    calendar.dataset.calendarUrl=url.href;
    const google=document.getElementById('guide-calendar-google');google.href=url.href;
    const escapeIcs=value=>String(value).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/([,;])/g,'\\$1');
    const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Event invitation//RU','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',`UID:event-${start.getTime()}@invitation.local`,`DTSTAMP:${stamp(new Date())}`,`DTSTART:${stamp(start)}`,`DTEND:${stamp(end)}`,`SUMMARY:${escapeIcs(c.eventName)}`,'END:VEVENT','END:VCALENDAR',''].join('\r\n');
    const icsUrl=URL.createObjectURL(new Blob([ics],{type:'text/calendar;charset=utf-8'}));
    const device=document.getElementById('guide-calendar-device');device.href=icsUrl;device.download='event.ics';device.dataset.calendarFile='event.ics';
    const picker=calendar.closest('.guide-calendar-picker'),menu=document.getElementById('guide-calendar-menu');
    const items=[device,google];
    const setMenu=(open,focusFirst=false)=>{calendar.setAttribute('aria-expanded',String(open));menu.hidden=!open;if(open&&focusFirst)items[0].focus();};
    calendar.onclick=()=>setMenu(menu.hidden,!menu.hidden);
    calendar.addEventListener('keydown',event=>{if(['ArrowDown','Enter',' '].includes(event.key)&&menu.hidden){event.preventDefault();setMenu(true,true);}else if(event.key==='Escape'&&!menu.hidden){event.preventDefault();setMenu(false);}});
    menu.addEventListener('keydown',event=>{const index=items.indexOf(document.activeElement);if(event.key==='Escape'){event.preventDefault();setMenu(false);calendar.focus();}else if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();items[(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length].focus();}else if(event.key==='Home'||event.key==='End'){event.preventDefault();items[event.key==='Home'?0:items.length-1].focus();}else if(event.key==='Tab')setMenu(false);});
    items.forEach(item=>item.addEventListener('click',()=>setMenu(false)));
    document.addEventListener('pointerdown',event=>{if(!picker.contains(event.target))setMenu(false);});
    window.addEventListener('pagehide',()=>URL.revokeObjectURL(icsUrl),{once:true});
  }
  function planScene(object){
    let dots='';
    for(let row=0;row<5;row++){
      const t=row/4,y=(108+t*92).toFixed(1),spread=20+t*36,r=(1.15+t*.8).toFixed(2);
      for(let col=-4;col<=4;col++){
        const x=180+col*spread;
        if(x>=-8&&x<=368)dots+=`<circle cx="${x.toFixed(1)}" cy="${y}" r="${r}"/>`;
      }
    }
    return `<svg viewBox="24 8 312 212" aria-hidden="true" focusable="false"><g fill="#c8c8c8">${dots}</g><g fill="none" stroke="#d6d6d6" stroke-width="1.5" stroke-dasharray="2.4 4.2" stroke-linecap="round"><path d="M12 200L180 102"/><path d="M348 200L180 102"/><path d="M52 218L180 122"/><path d="M308 218L180 122"/></g>${object}</svg>`;
  }
  const planArts=[
    planScene(`<ellipse cx="168" cy="176" rx="86" ry="14" fill="#111" opacity=".05"/><ellipse cx="108" cy="156" rx="16" ry="6" fill="#1d5ed8"/><path d="M92 118a16 6 0 0 0 32 0v38a16 6 0 0 1-32 0z" fill="#4b8dff"/><ellipse cx="108" cy="118" rx="16" ry="6" fill="#d7e6ff"/><ellipse cx="166" cy="164" rx="72" ry="20" fill="#e08a52"/><ellipse cx="166" cy="156" rx="72" ry="20" fill="#f7c9a4"/><ellipse cx="166" cy="156" rx="48" ry="13" fill="#f3a56e"/><ellipse cx="166" cy="148" rx="22" ry="7" fill="#e07d45"/><ellipse cx="166" cy="142" rx="22" ry="7" fill="#f8d7bc"/>`),
    planScene(`<ellipse cx="186" cy="206" rx="96" ry="13" fill="#111" opacity=".05"/><polygon points="92.9,150.6 209.3,217.8 209.3,202.1 92.9,134.9" fill="#e07d45"/><polygon points="279.1,177.4 209.3,217.8 209.3,202.1 279.1,161.8" fill="#f3a56e"/><polygon points="92.9,134.9 209.3,202.1 279.1,161.8 162.7,94.6" fill="#f7c49a"/><ellipse cx="186" cy="158" rx="46" ry="16" fill="#e08a52"/><ellipse cx="186" cy="150" rx="46" ry="16" fill="#f3a56e"/><ellipse cx="186" cy="146" rx="36" ry="13" fill="#1d5ed8"/><path d="M150 112a36 13 0 0 0 72 0v34a36 13 0 0 1-72 0z" fill="#3d7ef5"/><ellipse cx="186" cy="112" rx="36" ry="13" fill="#7eb0ff"/><ellipse cx="174" cy="108" rx="12" ry="4" fill="#fff" opacity=".9"/>`),
    planScene(`<ellipse cx="186" cy="206" rx="96" ry="13" fill="#111" opacity=".05"/><polygon points="92.9,150.6 209.3,217.8 209.3,202.1 92.9,134.9" fill="#e07d45"/><polygon points="279.1,177.4 209.3,217.8 209.3,202.1 279.1,161.8" fill="#f3a56e"/><polygon points="92.9,134.9 209.3,202.1 279.1,161.8 162.7,94.6" fill="#f7c49a"/><ellipse cx="168" cy="124" rx="11" ry="4" fill="#1d5ed8"/><path d="M157 100a11 4 0 0 0 22 0v24a11 4 0 0 1-22 0z" fill="#4b8dff"/><ellipse cx="168" cy="100" rx="11" ry="4" fill="#d7e6ff"/><ellipse cx="214" cy="138" rx="11" ry="4" fill="#1d5ed8"/><path d="M203 114a11 4 0 0 0 22 0v24a11 4 0 0 1-22 0z" fill="#4b8dff"/><ellipse cx="214" cy="114" rx="11" ry="4" fill="#d7e6ff"/><ellipse cx="152" cy="158" rx="22" ry="8" fill="#e08a52"/><ellipse cx="152" cy="153" rx="22" ry="8" fill="#f7c9a4"/><ellipse cx="152" cy="153" rx="14" ry="5" fill="#fff4ea"/><ellipse cx="152" cy="150" rx="8" ry="3" fill="#e07d45"/><ellipse cx="214" cy="170" rx="22" ry="8" fill="#e08a52"/><ellipse cx="214" cy="165" rx="22" ry="8" fill="#f7c9a4"/><ellipse cx="214" cy="165" rx="14" ry="5" fill="#fff4ea"/><ellipse cx="214" cy="162" rx="8" ry="3" fill="#e07d45"/><rect x="185" y="96" width="4" height="54" rx="2" fill="#c96a3a"/><rect x="174" y="66" width="26" height="38" rx="13" fill="#d97842"/><rect x="178" y="73" width="18" height="24" rx="9" fill="#2f6fe0"/><path d="M182 80h10M182 86h10M182 92h10" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>`)
  ];
  const planSteps=document.getElementById('guide-plan-steps');
  (c.programSteps||[]).forEach((step,i)=>{
    const item=el('li');
    const badge=el('span','guide-plan-badge',String(i+1));
    badge.setAttribute('aria-hidden','true');
    const art=el('div','guide-plan-art');
    art.innerHTML=planArts[i]||'';
    item.append(badge,el('h4','',step.title),el('p','guide-plan-place',step.place),art);
    planSteps.append(item);
  });
})();
