import {database,ref,push,set,update,remove,onValue,serverTimestamp} from './firebase.js';
const base = uid => `users/${uid}/offices`;
export function watchOffices(uid,ok,fail){return onValue(ref(database,base(uid)),snap=>{const obj=snap.val()||{};ok(Object.entries(obj).map(([id,v])=>({id,...v,areas:Object.entries(v.areas||{}).map(([aid,a])=>({id:aid,...a}))})));},fail);}
export function addOffice(uid,office){return set(push(ref(database,base(uid))),{ba:office.ba,name:office.name,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});}
export function editOffice(uid,id,office){return update(ref(database,`${base(uid)}/${id}`),{ba:office.ba,name:office.name,updatedAt:serverTimestamp()});}
export function deleteOffice(uid,id){return remove(ref(database,`${base(uid)}/${id}`));}
export function addArea(uid,officeId,area){return set(push(ref(database,`${base(uid)}/${officeId}/areas`)),{...area,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});}
export function editArea(uid,officeId,id,area){return update(ref(database,`${base(uid)}/${officeId}/areas/${id}`),{...area,updatedAt:serverTimestamp()});}
export function deleteArea(uid,officeId,id){return remove(ref(database,`${base(uid)}/${officeId}/areas/${id}`));}
export async function importSeed(uid,initial){
 const root=ref(database,base(uid));
 // Only allow importing into a completely empty offices collection.
 const {get}=await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js');
 if((await get(root)).exists()) throw new Error('Offices already exist. Import is only available when the offices collection is empty.');
 const records={};
 for(const office of initial){const id=push(root).key;const areas={};for(const area of office.areas){areas[push(ref(database,`${base(uid)}/${id}/areas`)).key]={...area,createdAt:Date.now(),updatedAt:Date.now()};}records[id]={ba:office.ba,name:office.name,areas,createdAt:Date.now(),updatedAt:Date.now()};}
 return set(root,records);
}
