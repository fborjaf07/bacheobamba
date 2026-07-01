/* ──────────────────────────────────────────────
   BACHEOBAMBA · app.js
   Lógica preservada del original (auth, IndexedDB,
   GitHub sync, wizard, mapa, panel técnico).
────────────────────────────────────────────── */

/* ── SHA-256 ── */
function sha256(str){
  const K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  function rotr(x,n){return(x>>>n)|(x<<(32-n));}
  const b2=[];
  for(let i=0;i<str.length;i++){
    const c=str.charCodeAt(i);
    if(c<128)b2.push(c);
    else if(c<2048)b2.push(192|(c>>6),128|(c&63));
    else b2.push(224|(c>>12),128|((c>>6)&63),128|(c&63));
  }
  const bl2=b2.length*8;
  b2.push(0x80);
  while(b2.length%64!==56)b2.push(0);
  for(let i=3;i>=0;i--)b2.push(0);
  b2.push((bl2>>>24)&255,(bl2>>>16)&255,(bl2>>>8)&255,bl2&255);
  let h0=0x6a09e667,h1=0xbb67ae85,h2=0x3c6ef372,h3=0xa54ff53a;
  let h4=0x510e527f,h5=0x9b05688c,h6=0x1f83d9ab,h7=0x5be0cd19;
  for(let i=0;i<b2.length;i+=64){
    const w=[];
    for(let j=0;j<16;j++)w[j]=(b2[i+j*4]<<24)|(b2[i+j*4+1]<<16)|(b2[i+j*4+2]<<8)|b2[i+j*4+3];
    for(let j=16;j<64;j++){
      const s0=rotr(w[j-15],7)^rotr(w[j-15],18)^(w[j-15]>>>3);
      const s1=rotr(w[j-2],17)^rotr(w[j-2],19)^(w[j-2]>>>10);
      w[j]=(w[j-16]+s0+w[j-7]+s1)>>>0;
    }
    let a=h0,b=h1,c=h2,d=h3,e=h4,f=h5,g=h6,h=h7;
    for(let j=0;j<64;j++){
      const S1=rotr(e,6)^rotr(e,11)^rotr(e,25);
      const ch=(e&f)^(~e&g);
      const t1=(h+S1+ch+K[j]+w[j])>>>0;
      const S0=rotr(a,2)^rotr(a,13)^rotr(a,22);
      const maj=(a&b)^(a&c)^(b&c);
      const t2=(S0+maj)>>>0;
      h=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0;
    }
    h0=(h0+a)>>>0;h1=(h1+b)>>>0;h2=(h2+c)>>>0;h3=(h3+d)>>>0;
    h4=(h4+e)>>>0;h5=(h5+f)>>>0;h6=(h6+g)>>>0;h7=(h7+h)>>>0;
  }
  return[h0,h1,h2,h3,h4,h5,h6,h7].map(v=>v.toString(16).padStart(8,'0')).join('');
}

/* ── LS ── */
const LS={g:k=>{try{return JSON.parse(localStorage.getItem(k));}catch{return null;}},
  s:(k,v)=>localStorage.setItem(k,JSON.stringify(v)),r:k=>localStorage.removeItem(k)};

/* ── GITHUB ── */
const GH={
  owner:'fborjaf07',repo:'bacheobamba',file:'baches-data.json',branch:'main',
  get token(){return LS.g('bb_gh_token')||'';},
  get api(){return 'https://api.github.com/repos/'+this.owner+'/'+this.repo+'/contents/'+this.file;}
};
const GH_OBRAS='https://raw.githubusercontent.com/fborjaf07/obras-publicas/main/baches-data.json';

const HASH_1234 = sha256("1234");

function initDatos(){
  const usActual = LS.g("bb_u");
  const hashValido = /^[0-9a-f]{64}$/;
  if(usActual && usActual.some(u => !hashValido.test(u.hash))){LS.r("bb_u");}
  if(!LS.g("bb_u"))LS.s("bb_u",[
    {id:"fabian",nombre:"Fabian Borja",nc:"Fabian Borja",rol:"admin",hash:HASH_1234,primerLogin:true,preg:"",respH:""},
    {id:"tatiana",nombre:"Tatiana",nc:"Tatiana",rol:"tecnico",hash:HASH_1234,primerLogin:true,preg:"",respH:""},
    {id:"patricio",nombre:"Patricio",nc:"Patricio",rol:"tecnico",hash:HASH_1234,primerLogin:true,preg:"",respH:""},
  ]);
  if(!LS.g("bb_r"))LS.s("bb_r",[]);
  if(!LS.g("bb_c"))LS.s("bb_c",[]);
}

/* ── SESIÓN ── */
let _st=null,_sa=null;
const SD=30*60*1000;
function getSes(){return LS.g('bb_s');}
function setSes(uid){LS.s('bb_s',{uid,exp:Date.now()+SD});startST();}
function delSes(){LS.r('bb_s');clearTimeout(_st);clearTimeout(_sa);document.getElementById('ses-av').classList.remove('on');}
function sesOk(){const s=getSes();return s&&s.exp>Date.now();}
function startST(){
  clearTimeout(_st);clearTimeout(_sa);
  const s=getSes();if(!s)return;
  const rem=s.exp-Date.now(),av=rem-5*60*1000;
  if(av>0)_sa=setTimeout(()=>document.getElementById('ses-av').classList.add('on'),av);
  _st=setTimeout(()=>cerrarSes(true),rem);
  tickT();
}
function tickT(){
  const s=getSes();if(!s)return;
  const rem=s.exp-Date.now();if(rem<=0)return;
  const el=document.getElementById('p-timer');
  if(el)el.textContent=`${Math.floor(rem/60000)}:${Math.floor((rem%60000)/1000).toString().padStart(2,'0')}`;
  setTimeout(tickT,1000);
}

/* ── HELPERS ── */
function ao(id){document.getElementById(id).classList.add('on');}
function co(id){const e=document.getElementById(id);if(e)e.classList.remove('on');}
let _nT=null;
function notif(msg,tipo=''){
  const e=document.getElementById('notif');e.textContent=msg;e.className='notif on'+(tipo?' '+tipo:'');
  clearTimeout(_nT);_nT=setTimeout(()=>e.classList.remove('on'),3200);
}
function fFecha(iso){if(!iso)return'';const d=new Date(iso);return d.toLocaleDateString('es-EC',{day:'2-digit',month:'short',year:'numeric'});}
function escH(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
/* ── PRIVACIDAD: enmascarado de datos publicados ── */
function maskNombre(n){
  const partes=String(n||'').trim().split(/\s+/).filter(Boolean);
  if(!partes.length)return '';
  return partes.slice(0,2).map(p=>p[0].toUpperCase()+'.').join(' ');
}
function gpsPub(v){return v==null?null:Number(parseFloat(v).toFixed(4));}
function claveDebil(c){
  const x=String(c||'').toLowerCase();
  const debiles=['12345678','123456789','contrasena','password','riobamba','bacheobamba','11111111','00000000','qwertyui'];
  if(debiles.includes(x))return true;
  if(/^(\d)\1+$/.test(x))return true;          // todos iguales
  if(/^(0123456789|9876543210)/.test(x))return true; // secuencias
  return false;
}
function fId(){return'R'+Date.now()+Math.random().toString(36).slice(2,6);}
function verFoto(src,lbl){document.getElementById('fv-img').src=src;document.getElementById('fv-lbl').textContent=lbl||'';document.getElementById('fv').classList.add('on');}

/* ── IndexedDB ── */
let _idb=null;
function abrirIDB(){
  return new Promise((res,rej)=>{
    if(_idb){res(_idb);return;}
    const req=indexedDB.open('bacheobamba_fotos',1);
    req.onupgradeneeded=e=>{e.target.result.createObjectStore('fotos');};
    req.onsuccess=e=>{_idb=e.target.result;res(_idb);};
    req.onerror=()=>rej(req.error);
  });
}
async function idbGuardar(clave,blob){
  const db=await abrirIDB();
  return new Promise((res,rej)=>{
    const tx=db.transaction('fotos','readwrite');
    tx.objectStore('fotos').put(blob,clave);
    tx.oncomplete=()=>res(true);
    tx.onerror=()=>rej(tx.error);
  });
}
async function idbLeer(clave){
  const db=await abrirIDB();
  return new Promise((res,rej)=>{
    const tx=db.transaction('fotos','readonly');
    const req=tx.objectStore('fotos').get(clave);
    req.onsuccess=()=>res(req.result||null);
    req.onerror=()=>rej(req.error);
  });
}
async function idbBorrar(clave){
  const db=await abrirIDB();
  return new Promise((res)=>{
    const tx=db.transaction('fotos','readwrite');
    tx.objectStore('fotos').delete(clave);
    tx.oncomplete=()=>res();
  });
}
function blobABase64(blob){
  return new Promise((res,rej)=>{
    const r=new FileReader();
    r.onload=e=>res(e.target.result.split(',')[1]);
    r.onerror=()=>rej(r.error);
    r.readAsDataURL(blob);
  });
}

/* ── WIZARD ── */
let _wizModo='ciudadano';
let _wizAtenId=null;
let _wizGPSok=false;
let _wizFotoOk=false;
let _wizDespOk=false;
let _wizTipo='';
let _wizLat=null, _wizLng=null;
let _wizClaveFotoAntes=null, _wizClaveFotoDesp=null;

function selTipo(btn, tipo){
  document.querySelectorAll('.tipo-btn').forEach(b=>b.classList.remove('sel'));
  btn.classList.add('sel');
  _wizTipo=tipo;
  document.getElementById('wiz-tipo').value=tipo;
  wiz_checkEnviar();
}

function wiz_updInd(){
  const iF=document.getElementById('wind-foto');
  iF.className='wiz-ind'+(_wizFotoOk?' listo':'');
  const iG=document.getElementById('wind-gps');
  iG.className='wiz-ind'+(_wizGPSok?' listo':'');
  const iS=document.getElementById('wind-guardar');
  const todoListo=_wizModo==='atender'
    ?(_wizGPSok&&_wizDespOk&&document.getElementById('wiz-obs').value.trim())
    :(_wizFotoOk&&_wizGPSok&&_wizTipo);
  iS.className='wiz-ind'+(todoListo?' listo activo':'');
}

function abrirWizard(modo, repId=null){
  _wizModo=modo; _wizAtenId=repId;
  _wizGPSok=false; _wizFotoOk=false; _wizDespOk=false;
  _wizTipo=''; _wizLat=null; _wizLng=null;
  _wizClaveFotoAntes=null; _wizClaveFotoDesp=null;
  document.getElementById('wiz-foto-inp').value='';
  const prev=document.getElementById('wiz-foto-prev');
  prev.src='';prev.classList.remove('on');
  document.getElementById('btn-refoto').classList.remove('on');
  const tap=document.getElementById('foto-tap');
  tap.classList.remove('listo');
  document.getElementById('ft-title').textContent='Toca para tomar la foto';
  document.getElementById('ft-sub').textContent='Apunta la cámara al bache';
  document.getElementById('gps-result').className='gps-result';
  document.getElementById('gps-result').textContent='Presiona para obtener coordenadas';
  document.getElementById('btn-gps').disabled=false;
  document.getElementById('btn-gps').textContent='Obtener GPS';
  document.querySelectorAll('.tipo-btn').forEach(b=>b.classList.remove('sel'));
  document.getElementById('wiz-tipo').value='';
  document.getElementById('wiz-obs').value='';
  document.getElementById('wiz-desp-inp').value='';
  document.getElementById('wiz-desp-prev').classList.remove('on');
  const titulos={ciudadano:'Reportar bache',tecnico:'Nuevo reporte',atender:'Atender reporte'};
  document.getElementById('wiz-titulo').textContent=titulos[modo]||'Reporte';
  const extra=document.getElementById('wiz-aten-extra');
  const btnEnv=document.getElementById('btn-enviar');
  if(modo==='atender'){
    extra.style.display='block';
    btnEnv.textContent='Marcar como atendido';
    if(repId){
      const rs=LS.g('bb_r')||[];
      const r=rs.find(x=>x.id===repId);
      if(r){
        if(r.tipo){
          _wizTipo=r.tipo;
          document.getElementById('wiz-tipo').value=r.tipo;
          document.querySelectorAll('.tipo-btn').forEach(b=>{if(b.textContent===r.tipo)b.classList.add('sel');});
        }
        const srcA=fotoSrc(r,'antes');
        if(srcA){
          _wizFotoOk=true;
          prev.src=srcA;prev.classList.add('on');
          tap.classList.add('listo');
          document.getElementById('ft-title').textContent='Foto cargada';
          document.getElementById('ft-sub').textContent='Toca para reemplazarla';
          document.getElementById('btn-refoto').classList.add('on');
        }
        if(r.lat){_wizLat=r.lat;_wizLng=r.lng;_wizGPSok=true;
          document.getElementById('gps-result').className='gps-result ok';
          document.getElementById('gps-result').textContent=r.lat+', '+r.lng;
        }
      }
    }
  }else{
    extra.style.display='none';
    btnEnv.textContent='Guardar reporte';
  }
  wiz_checkEnviar();
  wiz_updInd();
  document.getElementById('wiz').classList.add('on');
  setTimeout(wiz_obtenerGPS, 400);
}

function cerrarWiz(){
  document.getElementById('wiz').classList.remove('on');
  _wizAtenId=null;
}

function wiz_fotoTomada(inp){
  if(!inp.files[0])return;
  const blob=inp.files[0];
  const url=URL.createObjectURL(blob);
  const prev=document.getElementById('wiz-foto-prev');
  prev.src=url;prev.classList.add('on');
  document.getElementById('btn-refoto').classList.add('on');
  document.getElementById('foto-tap').classList.add('listo');
  document.getElementById('ft-title').textContent='¡Foto lista!';
  document.getElementById('ft-sub').textContent='Toca para cambiarla';
  _wizFotoOk=true;
  _wizClaveFotoAntes='tmp_antes_'+Date.now();
  idbGuardar(_wizClaveFotoAntes,blob).catch(e=>console.warn('IDB:',e));
  wiz_checkEnviar();
  wiz_updInd();
}

function wiz_obtenerGPS(){
  const btn=document.getElementById('btn-gps');
  const res=document.getElementById('gps-result');
  btn.disabled=true;btn.textContent='Obteniendo…';
  res.className='gps-result';res.textContent='Obteniendo coordenadas…';
  if(!navigator.geolocation){
    btn.disabled=false;btn.textContent='Obtener GPS';
    res.className='gps-result ko';res.textContent='GPS no disponible';
    _wizGPSok=true;wiz_checkEnviar();wiz_updInd();return;
  }
  navigator.geolocation.getCurrentPosition(p=>{
    _wizLat=p.coords.latitude.toFixed(6);
    _wizLng=p.coords.longitude.toFixed(6);
    res.className='gps-result ok';
    res.textContent=_wizLat+', '+_wizLng;
    btn.disabled=false;btn.textContent='Actualizar GPS';
    _wizGPSok=true;wiz_checkEnviar();wiz_updInd();
  },()=>{
    btn.disabled=false;btn.textContent='Reintentar GPS';
    res.className='gps-result ko';res.textContent='No se obtuvo GPS';
    _wizGPSok=true;wiz_checkEnviar();wiz_updInd();
  },{enableHighAccuracy:true,timeout:12000});
}

function wiz_fotoDesp(inp){
  if(!inp.files[0])return;
  const blob=inp.files[0];
  const url=URL.createObjectURL(blob);
  const pr=document.getElementById('wiz-desp-prev');
  pr.src=url;pr.classList.add('on');
  _wizDespOk=true;
  _wizClaveFotoDesp='tmp_desp_'+Date.now();
  idbGuardar(_wizClaveFotoDesp,blob).catch(e=>console.warn('IDB desp:',e));
  wiz_checkEnviar();wiz_updInd();
}

function wiz_checkEnviar(){
  const btn=document.getElementById('btn-enviar');
  const hint=document.getElementById('wiz-hint');
  let ok=false;
  if(_wizModo==='atender'){
    const obs=document.getElementById('wiz-obs').value.trim();
    ok=_wizGPSok&&_wizDespOk&&obs.length>0;
    if(!_wizGPSok)hint.textContent='Obtén el GPS primero';
    else if(!_wizDespOk)hint.textContent='Adjunta la foto del DESPUÉS';
    else if(!obs)hint.textContent='Agrega observaciones de cierre';
    else hint.textContent='Todo listo — toca para guardar';
  }else{
    ok=_wizFotoOk&&_wizGPSok&&_wizTipo;
    if(!_wizFotoOk)hint.textContent='Toma la foto del bache';
    else if(!_wizGPSok)hint.textContent='Obtén las coordenadas GPS';
    else if(!_wizTipo)hint.textContent='Selecciona el tipo de bache';
    else hint.textContent='Todo listo — toca para guardar';
  }
  btn.classList.toggle('activo',ok);
  wiz_updInd();
}

async function wiz_enviar(){
  const btn=document.getElementById('btn-enviar');
  if(!btn.classList.contains('activo'))return;
  btn.classList.remove('activo');
  btn.textContent='Guardando…';
  const ses=getSes();const us=LS.g('bb_u')||[];
  const u=us.find(x=>x.id===(ses&&ses.uid));

  if(_wizModo==='atender'){
    const rs=LS.g('bb_r')||[];
    const idx=rs.findIndex(r=>r.id===_wizAtenId);if(idx<0)return;
    if(_wizClaveFotoAntes){
      const ant=rs[idx].idbAntes;
      rs[idx].idbAntes=_wizClaveFotoAntes;
      if(ant&&ant!==_wizClaveFotoAntes)idbBorrar(ant);
    }
    if(_wizClaveFotoDesp){rs[idx].idbDesp=_wizClaveFotoDesp;rs[idx].fotoDespues=null;}
    rs[idx].estado='atendido';
    rs[idx].observaciones=document.getElementById('wiz-obs').value.trim();
    rs[idx].tecnico=u?u.nc||u.nombre:'Técnico';
    rs[idx].fechaAten=new Date().toISOString();
    rs[idx].pendienteSubir=true;
    if(_wizLat){rs[idx].lat=_wizLat;rs[idx].lng=_wizLng;}
    LS.s('bb_r',rs);
    await cargarPreviews(rs[idx]);
    cerrarWiz();renderPend();renderAten();actualizarStats();renderCiu();
    notif('Atendido — pendiente de sincronizar','v');
    if(GH.token)sincGH(true);
    return;
  }

  const repId=fId();
  if(_wizClaveFotoAntes){
    const blob=await idbLeer(_wizClaveFotoAntes);
    if(blob){await idbGuardar('antes_'+repId,blob);idbBorrar(_wizClaveFotoAntes);}
  }
  const rep={
    id:repId,direccion:'',tipo:_wizTipo,descripcion:'',
    origen:_wizModo==='tecnico'?'tecnico':'ciudadano',
    tecnico_creador:_wizModo==='tecnico'?(u?u.nc||u.nombre:'Técnico'):'',
    lat:_wizLat,lng:_wizLng,estado:'pendiente',fecha:new Date().toISOString(),
    idbAntes:_wizClaveFotoAntes?'antes_'+repId:null,
    idbDesp:null,fotoAntes:null,fotoDespues:null,
    observaciones:'',tecnico:null,fechaAten:null,pendienteSubir:true
  };
  const rs=LS.g('bb_r')||[];rs.unshift(rep);LS.s('bb_r',rs);
  await cargarPreviews(rep);
  cerrarWiz();actualizarStats();renderCiu();
  if(sesOk()){renderPend();}
  notif('Reporte guardado','v');
  if(GH.token)sincGH(true);
}

const _previews={};
async function cargarPreviews(r){
  if(r.idbAntes&&!_previews['a_'+r.id]){
    const b=await idbLeer(r.idbAntes);
    if(b)_previews['a_'+r.id]=URL.createObjectURL(b);
  }
  if(r.idbDesp&&!_previews['d_'+r.id]){
    const b=await idbLeer(r.idbDesp);
    if(b)_previews['d_'+r.id]=URL.createObjectURL(b);
  }
}
async function cargarTodasPreviews(){
  const rs=LS.g('bb_r')||[];
  for(const r of rs) await cargarPreviews(r);
}
function fotoSrc(r,tipo){
  const key=tipo==='antes'?'a_'+r.id:'d_'+r.id;
  if(_previews[key])return _previews[key];
  if(tipo==='antes'&&r.fotoAntes)return r.fotoAntes;
  if(tipo==='desp'&&r.fotoDespues)return r.fotoDespues;
  return null;
}

/* ── GITHUB sync ── */
function ghStatusUI(){
  const dot=document.getElementById('gh-dot'),st=document.getElementById('gh-st');
  if(!dot||!st)return;
  if(GH.token){dot.className='sdot ok';st.textContent='Token configurado';}
  else{dot.className='sdot';st.textContent='Sin token configurado';}
}
function guardarToken(){
  const t=document.getElementById('gh-tok-inp').value.trim();
  if(!t.startsWith('ghp_')&&!t.startsWith('github_pat_')){document.getElementById('gh-err').classList.add('on');return;}
  document.getElementById('gh-err').classList.remove('on');
  LS.s('bb_gh_token',t);co('ov-token');ghStatusUI();notif('Acceso configurado','v');
  // Provisionar dispositivo: traer usuarios reales del repo privado
  cargarUsuariosGH().then(()=>{try{ghStatusUI();}catch(e){}}).catch(()=>{});
}
function borrarToken(){LS.r('bb_gh_token');document.getElementById('gh-tok-inp').value='';co('ov-token');ghStatusUI();notif('Token borrado');}
async function obtenerSHA(){
  try{const r=await fetch(GH.api+'?ref='+GH.branch,{headers:{Authorization:'token '+GH.token,Accept:'application/vnd.github.v3+json'}});
    if(r.status===404)return null;if(!r.ok)return undefined;return(await r.json()).sha;
  }catch{return undefined;}}
async function leerGH(){
  const url='https://raw.githubusercontent.com/'+GH.owner+'/'+GH.repo+'/main/'+GH.file+'?t='+Date.now();
  for(let i=0;i<3;i++){
    try{
      const r=await fetch(url,{cache:'no-store'});
      if(r.status===404)return null;
      if(!r.ok){await new Promise(res=>setTimeout(res,800));continue;}
      return await r.json();
    }catch(e){await new Promise(res=>setTimeout(res,800));}
  }
  return null;
}
async function leerObras(){
  try{const r=await fetch(GH_OBRAS+'?t='+Date.now());if(!r.ok)return null;return await r.json();}catch{return null;}
}
async function subirFotoGH(repId,tipo,blob){
  const path=`fotos/${repId}_${tipo}.jpg`;
  const apiUrl=`https://api.github.com/repos/${GH.owner}/${GH.repo}/contents/${path}`;
  let sha=null;
  try{
    const ch=await fetch(apiUrl+'?ref='+GH.branch,{headers:{Authorization:'token '+GH.token,Accept:'application/vnd.github.v3+json'}});
    if(ch.ok){const d=await ch.json();sha=d.sha;}
  }catch{}
  const b64=await blobABase64(blob);
  const body={message:`Foto ${tipo} reporte ${repId}`,content:b64,branch:GH.branch};
  if(sha)body.sha=sha;
  const r=await fetch(apiUrl,{method:'PUT',
    headers:{Authorization:'token '+GH.token,Accept:'application/vnd.github.v3+json','Content-Type':'application/json'},
    body:JSON.stringify(body)});
  if(!r.ok){const e=await r.json();throw new Error(e.message);}
  return `https://raw.githubusercontent.com/${GH.owner}/${GH.repo}/main/${path}`;
}

async function sincGH(silent=false){
  if(!GH.token){notif('Configura el token de GitHub primero','r');return;}
  if(!silent)notif('Sincronizando…');
  try{
    const remoto=await leerGH();
    let local=LS.g('bb_r')||[];
    for(let r of local){
      if(!r.pendienteSubir)continue;
      if(r.idbAntes&&!r.fotoAntes){
        const blob=await idbLeer(r.idbAntes);
        if(blob){try{r.fotoAntes=await subirFotoGH(r.id,'antes',blob);notif('Subiendo fotos…');}catch(e){console.warn(e);}}
      }
      if(r.idbDesp&&!r.fotoDespues){
        const blob=await idbLeer(r.idbDesp);
        if(blob){try{r.fotoDespues=await subirFotoGH(r.id,'desp',blob);}catch(e){console.warn(e);}}
      }
      const fotoAntesOk=!r.idbAntes||r.fotoAntes;
      const fotoDespOk=!r.idbDesp||r.fotoDespues;
      if(fotoAntesOk&&fotoDespOk)r.pendienteSubir=false;
    }
    LS.s('bb_r',local);

    let fusionado=[...local];
    if(remoto&&Array.isArray(remoto.baches)){
      const ml={};local.forEach(r=>{ml[r.id]=r;});
      remoto.baches.forEach(r=>{if(!ml[r.id])fusionado.push(r);});
    }
    const bachesLimpios=fusionado.map(r=>{
      const {idbAntes,idbDesp,pendienteSubir,...limpio}=r;
      // Enmascarar PII antes de publicar en el repo (datos accesibles sin login)
      limpio.tecnico=maskNombre(limpio.tecnico);
      limpio.tecnico_creador=maskNombre(limpio.tecnico_creador);
      if(limpio.lat!=null)limpio.lat=gpsPub(limpio.lat);
      if(limpio.lng!=null)limpio.lng=gpsPub(limpio.lng);
      return limpio;
    });
    const data={version:'2.0',actualizacion:new Date().toISOString(),baches:bachesLimpios};
    const contenido=btoa(unescape(encodeURIComponent(JSON.stringify(data,null,2))));
    const sha=await obtenerSHA();
    const body={message:'BACHEOBAMBA: '+new Date().toLocaleString('es-EC'),content:contenido,branch:GH.branch};
    if(sha)body.sha=sha;
    const rr=await fetch(GH.api,{method:'PUT',
      headers:{Authorization:'token '+GH.token,Accept:'application/vnd.github.v3+json','Content-Type':'application/json'},
      body:JSON.stringify(body)});
    if(!rr.ok){const e=await rr.json();throw new Error(e.message||rr.status);}
    LS.s('bb_r',fusionado);
    if(!silent)notif('Sincronizado con GitHub','v');
    renderCiu();renderPend&&renderPend();renderAten&&renderAten();
    return true;
  }catch(e){notif('Error: '+e.message,'r');return false;}
}
async function cargarGH(){
  notif('Cargando datos...');
  const dataBaches=await leerGH();
  if(dataBaches){
    const local=LS.g('bb_r')||[];
    const ml={};local.forEach(r=>{ml[r.id]=r;});
    let remotos=[];
    if(Array.isArray(dataBaches.baches)){
      dataBaches.baches.forEach(r=>remotos.push({
        id:r.id||('R'+Math.random().toString(36).slice(2)),
        direccion:r.direccion||'',
        tipo:(r.tipo&&r.tipo!=='atendido'&&r.tipo!=='pendiente')?r.tipo:'Intervención',
        lat:(r.lat!=null)?r.lat:null,lng:(r.lng!=null)?r.lng:null,
        estado:r.estado||'pendiente',fecha:r.fecha||new Date().toISOString(),
        fotoAntes:r.fotoAntes||null,fotoDespues:r.fotoDespues||null,
        observaciones:r.observaciones||'',tecnico:r.tecnico||'',
        origen:'tecnico',pendienteSubir:false
      }));
    }
    const mr={};remotos.forEach(r=>{mr[r.id]=r;});
    LS.s('bb_r',Object.values({...mr,...ml}));
  }
  const dataObras=await leerObras();
  if(dataObras&&Array.isArray(dataObras.cronograma)){
    const cronRemoto=dataObras.cronograma.map((c,i)=>({
      id:'CO'+(c.nombre||i).toString().replace(/\s/g,'').slice(0,10)+i,
      sector:c.nombre||'Sin nombre',descripcion:c.observaciones||'',
      fecha:c.fecha_ini||c.fecha_fin||new Date().toISOString().slice(0,10),
      fechaFin:c.fecha_fin||'',estado:c.estado||'programado',
      puntos:Array.isArray(c.puntos)?c.puntos:[]
    }));
    const lc=LS.g('bb_c')||[];
    const mlc={};lc.forEach(c=>{mlc[c.id]=c;});
    const mrc={};cronRemoto.forEach(c=>{mrc[c.id]=c;});
    LS.s('bb_c',Object.values({...mrc,...mlc}));
  }
  await cargarTodasPreviews();
  if(typeof mapaCiu!=='undefined'&&mapaCiu)refrescarMapa(mapaCiu);
  if(typeof mapaTec!=='undefined'&&mapaTec)refrescarMapa(mapaTec);
  if(dataBaches||dataObras)notif('Datos actualizados desde GitHub','v');
  else notif('Sin datos en GitHub aún');
}

/* ── USUARIOS (repo privado, login multi-dispositivo) ── */
const GHU={
  owner:'fborjaf07',repo:'usuarios_bacheobamba',file:'usuarios.json',branch:'main',
  get token(){return LS.g('bb_gh_token')||'';},
  get api(){return 'https://api.github.com/repos/'+this.owner+'/'+this.repo+'/contents/'+this.file;}
};
async function leerUsuariosGH(){
  if(!GHU.token)return null;
  try{
    const r=await fetch(GHU.api+'?ref='+GHU.branch+'&t='+Date.now(),
      {headers:{Authorization:'token '+GHU.token,Accept:'application/vnd.github.v3+json'},cache:'no-store'});
    if(r.status===404)return {usuarios:[],sha:null,vacio:true};
    if(!r.ok)return null;
    const d=await r.json();
    const txt=decodeURIComponent(escape(atob((d.content||'').replace(/\s/g,''))));
    const p=JSON.parse(txt);
    return {usuarios:Array.isArray(p.usuarios)?p.usuarios:[],sha:d.sha};
  }catch{return null;}
}
async function subirUsuariosGH(){
  if(!GHU.token)return {ok:false,err:'Sin token'};
  try{
    const us=LS.g('bb_u')||[];
    let sha=null;
    try{const ch=await fetch(GHU.api+'?ref='+GHU.branch,
      {headers:{Authorization:'token '+GHU.token,Accept:'application/vnd.github.v3+json'}});
      if(ch.ok)sha=(await ch.json()).sha;}catch{}
    const data={version:'1.0',actualizacion:new Date().toISOString(),usuarios:us};
    const contenido=btoa(unescape(encodeURIComponent(JSON.stringify(data,null,2))));
    const body={message:'Usuarios: '+new Date().toLocaleString('es-EC'),content:contenido,branch:GHU.branch};
    if(sha)body.sha=sha;
    const r=await fetch(GHU.api,{method:'PUT',
      headers:{Authorization:'token '+GHU.token,Accept:'application/vnd.github.v3+json','Content-Type':'application/json'},
      body:JSON.stringify(body)});
    if(r.ok)return {ok:true};
    let msg='HTTP '+r.status;
    try{const j=await r.json();if(j.message)msg=j.message;}catch{}
    return {ok:false,err:msg};
  }catch(e){return {ok:false,err:e.message||'Error de red'};}
}
async function sincUsuariosManual(){
  if(!GHU.token){notif('Configura el token primero');return;}
  notif('Subiendo usuarios…');
  const r=await subirUsuariosGH();
  if(r.ok)notif('Usuarios sincronizados con el repo privado','v');
  else notif('No se pudo subir: '+r.err);
}
async function cargarUsuariosGH(){
  if(!GHU.token)return;
  const remoto=await leerUsuariosGH();
  if(!remoto)return;
  const hashOk=/^[0-9a-f]{64}$/;
  const validos=(remoto.usuarios||[]).filter(u=>u&&u.id&&hashOk.test(u.hash||''));
  if(validos.length){
    const local=LS.g('bb_u')||[];
    const ml={};local.forEach(u=>{ml[u.id]=u;});
    const mr={};validos.forEach(u=>{mr[u.id]=u;});
    LS.s('bb_u',Object.values({...ml,...mr})); // el repo manda en usuarios compartidos
  }else if(remoto.vacio){
    // archivo aún no existe: solo un admin con sesión lo crea
    const s=getSes();const u=(LS.g('bb_u')||[]).find(x=>x.id===(s&&s.uid));
    if(u&&u.rol==='admin')await subirUsuariosGH();
  }
}

/* ── LOGIN ── */
let _pusr=null;
function abrirLogin(){
  document.getElementById('l-usr').value='';document.getElementById('l-clave').value='';
  document.getElementById('l-err').classList.remove('on');ao('ov-login');
  setTimeout(()=>document.getElementById('l-usr').focus(),120);
}
async function intentarLogin(){
  const id=document.getElementById('l-usr').value.trim().toLowerCase();
  const clave=document.getElementById('l-clave').value;
  const errEl=document.getElementById('l-err');
  const btn=document.getElementById('l-btn');
  // Refrescar usuarios desde el repo privado antes de validar (si hay token)
  if(GHU.token){
    if(btn){btn.disabled=true;btn.dataset.t=btn.textContent;btn.textContent='Verificando…';}
    try{ await cargarUsuariosGH(); }catch(e){}
    if(btn){btn.disabled=false;btn.textContent=btn.dataset.t||'Ingresar';}
  }
  const us=LS.g('bb_u')||[];
  const u=us.find(x=>x.id.toLowerCase()===id||x.nombre.toLowerCase()===id||x.nc.toLowerCase()===id);
  if(!u||u.hash!==sha256(clave)){errEl.classList.add('on');return;}
  co('ov-login');
  if(u.primerLogin){_pusr=u.id;ao('ov-cc');return;}
  setSes(u.id);abrirPanel(u);
}
function guardarCC(){
  const nv=document.getElementById('cc-nv').value,cf=document.getElementById('cc-cf').value;
  const pr=document.getElementById('cc-preg').value,rs=document.getElementById('cc-resp').value.trim();
  const e=document.getElementById('cc-err');
  if(nv.length<8){e.textContent='Mínimo 8 caracteres';e.classList.add('on');return;}
  if(claveDebil(nv)){e.textContent='Contraseña demasiado común, elige otra';e.classList.add('on');return;}
  if(nv!==cf){e.textContent='Las contraseñas no coinciden';e.classList.add('on');return;}
  if(!pr||!rs){e.textContent='Completa pregunta y respuesta';e.classList.add('on');return;}
  e.classList.remove('on');
  const us=LS.g('bb_u')||[];const idx=us.findIndex(x=>x.id===_pusr);
  us[idx]={...us[idx],hash:sha256(nv),primerLogin:false,preg:pr,respH:sha256(rs.toLowerCase())};
  LS.s('bb_u',us);co('ov-cc');setSes(_pusr);abrirPanel(us[idx]);notif('Contraseña actualizada','v');subirUsuariosGH();
}
function abrirMiClave(){
  ['mc-ac','mc-nv','mc-cf'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('mc-err').classList.remove('on');
  ao('ov-mc');
  setTimeout(()=>document.getElementById('mc-ac').focus(),120);
}
async function guardarMiClave(){
  const ac=document.getElementById('mc-ac').value;
  const nv=document.getElementById('mc-nv').value;
  const cf=document.getElementById('mc-cf').value;
  const e=document.getElementById('mc-err');
  const s=getSes();
  const us=LS.g('bb_u')||[];
  const idx=us.findIndex(x=>x.id===(s&&s.uid));
  if(idx<0){e.textContent='Sesión no válida, vuelve a entrar';e.classList.add('on');return;}
  if(us[idx].hash!==sha256(ac)){e.textContent='La contraseña actual es incorrecta';e.classList.add('on');return;}
  if(nv.length<8){e.textContent='Mínimo 8 caracteres';e.classList.add('on');return;}
  if(claveDebil(nv)){e.textContent='Contraseña demasiado común, elige otra';e.classList.add('on');return;}
  if(nv!==cf){e.textContent='Las contraseñas no coinciden';e.classList.add('on');return;}
  if(nv===ac){e.textContent='La nueva contraseña debe ser distinta';e.classList.add('on');return;}
  e.classList.remove('on');
  us[idx]={...us[idx],hash:sha256(nv),primerLogin:false};
  LS.s('bb_u',us);
  co('ov-mc');notif('Contraseña actualizada, sincronizando…','v');
  const r=await subirUsuariosGH();
  if(r&&r.ok)notif('Contraseña guardada y sincronizada','v');
  else notif('Guardada local. No se pudo subir: '+((r&&r.err)||'sin token'));
}
let _rs=0,_ru='';
function abrirRec(){
  _rs=0;_ru='';
  ['rec-usr','rec-resp','rec-nc'].forEach(id=>document.getElementById(id).value='');
  ['rec-preg-c','rec-nc-c'].forEach(id=>document.getElementById(id).style.display='none');
  document.getElementById('rec-err').classList.remove('on');
  document.getElementById('rec-btn').textContent='Buscar usuario';
  co('ov-login');ao('ov-rec');
}
function pasoRec(){
  const us=LS.g('bb_u')||[];const e=document.getElementById('rec-err');
  if(_rs===0){
    const id=document.getElementById('rec-usr').value.trim().toLowerCase();
    const u=us.find(x=>x.id.toLowerCase()===id||x.nombre.toLowerCase()===id);
    if(!u||!u.preg){e.textContent='Usuario no encontrado o sin pregunta';e.classList.add('on');return;}
    e.classList.remove('on');_ru=u.id;
    document.getElementById('rec-preg-lbl').textContent=u.preg;
    document.getElementById('rec-preg-c').style.display='block';
    document.getElementById('rec-btn').textContent='Verificar respuesta';_rs=1;
  }else if(_rs===1){
    const u=us.find(x=>x.id===_ru);const rs=document.getElementById('rec-resp').value.trim().toLowerCase();
    if(!u||u.respH!==sha256(rs)){e.textContent='Respuesta incorrecta';e.classList.add('on');return;}
    e.classList.remove('on');document.getElementById('rec-nc-c').style.display='block';
    document.getElementById('rec-btn').textContent='Guardar nueva contraseña';_rs=2;
  }else{
    const nc=document.getElementById('rec-nc').value;
    if(nc.length<8){e.textContent='Mínimo 8 caracteres';e.classList.add('on');return;}
    if(claveDebil(nc)){e.textContent='Contraseña demasiado común, elige otra';e.classList.add('on');return;}
    const idx=us.findIndex(x=>x.id===_ru);us[idx].hash=sha256(nc);LS.s('bb_u',us);
    co('ov-rec');notif('Contraseña restablecida','v');subirUsuariosGH();abrirLogin();
  }
}

/* ── PANEL TÉCNICO ── */
function abrirPanel(u){
  document.getElementById('p-usr').textContent=u.nc||u.nombre;
  document.getElementById('panel').classList.add('on');
  const tabA=document.getElementById('tb-tc-adm');
  tabA.style.display=u.rol==='admin'?'flex':'none';
  actTab('tc-pen');
  renderPend();renderAten();renderCronTec();
  if(u.rol==='admin'){renderAdmin();ghStatusUI();cargarUsuariosGH().then(()=>renderAdmin()).catch(()=>{});}
  actualizarStats();
}
function cerrarSes(exp=false){
  delSes();document.getElementById('panel').classList.remove('on');
  if(exp)notif('Sesión expirada','r');else notif('Sesión cerrada');
}
function actTab(id){
  document.querySelectorAll('.tc').forEach(t=>t.classList.remove('on'));
  document.querySelectorAll('.tab').forEach(b=>b.classList.remove('on'));
  document.getElementById(id).classList.add('on');
  const btn=document.getElementById('tb-'+id);if(btn)btn.classList.add('on');
  if(id==='tc-mapa')setTimeout(cargarMapaTec,80);
}

/* ── RENDER ── */
function actualizarStats(){
  const rs=LS.g('bb_r')||[];
  const p=rs.filter(r=>r.estado==='pendiente').length;
  const a=rs.filter(r=>r.estado==='atendido').length;
  document.getElementById('sn-tot').textContent=rs.length;
  document.getElementById('sn-pen').textContent=p;
  document.getElementById('sn-ate').textContent=a;
  const b=document.getElementById('bdg-pen');if(b)b.textContent=p;
}
function renderCiu(){
  let rs=LS.g('bb_r')||[];const el=document.getElementById('lista-ciu');
  rs=rs.filter(bacheEnPlat);
  if(!rs.length){el.innerHTML='<div class="empty"><p>'+(_platFiltro?'No hay reportes en esta plataforma.':'Aún no hay reportes. ¡Sé el primero en reportar!')+'</p></div>';if(mapaCiu)refrescarMarcadores(mapaCiu);return;}
  el.innerHTML=rs.slice(0,5).map(r=>`
    <div class="rep-card ${r.estado}" onclick="verDetalle('${r.id}')">
      <div class="rep-dot ${r.estado}"></div>
      <div class="rep-info"><div class="rep-dir">${escH(r.direccion||r.tipo||'Reporte sin dirección')}</div>
        <div class="rep-meta">${escH(r.tipo||'—')} · ${fFecha(r.fecha)}</div>
      </div>
      <div class="rep-bdg ${r.estado}">${r.estado==='pendiente'?'Pendiente':'Atendido'}</div>
    </div>`).join('');
  if(mapaCiu)refrescarMarcadores(mapaCiu);
}

function renderPend(){
  const rs=(LS.g('bb_r')||[]).filter(r=>r.estado==='pendiente');
  document.getElementById('bdg-pen').textContent=rs.length;
  const el=document.getElementById('lista-pen');
  if(!rs.length){el.innerHTML='<div class="empty"><p>Sin reportes pendientes.</p></div>';return;}
  el.innerHTML='';
  rs.forEach(r=>{
    const srcA=fotoSrc(r,'antes');
    const div=document.createElement('div');
    div.className='tec-card';
    div.innerHTML='<div class="tec-body">'
      +'<div style="flex:1;min-width:0;">'
      +'<div class="tec-tipo">'+escH(r.tipo||'—')+'</div>'
      +'<div class="tec-dir">'+escH(r.direccion||'Sin dirección')+'</div>'
      +'<div class="tec-meta">'+fFecha(r.fecha)
        +(r.lat?' · '+r.lat+', '+r.lng:'')
        +(r.origen==='ciudadano'?' · Ciudadano':r.tecnico_creador?' · '+escH(r.tecnico_creador):'')
      +'</div></div>'
      +'<div class="tec-acc">'
      +(srcA?'<button class="ico-btn ib-a" title="Ver foto">'+ICON.image+'</button>':'')
      +'<button class="ico-btn ib-v" title="Atender">'+ICON.check+'</button>'
      +'<button class="ico-btn ib-r" title="Eliminar">'+ICON.trash+'</button>'
      +'</div></div>';
    const btns=div.querySelectorAll('.ico-btn');
    let btnIdx=0;
    if(srcA){btns[btnIdx].onclick=()=>verFoto(srcA,'Foto antes');btnIdx++;}
    btns[btnIdx].onclick=()=>abrirWizard('atender',r.id);btnIdx++;
    btns[btnIdx].onclick=()=>elimRep(r.id);
    el.appendChild(div);
  });
}

function renderAten(){
  const rs=(LS.g('bb_r')||[]).filter(r=>r.estado==='atendido');
  const el=document.getElementById('lista-ate');
  if(!rs.length){el.innerHTML='<div class="empty"><p>Aún no hay reportes atendidos.</p></div>';return;}
  el.innerHTML='';
  rs.forEach(r=>{
    const srcA=fotoSrc(r,'antes');
    const srcD=fotoSrc(r,'desp');
    const div=document.createElement('div');
    div.className='tec-card';
    div.innerHTML='<div class="tec-body">'
      +'<div style="flex:1;min-width:0;">'
      +'<div class="tec-tipo done">'+escH(r.tipo||'—')+'</div>'
      +'<div class="tec-dir">'+escH(r.direccion||'Sin dirección')+'</div>'
      +'<div class="tec-meta">'+escH(r.tecnico||'—')+' · '+fFecha(r.fechaAten||r.fecha)+'</div>'
      +'</div>'
      +'<div class="tec-acc">'
      +(srcA?'<button class="ico-btn ib-r" title="Antes">'+ICON.image+'</button>':'')
      +(srcD?'<button class="ico-btn ib-v" title="Después">'+ICON.image+'</button>':'')
      +'<button class="ico-btn ib-g" title="Ver detalle">'+ICON.eye+'</button>'
      +'<button class="ico-btn ib-r" title="Eliminar">'+ICON.trash+'</button>'
      +'</div></div>';
    const btns=div.querySelectorAll('.ico-btn');
    let i=0;
    if(srcA){btns[i].onclick=()=>verFoto(srcA,'Antes');i++;}
    if(srcD){btns[i].onclick=()=>verFoto(srcD,'Después');i++;}
    btns[i].onclick=()=>verDetalle(r.id);i++;
    btns[i].onclick=()=>elimRep(r.id);
    el.appendChild(div);
  });
}

function elimRep(id){
  if(!confirm('¿Eliminar este reporte?'))return;
  let rs=LS.g('bb_r')||[];rs=rs.filter(r=>r.id!==id);LS.s('bb_r',rs);
  renderPend();renderAten();actualizarStats();renderCiu();
  notif('Reporte eliminado');if(GH.token)sincGH(true);
}

function verDetalle(id){
  const rs=LS.g('bb_r')||[];const r=rs.find(x=>x.id===id);if(!r)return;
  document.getElementById('det-tit').textContent=r.estado==='pendiente'?'Reporte pendiente':'Reporte atendido';
  const srcA=fotoSrc(r,'antes')||r.fotoAntes;
  const srcD=fotoSrc(r,'desp')||r.fotoDespues;
  let h=`<div class="det-head">
    <div class="tec-tipo ${r.estado==='atendido'?'done':''}">${escH(r.tipo||'—')}</div>
    <strong>${escH(r.direccion||'Sin dirección')}</strong>
    <div class="det-meta">${fFecha(r.fecha)}${r.lat?` · ${r.lat}, ${r.lng}`:''}</div>
  </div>`;
  if(srcA||srcD){
    h+='<div class="ad-grid">';
    if(srcA)h+='<div><div class="ad-lbl a">ANTES</div><img src="'+srcA+'" id="det-img-a"></div>';
    if(srcD)h+='<div><div class="ad-lbl d">DESPUÉS</div><img src="'+srcD+'" id="det-img-d"></div>';
    h+='</div>';
  }
  if(r.observaciones){const tn=sesOk()?(r.tecnico||'Técnico'):(maskNombre(r.tecnico)||'Técnico');h+=`<div class="det-obs"><strong>${escH(tn)}:</strong> ${escH(r.observaciones)}</div>`;}
  document.getElementById('det-body').innerHTML=h;
  const ia=document.getElementById('det-img-a');
  const id2=document.getElementById('det-img-d');
  if(ia){const s=ia.src;ia.onclick=()=>verFoto(s,'Antes');}
  if(id2){const s=id2.src;id2.onclick=()=>verFoto(s,'Después');}
  ao('ov-det');
}

/* ── CRONOGRAMA ── */
let _cronFiltro='todos';
function filtrarCron(btn,filtro){
  _cronFiltro=filtro;
  document.querySelectorAll('.cron-ley-chip').forEach(b=>b.classList.remove('on'));
  if(btn)btn.classList.add('on');
  renderCronCiu();
}
function renderCronCiu(){
  const cs=LS.g('bb_c')||[];const el=document.getElementById('cron-ciu');
  if(!cs.length){el.innerHTML='<div class="cron-vacio">No hay intervenciones programadas todavía.</div>';return;}
  const clase=c=>{
    const esEjec=c.estado==='ejecutado'||c.estado==='completado';
    const esProg=c.estado==='programado';
    return esEjec?'done':esProg?'prog':'exec';
  };
  let sorted=[...cs].sort((a,b)=>(a.fecha||'').localeCompare(b.fecha||''));
  if(_cronFiltro&&_cronFiltro!=='todos')sorted=sorted.filter(c=>clase(c)===_cronFiltro);
  if(!sorted.length){el.innerHTML='<div class="cron-vacio">No hay intervenciones en este estado.</div>';return;}
  sorted=sorted.slice(0,5);
  el.innerHTML=sorted.map(c=>{
    const f=new Date((c.fecha||'2026-01-01')+'T12:00:00');
    const dia=isNaN(f)?'—':f.getDate();
    const mes=isNaN(f)?'—':f.toLocaleString('es',{month:'short'}).toUpperCase();
    const esEjec=c.estado==='ejecutado'||c.estado==='completado';
    const esProg=c.estado==='programado';
    const bdgCls=esEjec?'done':esProg?'prog':'exec';
    const bdgTxt=esEjec?'Ejecutado':esProg?'Programado':'En curso';
    return '<div class="cron-item '+bdgCls+'">'
      +'<div class="cron-f"><div class="d">'+dia+'</div><div class="m">'+mes+'</div></div>'
      +'<div class="cron-info"><h4>'+escH(c.sector||c.nombre||'')+'</h4>'
      +(c.descripcion?'<p>'+escH(c.descripcion)+'</p>':'')+'</div>'
      +'<div class="cron-bdg '+bdgCls+'">'+bdgTxt+'</div>'
      +'</div>';
  }).join('');
}
function renderCronTec(){
  const cs=LS.g('bb_c')||[];const el=document.getElementById('lista-cron-tec');
  if(!cs.length){el.innerHTML='<div class="empty"><p>Sin intervenciones programadas.</p></div>';return;}
  el.innerHTML='';
  [...cs].sort((a,b)=>(a.fecha||'').localeCompare(b.fecha||'')).forEach(c=>{
    const div=document.createElement('div');
    div.className='tec-card';div.style.marginBottom='8px';
    div.innerHTML='<div class="tec-body">'
      +'<div style="flex:1;"><div class="tec-dir">'+escH(c.sector||c.nombre||'')+'</div>'
      +'<div class="tec-meta">'+escH(c.descripcion||'')+' · '+escH(c.fecha||'')+' · <strong>'+escH(c.estado||'')+'</strong></div>'
      +'</div><div class="tec-acc">'
      +'<button class="ico-btn ib-a">'+ICON.edit+'</button>'
      +'<button class="ico-btn ib-r">'+ICON.trash+'</button>'
      +'</div></div>';
    const btns=div.querySelectorAll('.ico-btn');
    btns[0].onclick=()=>editCron(c.id);
    btns[1].onclick=()=>elimCron(c.id);
    el.appendChild(div);
  });
}
function guardarCron(){
  const sec=document.getElementById('cron-sec').value.trim();
  const desc=document.getElementById('cron-desc').value.trim();
  const fecha=document.getElementById('cron-fecha').value;
  const est=document.getElementById('cron-est').value;
  const e=document.getElementById('cron-err');
  if(!sec||!desc||!fecha){e.classList.add('on');return;}e.classList.remove('on');
  const cs=LS.g('bb_c')||[];const eid=document.getElementById('cron-eid').value;
  if(eid){const i=cs.findIndex(c=>c.id===eid);if(i>=0)cs[i]={...cs[i],sector:sec,descripcion:desc,fecha,estado:est};}
  else cs.push({id:'C'+Date.now(),sector:sec,descripcion:desc,fecha,estado:est});
  LS.s('bb_c',cs);co('ov-cron');renderCronTec();renderCronCiu();notif('Intervención guardada','v');
  if(GH.token)sincGH(true);
}
function editCron(id){
  const cs=LS.g('bb_c')||[];const c=cs.find(x=>x.id===id);if(!c)return;
  document.getElementById('cron-eid').value=id;
  document.getElementById('cron-sec').value=c.sector;
  document.getElementById('cron-desc').value=c.descripcion;
  document.getElementById('cron-fecha').value=c.fecha;
  document.getElementById('cron-est').value=c.estado;ao('ov-cron');
}
function elimCron(id){
  if(!confirm('¿Eliminar?'))return;
  let cs=LS.g('bb_c')||[];cs=cs.filter(c=>c.id!==id);LS.s('bb_c',cs);
  renderCronTec();renderCronCiu();notif('Eliminado');if(GH.token)sincGH(true);
}

/* ── ADMIN ── */
function renderAdmin(){
  const us=LS.g('bb_u')||[];
  document.getElementById('lista-usr').innerHTML=us.map(u=>`
    <div class="usr-row">
      <div class="usr-av">${(u.nc||u.nombre)[0].toUpperCase()}</div>
      <div style="flex:1;"><div class="usr-name">${escH(u.nc||u.nombre)}</div>
        <div class="usr-rol">${u.rol==='admin'?'Administrador':'Técnico'} · @${escH(u.id)}${u.primerLogin?' · Sin configurar':''}</div>
      </div>
      <div style="display:flex;gap:6px;">
        <button class="ico-btn ib-a" onclick="editUsr('${u.id}')" title="Editar">${ICON.edit}</button>
        <button class="ico-btn ib-r" onclick="abrirReset('${u.id}')" title="Reset">${ICON.refresh}</button>
        ${u.id!=='fabian'?`<button class="ico-btn ib-g" onclick="elimUsr('${u.id}')" title="Eliminar">${ICON.trash}</button>`:''}
      </div>
    </div>`).join('');
  const rs=LS.g('bb_r')||[];const cs=LS.g('bb_c')||[];
  document.getElementById('adm-stats').innerHTML=`
    <div class="adm-stats-grid">
      <div><strong class="azul">${rs.length}</strong><span>Reportes totales</span></div>
      <div><strong class="rojo">${rs.filter(r=>r.estado==='pendiente').length}</strong><span>Pendientes</span></div>
      <div><strong class="verde">${rs.filter(r=>r.estado==='atendido').length}</strong><span>Atendidos</span></div>
      <div><strong class="azul">${cs.length}</strong><span>Intervenciones</span></div>
      <div><strong>${us.length}</strong><span>Usuarios</span></div>
      <div><strong>${rs.filter(r=>r.fotoAntes||r.fotoDespues).length}</strong><span>Con foto</span></div>
    </div>`;
}
function guardarUsr(){
  const eid=document.getElementById('usr-eid').value;
  const id=document.getElementById('usr-id').value.trim().toLowerCase();
  const nc=document.getElementById('usr-nc').value.trim();
  const rol=document.getElementById('usr-rol').value;
  const e=document.getElementById('usr-err');
  if(!nc){e.textContent='Completa el nombre';e.classList.add('on');return;}
  if(!eid&&!/^[a-z0-9_]+$/.test(id)){e.textContent='ID: solo letras/números/_';e.classList.add('on');return;}
  e.classList.remove('on');
  const us=LS.g('bb_u')||[];
  if(eid){const i=us.findIndex(u=>u.id===eid);if(i>=0){us[i].nc=nc;us[i].nombre=nc;us[i].rol=rol;}}
  else{
    if(us.find(u=>u.id===id)){e.textContent='Ese ID ya existe';e.classList.add('on');return;}
    us.push({id,nombre:nc,nc,rol,hash:sha256('1234'),primerLogin:true,preg:'',respH:''});
  }
  LS.s('bb_u',us);cerrarOvUsr();renderAdmin();notif('Usuario guardado','v');subirUsuariosGH();
}
function cerrarOvUsr(){
  co('ov-usr');
  document.getElementById('usr-id').disabled=false;
  document.getElementById('usr-eid').value='';
  document.getElementById('usr-tit').textContent='Agregar usuario';
}
function editUsr(id){
  const us=LS.g('bb_u')||[];const u=us.find(x=>x.id===id);if(!u)return;
  document.getElementById('usr-tit').textContent='Editar usuario';
  document.getElementById('usr-eid').value=id;
  document.getElementById('usr-id').value=u.id;document.getElementById('usr-id').disabled=true;
  document.getElementById('usr-nc').value=u.nc||u.nombre;
  document.getElementById('usr-rol').value=u.rol;ao('ov-usr');
}
function elimUsr(id){
  if(id==='fabian'){notif('No se puede eliminar al admin principal','r');return;}
  if(!confirm('¿Eliminar usuario?'))return;
  let us=LS.g('bb_u')||[];us=us.filter(u=>u.id!==id);LS.s('bb_u',us);
  renderAdmin();notif('Usuario eliminado');subirUsuariosGH();
}
function abrirReset(id){
  const us=LS.g('bb_u')||[];const u=us.find(x=>x.id===id);if(!u)return;
  document.getElementById('reset-uid').value=id;
  document.getElementById('reset-desc').innerHTML=`Resetear contraseña de <strong>${escH(u.nc||u.nombre)}</strong> a <strong>1234</strong>.`;
  ao('ov-reset');
}
function confirmarReset(){
  const id=document.getElementById('reset-uid').value;
  const us=LS.g('bb_u')||[];const i=us.findIndex(u=>u.id===id);if(i<0)return;
  us[i].hash=sha256('1234');us[i].primerLogin=true;LS.s('bb_u',us);
  co('ov-reset');renderAdmin();notif('Contraseña restablecida a 1234','v');subirUsuariosGH();
}

/* ── MAPA ── */
let mapaCiu=null,mapaTec=null;
let _platFiltro='';
let _estadoFiltro='';
function platColor(i){const t=(window.PLATAFORMAS_GEO||[]).length||18;const hue=Math.round(185+i*(330-185)/Math.max(1,t-1));return 'hsl('+hue+',62%,48%)';}
function platLetra(p){var d=String(p.name||'').replace(/plataforma/i,'').trim();if(/^[A-Za-z\u00d1\u00f1]$/.test(d))return d;return p.letter||d;}
function bacheEnPlat(r){
  if(_estadoFiltro&&(r.estado||'pendiente')!==_estadoFiltro)return false;
  if(!_platFiltro)return true;
  if(r.lat==null||r.lng==null)return false;
  return !!(window.findPlataforma&&window.findPlataforma(parseFloat(r.lat),parseFloat(r.lng))===_platFiltro);
}
function filtrarEstado(v){
  _estadoFiltro=v||'';
  document.querySelectorAll('#estado-filtro .plat-chip').forEach(c=>c.classList.toggle('on',(c.getAttribute('data-est')||'')===_estadoFiltro));
  initPlatFiltro();
  renderCiu();
  if(mapaCiu)refrescarMapa(mapaCiu);
  if(mapaTec)refrescarMapa(mapaTec);
}
function dibujarPlataformas(mapa){
  if(!mapa||!window.PLATAFORMAS_GEO)return;
  window.PLATAFORMAS_GEO.forEach((p,i)=>{
    if(!p.rings||!p.rings[0])return;
    const col=platColor(i);
    const dim=_platFiltro&&p.name!==_platFiltro;
    const ll=p.rings[0].map(c=>[c[0],c[1]]);
    const poly=L.polygon(ll,{color:col,weight:dim?1:2,opacity:dim?0.25:0.8,fillColor:col,fillOpacity:dim?0.03:0.15});
    poly.addTo(mapa);
    poly.on('click',()=>filtrarPlataforma(p.name));
    poly.bindTooltip(p.name,{sticky:true});
    if(p.center){
      const lbl=L.divIcon({className:'',html:'<div class="plat-lbl" style="--pc:'+col+';'+(dim?'opacity:.35;':'')+'">'+platLetra(p)+'</div>',iconSize:[24,24],iconAnchor:[12,12]});
      L.marker([p.center[0],p.center[1]],{icon:lbl,interactive:false,keyboard:false}).addTo(mapa);
    }
  });
}
function initPlatFiltro(){
  const wrap=document.getElementById('plat-filtro');
  if(!wrap||!window.PLATAFORMAS_GEO)return;
  // contar reportes por plataforma (respetando filtro de estado activo)
  const rs=(LS.g('bb_r')||[]).filter(r=>{
    if(r.lat==null||r.lng==null)return false;
    if(_estadoFiltro&&(r.estado||'pendiente')!==_estadoFiltro)return false;
    return true;
  });
  const cuentas={};
  let totalFiltrado=0;
  rs.forEach(r=>{
    const pn=window.findPlataforma?window.findPlataforma(parseFloat(r.lat),parseFloat(r.lng)):null;
    if(pn){cuentas[pn]=(cuentas[pn]||0)+1;totalFiltrado++;}
  });
  let h='<span class="plat-filtro-tit">Plataforma</span>';
  h+='<button type="button" class="plat-chip'+((_platFiltro==='')?' on':'')+' " data-plat="" onclick="filtrarPlataforma(\'\')">Todas <span class="plat-count">'+totalFiltrado+'</span></button>';
  window.PLATAFORMAS_GEO.forEach((p,i)=>{
    const n=cuentas[p.name]||0;
    h+='<button type="button" class="plat-chip'+(_platFiltro===p.name?' on':'')+' " data-plat="'+escH(p.name)+'" onclick="filtrarPlataforma(\''+escH(p.name)+'\')"><span class="plat-chip-dot" style="background:'+platColor(i)+'"></span>'+escH(platLetra(p))+'<span class="plat-count">'+n+'</span></button>';
  });
  wrap.innerHTML=h;
}
function filtrarPlataforma(name){
  _platFiltro=name||'';
  document.querySelectorAll('.plat-chip').forEach(c=>c.classList.toggle('on',(c.getAttribute('data-plat')||'')===_platFiltro));
  renderCiu();
  if(mapaCiu)refrescarMapa(mapaCiu);
  if(mapaTec)refrescarMapa(mapaTec);
  if(_platFiltro){
    const p=(window.PLATAFORMAS_GEO||[]).find(x=>x.name===_platFiltro);
    if(p&&p.rings&&p.rings[0]){const ll=p.rings[0].map(c=>[c[0],c[1]]);if(mapaCiu){try{mapaCiu.fitBounds(ll,{padding:[20,20],maxZoom:16});}catch(e){}}}
  }
}
function mkIco(color){
  return L.divIcon({className:'',
    html:`<div style="width:14px;height:14px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(26,47,90,0.35);"></div>`,
    iconSize:[14,14],iconAnchor:[7,7]});
}
function refrescarMapa(mapa){
  if(!mapa)return;
  mapa.eachLayer(l=>{if(l instanceof L.Marker||l instanceof L.Polyline||l instanceof L.CircleMarker||l instanceof L.Polygon)mapa.removeLayer(l);});
  dibujarPlataformas(mapa);
  const rs=LS.g('bb_r')||[];const cs=LS.g('bb_c')||[];const bounds=[];
  rs.forEach(r=>{
    if(r.lat==null||r.lng==null)return;
    if(!bacheEnPlat(r))return;
    const lat=parseFloat(r.lat),lng=parseFloat(r.lng);
    if(isNaN(lat)||isNaN(lng))return;
    bounds.push([lat,lng]);
    const color=r.estado==='pendiente'?'#C8102E':'#1A7A4A';
    const m=L.marker([lat,lng],{icon:mkIco(color)}).addTo(mapa);
    const srcA=fotoSrc(r,'antes');const srcD=fotoSrc(r,'desp');
    let p='<div style="font-family:Montserrat,sans-serif;min-width:160px;">'
      +(r.direccion?'<strong style="font-size:0.84rem;color:#1A2F5A;">'+escH(r.direccion)+'</strong><br>':'')
      +'<span style="font-size:0.7rem;color:#7a818e;">'+escH(r.tipo||'—')+' · '+fFecha(r.fecha)+'</span><br>'
      +'<span style="font-size:0.7rem;font-weight:700;color:'+color+';">'
      +(r.estado==='pendiente'?'Pendiente':'Atendido')+'</span>';
    if(srcA||srcD){
      p+='<div style="display:flex;gap:5px;margin-top:6px;">';
      if(srcA)p+='<img src="'+srcA+'" style="width:72px;height:52px;object-fit:cover;border-radius:6px;cursor:pointer;" id="mk-a-'+r.id+'">';
      if(srcD)p+='<img src="'+srcD+'" style="width:72px;height:52px;object-fit:cover;border-radius:6px;cursor:pointer;" id="mk-d-'+r.id+'">';
      p+='</div>';
    }
    p+='</div>';
    m.bindPopup(L.popup({maxWidth:240}).setContent(p));
    m.on('popupopen',()=>{
      const ia=document.getElementById('mk-a-'+r.id);const ib=document.getElementById('mk-d-'+r.id);
      if(ia){const s=ia.src;ia.onclick=()=>verFoto(s,'Antes');}
      if(ib){const s=ib.src;ib.onclick=()=>verFoto(s,'Después');}
    });
  });
  cs.forEach(c=>{
    if(!Array.isArray(c.puntos)||c.puntos.length<1)return;
    const esEjec=c.estado==='ejecutado'||c.estado==='completado';
    const esProg=c.estado==='programado';
    const lineColor=esEjec?'#C8102E':esProg?'#0B1F4D':'#1E3A8A';
    const popHTML='<div style="font-family:Montserrat,sans-serif;min-width:160px;">'
      +'<strong style="font-size:0.84rem;color:#1A2F5A;">'+escH(c.sector)+'</strong><br>'
      +'<span style="font-size:0.7rem;color:#7a818e;">'+escH(c.fecha)+(c.fechaFin&&c.fechaFin!==c.fecha?' → '+escH(c.fechaFin):'')+'</span><br>'
      +'<span style="display:inline-block;margin-top:4px;padding:2px 8px;border-radius:50px;font-size:0.66rem;font-weight:700;background:'
      +(esEjec?'#C8102E;color:#fff':esProg?'#0B1F4D;color:#fff':'#1E3A8A;color:#fff')+';">'
      +(esEjec?'Ejecutado':esProg?'Programado':'En ejecución')+'</span>'
      +(c.descripcion?'<br><span style="font-size:0.7rem;color:#7a818e;">'+escH(c.descripcion)+'</span>':'')
      +'</div>';
    if(c.puntos.length>=2){
      const latlngs=c.puntos.map(p=>[p[0],p[1]]);
      const line=L.polyline(latlngs,{color:lineColor,weight:4,opacity:0.85,dashArray:esProg?'8,6':null}).addTo(mapa);
      line.bindPopup(L.popup({maxWidth:240}).setContent(popHTML));
      latlngs.forEach(ll=>bounds.push(ll));
    }
    const p0=c.puntos[0];
    const mIco=L.divIcon({className:'',
      html:'<div style="width:16px;height:16px;border-radius:50%;background:'+lineColor+';border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
      iconSize:[16,16],iconAnchor:[8,8]});
    const mk=L.marker([p0[0],p0[1]],{icon:mIco}).addTo(mapa);
    mk.bindPopup(L.popup({maxWidth:240}).setContent(popHTML));
  });
  if(!_platFiltro){
    if(bounds.length===1){mapa.setView(bounds[0],16);}
    else if(bounds.length>1){try{mapa.fitBounds(bounds,{padding:[24,24],maxZoom:16});}catch(e){}}
  }
  setTimeout(()=>mapa.invalidateSize(),100);
}
function refrescarMarcadores(mapa){refrescarMapa(mapa);}
const TILE_URL='https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTR='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
function initMapaCiu(){
  if(mapaCiu){mapaCiu.remove();mapaCiu=null;}
  mapaCiu=L.map('mapa-ciu',{zoomControl:true}).setView([-1.6635,-78.6543],14);
  L.tileLayer(TILE_URL,{attribution:TILE_ATTR,maxZoom:19}).addTo(mapaCiu);
  setTimeout(()=>{mapaCiu.invalidateSize();refrescarMarcadores(mapaCiu);},400);
}
function cargarMapaTec(){
  if(mapaTec){mapaTec.remove();mapaTec=null;}
  mapaTec=L.map('mapa-tec').setView([-1.6635,-78.6543],14);
  L.tileLayer(TILE_URL,{attribution:TILE_ATTR,maxZoom:19}).addTo(mapaTec);
  refrescarMarcadores(mapaTec);
  setTimeout(()=>mapaTec.invalidateSize(),200);
}

/* ── ICONOS SVG inline ── */
const ICON={
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  camera:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
  save:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>',
  lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  cog:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>',
  edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',
  refresh:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/><path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"/></svg>',
  eye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  image:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  map:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>',
  cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  list:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
  cloud:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>',
  link:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  hole:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="14" rx="9" ry="5"/><path d="M3 14 Q12 6 21 14"/></svg>',
  'chev-l':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
  'chev-r':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>'
};

/* ── GALERÍA CARRUSEL ── */
function galInit(){
  const track=document.getElementById('gal-track');
  if(!track)return;
  const slides=track.querySelectorAll('.gal-slide');
  const dotsWrap=document.getElementById('gal-dots');
  dotsWrap.innerHTML='';
  slides.forEach((s,i)=>{
    const b=document.createElement('button');
    b.className='gal-dot'+(i===0?' on':'');
    b.type='button';
    b.onclick=()=>galIr(i);
    dotsWrap.appendChild(b);
  });
  track.addEventListener('scroll',()=>{
    const i=Math.round(track.scrollLeft/track.clientWidth);
    dotsWrap.querySelectorAll('.gal-dot').forEach((d,k)=>d.classList.toggle('on',k===i));
  },{passive:true});
}
function galIr(i){
  const track=document.getElementById('gal-track');
  if(track)track.scrollTo({left:i*track.clientWidth,behavior:'smooth'});
}
function galMover(dir){
  const track=document.getElementById('gal-track');
  if(!track)return;
  const n=track.querySelectorAll('.gal-slide').length;
  let i=Math.round(track.scrollLeft/track.clientWidth)+dir;
  if(i<0)i=n-1; if(i>=n)i=0;
  galIr(i);
}

function recargarDatos(){
  (async()=>{
    try{
      await cargarGH();
      actualizarStats();renderCiu();renderCronCiu();
      if(typeof mapaCiu!=='undefined'&&mapaCiu)refrescarMarcadores(mapaCiu);
    }catch(e){notif('Error al cargar datos','r');}
  })();
}
function __bootApp(){
  // Inyectar iconos en botones declarativos
  document.querySelectorAll('[data-ico]').forEach(el=>{
    const name=el.getAttribute('data-ico');
    if(ICON[name]){el.insertAdjacentHTML('afterbegin','<span class="ico">'+ICON[name]+'</span>');}
  });
  document.querySelectorAll('.ov').forEach(o=>{o.addEventListener('click',function(e){if(e.target===this)this.classList.remove('on');});});

  initDatos();
  actualizarStats();
  renderCiu();
  renderCronCiu();
  initPlatFiltro();
  initMapaCiu();
  galInit();
  if(sesOk()){
    const s=getSes();const us=LS.g('bb_u')||[];
    const u=us.find(x=>x.id===s.uid);
    if(u){abrirPanel(u);startST();}
  }
  (async()=>{
    try{ await cargarTodasPreviews(); }catch(e){}
    try{ await cargarUsuariosGH(); }catch(e){}
    try{
      await cargarGH();
      actualizarStats();renderCiu();renderCronCiu();
      if(mapaCiu)refrescarMarcadores(mapaCiu);
      if(mapaTec)refrescarMarcadores(mapaTec);
    }catch(e){}
  })();
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',__bootApp);}else{__bootApp();}
