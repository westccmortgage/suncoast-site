(function(){
  var ADS_ID='AW-18417657219';
  var LEAD_DESTINATION='AW-18417657219/LiA7CPWd4eocEIPLnM5E';
  var PENDING_KEY='suncoast_pending_lead';
  var params=new URLSearchParams(window.location.search);
  var keys=['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','gbraid','wbraid'];
  var saved={};

  function safeGet(key){try{return localStorage.getItem(key)||''}catch(e){return ''}}
  function safeSet(key,value){try{localStorage.setItem(key,value)}catch(e){}}
  function sessionGet(key){try{return sessionStorage.getItem(key)||''}catch(e){return ''}}
  function sessionSet(key,value){try{sessionStorage.setItem(key,value)}catch(e){}}
  function sessionRemove(key){try{sessionStorage.removeItem(key)}catch(e){}}
  function uid(){return 'sc_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,10)}

  keys.forEach(function(k){
    var v=params.get(k)||safeGet('suncoast_'+k)||'';
    if(v){saved[k]=v;safeSet('suncoast_'+k,v)}
  });
  var landing=safeGet('suncoast_landing_page')||window.location.href;
  if(!safeGet('suncoast_landing_page'))safeSet('suncoast_landing_page',landing);

  window.dataLayer=window.dataLayer||[];
  window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
  window.gtag('js',new Date());
  window.gtag('config',ADS_ID);
  if(!document.querySelector('script[data-suncoast-google-ads]')){
    var ads=document.createElement('script');
    ads.async=true;
    ads.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(ADS_ID);
    ads.setAttribute('data-suncoast-google-ads','');
    document.head.appendChild(ads);
  }

  function push(name,extra){window.dataLayer.push(Object.assign({event:name,page_location:window.location.href},extra||{}))}

  function markPending(form){
    var item={
      id:uid(),
      ts:Date.now(),
      form_name:form.getAttribute('name')||'suncoast-lead'
    };
    sessionSet(PENDING_KEY,JSON.stringify(item));
  }

  function fireConfirmedLead(){
    if(!/^\/thanks(?:\.html)?\/?$/.test(window.location.pathname))return;
    var raw=sessionGet(PENDING_KEY);
    if(!raw)return;
    var item;
    try{item=JSON.parse(raw)}catch(e){sessionRemove(PENDING_KEY);return}
    if(!item||!item.id||!item.ts||Date.now()-item.ts>30*60*1000){sessionRemove(PENDING_KEY);return}
    sessionRemove(PENDING_KEY);
    push('suncoast_lead_submit',{form_name:item.form_name,lead_event_id:item.id});
    window.gtag('event','conversion',{
      send_to:LEAD_DESTINATION,
      value:1.0,
      currency:'USD',
      transaction_id:item.id
    });
  }

  function languagePath(prefix,base){
    if(!base||base==='/') return prefix?prefix+'/':'/';
    return prefix?prefix+base+'/':base;
  }

  function injectLanguageLinks(){
    var nav=document.querySelector('.nav-inner');
    if(!nav||nav.querySelector('[data-suncoast-languages]'))return;
    var path=window.location.pathname.replace(/\/$/,'')||'/';
    var locale='en';
    var base=path;
    if(path==='/es'||path.indexOf('/es/')===0){locale='es';base=path.replace(/^\/es/,'')||'/'}
    if(path==='/pt-br'||path.indexOf('/pt-br/')===0){locale='pt';base=path.replace(/^\/pt-br/,'')||'/'}
    var supported=['/','/miami-dade-county-mortgage','/broward-county-mortgage','/palm-beach-county-mortgage'];
    if(supported.indexOf(base)===-1)return;
    var wrap=document.createElement('div');
    wrap.setAttribute('data-suncoast-languages','');
    wrap.setAttribute('role','group');
    wrap.setAttribute('aria-label','Language');
    [
      ['EN',languagePath('',base),'en'],
      ['ES',languagePath('/es',base),'es'],
      ['PT-BR',languagePath('/pt-br',base),'pt']
    ].forEach(function(item){
      var a=document.createElement('a');
      a.href=item[1];
      a.textContent=item[0];
      a.hreflang=item[2]==='pt'?'pt-BR':item[2];
      a.lang=item[2]==='pt'?'pt-BR':item[2];
      if(locale===item[2])a.setAttribute('aria-current','true');
      wrap.appendChild(a);
    });
    var menu=nav.querySelector('.nav-links');
    if(menu)menu.appendChild(wrap);else nav.insertBefore(wrap,nav.querySelector('.nav-phone')||null);
  }

  var ERR={
    en:['Your request could not be sent. Please try again or call ','.'],
    es:['No pudimos enviar su solicitud. Inténtelo de nuevo o llame al ','.'],
    pt:['Não foi possível enviar sua solicitação. Tente novamente ou ligue para ','.']
  };
  function showError(form){
    var l=(document.documentElement.lang||'en').toLowerCase().slice(0,2);
    var m=ERR[l]||ERR.en;
    var notice=form.querySelector('[data-submit-error]');
    if(!notice){notice=document.createElement('p');notice.setAttribute('data-submit-error','');notice.setAttribute('role','alert');form.appendChild(notice)}
    notice.textContent='';
    notice.appendChild(document.createTextNode(m[0]));
    var a=document.createElement('a');a.href='tel:+13106541577';a.textContent='(310) 654-1577';
    notice.appendChild(a);
    notice.appendChild(document.createTextNode(m[1]));
  }

  function initMenu(){
    var nav=document.querySelector('.nav');
    var btn=nav&&nav.querySelector('.nav-toggle');
    var links=nav&&nav.querySelector('.nav-links');
    if(!btn||!links)return;
    var root=document.documentElement;
    var open=false;
    var phone=nav.querySelector('.nav-inner > .nav-phone');
    if(phone&&!links.querySelector('.nav-phone-m')){
      var call=document.createElement('a');
      call.className='nav-phone-m';
      call.href=phone.getAttribute('href');
      call.textContent=phone.textContent;
      links.appendChild(call);
    }
    function fit(){
      if(open)links.style.maxHeight=Math.max(160,window.innerHeight-nav.getBoundingClientRect().bottom)+'px';
      else links.style.maxHeight='';
    }
    function set(next){
      open=next;
      btn.setAttribute('aria-expanded',open?'true':'false');
      nav.classList.toggle('menu-open',open);
      root.classList.toggle('menu-open',open);
      fit();
    }
    btn.addEventListener('click',function(e){e.stopPropagation();set(!open)});
    links.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('a'))set(false)});
    document.addEventListener('click',function(e){
      if(open&&!nav.contains(e.target)){e.preventDefault();e.stopPropagation();set(false)}
    },true);
    document.addEventListener('keydown',function(e){
      if((e.key==='Escape'||e.key==='Esc')&&open){set(false);btn.focus()}
    });
    window.addEventListener('resize',function(){if(window.innerWidth>900&&open)set(false);else fit()});
    window.addEventListener('pageshow',function(){if(open)set(false)});
  }

  document.addEventListener('DOMContentLoaded',function(){
    injectLanguageLinks();
    initMenu();
    document.querySelectorAll('form[data-suncoast-lead]').forEach(function(form){
      Object.keys(saved).forEach(function(k){var el=form.querySelector('[name="'+k+'"]');if(el)el.value=saved[k]});
      var lp=form.querySelector('[name="landing_page"]');if(lp)lp.value=landing;
      var sp=form.querySelector('[name="submission_page"]');if(sp)sp.value=window.location.href;
      var sending=false;
      form.addEventListener('submit',async function(event){
        event.preventDefault();
        if(sending)return;
        sending=true;
        var button=form.querySelector('button[type="submit"]');
        if(button)button.disabled=true;
        form.setAttribute('aria-busy','true');
        var notice0=form.querySelector('[data-submit-error]');if(notice0)notice0.remove();
        if(sp)sp.value=window.location.href;
        sessionRemove(PENDING_KEY);
        try{
          var response=await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(form)).toString()});
          if(!response.ok)throw new Error('Submission failed');
          markPending(form);
          window.location.assign(form.getAttribute('action')||'/thanks');
        }catch(error){
          sending=false;
          if(button)button.disabled=false;
          form.removeAttribute('aria-busy');
          showError(form);
        }
      })
    });
    document.querySelectorAll('a[href^="tel:"]').forEach(function(a){
      a.addEventListener('click',function(){push('suncoast_phone_click',{phone:a.getAttribute('href').replace('tel:','')})})
    });
    document.querySelectorAll('[data-application-start]').forEach(function(a){
      a.addEventListener('click',function(){push('suncoast_application_start',{destination:a.href})})
    });
    document.querySelectorAll('[data-property-review]').forEach(function(a){
      a.addEventListener('click',function(){push('suncoast_property_review_start',{destination:a.href})})
    });
    fireConfirmedLead();
  })
})();
