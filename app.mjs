import {serialize,parse,validate} from './rules.mjs';
import {items,outfits,makeRule,presets} from './catalog.mjs';
const $=id=>document.getElementById(id);
const names={each:'Extra Rolls (Each)',one1:'Extra Rolls (One) 1',one2:'Extra Rolls (One) 2',one3:'Extra Rolls (One) 3'};
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
const itemName=id=>items.find(i=>i.id===id)?.name||id||'Custom item';
function option(value,label){const o=document.createElement('option');o.value=value;o.textContent=label;return o;}
function outfitSelect(value,custom=true){const select=document.createElement('select');select.append(option('','All zombie outfits'),...outfits.map(o=>option(o,o.replaceAll('_',' '))));if(value&&!outfits.includes(value))select.append(option(value,value));if(custom)select.append(option('__custom','Custom outfit…'));select.value=value;return select;}
$('add-outfit').replaceWith(Object.assign(outfitSelect('',false),{id:'add-outfit'}));
$('category').append(option('all','All categories'),...Array.from(new Set(items.map(i=>i.category))).map(c=>option(c,c)));
function save(){try{localStorage.setItem('mad-loot-rules',JSON.stringify(sets));}catch{storageWarning='Browser saving is unavailable. Download your rules before leaving.';}}
function outputs(){
 save();$('outputs').replaceChildren();
 for(const [key,name] of Object.entries(names)){
  const box=document.createElement('div');box.className='output-set'+(key===active?' current':'');
  const title=document.createElement('label');title.htmlFor='output-'+key;title.textContent=name;
  const meta=document.createElement('span');meta.className='small';meta.textContent=`${sets[key].length} rules`;
  const text=document.createElement('textarea');text.id='output-'+key;text.rows=2;text.readOnly=true;text.setAttribute('aria-label',name+' output');
  const button=document.createElement('button');button.className=key===active?'':'quiet';button.textContent='Copy '+(key==='each'?'Each':'One '+key.slice(-1));
  try{text.value=serialize(sets[key]);button.disabled=!sets[key].length;}catch(error){text.placeholder=error.message;button.disabled=true;}
  button.onclick=async()=>{try{await navigator.clipboard.writeText(text.value);$('status').textContent='Copied '+name+'. Paste it into that sandbox setting.';}catch{text.focus();text.select();$('status').textContent='Copy the selected text using your keyboard or browser menu.';}};
  box.append(title,meta,text,button);$('outputs').append(box);
 }
 $('status').textContent=storageWarning;
 document.querySelectorAll('#tabs button').forEach(b=>{b.textContent=names[b.dataset.key]+` (${sets[b.dataset.key].length})`;b.setAttribute('aria-pressed',String(b.dataset.key===active));});
 $('export').disabled=Object.values(sets).some(rules=>{try{serialize(rules);return false;}catch{return true;}});
}
function addRules(rules){sets[active].push(...rules);render();const cards=$('rules').children;if(cards.length)cards[cards.length-rules.length].scrollIntoView({block:'nearest',behavior:'smooth'});}
function catalog(){
 const query=$('search').value.toLowerCase().trim(),category=$('category').value;
 const filtered=items.filter(i=>(category==='all'||i.category===category)&&`${i.name} ${i.id}`.toLowerCase().includes(query));
 $('catalog-count').textContent=`${filtered.length} items`;$('catalog-items').replaceChildren();
 for(const item of filtered){
  const button=document.createElement('button');button.className='catalog-item';
  const icon=document.createElement('span');icon.className='item-icon';icon.textContent={Weapons:'⚒',Medical:'✚','Tools & supplies':'⚙','Food & drink':'◒',Ammunition:'▥','Books & skills':'▤','Everyday items':'◇',Fishing:'≈'}[item.category];
  const text=document.createElement('span');const name=document.createElement('b');name.textContent=item.name;const id=document.createElement('small');id.textContent=item.id;text.append(name,id);
  const plus=document.createElement('span');plus.className='plus';plus.textContent='+';
  button.append(icon,text,plus);button.setAttribute('aria-label','Add '+item.name);
  button.onclick=()=>{const rule=makeRule(item.id,$('add-chance').value,$('add-outfit').value);try{validate(rule);addRules([rule]);}catch(error){$('status').textContent=error.message;$('add-chance').reportValidity();}};
  $('catalog-items').append(button);
 }
 if(!filtered.length){const p=document.createElement('p');p.className='small';p.textContent='No matching items. Try another search, or add a custom item.';$('catalog-items').append(p);}
}
function render(){
 $('set-title').textContent=names[active];$('set-mode').textContent=active==='each'?'INDEPENDENT DROPS':'RANDOM PICK POOL';
 $('set-help').textContent=active==='each'?'Every matching item below gets its own drop roll. Add as many rules as you like.':'One matching rule from this set is selected at random, then its drop chance is rolled. Extra copies may add more of that selected item.';
 $('rules').replaceChildren();$('empty').hidden=sets[active].length>0;$('clear').disabled=!sets[active].length;
 sets[active].forEach((rule,index)=>{
  const card=document.createElement('article');card.className='rule';
  const head=document.createElement('div');head.className='rule-head';
  const title=document.createElement('h3');title.textContent=itemName(rule.item);
  const actions=document.createElement('div');actions.className='actions';
  for(const [label,fn] of [['Duplicate',()=>{sets[active].splice(index+1,0,{...rule});render();}],['Remove',()=>{sets[active].splice(index,1);render();}]]){const b=document.createElement('button');b.className='icon-button';b.textContent=label;b.setAttribute('aria-label',label+' '+itemName(rule.item));b.onclick=fn;actions.append(b);}
  head.append(title,actions);card.append(head);
  const fields=document.createElement('div');fields.className='fields';card.append(fields);
  function field(labelText,input){const wrap=document.createElement('div');const label=document.createElement('label');input.id=`rule-${index}-${labelText.replaceAll(/[^a-z]/gi,'')}`;label.htmlFor=input.id;label.textContent=labelText;wrap.append(label,input);fields.append(wrap);return wrap;}
  const itemPicker=document.createElement('select');
  itemPicker.append(...items.map(i=>option(i.id,i.name)),option('__custom','Custom / modded item…'));
  itemPicker.value=items.some(i=>i.id===rule.item)?rule.item:'__custom';
  const itemWrap=field('Item',itemPicker);
  const item=document.createElement('input');item.value=rule.item;item.spellcheck=false;item.placeholder='Module.ItemName';item.setAttribute('aria-label','Custom item ID');item.hidden=itemPicker.value!=='__custom';itemWrap.append(item);
  itemPicker.onchange=()=>{item.hidden=itemPicker.value!=='__custom';if(itemPicker.value==='__custom'){rule.item='';item.value='';item.focus();}else{rule.item=itemPicker.value;item.value=rule.item;}title.textContent=itemName(rule.item);refresh();};
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
  slider(card,'chance','Drop chance (%)',100,'any');
  const chips=document.createElement('div');chips.className='chance-chips';for(const [text,value] of [['Very rare','0.1'],['Rare','1'],['Uncommon','5'],['Common','25'],['Guaranteed','100']]){const b=document.createElement('button');b.textContent=text;b.className='chip';b.onclick=()=>{rule.chance=value;render();};chips.append(b);}card.append(chips);
  const details=document.createElement('details');details.open=Number(rule.more)>0;const summary=document.createElement('summary');summary.textContent='Extra copies';details.append(summary);const note=document.createElement('p');note.className='small';note.textContent='After this item drops, try these additional rolls for more copies of the same item.';details.append(note);slider(details,'more','Additional rolls',100,'1');slider(details,'moreChance','Chance per additional roll (%)',100,'any');card.append(details);
  const description=document.createElement('p');description.className='rule-description';const error=document.createElement('p');error.className='error';error.setAttribute('role','status');card.append(description,error);
  function refresh(){
   try{validate(rule);error.textContent='';}catch(e){error.textContent=e.message;}
   description.textContent=`${rule.chance || '0'}% base chance · ${rule.outfit||'All zombie outfits'}${Number(rule.more)>0?` · up to ${Number(rule.more)+1} copies`:''}`;
   outputs();
  }
  $('rules').append(card);refresh();
 });outputs();
}
for(const key of Object.keys(names)){const button=document.createElement('button');button.dataset.key=key;button.onclick=()=>{active=key;render();};$('tabs').append(button);}
$('search').oninput=catalog;$('category').onchange=catalog;
$('custom').onclick=$('add').onclick=()=>addRules([makeRule('','5',$('add-outfit').value)]);
$('empty-add').onclick=()=>{$('search').focus();$('search').scrollIntoView({block:'center',behavior:'smooth'});};
$('clear').onclick=()=>{if(confirm('Clear all rules in '+names[active]+'?')){sets[active]=[];render();}};
for(const b of document.querySelectorAll('[data-preset]'))b.onclick=()=>addRules(presets[b.dataset.preset].map(args=>makeRule(...args)));
$('load').onclick=()=>{try{const rules=parse($('import').value);if(!rules.length)throw Error('Paste at least one rule.');if(sets[active].length&&!confirm('Replace the rules in '+names[active]+'?'))return;sets[active]=rules;render();$('import-status').textContent=`Imported ${rules.length} rules into ${names[active]}.`;}catch(error){$('import-status').textContent=error.message;}};
$('export').onclick=()=>{try{const text=Object.entries(names).map(([key,name])=>`${name}\n${serialize(sets[key])||'(empty)'}\n`).join('\n');const url=URL.createObjectURL(new Blob([text],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download='mad-loot-ruleset.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(error){$('status').textContent=error.message;}};
catalog();render();
