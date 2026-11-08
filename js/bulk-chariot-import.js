/* SBI mobile bulk import — isolated from the standard single-chariot form. */
(()=> {
  const $=s=>document.querySelector(s);
  const fields=['stock','client','chassis','serial_number','color','engine','engine_number','capacity','lifting_height','fork_dimension','mast_type','tire_type','delivery_date','observations'];
  const labels={stock:'Stock',client:'Client',chassis:'N° châssis',serial_number:'N° de série',color:'Couleur',engine:'Type moteur',engine_number:'N° moteur',capacity:'Capacité',lifting_height:'Hauteur',fork_dimension:'Fourche',mast_type:'Type de mât',tire_type:'Type de pneu',delivery_date:'Date livraison',observations:'Observations'};
  const required=['chassis','color','engine','capacity','fork_dimension','tire_type'];
  const choices={stock:['STOCK1','STOCK2','SHOWROOM','FABRICATION'],color:['Jaune','Orange','Rouge','Vert','Gris'],engine:['ISUZU','MITSUBISHI','XINCHAI','YANMAR','GPL','ÉLECTRIQUE'],capacity:['2.5T','3T','3.8T','3.5T (TT)','5T','7T','10T','12T'],lifting_height:['3M','4M','4.3M','4.5M','6M'],fork_dimension:['1,2 m','1,5 m','2 m','2.5 m','Autre'],mast_type:['DUPLEX','TRIPLEX'],tire_type:['PNEUMATIQUE','PNEU PLEIN']};
  let rows=[];
  const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const aliases={chassis:['chassis','numerochassis','nchassis'],serial_number:['numeroserie','nserie','serialnumber'],color:['couleur','color'],engine:['typemoteur','moteur','engine'],engine_number:['numeromoteur','nmoteur','enginenumber'],capacity:['capacite','capacity'],lifting_height:['hauteurdelevage','hauteur','liftingheight'],fork_dimension:['fourche','dimensionfourche','forkdimension'],mast_type:['typ demat','typem at','typem at','typemat','masttype'],tire_type:['typedepneu','pneu','tiretype'],client:['client'],stock:['stock'],delivery_date:['datedelivraison','deliverydate'],observations:['observations','remarques'],qr_id:['qrid']};
  const status=$('#sbiBulkStatus'),preview=$('#sbiBulkPreview'),confirmBtn=$('#sbiBulkConfirm'),cancelBtn=$('#sbiBulkCancel');
  const setStatus=(msg,error=false)=>{status.textContent=msg;status.classList.toggle('error',error)};
  function mapRows(matrix){
    if(!matrix.length)return [];
    const header=matrix[0].map(norm);
    const map={};
    Object.entries(aliases).forEach(([key,names])=>{const i=header.findIndex(h=>[norm(key),...names.map(norm)].includes(h));if(i>=0)map[key]=i});
    if(map.chassis===undefined||map.engine===undefined)throw new Error('Colonnes obligatoires introuvables. Le fichier doit contenir au minimum N° châssis et Type moteur.');
    return matrix.slice(1).filter(r=>r.some(v=>String(v??'').trim())).map((r,i)=>{
      const p={};fields.forEach(k=>{const v=map[k]===undefined?'':r[map[k]];p[k]=v==null?'':String(v).trim()});
      p.chassis=p.chassis.toUpperCase();p.engine=p.engine.toUpperCase();p.client=p.client.toUpperCase();
      p.status='En stock';p.stock=p.stock||'STOCK1';
      return {sourceRow:i+2,p};
    });
  }
  function cellEditor(row,key){
    const val=row.p[key]||'';
    if(choices[key]){
      return '<select data-row="'+row.sourceRow+'" data-key="'+key+'"><option value="">— Choisir —</option>'+choices[key].map(v=>'<option '+(v===val?'selected':'')+' value="'+v+'">'+v+'</option>').join('')+'</select>';
    }
    return '<input data-row="'+row.sourceRow+'" data-key="'+key+'" value="'+String(val).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')+'" inputmode="'+(key==='chassis'?'text':'text')+'">';
  }
  function validate(){
    const seen=new Map(),existing=Array.isArray(window.CHARIOTS)?window.CHARIOTS:[];
    const nextErrors=[];
    rows.forEach(row=>{
      const p=row.p,missing=required.filter(k=>!String(p[k]||'').trim());
      if(missing.length)nextErrors.push('Ligne '+row.sourceRow+' : '+missing.map(k=>labels[k]).join(', ')+' obligatoire(s).');
      const key=norm(p.chassis)+'|'+norm(p.engine);
      const existingMatch=existing.find(c=>norm(c.chassis)===norm(p.chassis)&&norm(c.engine)===norm(p.engine));
      if(p.chassis&&p.engine&&existingMatch)nextErrors.push('Ligne '+row.sourceRow+' : doublon existant ('+p.chassis+' + '+p.engine+').');
      if(p.chassis&&p.engine&&seen.has(key))nextErrors.push('Lignes '+seen.get(key)+' et '+row.sourceRow+' : doublon dans le fichier ('+p.chassis+' + '+p.engine+').');
      if(p.chassis&&p.engine)seen.set(key,row.sourceRow);
      if(p.chassis&&!/^G/i.test(p.chassis))nextErrors.push('Ligne '+row.sourceRow+' : le N° châssis doit commencer par G.');
      Object.keys(choices).forEach(k=>{if(p[k]&&!choices[k].includes(p[k]))nextErrors.push('Ligne '+row.sourceRow+' : valeur non reconnue pour '+labels[k]+'.')});
    });
    return nextErrors;
  }
  function render(){
    preview.hidden=false;
    preview.innerHTML='<div class="sbi-bulk-summary">'+rows.length+' ligne(s) détectée(s). Modifiez les champs directement dans le tableau.</div><div class="sbi-bulk-table-wrap"><table class="sbi-bulk-table"><thead><tr><th>Ligne</th>'+fields.filter(k=>!['observations','delivery_date','serial_number','engine_number','client','stock'].includes(k)).map(k=>'<th>'+labels[k]+'</th>').join('')+'<th>Validation</th></tr></thead><tbody>'+rows.map(row=>'<tr><td>'+row.sourceRow+'</td>'+fields.filter(k=>!['observations','delivery_date','serial_number','engine_number','client','stock'].includes(k)).map(k=>'<td>'+cellEditor(row,k)+'</td>').join('')+'<td data-validation="'+row.sourceRow+'"></td></tr>').join('')+'</tbody></table></div><details class="sbi-bulk-extra"><summary>Afficher les autres champs (client, série, moteur, stock, date, observations)</summary>'+rows.map(row=>'<div class="sbi-bulk-extra-row"><strong>'+row.p.chassis+'</strong>'+['client','serial_number','engine_number','stock','delivery_date','observations'].map(k=>'<label>'+labels[k]+cellEditor(row,k)+'</label>').join('')+'</div>').join('')+'</details>';
    preview.querySelectorAll('[data-row][data-key]').forEach(el=>el.addEventListener('change',()=>{const row=rows.find(r=>r.sourceRow===Number(el.dataset.row));if(row)row.p[el.dataset.key]=el.value;updateValidation()}));
    updateValidation();
  }
  function updateValidation(){
    const errors=validate();
    preview.querySelectorAll('[data-validation]').forEach(el=>{const line=Number(el.dataset.validation),messages=errors.filter(e=>e.includes('Ligne '+line+' :')||e.includes('Lignes '+line+' et '));el.textContent=messages.length?'À corriger':'OK';el.className=messages.length?'invalid':'valid'});
    confirmBtn.disabled=errors.length>0||!rows.length;
    setStatus(errors.length?errors.join('\n'):'Toutes les lignes sont valides. Vérifiez l’aperçu puis confirmez.');
  }
  async function readFile(file){
    if(!window.XLSX)throw new Error('Le lecteur Excel n’est pas chargé. Actualisez la page et réessayez.');
    const data=await file.arrayBuffer(),workbook=XLSX.read(data,{type:'array',cellDates:false});
    const sheet=workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet,{header:1,defval:'',raw:false});
  }
  async function startImport(){
    if(!window.requireValidLicense?.()||!window.requireAdmin?.())return;
    const errors=validate();if(errors.length){setStatus(errors.join('\n'),true);return}
    if(!confirm('Importer '+rows.length+' chariot(s) dans Supabase ? Cette action créera de nouvelles fiches et leurs historiques.'))return;
    confirmBtn.disabled=true;cancelBtn.disabled=true;setStatus('Importation en cours…');
    const existing=Array.isArray(window.CHARIOTS)?window.CHARIOTS:[];
    let max=existing.reduce((n,c)=>Math.max(n,Number(String(c.qr_id||'').match(/^CH-(\d+)$/i)?.[1]||0),0),0);
    const inserted=[],failed=[];
    for(const row of rows){
      const p={...row.p};
      max+=1;p.qr_id='CH-'+String(max).padStart(4,'0');
      p.client=String(p.client||'').trim().toUpperCase();
      p.status='En stock';p.stock=p.stock||'STOCK1';
      if(!String(p.mast_type||'').trim())p.mast_type=['3M','4M'].includes(p.lifting_height)?'DUPLEX':(['4.3M','4.5M','6M'].includes(p.lifting_height)?'TRIPLEX':'');
      p.updated_at=new Date().toISOString();
      const {error}=await window.supabaseClient.from('chariots').insert(p);
      if(error){failed.push(row.sourceRow+' ('+p.chassis+') : '+(error.message||'Erreur Supabase'));continue}
      inserted.push(p);
      const log={qr_id:p.qr_id,date:new Date().toISOString().slice(0,10),technicien:window.getUserDisplayName?.()||'Import groupé',type:'Création chariot',travaux:'Chariot créé par import groupé • Châssis : '+p.chassis+' • Moteur : '+p.engine+' • Statut initial : '+p.status,created_by:window.currentUser?.id||null};
      const audit=await window.supabaseClient.from('maintenance').insert(log);
      if(audit.error)failed.push(row.sourceRow+' ('+p.chassis+') : chariot créé, historique non enregistré.');
    }
    setStatus('Import terminé : '+inserted.length+' chariot(s) créé(s), '+failed.length+' anomalie(s).'+(failed.length?'\n'+failed.join('\n'):''),failed.length>0);
    confirmBtn.hidden=true;cancelBtn.textContent='Fermer';cancelBtn.hidden=false;
  }
  function init(){
    const toggle=$('#sbiBulkToggle'),panel=$('#sbiBulkPanel'),file=$('#sbiBulkFile');
    if(!toggle||!panel||!file)return;
    toggle.addEventListener('click',()=>{panel.hidden=!panel.hidden;toggle.textContent=panel.hidden?'Ouvrir l’importation':'Fermer l’importation';toggle.setAttribute('aria-expanded',String(!panel.hidden))});
    file.addEventListener('change',async()=>{rows=[];preview.hidden=true;confirmBtn.disabled=true;confirmBtn.hidden=false;cancelBtn.hidden=false;setStatus('');if(!file.files?.[0])return;try{rows=mapRows(await readFile(file.files[0]));if(!rows.length)throw new Error('Aucune ligne de données trouvée.');render()}catch(e){setStatus(e.message||String(e),true)}});
    confirmBtn.addEventListener('click',startImport);
    cancelBtn.addEventListener('click',()=>{rows=[];file.value='';preview.hidden=true;confirmBtn.hidden=false;confirmBtn.disabled=true;cancelBtn.hidden=true;setStatus('Importation réinitialisée.')});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();