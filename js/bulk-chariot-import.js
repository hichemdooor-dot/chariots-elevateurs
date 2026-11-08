/* SBI mobile bulk import — isolated from the standard single-chariot form. */
(()=> {
  const $=s=>document.querySelector(s);
  const fields=['stock','client','chassis','serial_number','color','engine','engine_number','capacity','lifting_height','fork_dimension','mast_type','tire_type','delivery_date','observations'];
  const labels={stock:'Stock',client:'Client',chassis:'N° châssis',serial_number:'N° de série',color:'Couleur',engine:'Type moteur',engine_number:'N° moteur',capacity:'Capacité',lifting_height:'Hauteur',fork_dimension:'Fourche',mast_type:'Type de mât',tire_type:'Type de pneu',delivery_date:'Date livraison',observations:'Observations'};
  const required=['chassis','engine'];
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
    const seen=new Map(),existing=Array.isArray(CHARIOTS)?CHARIOTS:[];
    const nextErrors=[];
    rows.forEach(row=>{
      const p=row.p,missing=required.filter(k=>!String(p[k]||'').trim());
      if(missing.length)nextErrors.push('Ligne '+row.sourceRow+' : '+missing.map(k=>labels[k]).join(', ')+' obligatoire(s).');
      const key=norm(p.chassis)+'|'+norm(p.engine);
      const existingMatch=existing.find(c=>norm(c.chassis)===norm(p.chassis)&&norm(c.engine)===norm(p.engine));
      // Duplicates are flagged in the preview and skipped during import; they do not block valid rows.
      if(p.chassis&&p.engine&&existingMatch)row.duplicateReason='Déjà présent dans la base';
      if(p.chassis&&p.engine&&seen.has(key))row.duplicateReason='Doublon dans le fichier';
      if(p.chassis&&p.engine)seen.set(key,row.sourceRow);
      if(p.chassis&&!/^G/i.test(p.chassis))nextErrors.push('Ligne '+row.sourceRow+' : le N° châssis doit commencer par G.');
      Object.keys(choices).forEach(k=>{if(p[k]&&!choices[k].includes(p[k]))nextErrors.push('Ligne '+row.sourceRow+' : valeur non reconnue pour '+labels[k]+'.')});
    });
    return nextErrors;
  }
  function render(){
    preview.hidden=false;
    preview.innerHTML='<div class="sbi-bulk-summary">'+rows.length+' ligne(s) détectée(s). Modifiez les champs directement dans le tableau.</div><div class="sbi-bulk-table-wrap"><table class="sbi-bulk-table"><thead><tr><th>Ligne</th>'+fields.filter(k=>!['observations','delivery_date','serial_number','engine_number','client','stock'].includes(k)).map(k=>'<th>'+labels[k]+'</th>').join('')+'<th>Reconnaissance</th><th>Validation</th><th>Action</th></tr></thead><tbody>'+rows.map(row=>'<tr><td>'+row.sourceRow+'</td>'+fields.filter(k=>!['observations','delivery_date','serial_number','engine_number','client','stock'].includes(k)).map(k=>'<td>'+cellEditor(row,k)+'</td>').join('')+'<td class="sbi-ai-confidence">'+Math.round(Math.min(...Object.values(row.confidence||{}).map(Number).filter(Number.isFinite),1)*100)+'%</td><td data-validation="'+row.sourceRow+'"></td><td><button type="button" class="btn light sbi-bulk-remove" data-remove-row="'+row.sourceRow+'">Retirer</button></td></tr>').join('')+'</tbody></table></div><details class="sbi-bulk-extra"><summary>Afficher les autres champs (client, série, moteur, stock, date, observations)</summary>'+rows.map(row=>'<div class="sbi-bulk-extra-row"><strong>'+row.p.chassis+'</strong>'+['client','serial_number','engine_number','stock','delivery_date','observations'].map(k=>'<label>'+labels[k]+cellEditor(row,k)+'</label>').join('')+'</div>').join('')+'</details>';
    preview.querySelectorAll('[data-row][data-key]').forEach(el=>el.addEventListener('change',()=>{const row=rows.find(r=>r.sourceRow===Number(el.dataset.row));if(row)row.p[el.dataset.key]=el.value;updateValidation()}));
    preview.querySelectorAll('[data-remove-row]').forEach(btn=>btn.addEventListener('click',()=>{const line=Number(btn.dataset.removeRow);rows=rows.filter(r=>r.sourceRow!==line);render();setStatus('Ligne '+line+' retirée de l’import. '+rows.length+' ligne(s) restante(s).')}));
    updateValidation();
  }
  function updateValidation(){
    const errors=validate();
    preview.querySelectorAll('[data-validation]').forEach(el=>{
      const line=Number(el.dataset.validation),row=rows.find(r=>r.sourceRow===line);
      const p=row?.p||{},existing=Array.isArray(CHARIOTS)?CHARIOTS:[];
      const duplicateExisting=!!(p.chassis&&p.engine&&existing.some(c=>norm(c.chassis)===norm(p.chassis)&&norm(c.engine)===norm(p.engine)));
      const duplicateFile=!!(p.chassis&&p.engine&&rows.some(r=>r.sourceRow!==line&&norm(r.p.chassis)===norm(p.chassis)&&norm(r.p.engine)===norm(p.engine)));
      const messages=errors.filter(e=>e.includes('Ligne '+line+' :')||e.includes('Lignes '+line+' et '));
      const duplicate=duplicateExisting||duplicateFile;
      const confidenceValues=Object.values(row?.confidence||{}).map(Number).filter(Number.isFinite);
      const confidence=confidenceValues.length?Math.min(...confidenceValues):1;
      const needsReview=!!row?.uncertain_fields?.length||confidence<0.75;
      el.textContent=duplicate?'DOUBLON':messages.length?'À corriger':needsReview?'À VÉRIFIER':'OK';
      el.className=duplicate?'duplicate':messages.length?'invalid':needsReview?'invalid':'valid';
      const tr=el.closest('tr');if(tr){tr.classList.toggle('sbi-bulk-duplicate-row',duplicate);tr.classList.toggle('sbi-bulk-review-row',!duplicate&&needsReview);}
    });
    const duplicateCount=preview.querySelectorAll('[data-validation].duplicate').length;
    const reviewCount=preview.querySelectorAll('[data-validation].invalid').length;
    const importableCount=rows.length-duplicateCount;
    confirmBtn.disabled=errors.length>0||importableCount===0;
    setStatus(errors.length?errors.join('\n'):(duplicateCount?duplicateCount+' doublon(s) seront ignoré(s). '+importableCount+' ligne(s) pourront être importées.':'Toutes les lignes sont valides. Les champs facultatifs peuvent rester vides. Vérifiez l’aperçu puis confirmez.'));
  }

  function rowsFromAi(data){
    const source=Array.isArray(data?.rows)?data.rows:[];
    if(!source.length)throw new Error(data?.notes||'Aucun chariot n’a été reconnu sur cette photo.');
    return source.map((r,i)=>{
      const p={};fields.forEach(k=>p[k]='');
      p.chassis=String(r.chassis||'').trim().toUpperCase();
      p.engine=String(r.engine||'').trim().toUpperCase();
      p.capacity=String(r.capacity||'').trim().toUpperCase();
      p.lifting_height=String(r.lifting_height||'').trim().toUpperCase();
      p.color=String(r.color||'').trim();
      p.stock='STOCK1';p.status='En stock';
      return {sourceRow:i+1,p,confidence:r.confidence||{},uncertain_fields:Array.isArray(r.uncertain_fields)?r.uncertain_fields:[],source_text:r.source_text||''};
    });
  }
  async function readCameraPhoto(){
    const input=$('#sbiCameraFile'),file=input?.files?.[0],readBtn=$('#sbiCameraRead');
    if(!file)return setStatus('Prenez une photo avant de lancer la lecture.',true);
    if(!['image/jpeg','image/png','image/webp'].includes(file.type))return setStatus('Format non pris en charge. Utilisez une photo JPEG, PNG ou WebP.',true);
    if(file.size>8*1024*1024)return setStatus('La photo dépasse 8 Mo. Réduisez sa taille puis réessayez.',true);
    readBtn.disabled=true;setStatus('Envoi sécurisé de la photo à OpenAI pour lire l’écriture manuscrite…');
    try{
      const sessionResult=await supabaseClient.auth.getSession();
      const session=sessionResult?.data?.session;
      if(!session?.access_token)throw new Error('Votre session a expiré. Reconnectez-vous.');
      const imageData=await new Promise((resolve,reject)=>{
        const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||'').split(',')[1]||'');reader.onerror=()=>reject(new Error('Impossible de lire la photo.'));reader.readAsDataURL(file);
      });
      const {data,error}=await supabaseClient.functions.invoke('recognize-handwriting',{body:{imageBase64:imageData,mimeType:file.type}});
      if(error)throw new Error(data?.error||error.message||'Erreur du service de reconnaissance.');
      if(data?.error)throw new Error(data.error);
      rows=rowsFromAi(data);
      render();
      const uncertain=rows.filter(r=>r.uncertain_fields.length||Object.values(r.confidence).some(v=>Number(v)<0.75)).length;
      setStatus('Reconnaissance terminée : '+rows.length+' ligne(s). '+uncertain+' ligne(s) nécessitent une vérification. '+(data.notes||'Vérifiez chaque valeur avant confirmation.'));
      $('#sbiCameraConvert').hidden=true;
      $('#sbiCameraText').hidden=true;
    }catch(e){
      console.error('SBI handwriting recognition',e);
      setStatus(e.message||'La reconnaissance a échoué.',true);
    }finally{readBtn.disabled=false}
  }
  async function readFile(file){
    if(!window.XLSX)throw new Error('Le lecteur Excel n’est pas chargé. Actualisez la page et réessayez.');
    const data=await file.arrayBuffer(),workbook=XLSX.read(data,{type:'array',cellDates:false});
    const sheet=workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet,{header:1,defval:'',raw:false});
  }
  async function startImport(){
    if(!requireValidLicense()||!requireAdmin())return;
    const errors=validate();if(errors.length){setStatus(errors.join('\n'),true);return}
    if(!confirm('Importer '+rows.length+' chariot(s) dans Supabase ? Cette action créera de nouvelles fiches et leurs historiques.'))return;
    confirmBtn.disabled=true;cancelBtn.disabled=true;setStatus('Importation en cours…');
    const existing=Array.isArray(CHARIOTS)?CHARIOTS:[];
    const {data:latestRows,error:checkError}=await supabaseClient.from('chariots').select('chassis,engine,qr_id');
    if(checkError){setStatus('Import annulé : impossible de vérifier les doublons dans la base ('+(checkError.message||'erreur Supabase')+').',true);confirmBtn.disabled=false;cancelBtn.disabled=false;return}
    const databaseRows=Array.isArray(latestRows)?latestRows:existing;
    let max=databaseRows.reduce((n,c)=>Math.max(n,Number(String(c.qr_id||'').match(/^CH-(\d+)$/i)?.[1]||0),0),0);
    const inserted=[],failed=[],skipped=[];
    const fileCounts=new Map();
    rows.forEach(r=>{const k=norm(r.p.chassis)+'|'+norm(r.p.engine);fileCounts.set(k,(fileCounts.get(k)||0)+1)});
    for(const row of rows){
      const duplicateKey=norm(row.p.chassis)+'|'+norm(row.p.engine);
      const alreadyExists=databaseRows.some(c=>norm(c.chassis)===norm(row.p.chassis)&&norm(c.engine)===norm(row.p.engine));
      if(alreadyExists||fileCounts.get(duplicateKey)>1){skipped.push(row.sourceRow+' ('+row.p.chassis+' + '+row.p.engine+')');continue;}
      const p={...row.p};
      max+=1;p.qr_id='CH-'+String(max).padStart(4,'0');
      p.client=String(p.client||'').trim().toUpperCase();
      p.status='En stock';p.stock=p.stock||'STOCK1';
      if(!String(p.mast_type||'').trim())p.mast_type=['3M','4M'].includes(p.lifting_height)?'DUPLEX':(['4.3M','4.5M','6M'].includes(p.lifting_height)?'TRIPLEX':'');
      p.updated_at=new Date().toISOString();
      const {error}=await supabaseClient.from('chariots').insert(p);
      if(error){failed.push(row.sourceRow+' ('+p.chassis+') : '+(error.message||'Erreur Supabase'));continue}
      inserted.push(p);
      const log={qr_id:p.qr_id,date:new Date().toISOString().slice(0,10),technicien:getUserDisplayName?.()||'Import groupé',type:'Création chariot',travaux:'Chariot créé par import groupé • Châssis : '+p.chassis+' • Moteur : '+p.engine+' • Statut initial : '+p.status,created_by:currentUser?.id||null};
      const audit=await supabaseClient.from('maintenance').insert(log);
      if(audit.error)failed.push(row.sourceRow+' ('+p.chassis+') : chariot créé, historique non enregistré.');
    }
    setStatus('Import terminé : '+inserted.length+' chariot(s) créé(s), '+skipped.length+' doublon(s) ignoré(s), '+failed.length+' anomalie(s).'+(skipped.length?'\nDoublons ignorés : '+skipped.join(', '):'')+(failed.length?'\n'+failed.join('\n'):''),failed.length>0);
    confirmBtn.hidden=true;cancelBtn.textContent='Fermer';cancelBtn.hidden=false;
  }
  function init(){
    const toggle=$('#sbiBulkToggle'),panel=$('#sbiBulkPanel'),file=$('#sbiBulkFile');
    const camera=$('#sbiCameraFile'),cameraPreview=$('#sbiCameraPreview');
    camera?.addEventListener('change',()=>{const f=camera.files?.[0];if(f){cameraPreview.src=URL.createObjectURL(f);cameraPreview.hidden=false;$('#sbiCameraText').hidden=true;$('#sbiCameraConvert').hidden=true}});
    $('#sbiCameraRead')?.addEventListener('click',readCameraPhoto);
    $('#sbiCameraConvert')?.addEventListener('click',()=>setStatus('La conversion OCR locale a été remplacée par la reconnaissance OpenAI sécurisée.',true));
    if(!toggle||!panel||!file)return;
    toggle.addEventListener('click',()=>{panel.hidden=!panel.hidden;toggle.textContent=panel.hidden?'Ouvrir l’importation':'Fermer l’importation';toggle.setAttribute('aria-expanded',String(!panel.hidden))});
    file.addEventListener('change',async()=>{rows=[];preview.hidden=true;confirmBtn.disabled=true;confirmBtn.hidden=false;cancelBtn.hidden=false;setStatus('');if(!file.files?.[0])return;try{rows=mapRows(await readFile(file.files[0]));if(!rows.length)throw new Error('Aucune ligne de données trouvée.');render()}catch(e){setStatus(e.message||String(e),true)}});
    confirmBtn.addEventListener('click',startImport);
    cancelBtn.addEventListener('click',()=>{rows=[];file.value='';if(camera)camera.value='';if(cameraPreview){cameraPreview.hidden=true;cameraPreview.removeAttribute('src')}$('#sbiCameraText').value='';$('#sbiCameraText').hidden=true;$('#sbiCameraConvert').hidden=true;preview.hidden=true;confirmBtn.hidden=false;confirmBtn.disabled=true;cancelBtn.hidden=true;setStatus('Importation réinitialisée.')});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();