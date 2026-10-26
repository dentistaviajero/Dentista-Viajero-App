/* Dentista Viajero | Historia clinica v0.5
   Complemento compatible con la version v0.4. No elimina registros existentes.
   MODO DEMOSTRACION: los datos permanecen en localStorage, sin cifrado ni servidor privado.
*/
(()=>{'use strict';
const KEY='dentista_viajero_demo_v02';
const groups=[
 ['🩺 Motivo y datos clínicos',[
  ['motivo','Motivo de consulta','textarea'],['padecimiento','Padecimiento actual / síntomas','textarea'],
  ['antecedentesPat','Antecedentes personales patológicos','textarea'],['antecedentesNoPat','Antecedentes personales no patológicos','textarea'],
  ['antecedentesFam','Antecedentes heredofamiliares','textarea'],['medicamentos','Medicamentos actuales','textarea'],
  ['alergias','Alergias conocidas y reacciones','textarea'],['condiciones','Condiciones, discapacidad, neurodivergencia y apoyos necesarios','textarea']]],
 ['👶 Nacimiento y lactancia',[
  ['lugarNacimiento','Lugar de nacimiento','text'],['tipoParto','Tipo de nacimiento','select:Vaginal|Cesárea|Instrumentado|Otro|No se sabe'],
  ['lactancia','Tipo de lactancia','select:Materna|Fórmula|Mixta|No recibió|No se sabe'],
  ['lactanciaRitmo','Frecuencia de alimentación','select:Libre demanda|Horarios|Mixto|No se sabe'],
  ['lactanciaTiempo','¿Durante cuánto tiempo recibió lactancia?','text']]],
 ['🌙 Hábitos orales y sueño',[
  ['habitosOrales','Hábitos orales (dedo, chupón, labio, bruxismo, respiración bucal, etc.)','textarea'],
  ['sueno','Sueño: ronquidos, despertares, respiración y otros hallazgos','textarea']]],
 ['🎨 Consultorio divertido: conociendo al niño',[
  ['apodo','¿Cómo le gusta que le digan?','text'],['colorFavorito','Color favorito','text'],
  ['personajeFavorito','Caricatura o personaje favorito','text'],['gustos','¿Qué cosas le gustan?','textarea'],
  ['apoyosConsulta','¿Qué le ayuda a sentirse cómodo durante la consulta?','textarea']]],
 ['📝 Notas del expediente', [['notas','Notas adicionales y observaciones','textarea']]]
];
const fields=groups.flatMap(g=>g[1]);
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=()=>{try{const a=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(a)?a:[]}catch{return []}};
function inputHTML([key,label,type],p){const v=escape(p?.[key]||'');let ctrl;
 if(type==='textarea')ctrl=`<textarea id="${key}" rows="3">${v}</textarea>`;
 else if(type.startsWith('select:'))ctrl=`<select id="${key}"><option value="">Sin registrar</option>${type.slice(7).split('|').map(o=>`<option value="${escape(o)}" ${p?.[key]===o?'selected':''}>${escape(o)}</option>`).join('')}</select>`;
 else ctrl=`<input id="${key}" type="text" value="${v}">`;
 return `<div class="field"><label for="${key}">${escape(label)}</label>${ctrl}</div>`;
}
function formHTML(p){return `<div class="dv-history" style="margin:20px 0">${groups.map(([title,items])=>`<fieldset class="dv-history-group"><legend>${title}</legend>${items.map(x=>inputHTML(x,p)).join('')}</fieldset>`).join('')}</div>`}
function getCurrentPatient(){const h=document.querySelector('#view .card .muted');const folio=h?.textContent?.match(/Folio:\s*(.+)/)?.[1]?.trim();return read().find(p=>(p.folio||p.id)===folio)}
function render(){const view=document.getElementById('view');if(!view)return;
 for(const [formId,isEdit] of [['patientForm',false],['editForm',true]]){
  const f=document.getElementById(formId);if(f&&!f.querySelector('.dv-history')){
   const p=isEdit?getCurrentPatient():{};const wrap=document.createElement('div');wrap.innerHTML=formHTML(p);f.insertBefore(wrap.firstElementChild,f.querySelector('.actions')||f.querySelector('button[type="submit"]'));
  }
 }
 const edit=document.getElementById('editToggle');const card=edit?.closest('.card');
 if(card&&!card.querySelector('.dv-profile')){
  const p=getCurrentPatient();if(!p)return;
  const top=document.createElement('div');top.className='dv-profile';
  const chips=[['Apodo',p.apodo],['Color favorito',p.colorFavorito],['Personaje favorito',p.personajeFavorito],['Le gusta',p.gustos]].filter(x=>x[1]);
  top.innerHTML=chips.length?`<div class="dv-chips">${chips.map(([a,b])=>`<span><b>${escape(a)}:</b> ${escape(b)}</span>`).join('')}</div>`:'';
  const alerts=[['Alerta especial',p.alertas],['Alergias',p.alergias],['Condiciones y apoyos',p.condiciones]].filter(x=>x[1]);
  if(alerts.length)top.innerHTML+=`<div class="dv-alert"><b>⚠️ ALERTAS Y APOYOS PARA LA CONSULTA</b>${alerts.map(([a,b])=>`<p><strong>${escape(a)}:</strong> ${escape(b)}</p>`).join('')}</div>`;
  const actions=card.querySelector('.actions');card.insertBefore(top,actions||null);
 }
 if(edit&&!view.querySelector('.dv-history-summary')){
  const p=getCurrentPatient();if(!p)return;
  const summary=document.createElement('div');summary.className='card dv-history-summary';
  summary.innerHTML='<h3>🩺 Historia clínica</h3>'+groups.slice(0,-1).map(([title,items])=>`<section class="dv-summary-section"><h4>${title}</h4>${items.filter(([key])=>p[key]).map(([key,label])=>`<p><b>${escape(label)}:</b> ${escape(p[key])}</p>`).join('')||'<p class="muted">Sin datos registrados</p>'}</section>`).join('')+`<section class="dv-summary-section"><h4>📝 Notas adicionales</h4><p>${escape(p.notas||'Sin notas registradas')}</p></section>`;
  const editCard=document.getElementById('editCard');editCard.parentNode.insertBefore(summary,editCard.nextSibling);
 }
}
// El formulario original guarda primero; luego incorporamos los nuevos campos al mismo expediente.
document.addEventListener('submit',e=>{
 const form=e.target;if(!['patientForm','editForm'].includes(form?.id))return;
 const extras=Object.fromEntries(fields.map(([k])=>[k,form.querySelector('#'+k)?.value?.trim()||'']));
 const isEdit=form.id==='editForm';const id=isEdit?getCurrentPatient()?.id:null;
 queueMicrotask(()=>{
  const records=read();const p=isEdit?records.find(x=>x.id===id):records[records.length-1];
  if(!p)return;Object.assign(p,extras);
  try{localStorage.setItem(KEY,JSON.stringify(records))}catch{alert('No se pudieron guardar los nuevos datos clínicos. Revisa el espacio disponible y exporta un respaldo.');return}
  render();
 });
},true);
const observer=new MutationObserver(()=>render());
function init(){const root=document.getElementById('view');if(!root)return;observer.observe(root,{childList:true,subtree:false});render()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
