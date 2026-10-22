/* Browser-local demo accounts. Server authentication is required for production access. */
const USERS_KEY='rk-finance-demo-team-v1';
let currentUserId=null,teamFormMode=null,teamTargetId=null;
function readUsers(){const users=JSON.parse(localStorage.getItem(USERS_KEY)||'[]');if(!Array.isArray(users))throw Error('Invalid team data');return users}
function writeUsers(users){localStorage.setItem(USERS_KEY,JSON.stringify(users))}
function newSalt(){return Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('')}
async function passwordDigest(password,salt){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+':'+password))),b=>b.toString(16).padStart(2,'0')).join('')}
async function ensureUsers(){
  if(localStorage.getItem(USERS_KEY)!==null)return;
  const users=[],seeds=[['demo-admin','RK Admin','RK-ADMIN','admin','demo123'],['demo-manager','RK Manager','RK-MANAGER','manager','manager123'],['demo-staff','RK Staff','RK-STAFF','staff','staff123']];
  for(const [id,name,userId,role,password]of seeds){const salt=newSalt();users.push({id,name,userId,role,salt,passwordHash:await passwordDigest(password,salt),active:true,joined:'2026-10-20',createdBy:'Demo setup',updated:'2026-10-20'})}
  if(localStorage.getItem(USERS_KEY)===null)writeUsers(users);
}
function activeUser(){if(!currentUserId)return null;return readUsers().find(u=>u.id===currentUserId)||null}
function checkSession(){const u=activeUser();if(!u||!u.active){if(currentUserId){signOut();document.getElementById('loginError').textContent='Your account is no longer active. Contact the administrator.'}return false}return true}
function requireAdmin(){if(!checkSession())return false;if(activeUser().role!=='admin'){showToast('Only an administrator can manage team accounts');return false}return true}
function roleLabel(role){return {admin:'Administrator',manager:'Manager',staff:'Staff',cashier:'Cashier',collector:'Collection Staff'}[role]||'Staff'}
function applyRole(){
  const user=activeUser();document.getElementById('signedInName').textContent=user.name;document.getElementById('signedInRole').textContent=roleLabel(user.role);document.getElementById('roleBadge').textContent=roleLabel(user.role);
  document.querySelector('.side-foot .user-dot').textContent=user.name.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();document.querySelector('[data-screen=reports]').classList.toggle('hidden',user.role==='staff');
}
function signOut(){
  currentUserId=null;document.getElementById('app').classList.add('hidden');document.getElementById('login').classList.remove('hidden');
  ['profileOverlay','modalOverlay','teamOverlay'].forEach(id=>document.getElementById(id).classList.remove('open'));
  document.getElementById('teamFormBody').innerHTML='';teamFormMode=null;teamTargetId=null;document.getElementById('loginPassword').value='';document.getElementById('loginError').textContent='';
}
function teamButton(label,mode,id){return '<button class="mini" data-mode="'+mode+'" data-id="'+safe(id)+'" onclick="openTeamForm(this.dataset.mode,this.dataset.id)">'+label+'</button>'}
function renderSettings(){
  if(!checkSession())return;const user=activeUser();
  let content='<article class="card account-card"><div class="account-avatar">'+safe(user.name.split(' ').map(x=>x[0]).join('').slice(0,2))+'</div><div><h3>'+safe(user.name)+'</h3><p>'+safe(user.userId)+' · '+roleLabel(user.role)+'</p></div><span class="tag active">Active account</span></article>';
  if(user.role!=='admin'){
    content+='<article class="card settings-note"><h3>Office access</h3><p>'+(user.role==='manager'?'Manage loans, collections, follow-ups and reports.':'Manage customer loans, collections and follow-ups.')+'</p><p>Account creation, password resets and activation are handled by your administrator.</p></article>';
    const accountQuery=String(window.ERP?.settingsQuery?.()||'').toLowerCase();if(accountQuery&&![user.name,user.userId,roleLabel(user.role),'office access'].join(' ').toLowerCase().includes(accountQuery))content='<article class="card settings-note"><h3>No matching account details</h3><p>Try your name, user ID or role, or clear the search.</p></article>';document.getElementById('settingsContent').innerHTML=content;return;
  }
  const users=readUsers(),teamQuery=String(window.ERP?.settingsQuery?.()||'').toLowerCase(),shownUsers=users.filter(u=>[u.name,u.userId,roleLabel(u.role),u.active?'Active':'Deactivated'].join(' ').toLowerCase().includes(teamQuery));
  content+='<div class="team-summary"><div><span>Team accounts</span><strong>'+users.length+'</strong></div><div><span>Active</span><strong>'+users.filter(u=>u.active).length+'</strong></div><div><span>Deactivated</span><strong>'+users.filter(u=>!u.active).length+'</strong></div></div>';
  content+='<article class="card"><div class="card-head"><div><h3>Team & access</h3><p>Create staff / manager logins and manage office access.</p></div><button class="primary" data-mode="create" onclick="openTeamForm(this.dataset.mode)">＋ Add team member</button></div>';
  content+='<div class="table-wrap"><table class="data-table"><thead><tr><th>Team member</th><th>User ID</th><th>Role</th><th>Joined</th><th>Status</th><th>Manage</th></tr></thead><tbody>';
  content+=shownUsers.length?shownUsers.map(u=>'<tr><td><strong>'+safe(u.name)+'</strong>'+(u.id===user.id?' <small class="muted">(You)</small>':'')+'</td><td>'+safe(u.userId)+'</td><td>'+roleLabel(u.role)+'</td><td>'+safe(u.joined)+'</td><td><span class="tag '+(u.active?'active':'closed')+'">'+(u.active?'Active':'Deactivated')+'</span></td><td>'+(u.id===user.id?'<span class="muted">Administrator</span>':'<div class="team-actions">'+teamButton('Edit','edit',u.id)+teamButton('Reset password','reset',u.id)+'<button class="mini" data-id="'+safe(u.id)+'" onclick="toggleTeamUser(this.dataset.id)">'+(u.active?'Deactivate':'Activate')+'</button></div>')+'</td></tr>').join(''):'<tr><td colspan="6" class="erp-empty">No team accounts match this search.</td></tr>';
  content+='</tbody></table></div></article><p class="settings-footnote">Demo team accounts are saved in this browser. Production user access requires server-side authentication.</p>';
  document.getElementById('settingsContent').innerHTML=content;
}
function openTeamForm(mode,id=null){
  if(!requireAdmin())return;const u=id?readUsers().find(x=>x.id===id):null;
  if(!['create','edit','reset'].includes(mode)||mode!=='create'&&(!u||u.role==='admin'))return;
  teamFormMode=mode;teamTargetId=id;document.getElementById('teamFormError').textContent='';
  document.getElementById('teamFormTitle').textContent=mode==='create'?'Add team member':mode==='reset'?'Reset password':'Edit team member';
  let body='';
  if(mode==='reset'){
    body='<p class="team-reset-note">Set a new password for <strong>'+safe(u.name)+'</strong> ('+safe(u.userId)+').</p>'+inputField('New password','teamPassword','password','minlength="8" autocomplete="new-password" required');
  }else{
    const today=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'});
    body=formSection('Team member',inputField('Full name','teamName','text','maxlength="80" required value="'+safe(u?.name||'')+'"')+inputField('User ID','teamUserId','text','pattern="[A-Za-z0-9_-]{3,32}" maxlength="32" required autocomplete="off" '+(u?'readonly ':'')+'value="'+safe(u?.userId||'')+'"')+'<div class="field"><label for="teamRole">Access role</label><select id="teamRole" name="teamRole"><option value="staff" '+(u?.role==='staff'?'selected':'')+'>Staff</option><option value="manager" '+(u?.role==='manager'?'selected':'')+'>Manager</option><option value="cashier" '+(u?.role==='cashier'?'selected':'')+'>Cashier</option><option value="collector" '+(u?.role==='collector'?'selected':'')+'>Collection Staff</option></select></div>'+inputField('Joining date','teamJoined','date','required value="'+safe(u?.joined||today)+'"')+(mode==='create'?inputField('Password · at least 8 characters','teamPassword','password','minlength="8" autocomplete="new-password" required'):''));
  }
  document.getElementById('teamFormBody').innerHTML=body;document.getElementById('teamFormSubmit').textContent=mode==='create'?'Create account':mode==='reset'?'Reset password':'Save changes';document.getElementById('teamOverlay').classList.add('open');
}
function closeTeamForm(){document.getElementById('teamOverlay').classList.remove('open');document.getElementById('teamFormBody').innerHTML='';teamTargetId=null;teamFormMode=null}
async function saveTeamUser(e){
  e.preventDefault();if(!requireAdmin())return;
  const data=new FormData(e.target),mode=teamFormMode,id=teamTargetId,button=document.getElementById('teamFormSubmit');button.disabled=true;
  try{
    let users=readUsers(),u=users.find(x=>x.id===id);
    if(!['create','edit','reset'].includes(mode))throw Error('Reopen the account form.');
    if(mode!=='create'&&(!u||u.role==='admin'))throw Error('Administrator accounts cannot be changed here.');
    if(mode==='create'||mode==='edit'){
      const name=String(data.get('teamName')||'').trim(),userId=String(data.get('teamUserId')||'').trim().toUpperCase(),role=String(data.get('teamRole')),joined=String(data.get('teamJoined')||'');
      if(!name||!/^[-_A-Z0-9]{3,32}$/.test(userId)||!['staff','manager','cashier','collector'].includes(role)||!/^\d{4}-\d{2}-\d{2}$/.test(joined))throw Error('Enter a name, valid User ID, joining date, and a valid team role.');
      if(mode==='create'&&users.some(x=>x.userId===userId))throw Error('That User ID already exists. Choose another.');
      if(mode==='create')u={id:crypto.randomUUID(),name,userId,role,active:true,joined,createdBy:activeUser().userId};
      else{u.name=name;u.role=role;u.joined=joined}
    }
    if(mode==='create'||mode==='reset'){
      const password=String(data.get('teamPassword')||'');if(password.length<8)throw Error('Use a password with at least 8 characters.');
      const salt=newSalt(),hash=await passwordDigest(password,salt);if(!requireAdmin())return;
      users=readUsers();
      if(mode==='create'){if(users.some(x=>x.userId===u.userId))throw Error('That User ID already exists.');users.push(u)}
      else{u=users.find(x=>x.id===id);if(!u||u.role==='admin')throw Error('Account unavailable.')}
      u.salt=salt;u.passwordHash=hash;
    }
    u.updated=new Date().toISOString();writeUsers(users);closeTeamForm();renderSettings();showToast(mode==='create'?'Team account created':mode==='reset'?'Password reset successfully':'Team member updated');
  }catch(err){document.getElementById('teamFormError').textContent=err.message}
  finally{button.disabled=false}
}
function toggleTeamUser(id){if(!requireAdmin())return;const users=readUsers(),u=users.find(x=>x.id===id);if(!u||u.role==='admin'||u.id===currentUserId)return;u.active=!u.active;u.updated=new Date().toISOString();writeUsers(users);renderSettings();showToast(u.active?'Account activated':'Account deactivated')}
window.addEventListener('storage',e=>{if(e.key===USERS_KEY&&currentUserId&&checkSession()){applyRole();if(document.getElementById('settings').classList.contains('active'))renderSettings()}});
