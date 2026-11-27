import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {items,presets,makeRule} from '../catalog.mjs';
import {iconPaths} from '../icon-map.mjs';
import {serialize,parse} from '../rules.mjs';
const ids=new Set(items.map(i=>i.id));
assert.equal(ids.size,items.length,'No duplicate item IDs');
assert.ok(items.length>5000,'Full vanilla catalog should be present');
for(const item of items){
 assert.ok(item.name&&item.category&&item.subcategory,item.id);
 assert.equal(parse(serialize([makeRule(item.id)]))[0].item,item.id);
}
for(const [id,path] of Object.entries(iconPaths)){
 assert.ok(ids.has(id),id);
 assert.ok(existsSync(new URL('../'+path,import.meta.url)),path);
}
for(const preset of Object.values(presets)){
 for(const [id] of preset)assert.ok(ids.has(id),'Preset ID exists: '+id);
 const rules=preset.map(args=>makeRule(...args));assert.deepEqual(parse(serialize(rules)),rules);
}
console.log(`PASS: ${items.length} unique items, ${Object.keys(iconPaths).length} sprite paths, all presets and serialized IDs`);
