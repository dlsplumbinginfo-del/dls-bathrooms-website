(() => {
 'use strict';
 const raw=new URLSearchParams(location.search).get('looks');
 if(!raw)return;
 const ids=[...new Set(raw.split(',').filter(n=>/^([1-9]|1[0-9]|20)$/.test(n)))];
 if(!ids.length)return;
 const field=document.getElementById('project-details');if(!field)return;
 const names=ids.map(n=>'DLS-'+n.padStart(2,'0')).join(', ');
 const intro=`I like these DLS bathroom inspiration concepts: ${names}.\nPlease adapt the look to my room and confirm the products, availability and quotation.\n\nRoom size: \nChanges I would like: `;
 if(!field.value.trim())field.value=intro;
 const label=document.createElement('p');label.className='form-note';label.textContent='Your selected inspiration looks: '+names;field.parentElement.before(label);
})();
