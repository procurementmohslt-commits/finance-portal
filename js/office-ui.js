import {auth,onAuthStateChanged} from './firebase.js';
import {watchOffices,addOffice,editOffice,deleteOffice,addArea,editArea,deleteArea,importSeed} from './offices.js';
import {initialOffices} from './office-seed.js';
const $=id=>document.getElementById(id);
let user=null, offices=[],selected='',editingOffice=null,editingArea=null,unsubscribe=null;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const active=()=>offices.find(o=>o.id===selected);
function showError(e){$('office-error').textContent=e?.message||String(e);}
function render(){
 const office=active();
 $('office-select').innerHTML=offices.length?offices.map(o=>`<option value="${esc(o.id)}">BA ${esc(o.ba)} · ${esc(o.name)}</option>`).join(''):'<option value="">No offices yet</option>';
 $('office-select').value=office?.id||'';
 $('office-edit').disabled=$('office-delete').disabled=$('area-add').disabled=!office;
 $('import-offices').hidden=offices.length>0;
 $('office-info').textContent=office?`BA ${office.ba} — ${office.name}`:'Add an office or import your four supplied offices to begin.';
 const q=$('area-search').value.trim().toLowerCase();
 const areas=(office?.areas||[]).filter(a=>`${a.code} ${a.description}`.toLowerCase().includes(q)).sort((a,b)=>a.code.localeCompare(b.code));
 $('area-count').textContent=office?`(${office.areas.length})`:'';
 $('areas-list').innerHTML=areas.length?areas.map(a=>`<article class="area-row" data-id="${esc(a.id)}"><div><strong>${esc(a.code)}</strong><p>${esc(a.description)}</p></div><div class="area-actions"><button type="button" class="ghost" data-action="edit">Edit</button><button type="button" class="danger" data-action="delete">Delete</button></div></article>`).join(''):'<p class="empty">No matching functional areas.</p>';
}
$('open-offices').onclick=()=>{$('office-error').textContent='';$('offices-dialog').showModal();render();};
$('offices-close').onclick=()=>$('offices-dialog').close();
$('office-select').onchange=e=>{selected=e.target.value;$('area-search').value='';render();};
$('area-search').oninput=render;
function openOfficeEditor(id=null){editingOffice=id;const o=offices.find(x=>x.id===id);$('office-form-title').textContent=o?'Edit office':'Add office';$('office-ba').value=o?.ba||'';$('office-name').value=o?.name||'';$('office-form-error').textContent='';$('office-editor').showModal();}
$('office-add').onclick=()=>openOfficeEditor();
$('office-edit').onclick=()=>{if(active())openOfficeEditor(selected);};
$('office-cancel').onclick=()=>$('office-editor').close();
$('office-form').onsubmit=async e=>{e.preventDefault();const data={ba:$('office-ba').value.trim(),name:$('office-name').value.trim()};if(!data.ba||!data.name)return;const btn=e.submitter;btn.disabled=true;try{if(editingOffice)await editOffice(user.uid,editingOffice,data);else await addOffice(user.uid,data);$('office-editor').close();}catch(err){$('office-form-error').textContent=err.message;}finally{btn.disabled=false;}};
$('office-delete').onclick=async()=>{const o=active();if(!o||!confirm(`Delete BA ${o.ba} and ALL ${o.areas.length} functional areas permanently?`))return;try{await deleteOffice(user.uid,o.id);}catch(e){showError(e);}};
function openAreaEditor(id=null){const a=active()?.areas.find(x=>x.id===id);editingArea=id;$('area-form-title').textContent=a?'Edit functional area':'Add functional area';$('area-code').value=a?.code||'';$('area-description').value=a?.description||'';$('area-form-error').textContent='';$('area-editor').showModal();}
$('area-add').onclick=()=>openAreaEditor();
$('area-cancel').onclick=()=>$('area-editor').close();
$('area-form').onsubmit=async e=>{e.preventDefault();const data={code:$('area-code').value.trim(),description:$('area-description').value.trim()};if(!data.code||!data.description)return;const btn=e.submitter;btn.disabled=true;try{if(editingArea)await editArea(user.uid,selected,editingArea,data);else await addArea(user.uid,selected,data);$('area-editor').close();}catch(err){$('area-form-error').textContent=err.message;}finally{btn.disabled=false;}};
$('areas-list').onclick=async e=>{const b=e.target.closest('button[data-action]');if(!b)return;const id=b.closest('[data-id]').dataset.id;if(b.dataset.action==='edit')openAreaEditor(id);else if(confirm('Permanently delete this functional area?')){try{await deleteArea(user.uid,selected,id);}catch(err){showError(err);}}};
$('import-offices').onclick=async()=>{if(offices.length||!user)return;if(!confirm('Import all four offices and their 69 functional areas into Firebase? This only works when your offices list is empty.'))return;const btn=$('import-offices');btn.disabled=true;try{await importSeed(user.uid,initialOffices);}catch(e){showError(e);}finally{btn.disabled=false;}};
onAuthStateChanged(auth,u=>{unsubscribe?.();unsubscribe=null;user=u;offices=[];selected='';$('open-offices').disabled=!u;if(!u){render();return;}unsubscribe=watchOffices(u.uid,items=>{offices=items.sort((a,b)=>a.ba.localeCompare(b.ba));if(!offices.some(o=>o.id===selected))selected=offices[0]?.id||'';render();},showError);});
