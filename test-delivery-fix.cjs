const fs = require('fs');
const vm = require('vm');
const source = fs.readFileSync('/mnt/data/work/js/app.js', 'utf8');
const getFn = (name, nextMarker) => {
  const start = Math.max(source.indexOf(`function ${name}`), source.lastIndexOf(`async function ${name}`));
  if (start < 0) throw new Error(`Missing ${name}`);
  const end = nextMarker ? source.indexOf(nextMarker, start) : source.indexOf('\n}', start) + 2;
  if (end < 0) throw new Error(`Missing end for ${name}`);
  return source.slice(source.slice(Math.max(0,start-6), start).trim()==='async' ? start-6 : start, end);
};
const maintenanceInserts = [];
const ctx = {
  CHARIOTS: [{qr_id:'QR-TEST', delivery_date:'2026-09-29', client:'CLIENT TEST'}],
  DELIVERY_PLANS: [], currentUser:{id:'user-test'},
  supabaseClient:{from(table){return {insert(row){if(table==='maintenance')maintenanceInserts.push(row);return Promise.resolve({error:null})},update(){return {eq(){return Promise.resolve({error:null})}}}}}},
  normalizeStatus(v){return String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase()},
  getUserDisplayName(){return 'Test Admin'},
  localISODateGlobal(){return '2026-09-30'},
  cacheDeliveryPlans(){}, console
};
vm.createContext(ctx);
vm.runInContext(getFn('isDelivered','const AUTO_WORKFLOW_FORWARD'),ctx);
vm.runInContext(getFn('deliveryDateAfterStatusEdit','function automaticStatusForChariot'),ctx);
vm.runInContext(getFn('saveDeliveryConfirmationToStock','async function performWorkflowAction'),ctx);
(async()=>{
  if(ctx.isDelivered({status:'Réservé',delivery_date:'2026-09-29'})) throw new Error('Historical date incorrectly marks a returned chariot as currently delivered');
  if(!ctx.isDelivered({status:'Livré',delivery_date:'2026-09-29'})) throw new Error('Livré status not recognized');
  const delivered={status:'Livré',delivery_date:'2026-09-29'};
  if(ctx.deliveryDateAfterStatusEdit(delivered,'Réservé','2026-09-29')!==null) throw new Error('Effective delivery date was not cleared when returning to a previous stage');
  if(ctx.deliveryDateAfterStatusEdit(delivered,'Préparation livraison','')!==null) throw new Error('Blank date not enforced on return to previous stage');
  if(ctx.deliveryDateAfterStatusEdit(delivered,'Livré','')!=='2026-09-29') throw new Error('Date not retained while status remains Livré');
  if(ctx.deliveryDateAfterStatusEdit({status:'Réservé',delivery_date:''},'Réservé','')!==null) throw new Error('Unexpected date generated for non-delivered chariot');
  await ctx.saveDeliveryConfirmationToStock('QR-TEST',null,{skip:true});
  const planRow=maintenanceInserts.find(r=>r.type==='Planification livraison');
  if(!planRow) throw new Error('No planning event created for an unplanned delivery');
  const payload=JSON.parse(planRow.travaux);
  if(payload.date!=='2026-09-29'||payload.qr!=='QR-TEST'||!payload.id) throw new Error('Planning event missing expected date/QR/id');
  if(ctx.DELIVERY_PLANS.length!==1) throw new Error('In-memory planning cache not updated');
  console.log('PASS: returned chariot is not classified as currently delivered.');
  console.log('PASS: effective delivery date clears when a delivered chariot returns to a previous stage, and remains when still Livré.');
  console.log('PASS: delivery confirmation without an existing plan creates a persistent planning entry using the effective date.');
  console.log('PASS: local planning cache receives the new entry.');
})().catch(e=>{console.error(e);process.exit(1)});
