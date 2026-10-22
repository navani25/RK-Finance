/* Presentation and keyboard access only; business records and login are untouched. */
(()=>{'use strict';
const app=document.getElementById('app');
const paths={dashboard:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',finance:'<path d="M5 4h14M5 8h14M7 4c8 0 9 8 0 8l10 8M7 12H5"/>',gold:'<path d="m8 5-5 6 9 10 9-10-5-6H8Z M3 11h18 M8 5l4 16 4-16"/>',collections:'<path d="M4 5h16v16H4z M8 2v6M16 2v6M8 12h8M8 16h5"/>',reports:'<path d="M4 3h12l4 4v14H4zM15 3v5h5M8 16v-3M12 16v-6M16 16v-4"/>',settings:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2" fill="white"/><circle cx="16" cy="12" r="2" fill="white"/><circle cx="10" cy="18" r="2" fill="white"/>',plus:'<path d="M12 5v14M5 12h14"/>',receipt:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3ZM9 8h6M9 12h6"/>',arrow:'<path d="M5 12h14M14 7l5 5-5 5"/>',export:'<path d="M12 3v12M7 10l5 5 5-5M4 16v5h16v-5"/>'};
const icon=id=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[id]||paths.arrow)+'</svg>';
app.querySelectorAll('.nav button').forEach(b=>{b.querySelector('.nav-icon').innerHTML=icon(b.dataset.screen)});
const content=app.querySelector('.content');content.id='workspaceMain';content.tabIndex=-1;
const skip=document.createElement('a');skip.href='#workspaceMain';skip.className='skip-workspace';skip.textContent='Skip to workspace';app.prepend(skip);
const overlays=['profileOverlay','modalOverlay','teamOverlay'].map(id=>document.getElementById(id));
const labels=['Loan details','modalTitle','teamFormTitle'];
overlays.forEach((o,i)=>{const panel=o.firstElementChild;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');if(i)panel.setAttribute('aria-labelledby',labels[i]);else panel.setAttribute('aria-label',labels[i]);o.querySelector('.x').setAttribute('aria-label','Close dialog')});
const toast=document.getElementById('toast');if(toast){toast.setAttribute('role','status');toast.setAttribute('aria-live','polite')}
const resize=new ResizeObserver(entries=>entries.forEach(({target})=>{const overflow=target.scrollWidth>target.clientWidth+2;target.classList.toggle('has-overflow',overflow);target.setAttribute('aria-label',overflow?'Records: scroll horizontally to see all columns':'Records')}));
const tracked=new Set();
function paymentTotal(){const form=document.getElementById('modalFields'),box=form.querySelector('.payment-preview');if(!box)return;const p=Number(form.querySelector('[name=principal]')?.value||0),i=Number(form.querySelector('[name=interest]')?.value||0);const text=new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format((Number.isFinite(p)?p:0)+(Number.isFinite(i)?i:0));const strong=box.querySelector('strong');if(strong.textContent!==text)strong.textContent=text}
document.getElementById('modalFields').addEventListener('input',paymentTotal);
document.getElementById('modalFields').addEventListener('change',paymentTotal);
let stack=[],returnFocus=new Map(),frame=0;
function visible(e){return e.getClientRects().length>0&&!e.disabled}
function sync(){frame=0;
 tracked.forEach(el=>{if(!el.isConnected){resize.unobserve(el);tracked.delete(el)}});
 document.querySelectorAll('#app .table-wrap,#profileOverlay .table-wrap').forEach(el=>{if(!tracked.has(el)){tracked.add(el);resize.observe(el)}});
 document.querySelectorAll('#modalOverlay [required],#teamOverlay [required]').forEach(input=>{if(input.type==='hidden'||input.type==='checkbox'||!input.id)return;const label=document.querySelector('label[for="'+CSS.escape(input.id)+'"]');if(label&&!label.querySelector('.required-mark')){const mark=document.createElement('span');mark.className='required-mark';mark.textContent=' *';mark.setAttribute('aria-hidden','true');label.append(mark)}});
 const fields=document.getElementById('modalFields');if(fields.querySelector('[name=principal]')&&fields.querySelector('[name=interest]')&&!fields.querySelector('.payment-preview')){const panel=document.createElement('div');panel.className='payment-preview';panel.setAttribute('aria-live','polite');panel.innerHTML='<span>Payment total</span><strong></strong>';fields.querySelector('.form-section')?.after(panel)}paymentTotal();
 document.querySelectorAll('#app [data-action],#profileOverlay [data-action]').forEach(b=>{if(b.querySelector('svg'))return;const a=b.dataset.action;let id;if(a==='collect'||a.endsWith('-new'))id='plus';else if(a==='receipt'||a.startsWith('doc-')||a==='print-report')id='receipt';else if(a==='export-report')id='export';else if(a==='loan-view')id='arrow';if(id)b.insertAdjacentHTML('afterbegin',icon(id))});
 app.querySelectorAll('.status-switch button,.simple-tabs button').forEach(b=>{const value=String(b.classList.contains('active'));if(b.getAttribute('aria-pressed')!==value)b.setAttribute('aria-pressed',value)});
 const opened=overlays.filter(o=>o.classList.contains('open'));let restore=null;
 stack.forEach(o=>{if(!opened.includes(o)){restore=returnFocus.get(o);returnFocus.delete(o)}});
 opened.forEach(o=>{if(!stack.includes(o)){returnFocus.set(o,document.activeElement);stack=stack.filter(x=>x!==o).concat(o);queueMicrotask(()=>{const field=[...o.querySelectorAll('input:not([type=hidden]),select,textarea')].find(visible)||o.querySelector('button');field?.focus()})}});
 stack=stack.filter(o=>opened.includes(o));app.inert=!!stack.length;document.body.classList.toggle('dialog-open',!!stack.length);
 overlays.forEach(o=>{o.inert=stack.length>0&&o!==stack.at(-1)});if(restore?.isConnected&&visible(restore))restore.focus();else if(restore&&!stack.length)content.focus()
}
function schedule(){if(!frame)frame=requestAnimationFrame(sync)}
const observer=new MutationObserver(schedule);observer.observe(app,{childList:true,subtree:true});overlays.forEach(o=>observer.observe(o,{attributes:true,attributeFilter:['class'],childList:true,subtree:true}));
document.addEventListener('keydown',e=>{const o=stack.at(-1);if(!o)return;if(e.key==='Escape'){e.preventDefault();o.querySelector('.x').click();return}if(e.key!=='Tab')return;const nodes=[...o.querySelectorAll('a[href],button,input:not([type=hidden]),select,textarea,[tabindex="0"]')].filter(visible);const first=nodes[0],last=nodes.at(-1);if(!first)return;if(e.shiftKey&&(document.activeElement===first||!o.contains(document.activeElement))){e.preventDefault();last.focus()}else if(!e.shiftKey&&(document.activeElement===last||!o.contains(document.activeElement))){e.preventDefault();first.focus()}});
sync();
})();
