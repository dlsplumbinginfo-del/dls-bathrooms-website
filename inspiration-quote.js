(() => {
 const raw=new URLSearchParams(location.search).get('design');if(!raw)return;
 const field=document.getElementById('project-details');if(!field)return;
 try{const url=new URL(raw);if(url.origin!==location.origin||url.pathname!=='/ideas/customise/')return;
 const q=url.searchParams,n=Number(q.get('look'));if(!Number.isInteger(n)||n<1||n>70)return;
 const details=['My customised bathroom: DLS-'+String(n).padStart(2,'0'),'Approximate room: '+q.get('roomWidth')+' × '+q.get('roomDepth')+'m · '+q.get('shape'),'Finish: '+q.get('finish'),'Wall detail: '+q.get('structure'),'My complete choices and linked products: '+url.href,'','Changes or questions: '].join('\n');
 if(!field.value.trim())field.value=details;
 const note=document.createElement('p');note.className='form-note';note.textContent='Your customised bathroom choices are included below.';field.parentElement.before(note);
 }catch{}
})();
(() => {
 'use strict';
 const raw=new URLSearchParams(location.search).get('looks');
 if(!raw)return;
 const ids=[...new Set(raw.split(',').filter(n=>/^(?:[1-9]|[1-6][0-9]|70)$/.test(n)))];
 if(!ids.length)return;
 const field=document.getElementById('project-details');if(!field)return;
 const names=ids.map(n=>'DLS-'+n.padStart(2,'0')).join(', ');
 const intro=`I like these DLS bathroom inspiration concepts: ${names}.\nPlease adapt the look to my room and confirm the products, availability and quotation.\n\nRoom size: \nChanges I would like: `;
 if(!field.value.trim())field.value=intro;
 const label=document.createElement('p');label.className='form-note';label.textContent='Your selected inspiration looks: '+names;field.parentElement.before(label);
})();
