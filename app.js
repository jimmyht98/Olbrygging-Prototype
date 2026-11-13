(function(){
  var KEY = 'ambassador-proto-v1';
  var INTERESTS = ['Ølbrygging','Grill og BBQ','Pizza'];
  var CHANNELS = ['Messenger','E-post','Teams'];
  var SUGS = [
    {id:'s1',name:'Startsett for IPA, 20 liter',cat:'Ølbrygging',hot:true,svar:'20. november',frist:'11. desember'},
    {id:'s2',name:'Pizzastein, 38 cm',cat:'Pizza',hot:false,svar:'27. november',frist:'18. desember'},
    {id:'s3',name:'Røykflis av eple, 1 kg',cat:'Grill og BBQ',hot:true,svar:'20. november',frist:'11. desember'},
    {id:'s4',name:'Tørrgjær for lager, 5 pakker',cat:'Ølbrygging',hot:false,svar:'27. november',frist:'8. januar'},
    {id:'s5',name:'Steketermometer med to følere',cat:'Grill og BBQ',hot:false,svar:'4. desember',frist:'15. januar'}
  ];
  var SLOTS = ['Torsdag 3. desember kl. 19.00','Mandag 7. desember kl. 12.00','Onsdag 9. desember kl. 20.00'];
  var OTHERS = [
    {name:'Jonas Berg',kanal:'E-post',cap:'Litt tid',interests:'Ølbrygging',venter:1,ja:2,nei:0,frist:'20. november',innsjekk:'Tirsdag 1. desember kl. 18.00, bekreftet',note:'Ba om mer tid på forrige oppdrag.'},
    {name:'Selma Dahl',kanal:'Messenger',cap:'Pause',interests:'Grill og BBQ, Pizza',venter:0,ja:1,nei:1,frist:'Ingen',innsjekk:'Februar',note:'På pause siden 2. november.'},
    {name:'Henrik Moen',kanal:'Teams',cap:'God tid',interests:'Ølbrygging, Grill og BBQ',venter:2,ja:3,nei:1,frist:'20. november',innsjekk:'Fredag 4. desember kl. 12.00, ikke bekreftet',note:'Publiserte sist 9. november.'}
  ];
  var EVQ = [
    {k:'q1',s:'Produkt',t:'Hvordan passet produktet deg?',o:['Bra','Greit','Dårlig']},
    {k:'q2',s:'Frist',t:'Hvordan var fristen?',o:['Romslig','Passe','For kort']},
    {k:'q3',s:'Hjelp',t:'Fikk du hjelpen du trengte fra Carsten?',o:['Ja','Delvis','Nei']},
    {k:'next',s:'Ønsker',t:'Hva vil du videre?',o:['Nytt oppdrag','Pause']}
  ];

  function fresh(){
    return {cap:'god',interests:INTERESTS.slice(),answers:{},status:{},signed:false,
            channel:'Messenger',slot:0,slotOk:false,picking:false,sent:[],evals:{}};
  }
  var S = fresh();
  try{ var raw = localStorage.getItem(KEY); if(raw){ S = Object.assign(fresh(), JSON.parse(raw)); } }catch(e){}
  function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }

  function $(id){ return document.getElementById(id); }
  function el(tag, cls, text){ var n=document.createElement(tag); if(cls) n.className=cls; if(text!=null) n.textContent=text; return n; }
  function btn(text, action, data, cls){
    var b = el('button', cls == null ? 'btn' : cls, text); b.dataset.action = action;
    for(var k in (data||{})) b.dataset[k] = data[k];
    return b;
  }

  var toastTimer;
  function toast(t){
    var n=$('toast'); n.textContent=t; n.classList.add('show');
    clearTimeout(toastTimer); toastTimer=setTimeout(function(){ n.classList.remove('show'); }, 2600);
  }

  function visible(){
    if(S.cap==='pause') return [];
    return SUGS.filter(function(s){
      return S.interests.indexOf(s.cat)>-1 && (S.cap==='god' || s.hot);
    });
  }
  function openSugs(){ return visible().filter(function(s){ return !S.answers[s.id]; }); }

  /* Oversikt */
  function renderOverview(){
    var text = {
      god:'Du får alle forslag innen interessene dine.',
      litt:'Du får bare forslag Ølbrygging har merket som viktige.',
      pause:'Du får ingen nye forslag. Carsten får beskjed. Avtalen din gjelder fortsatt.'
    };
    var fill = {god:'85%',litt:'40%',pause:'6%'};
    $('capText').textContent = text[S.cap];
    $('capFill').style.height = fill[S.cap];
    Array.prototype.forEach.call($('capSeg').children, function(b){
      b.setAttribute('aria-pressed', String(b.dataset.v===S.cap));
    });

    var open = openSugs();
    var facts = $('facts'); facts.textContent='';
    function fact(label, value, href){
      var p = el('div','panel'); p.appendChild(el('p',null,label));
      var v = el('p');
      if(href){ var a=el('a',null,value); a.href=href; v.appendChild(a); } else { v.textContent=value; }
      p.appendChild(v); facts.appendChild(p);
    }
    fact('Forslag som venter på svar', open.length ? open.length + ' forslag' : 'Ingen', open.length ? '#forslag' : null);
    fact('Neste svarfrist', open.length ? open[0].svar : 'Ingen frister nå');
    fact('Neste innsjekk med Carsten', SLOTS[S.slot], '#avtale');

    var acc = $('accepted'); acc.textContent='';
    var mine = SUGS.filter(function(s){ return S.answers[s.id]==='innhold' || S.answers[s.id]==='produkt'; });
    if(!mine.length){
      var p = el('div','panel');
      p.appendChild(el('p',null,'Du har ikke sagt ja til noe ennå.'));
      var a = el('a',null,'Se forslagene dine'); a.href='#forslag';
      var w = el('p'); w.style.marginTop='.4rem'; w.appendChild(a); p.appendChild(w);
      acc.appendChild(p); return;
    }
    mine.forEach(function(s){
      var p = el('div','panel stack');
      p.appendChild(el('h3',null,s.name));
      var st = S.status[s.id];
      if(S.answers[s.id]==='produkt'){
        p.appendChild(el('p','muted','Du får produktet uten løfte om innhold.'));
      } else if(st==='publisert'){
        p.appendChild(el('p',null,'Publisert. Carsten har fått beskjed.'));
        renderEval(p, s);
      } else {
        p.appendChild(el('p',null, st==='utsatt' ? 'Du har bedt om mer tid. Carsten foreslår ny frist.' : 'Innhold innen ' + s.frist + '.'));
        var r = el('div','row');
        r.appendChild(btn('Marker som publisert','status',{id:s.id,v:'publisert'}));
        if(st!=='utsatt') r.appendChild(btn('Be om mer tid','status',{id:s.id,v:'utsatt'},'btn ghost'));
        p.appendChild(r);
      }
      acc.appendChild(p);
    });
  }

  /* Forslag */
  function renderSuggestions(){
    var chips = $('chips'); chips.textContent='';
    INTERESTS.forEach(function(i){
      var b = btn(i,'interest',{v:i},''); b.setAttribute('aria-pressed', String(S.interests.indexOf(i)>-1));
      chips.appendChild(b);
    });

    var open = openSugs(), list = $('openList'); list.textContent='';
    if(!open.length){
      var msg = S.cap==='pause' ? 'Du har satt samarbeidet på pause. Endre dette på Oversikt når du vil ha forslag igjen.'
              : !S.interests.length ? 'Velg minst én interesse for å få forslag.'
              : 'Du har svart på alle forslagene. Nye forslag kommer etter neste innsjekk.';
      var e = el('div','panel'); e.appendChild(el('p',null,msg)); list.appendChild(e);
    }
    open.forEach(function(s){
      var p = el('article','panel sug');
      var h = el('header'); h.appendChild(el('h3',null,s.name));
      h.appendChild(el('span', s.hot ? 'tag hot' : 'tag', s.hot ? 'Viktig for Ølbrygging nå' : 'Når du har tid'));
      p.appendChild(h);
      p.appendChild(el('p','muted', 'Foreslått fordi du har valgt ' + s.cat + '.' + (s.hot ? ' Produktet selger lite i dag, og innhold fra deg hjelper mest her.' : '')));
      var dl = el('dl','dates');
      dl.appendChild(el('dt',null,'Svar innen')); dl.appendChild(el('dd',null,s.svar));
      dl.appendChild(el('dt',null,'Innhold innen')); dl.appendChild(el('dd',null,s.frist));
      p.appendChild(dl);
      var r = el('div','row');
      r.appendChild(btn('Ja, jeg lager innhold','answer',{id:s.id,v:'innhold'}));
      r.appendChild(btn('Ja, uten løfte om innhold','answer',{id:s.id,v:'produkt'},'btn ghost'));
      r.appendChild(btn('Nei takk','answer',{id:s.id,v:'nei'},'btn ghost'));
      p.appendChild(r);
      list.appendChild(p);
    });

    var done = SUGS.filter(function(s){ return S.answers[s.id]; }), dl2 = $('doneList'); dl2.textContent='';
    if(!done.length){
      var e2 = el('div','panel'); e2.appendChild(el('p','muted','Svarene dine vises her.')); dl2.appendChild(e2);
    }
    var label = {innhold:'Du sa ja og lager innhold innen ',produkt:'Du sa ja til produktet, uten løfte om innhold.',nei:'Du sa nei takk.'};
    done.forEach(function(s){
      var p = el('div','panel stack');
      p.appendChild(el('h3',null,s.name));
      var a = S.answers[s.id];
      p.appendChild(el('p','answer', a==='innhold' ? label.innhold + s.frist + '.' : label[a]));
      p.appendChild(btn('Angre svaret','undo',{id:s.id},'btn link'));
      dl2.appendChild(p);
    });

    $('navCount').textContent = open.length || '';
    $('navCount').style.display = open.length ? '' : 'none';
  }

  /* Avtale */
  function renderAgreement(){
    var box = $('signBox'); box.textContent='';
    if(S.signed){
      box.appendChild(el('p','answer','Du godtok avtalen 13. november 2026.'));
    } else {
      box.appendChild(btn('Godta avtalen','sign'));
    }
    var c = $('checkin'); c.textContent='';
    c.appendChild(el('h3',null,SLOTS[S.slot]));
    c.appendChild(el('p','muted','15 minutter med Carsten på ' + S.channel + '. Dere går gjennom hva som fungerte, og hva du har lyst til å lage videre. Neste innsjekk etter denne er i februar.'));
    if(S.picking){
      var g = el('div','chips'); g.setAttribute('role','group'); g.setAttribute('aria-label','Velg tidspunkt');
      SLOTS.forEach(function(t,i){ g.appendChild(btn(t,'slot',{i:i},'')); });
      c.appendChild(g);
    } else {
      if(S.slotOk) c.appendChild(el('p','answer','Du har bekreftet tidspunktet.'));
      var r = el('div','row');
      if(!S.slotOk) r.appendChild(btn('Tidspunktet passer','slotok'));
      r.appendChild(btn('Velg et annet tidspunkt','pick',{},'btn ghost'));
      c.appendChild(r);
    }
  }

  /* Kontakt */
  function renderContact(){
    var ch = $('channels'); ch.textContent='';
    CHANNELS.forEach(function(n){
      var b = btn(n,'channel',{v:n},''); b.setAttribute('aria-pressed', String(S.channel===n)); ch.appendChild(b);
    });
    var sent = $('sent'); sent.textContent='';
    if(!S.sent.length){ sent.appendChild(el('p','muted','Du har ikke sendt noen meldinger ennå.')); return; }
    var ul = el('ul','plain');
    S.sent.slice().reverse().forEach(function(m){
      var li = el('li');
      li.appendChild(el('p','muted small', m.topic + ', ' + m.time));
      li.appendChild(el('p',null,m.text));
      ul.appendChild(li);
    });
    sent.appendChild(ul);
    sent.appendChild(el('p','muted small','Carsten svarer deg på ' + S.channel + '.'));
  }

  /* Evaluering etter publisert innhold */
  function renderEval(p, s){
    var e = S.evals[s.id] || {};
    if(e.sent){ p.appendChild(el('p','answer','Tilbakemelding sendt. Du valgte ' + (e.next==='Pause' ? 'pause' : 'nytt oppdrag') + '.')); return; }
    if(!e.open){ var r0 = el('div'); r0.appendChild(btn('Gi tilbakemelding','evopen',{id:s.id})); p.appendChild(r0); return; }
    EVQ.forEach(function(q){
      var w = el('div');
      var t = el('p',null,q.t); t.style.fontWeight='500'; t.style.marginBottom='.4rem'; w.appendChild(t);
      var g = el('div','chips'); g.setAttribute('role','group'); g.setAttribute('aria-label',q.t);
      q.o.forEach(function(o){
        var b = btn(o,'evset',{id:s.id,k:q.k,v:o},''); b.setAttribute('aria-pressed', String(e[q.k]===o)); g.appendChild(b);
      });
      w.appendChild(g); p.appendChild(w);
    });
    if(e.err) p.appendChild(el('p','err','Svar på alle fire spørsmålene før du sender.'));
    var r = el('div'); r.appendChild(btn('Send tilbakemelding','evsend',{id:s.id})); p.appendChild(r);
  }

  /* Ansattvisning */
  function renderStaff(){
    var capLabel = {god:'God tid',litt:'Litt tid',pause:'Pause'};
    var open = openSugs();
    var answered = SUGS.filter(function(s){ return S.answers[s.id]; });
    var ja = answered.filter(function(s){ return S.answers[s.id]!=='nei'; });
    var nora = {live:true,name:'Nora Lie',kanal:S.channel,cap:capLabel[S.cap],
      interests:S.interests.join(', ') || 'Ingen valgt',
      venter:open.length,ja:ja.length,nei:answered.length-ja.length,
      frist:open.length ? open[0].svar : 'Ingen',
      innsjekk:SLOTS[S.slot] + (S.slotOk ? ', bekreftet' : ', ikke bekreftet')};
    var people = [nora].concat(OTHERS);

    var facts = $('staffFacts'); facts.textContent='';
    function fact(label, value){
      var p = el('div','panel'); p.appendChild(el('p',null,label)); p.appendChild(el('p',null,value)); facts.appendChild(p);
    }
    fact('Forslag uten svar', String(people.reduce(function(n,x){ return n + x.venter; },0)));
    fact('Ambassadører på pause', String(people.filter(function(x){ return x.cap==='Pause'; }).length));
    fact('Meldinger til deg', String(S.sent.length));

    var list = $('staffList'); list.textContent='';
    people.forEach(function(x){
      var p = el('article','panel stack');
      var h = el('div','row'); h.style.justifyContent='space-between';
      h.appendChild(el('h3',null,x.name));
      h.appendChild(el('span', x.cap==='Pause' ? 'tag hot' : 'tag', x.cap));
      p.appendChild(h);
      var dl = el('dl','dates');
      function line(k,v){ dl.appendChild(el('dt',null,k)); dl.appendChild(el('dd',null,v)); }
      line('Kanal', x.kanal);
      line('Interesser', x.interests);
      line('Forslag', x.venter + ' venter, ' + x.ja + ' ja, ' + x.nei + ' nei');
      line('Neste svarfrist', x.frist);
      line('Neste innsjekk', x.innsjekk);
      if(x.live) line('Avtale', S.signed ? 'Godtatt 13. november 2026' : 'Ikke godtatt ennå');
      p.appendChild(dl);
      if(x.note) p.appendChild(el('p','muted',x.note));
      if(x.live){
        if(answered.length){
          var b1 = el('div'); var t1 = el('p',null,'Svar og status'); t1.style.fontWeight='600'; t1.style.marginBottom='.4rem'; b1.appendChild(t1);
          var ul = el('ul','plain');
          answered.forEach(function(s){
            var a = S.answers[s.id], st = S.status[s.id];
            var txt = a==='nei' ? 'Nei takk' : a==='produkt' ? 'Ja, uten løfte om innhold'
                    : st==='publisert' ? 'Publisert' : st==='utsatt' ? 'Ber om mer tid' : 'Lager innhold innen ' + s.frist;
            var li = el('li'); li.appendChild(el('p',null,s.name + ': ' + txt + '.'));
            var e = S.evals[s.id];
            if(e && e.sent){
              li.appendChild(el('p','muted small','Tilbakemelding. ' + EVQ.map(function(q){ return q.s + ': ' + e[q.k]; }).join('. ') + '.'));
            }
            ul.appendChild(li);
          });
          b1.appendChild(ul); p.appendChild(b1);
        }
        if(S.sent.length){
          var b2 = el('div'); var t2 = el('p',null,'Meldinger fra Nora'); t2.style.fontWeight='600'; t2.style.marginBottom='.4rem'; b2.appendChild(t2);
          var ul2 = el('ul','plain');
          S.sent.slice().reverse().forEach(function(m){
            var li = el('li'); li.appendChild(el('p','muted small', m.topic + ', ' + m.time)); li.appendChild(el('p',null,m.text)); ul2.appendChild(li);
          });
          b2.appendChild(ul2);
          b2.appendChild(el('p','muted small','Du svarer Nora på ' + S.channel + '.'));
          p.appendChild(b2);
        }
        p.appendChild(el('p','muted small','Denne raden oppdateres fra Noras side.'));
      }
      list.appendChild(p);
    });
  }

  function render(){ renderOverview(); renderSuggestions(); renderAgreement(); renderContact(); renderStaff(); save(); }

  /* Ruting */
  var VIEWS = ['oversikt','forslag','avtale','kontakt','ansatt'];
  function route(){
    var v = location.hash.replace('#','');
    if(VIEWS.indexOf(v)<0) v='oversikt';
    VIEWS.forEach(function(n){ $('v-'+n).classList.toggle('on', n===v); });
    Array.prototype.forEach.call(document.querySelectorAll('nav.tabs a'), function(a){
      if(a.dataset.tab===v) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
    });
    var staff = v==='ansatt';
    document.body.classList.toggle('staff', staff);
    $('brandRole').textContent = staff ? 'ansatt' : 'ambassadør';
    var sw = $('switch');
    sw.href = staff ? '#oversikt' : '#ansatt';
    sw.textContent = staff ? 'Tilbake til ambassadørsiden' : 'Åpne ansattvisningen';
    window.scrollTo(0,0);
  }
  window.addEventListener('hashchange', route);

  document.addEventListener('click', function(ev){
    var b = ev.target.closest('[data-action]'); if(!b) return;
    var d = b.dataset;
    switch(d.action){
      case 'cap':
        S.cap = d.v;
        toast(d.v==='pause' ? 'Samarbeidet er satt på pause.' : 'Kapasiteten din er oppdatert.');
        break;
      case 'interest':
        var i = S.interests.indexOf(d.v);
        if(i>-1) S.interests.splice(i,1); else S.interests.push(d.v);
        break;
      case 'answer':
        S.answers[d.id] = d.v;
        toast(d.v==='nei' ? 'Du sa nei takk.' : 'Du sa ja. Carsten sender produktet.');
        break;
      case 'undo':
        delete S.answers[d.id]; delete S.status[d.id]; delete S.evals[d.id];
        toast('Svaret er angret.');
        break;
      case 'status':
        S.status[d.id] = d.v;
        toast(d.v==='publisert' ? 'Markert som publisert.' : 'Carsten har fått beskjed om at du trenger mer tid.');
        break;
      case 'theme':
        var nt = curTheme()==='dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nt);
        try{ localStorage.setItem(TKEY, nt); }catch(e){}
        paintTheme();
        break;
      case 'evopen': S.evals[d.id] = {open:true}; break;
      case 'evset':
        var ev = S.evals[d.id] || (S.evals[d.id] = {open:true});
        ev[d.k] = d.v;
        break;
      case 'evsend':
        var es = S.evals[d.id] || (S.evals[d.id] = {open:true});
        if(!(es.q1 && es.q2 && es.q3 && es.next)){ es.err = true; break; }
        es.err = false; es.sent = true;
        if(es.next==='Pause'){ S.cap = 'pause'; toast('Tilbakemelding sendt. Samarbeidet er satt på pause.'); }
        else { toast('Tilbakemelding sendt. Carsten sender nye forslag.'); }
        break;
      case 'sign': S.signed = true; toast('Avtalen er godtatt.'); break;
      case 'slotok': S.slotOk = true; toast('Tidspunktet er bekreftet.'); break;
      case 'pick': S.picking = true; break;
      case 'slot': S.slot = Number(d.i); S.picking = false; S.slotOk = true; toast('Nytt tidspunkt er valgt.'); break;
      case 'channel': S.channel = d.v; toast('Carsten skriver til deg på ' + d.v + '.'); break;
      case 'copy':
        try{ navigator.clipboard.writeText('NORA10'); }catch(e){}
        toast('Koden er kopiert.');
        break;
      case 'send':
        var t = $('msg').value.trim();
        $('msgErr').hidden = !!t;
        if(!t){ $('msg').focus(); return; }
        var now = new Date();
        S.sent.push({topic:$('topic').value, text:t,
          time: now.toLocaleDateString('nb-NO',{day:'numeric',month:'long'}) + ' kl. ' + now.toLocaleTimeString('nb-NO',{hour:'2-digit',minute:'2-digit'})});
        $('msg').value='';
        toast('Meldingen er sendt.');
        break;
      case 'reset':
        S = fresh(); $('msg').value=''; $('msgErr').hidden = true;
        toast('Testen er nullstilt.');
        location.hash = 'oversikt';
        break;
    }
    render();
  });

  var TKEY = 'ambassador-proto-theme';
  function curTheme(){
    var t = document.documentElement.getAttribute('data-theme');
    if(t==='light' || t==='dark') return t;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function paintTheme(){ $('themeBtn').textContent = curTheme()==='dark' ? 'Lys modus' : 'Mørk modus'; }
  try{
    var savedTheme = localStorage.getItem(TKEY);
    if(savedTheme==='light' || savedTheme==='dark') document.documentElement.setAttribute('data-theme', savedTheme);
  }catch(e){}
  try{ window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', paintTheme); }catch(e){}
  paintTheme();

  render(); route();
})();
