import {serialize,parse,validate} from './rules.mjs';
import {items,outfits,makeRule,presets} from './catalog.mjs?v=5';
import {itemIcon} from './icons.mjs?v=5';
const $=id=>document.getElementById(id);
const names={each:'Extra Rolls (Each)',one1:'Extra Rolls (One) 1',one2:'Extra Rolls (One) 2',one3:'Extra Rolls (One) 3'};
let page=0, expanded=-1; const pageSize=48; const itemById=new Map(items.map(i=>[i.id,i]));
let sets={each:[],one1:[],one2:[],one3:[]}, active='each', storageWarning='';
try {
 const saved=JSON.parse(localStorage.getItem('mad-loot-rules')||'null');
 if(saved){
  for(const key of Object.keys(sets)) {
   if(!Array.isArray(saved[key])||saved[key].some(r=>!r||['item','outfit','chance','more','moreChance'].some(f=>typeof r[f]!=='string'))) throw Error('Invalid saved data');
  }
  sets=saved;
 }
} catch {storageWarning='Previously saved data could not be loaded. Download your rules before leaving.';}
const itemName=id=>itemById.get(id)?.name||id||'Custom item';
function option(value,label){const o=document.createElement('option');o.value=value;o.textContent=label;return o;}
function outfitSelect(value,custom=true){const select=document.createElement('select');select.append(option('','All zombie outfits'),...outfits.map(o=>option(o,o.replaceAll('_',' '))));if(value&&!outfits.includes(value))select.append(option(value,value));if(custom)select.append(option('__custom','Custom outfit…'));select.value=value;return select;}
$('add-outfit').replaceWith(Object.assign(outfitSelect('',false),{id:'add-outfit'}));
$('category').append(option('all','All categories'),...Array.from(new Set(items.map(i=>i.category))).map(c=>option(c,c)));
function save(){try{localStorage.setItem('mad-loot-rules',JSON.stringify(sets));}catch{storageWarning='Browser saving is unavailable. Download your rules before leaving.';}}
function outputs(){
 save();$('outputs').replaceChildren();
 for(const [key,name] of Object.entries(names)){
  if(!sets[key].length) continue;
  const box=document.createElement('div');box.className='output-set'+(key===active?' current':'');
  const title=document.createElement('label');title.htmlFor='output-'+key;title.textContent=name;
  const meta=document.createElement('span');meta.className='small';meta.textContent=`${sets[key].length} rules`;
  const text=document.createElement('textarea');text.id='output-'+key;text.rows=2;text.readOnly=true;text.setAttribute('aria-label',name+' output');
  const button=document.createElement('button');button.textContent='Copy for this setting';
  try{text.value=serialize(sets[key]);button.disabled=!sets[key].length;}catch(error){text.placeholder=error.message;button.disabled=true;}
  button.onclick=async()=>{try{await navigator.clipboard.writeText(text.value);$('status').textContent='Copied '+name+'. Paste it into that sandbox setting.';}catch{text.focus();text.select();$('status').textContent='Copy the selected text using your keyboard or browser menu.';}};
  const preview=document.createElement('details');const summary=document.createElement('summary');summary.textContent='View game text';preview.append(summary,text);box.append(title,meta,button,preview);$('outputs').append(box);
 }
 $('status').textContent=storageWarning; $('save-note').textContent=storageWarning||'Your changes save automatically in this browser.'; $('rule-count').textContent=sets[active].length+' items'; $('finish').disabled=!Object.values(sets).some(r=>r.length); if(!$('outputs').children.length)$('outputs').textContent='Add an item to your list first.';
 document.querySelectorAll('#tabs button').forEach(b=>{b.textContent=(b.dataset.key==='each'?'Main loot list':'Random pick '+b.dataset.key.slice(-1))+` (${sets[b.dataset.key].length})`;b.setAttribute('aria-pressed',String(b.dataset.key===active));});
 $('export').disabled=Object.values(sets).some(rules=>{try{serialize(rules);return false;}catch{return true;}});
}
function addRules(rules){expanded=sets[active].length;sets[active].push(...rules);render();$('rule-count').textContent=sets[active].length+' items';}
function subcategories(){
 const category=$('category').value;
 $('subcategory').replaceChildren(option('all','All item types'),...Array.from(new Set(items.filter(i=>category==='all'||i.category===category).map(i=>i.subcategory))).sort().map(c=>option(c,c)));
}
function catalog(){
 const terms=$('search').value.toLowerCase().trim().split(/\s+/).filter(Boolean),category=$('category').value,sub=$('subcategory').value;
 const filtered=items.filter(i=>(category==='all'||i.category===category)&&(sub==='all'||i.subcategory===sub)&&terms.every(q=>(i.name+' '+i.id+' '+i.subcategory).toLowerCase().includes(q)));
 if($('sort').value==='category')filtered.sort((a,b)=>a.category.localeCompare(b.category)||a.name.localeCompare(b.name));
 page=Math.max(0,Math.min(page,Math.ceil(filtered.length/pageSize)-1));
 $('catalog-count').textContent=filtered.length.toLocaleString()+' matches · '+items.length.toLocaleString()+' vanilla items';$('catalog-items').replaceChildren();
 for(const item of filtered.slice(page*pageSize,(page+1)*pageSize)){
  const row=document.createElement('div');row.className='catalog-item';
  const text=document.createElement('div');text.className='item-text';const name=document.createElement('b');name.textContent=item.name;const meta=document.createElement('small');meta.textContent=item.subcategory+' · '+item.id;text.append(name,meta);
  const button=document.createElement('button');const count=sets[active].filter(r=>r.item===item.id).length;button.textContent=count?'Add again ('+count+')':'+ Add';button.setAttribute('aria-label','Add '+item.name+' ('+item.id+')');
  button.onclick=()=>{addRules([makeRule(item.id)]);catalog();$('library-status').textContent=item.name+' added to your rules. Keep browsing or choose Done.';};
  row.append(itemIcon(item.id),text,button);$('catalog-items').append(row);
 }
 if(!filtered.length)$('catalog-items').textContent='No items found. Try a different category or search by item ID.';
 $('page-info').textContent=filtered.length?(page*pageSize+1)+'–'+Math.min((page+1)*pageSize,filtered.length)+' of '+filtered.length.toLocaleString():'0 results';
 $('previous').disabled=page===0;$('next').disabled=(page+1)*pageSize>=filtered.length;
}
function render(){
 $('set-title').textContent=names[active];$('set-mode').textContent=active==='each'?'INDEPENDENT DROPS':'RANDOM PICK POOL';
 $('set-help').textContent=active==='each'?'Each item gets its own chance to appear on a zombie.':'Random pick '+active.slice(-1)+': one matching item is chosen, then its drop chance is rolled.';
 $('rules').replaceChildren();$('empty').hidden=sets[active].length>0;$('clear').disabled=!sets[active].length;
 sets[active].forEach((rule,index)=>{
  const card=document.createElement('article');card.className='rule'; const body=document.createElement('div');body.className='rule-body';body.hidden=index!==expanded;
  const head=document.createElement('div');head.className='rule-head';
  const title=document.createElement('h3');title.textContent=itemName(rule.item);
  const actions=document.createElement('div');actions.className='actions';
  for(const [label,fn] of [['Duplicate',()=>{sets[active].splice(index+1,0,{...rule});render();}],['Remove',()=>{sets[active].splice(index,1);render();}]]){const b=document.createElement('button');b.className='icon-button';b.textContent=label;b.setAttribute('aria-label',label+' '+itemName(rule.item));b.onclick=fn;actions.append(b);}
  const edit=document.createElement('button');edit.className='edit-rule';edit.textContent=index===expanded?'Done':'Edit';edit.setAttribute('aria-label','Edit '+itemName(rule.item));edit.onclick=()=>{expanded=expanded===index?-1:index;render();}; actions.prepend(edit); const odds=document.createElement('span');odds.className='rule-odds';odds.textContent=rule.chance+'%';head.append(odds);head.append(itemIcon(rule.item,itemById.get(rule.item)?.category),title,actions);card.append(head,body); const advanced=document.createElement('details');advanced.className='advanced';const advancedTitle=document.createElement('summary');advancedTitle.textContent='More options';advanced.append(advancedTitle);
  const fields=document.createElement('div');fields.className='fields';advanced.append(fields);
  function field(labelText,input){const wrap=document.createElement('div');const label=document.createElement('label');input.id=`rule-${index}-${labelText.replaceAll(/[^a-z]/gi,'')}`;label.htmlFor=input.id;label.textContent=labelText;wrap.append(label,input);fields.append(wrap);return wrap;}
  const itemPicker=document.createElement('select');
  if(itemById.has(rule.item))itemPicker.append(option(rule.item,itemName(rule.item)));itemPicker.append(option('__custom','Custom / modded item…'));
  itemPicker.value=items.some(i=>i.id===rule.item)?rule.item:'__custom';
  const itemWrap=field('Item',itemPicker);
  const item=document.createElement('input');item.value=rule.item;item.spellcheck=false;item.placeholder='Module.ItemName';item.setAttribute('aria-label','Custom item ID');item.hidden=itemPicker.value!=='__custom';itemWrap.append(item);
  itemPicker.onchange=()=>{item.hidden=itemPicker.value!=='__custom';if(itemPicker.value==='__custom'){rule.item='';item.value='';item.focus();}else{rule.item=itemPicker.value;item.value=rule.item;}title.textContent=itemName(rule.item);head.querySelector('.item-icon').replaceWith(itemIcon(rule.item,itemById.get(rule.item)?.category));refresh();};
  const outfit=outfitSelect(rule.outfit);const outfitWrap=field('Zombie outfit',outfit);
  const custom=document.createElement('input');custom.placeholder='Exact outfit name';custom.setAttribute('aria-label','Custom outfit name');custom.value=rule.outfit;custom.hidden=!rule.outfit||outfits.includes(rule.outfit);outfitWrap.append(custom);
  outfit.onchange=()=>{custom.hidden=outfit.value!=='__custom';if(outfit.value==='__custom'){custom.value='';rule.outfit='';custom.focus();}else{rule.outfit=outfit.value;}refresh();};
  custom.oninput=()=>{rule.outfit=custom.value.trim();refresh();};
  item.oninput=()=>{rule.item=item.value.trim();title.textContent=itemName(rule.item);refresh();};
  function slider(parent,key,labelText,max,step){
   const wrap=document.createElement('div');wrap.className='slider-field';
   const line=document.createElement('div');line.className='slider-label';const label=document.createElement('label');const number=document.createElement('input');number.type='number';number.min='0';number.max=String(max);number.step=step;number.value=rule[key];number.id=`rule-${index}-${key}`;label.htmlFor=number.id;label.textContent=labelText;
   line.append(label,number);const range=document.createElement('input');range.type='range';range.min='0';range.max=String(max);range.step=step==='any'?'0.01':step;range.value=rule[key];range.setAttribute('aria-label',labelText+' slider');
   range.oninput=()=>{number.value=range.value;rule[key]=range.value;refresh();};number.oninput=()=>{rule[key]=number.value;range.value=number.value;refresh();};
   wrap.append(line,range);parent.append(wrap);
  }
  slider(body,'chance','Drop chance (%)',100,'any');
  const details=document.createElement('details');details.open=Number(rule.more)>0;const summary=document.createElement('summary');summary.textContent='Extra copies';details.append(summary);const note=document.createElement('p');note.className='small';note.textContent='After this item drops, try these additional rolls for more copies of the same item.';details.append(note);slider(details,'more','Additional rolls',100,'1');slider(details,'moreChance','Chance per additional roll (%)',100,'any');advanced.append(details);body.append(advanced);if(!rule.item||!itemById.has(rule.item)){advanced.open=true;body.hidden=false;}
  const description=document.createElement('p');description.className='rule-description';const error=document.createElement('p');error.className='error';error.setAttribute('role','status');body.append(description,error);
  function refresh(){
   try{validate(rule);error.textContent='';}catch(e){error.textContent=e.message;}
   odds.textContent=rule.chance+'%';const chance=Number(rule.chance); description.textContent=(Number.isFinite(chance)&&chance>=0&&chance<=100?(chance===0?'Never drops':chance===100?'Always drops before game multipliers':chance>=1?`About ${Number(chance.toFixed(2))} in 100 matching zombies`:`About 1 in ${Math.round(100/chance).toLocaleString()} matching zombies`):'Choose a chance from 0 to 100')+(rule.outfit?' · '+rule.outfit:'')+(Number(rule.more)>0?` · up to ${Number(rule.more)+1} copies`:'');
   outputs();
  }
  $('rules').append(card);refresh();
 });outputs();
}
for(const key of Object.keys(names)){const button=document.createElement('button');button.dataset.key=key;button.onclick=()=>{active=key;render();};$('tabs').append(button);}
$('search').oninput=()=>{page=0;catalog();};$('category').onchange=()=>{page=0;subcategories();catalog();};$('subcategory').onchange=$('sort').onchange=()=>{page=0;catalog();};$('previous').onclick=()=>{page--;catalog();$('catalog-items').scrollTop=0;};$('next').onclick=()=>{page++;catalog();$('catalog-items').scrollTop=0;};
$('custom').onclick=$('add').onclick=()=>{addRules([makeRule('','5','')]);$('library-dialog').close();};
$('browse').onclick=$('empty-add').onclick=()=>{catalog();$('library-status').textContent='';$('library-dialog').showModal();$('search').focus();};$('close-library').onclick=()=>$('library-dialog').close();
$('clear').onclick=()=>{if(confirm('Clear all rules in '+names[active]+'?')){sets[active]=[];render();}};
for(const b of document.querySelectorAll('[data-preset]'))b.onclick=()=>addRules(presets[b.dataset.preset].map(args=>makeRule(...args)));
$('load').onclick=()=>{try{const rules=parse($('import').value);if(!rules.length)throw Error('Paste at least one rule.');if(sets[active].length&&!confirm('Replace the rules in '+names[active]+'?'))return;sets[active]=rules;render();$('import-status').textContent=`Imported ${rules.length} rules into ${names[active]}.`;}catch(error){$('import-status').textContent=error.message;}};
$('export').onclick=()=>{try{const text=Object.entries(names).map(([key,name])=>`${name}\n${serialize(sets[key])||'(empty)'}\n`).join('\n');const url=URL.createObjectURL(new Blob([text],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download='mad-loot-ruleset.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(error){$('status').textContent=error.message;}};
$('finish').onclick=()=>{$('copy-dialog').showModal();};$('close-copy').onclick=()=>$('copy-dialog').close();
subcategories();catalog();render();
