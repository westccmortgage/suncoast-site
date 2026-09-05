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
    return (prefix||'')+base;
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
    wrap.setAttribute('aria-label','Language');
    wrap.style.cssText='display:flex;align-items:center;gap:7px;font-size:11px;font-weight:800;letter-spacing:.08em;white-space:nowrap';
    [
      ['EN',languagePath('',base),'en'],
      ['ES',languagePath('/es',base),'es'],
      ['PT-BR',languagePath('/pt-br',base),'pt']
    ].forEach(function(item){
      var a=document.createElement('a');
      a.href=item[1];
      a.textContent=item[0];
      a.hreflang=item[2]==='pt'?'pt-BR':item[2];
      a.style.cssText='text-decoration:none;color:'+(locale===item[2]?'#173452':'#748391')+';padding:5px 3px;border-bottom:2px solid '+(locale===item[2]?'#f3a51e':'transparent');
      wrap.appendChild(a);
    });
    var phone=nav.querySelector('.nav-phone');
    nav.insertBefore(wrap,phone||null);
  }

  document.addEventListener('DOMContentLoaded',function(){
    injectLanguageLinks();
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
          var notice=form.querySelector('[data-submit-error]');
          if(!notice){notice=document.createElement('p');notice.setAttribute('data-submit-error','');notice.setAttribute('role','alert');form.appendChild(notice)}
          notice.textContent='Your request could not be sent. Please try again.';
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
