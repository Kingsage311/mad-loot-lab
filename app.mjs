import {serialize, parse} from './rules.mjs';
const $ = id => document.getElementById(id);
const blank = () => ({item:'',outfit:'',chance:'1',more:'0',moreChance:'50'});
const sets = {each:[],one1:[],one2:[],one3:[]};
let storageAvailable = true;
try {
  const saved = JSON.parse(localStorage.getItem('mad-loot-rules') || 'null');
  if (saved) for (const key of Object.keys(sets)) {
    if (!Array.isArray(saved[key])) throw new Error('Invalid saved rules');
    sets[key] = saved[key].map(rule => {
      if (!rule || ['item','outfit','chance','more','moreChance'].some(field => typeof rule[field] !== 'string')) throw new Error('Invalid saved rule');
      return rule;
    });
  }
} catch { storageAvailable = false; }
if (!Object.values(sets).some(rules => rules.length)) sets.each.push(blank());
function update() {
  const rules = sets[$('set').value];
  try {
    $('output').value = serialize(rules);
    $('copy').disabled = !rules.length;
    $('status').textContent = rules.length ? `${rules.length} rule${rules.length === 1 ? '' : 's'} ready to copy.` : 'Add a rule to get started.';
  } catch (error) {
    $('output').value = '';
    $('copy').disabled = true;
    $('status').textContent = error.message;
  }
  try { localStorage.setItem('mad-loot-rules', JSON.stringify(sets)); }
  catch { storageAvailable = false; }
  if (!storageAvailable) $('status').textContent += ' Browser saving may be unavailable; copy your output before leaving.';
}
function render() {
  const key = $('set').value;
  $('destination').textContent = $('set').selectedOptions[0].textContent;
  $('set-help').textContent = key === 'each' ? 'Every matching rule gets its own chance to drop an item.' : 'One matching rule is picked at random, then its drop chance is rolled. Advanced extra rolls can add more copies of that item.';
  $('rules').replaceChildren();
  sets[key].forEach((rule, index) => {
    const card = document.createElement('section'); card.className = 'rule';
    card.innerHTML = `<div class="rule-head"><h3>Loot rule ${index+1}</h3><button class="remove" type="button">Remove</button></div><div class="fields"></div><details><summary>Extra copies of this item</summary><p class="hint">After the main drop succeeds, roll for additional copies. Maximum 100 extra rolls.</p><div class="fields extra"></div></details>`;
    card.querySelector('.remove').ariaLabel = `Remove loot rule ${index+1}`;
    card.querySelector('.remove').onclick = () => {sets[key].splice(index,1);render();};
    for (const [field, title, placeholder] of [['item','Item ID','Base.Axe'],['outfit','Zombie outfit (optional)','All outfits'],['chance','Drop chance (%)','1'],['more','Extra rolls','0'],['moreChance','Chance per extra roll (%)','50']]) {
      const wrapper = document.createElement('div');
      if (field === 'item') wrapper.className = 'wide';
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.id = `${key}-${index}-${field}`;label.htmlFor = input.id;label.textContent = title;
      input.value = rule[field];input.placeholder = placeholder;
      if (['chance','more','moreChance'].includes(field)) {input.type='number';input.min='0';input.max='100';input.step=field==='more'?'1':'any';}
      else {input.type='text';input.spellcheck=false;input.setAttribute('list',field==='item'?'items':'outfits');}
      input.oninput = () => {rule[field]=input.value.trim();update();};
      wrapper.append(label,input);
      card.querySelector(field === 'more' || field === 'moreChance' ? '.extra' : '.fields').append(wrapper);
    }
    card.querySelector('details').open = Number(rule.more)>0;
    $('rules').append(card);
  });
  update();
}
$('set').onchange = () => {$('import-status').textContent='';render();};
$('add').onclick = () => {sets[$('set').value].push(blank());render();$('rules').lastElementChild.querySelector('input').focus();};
$('copy').onclick = async () => {
  try {await navigator.clipboard.writeText($('output').value);$('status').textContent='Copied. Paste into '+$('destination').textContent+'.';}
  catch {$('output').focus();$('output').select();$('status').textContent='Select and copy the highlighted output using your browser or keyboard.';}
};
$('load').onclick = () => {
  try {
    const imported = parse($('import').value);
    if (!imported.length) throw new Error('Paste at least one rule to import.');
    if (sets[$('set').value].length && !window.confirm('Replace the rules in this selected set with the imported rules?')) return;
    sets[$('set').value] = imported;render();$('import-status').textContent=`Imported ${imported.length} rules.`;
  } catch(error) {$('import-status').textContent=error.message;}
};
render();
