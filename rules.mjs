const identifier = /^[A-Za-z0-9_.-]+$/;
export function validate(rule) {
  if (!identifier.test(rule.item)) throw new Error('Enter an item ID without spaces or separators (for example Base.Axe).');
  if (rule.outfit && !identifier.test(rule.outfit)) throw new Error('Use an outfit name without spaces or separators.');
  for (const key of ['chance', 'moreChance']) {
    if (String(rule[key]).trim() === '' || !Number.isFinite(Number(rule[key])) || Number(rule[key]) < 0 || Number(rule[key]) > 100) throw new Error('Chances must be numbers from 0 to 100.');
  }
  if (String(rule.more).trim() === '' || !Number.isInteger(Number(rule.more)) || Number(rule.more) < 0 || Number(rule.more) > 100) throw new Error('Extra rolls must be a whole number from 0 to 100.');
  return rule;
}
export function serialize(rules) {
  return rules.map(rule => {
    validate(rule);
    if (Number(rule.more) > 0) return `item:${rule.item},chance:${Number(rule.chance)},more:${Number(rule.more)},moreChance:${Number(rule.moreChance)}${rule.outfit ? `,outfit:${rule.outfit}` : ''}`;
    return `${rule.outfit ? `${rule.outfit}:` : ''}${rule.item}:${Number(rule.chance)}`;
  }).join(';');
}
export function parse(text) {
  if (!text.trim()) return [];
  return text.split(';').map((entry, index) => {
    try {
      const rule = {item: '', outfit: '', chance: '1', more: '0', moreChance: '50'};
      if (entry.includes(',')) {
        const seen = new Set();
        for (const field of entry.split(',')) {
          const parts = field.split(':').map(value => value.trim());
          if (parts.length !== 2 || !Object.hasOwn(rule, parts[0]) || seen.has(parts[0]) || !parts[1]) throw new Error('Invalid or duplicate advanced field.');
          rule[parts[0]] = parts[1]; seen.add(parts[0]);
        }
      } else {
        const parts = entry.split(':').map(value => value.trim());
        if (parts.length === 2) [rule.item, rule.chance] = parts;
        else if (parts.length === 3) [rule.outfit, rule.item, rule.chance] = parts;
        else throw new Error('Use Item:Chance or Outfit:Item:Chance.');
      }
      return validate(rule);
    } catch (error) { throw new Error(`Rule ${index + 1}: ${error.message}`); }
  });
}
