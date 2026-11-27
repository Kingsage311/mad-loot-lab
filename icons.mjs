const paths={
 axe:'M9 21 18 3M12 6 7 4 3 10 9 13 13 8M16 5 20 7',
 knife:'M4 21 10 15M8 13 12 17M10 13 19 3Q23 10 14 17Z',
 hammer:'M5 21 13 9M8 5 12 2 21 9 17 13Z',
 bat:'M4 21 11 14M10 14 16 3Q19 0 22 4L14 17Z',
 medical:'M5 7H19V21H5ZM9 7V3H15V7M9 14H15M12 11V17',
 pills:'M6 19Q2 15 6 11L12 5Q16 1 20 5Q24 9 20 13L14 19Q10 23 6 19ZM10 7 18 15',
 bottle:'M9 2H15V7L18 11V21H6V11L9 7ZM7 14H17M9 5H15',
 food:'M12 7Q3 2 3 12Q3 21 9 21H15Q21 21 21 12Q21 2 12 7ZM12 7V3L16 2',
 book:'M4 3H18V21H4ZM7 3V21M10 8H15M10 12H15',
 ammo:'M5 21V8L8 2 11 8V21ZM15 21V8L18 2 21 8V21ZM5 17H11M15 17H21',
 tool:'M4 21 14 11Q10 3 18 2L16 7 20 9 23 5Q25 15 17 14L7 23Z',
 roll:'M5 7Q5 2 12 2Q19 2 19 7V18Q19 23 12 23Q5 23 5 18ZM5 7Q12 13 19 7M10 6H14',
 money:'M2 5H22V19H2ZM7 5Q7 10 2 10M17 19Q17 14 22 14M12 8V16M15 10Q9 6 9 11Q9 13 15 13Q15 18 9 15',
 pencil:'M4 21 5 15 17 3 22 8 10 20ZM14 6 19 11M5 15 10 20',
 fish:'M3 12Q12 1 20 12Q12 23 3 12ZM20 12 24 7V17ZM14 10H14.1',
 generic:'M4 7 12 3 20 7V18L12 22 4 18ZM4 7 12 12 20 7M12 12V22'
};
export function itemIcon(id='',category=''){
 const value=id.toLowerCase();let type=category==='Medical'?'medical':category==='Books & skills'?'book':category==='Ammunition'?'ammo':category==='Food & drink'?'food':category==='Fishing'?'fish':category==='Tools & supplies'?'tool':'generic';
 for(const [pattern,key] of [[/axe/,'axe'],[/knife|scalpel/,'knife'],[/hammer|dumbbell/,'hammer'],[/baseballbat|crowbar/,'bat'],[/pills/,'pills'],[/bottle|whiskey|extinguisher|glue|toothpaste/,'bottle'],[/bandage|sheets|tape|line/,'roll'],[/money/,'money'],[/pencil|pen|screwdriver/,'pencil']])if(pattern.test(value)){type=key;break;}
 const span=document.createElement('span');span.className='item-icon icon-'+type;span.setAttribute('aria-hidden','true');
 span.innerHTML=`<svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[type]}"/></svg>`;return span;
}
