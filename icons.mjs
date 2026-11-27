import {iconPaths} from './icon-map.mjs';
export function itemIcon(id='') {
 const span=document.createElement('span');span.className='item-icon';span.setAttribute('aria-hidden','true');
 if(iconPaths[id]) {const image=document.createElement('img');image.src=iconPaths[id];image.alt='';image.width=32;image.height=32;span.append(image);}
 else {span.classList.add('unknown-icon');span.textContent='?';}
 return span;
}
