(function(){
  var params=new URLSearchParams(window.location.search);
  var keys=['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','gbraid','wbraid'];
  var saved={};
  keys.forEach(function(k){
    var v=params.get(k)||localStorage.getItem('suncoast_'+k)||'';
    if(v){saved[k]=v;localStorage.setItem('suncoast_'+k,v)}
  });
  var landing=localStorage.getItem('suncoast_landing_page')||window.location.href;
  if(!localStorage.getItem('suncoast_landing_page'))localStorage.setItem('suncoast_landing_page',landing);
  window.dataLayer=window.dataLayer||[];
  function push(name,extra){window.dataLayer.push(Object.assign({event:name,page_location:window.location.href},extra||{}))}

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
      form.addEventListener('submit',function(){push('suncoast_lead_submit',{form_name:form.getAttribute('name')||'suncoast-lead'})})
    });
    document.querySelectorAll('a[href^="tel:"]').forEach(function(a){
      a.addEventListener('click',function(){push('suncoast_phone_click',{phone:a.getAttribute('href').replace('tel:','')})})
    });
    document.querySelectorAll('[data-application-start]').forEach(function(a){
      a.addEventListener('click',function(){push('suncoast_application_start',{destination:a.href})})
    });
    document.querySelectorAll('[data-property-review]').forEach(function(a){
      a.addEventListener('click',function(){push('suncoast_property_review_start',{destination:a.href})})
    })
  })
})();
