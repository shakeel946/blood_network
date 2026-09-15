const app = document.getElementById('app');
const nav = document.getElementById('nav');
const toastRoot = document.getElementById('toast-root');
let token = localStorage.getItem('bn_token');
let role = localStorage.getItem('bn_role');

const api = async (path, opts = {}) => {
  opts.headers = { ...(opts.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  if (opts.body && !(opts.body instanceof FormData)) opts.headers['Content-Type'] = 'application/json';
  const r = await fetch(path, opts);
  let d = {};
  try { d = await r.json(); } catch {}
  if (!r.ok) throw new Error(d.detail || 'Request failed');
  return d;
};

function toast(message) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  toastRoot.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

function logout() {
  localStorage.clear();
  token = null;
  role = null;
  renderLogin();
}

function renderLogin() {
  nav.innerHTML = '';
  app.innerHTML = `
    <section class="auth-layout">
      <div class="hero-card auth-hero">
        <div>
          <span class="eyebrow">♥ Community powered</span>
          <h1>Every donor can make a difference.</h1>
          <p>Blood Network gives donors a simple, secure place to manage their information and availability.</p>
          <div class="hero-points">
            <div class="hero-point"><i>✓</i><span>Secure donor profiles</span></div>
            <div class="hero-point"><i>✓</i><span>Availability at a glance</span></div>
            <div class="hero-point"><i>✓</i><span>Donation history in one place</span></div>
          </div>
        </div>
        <div class="eyebrow">Blood Network · Donor Registry</div>
      </div>
      <div class="card auth-panel">
        <span class="eyebrow" style="color:var(--primary)">Welcome back</span>
        <h2>Donor Login</h2>
        <p class="subtitle muted">Sign in to manage your donor profile.</p>
        <form id="login" class="grid">
          <div class="field full"><label>Email</label><input name="email" type="email" autocomplete="email" placeholder="you@example.com" required></div>
          <div class="field full"><label>Password</label><input name="password" type="password" autocomplete="current-password" placeholder="Your password" minlength="8" required></div>
          <div class="full actions"><button>Login <span>→</span></button><button type="button" class="secondary" id="signupBtn">Create account</button></div>
        </form>
        <div id="msg" class="msg"></div>
      </div>
    </section>`;

  document.getElementById('login').onsubmit = async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    try {
      const d = await api('/api/auth/login', { method: 'POST', body: JSON.stringify(Object.fromEntries(f)) });
      localStorage.setItem('bn_token', d.access_token);
      localStorage.setItem('bn_role', d.role);
      token = d.access_token;
      role = d.role;
      render();
    } catch (x) {
      document.getElementById('msg').textContent = x.message;
    }
  };
  document.getElementById('signupBtn').onclick = renderSignup;
}

function renderSignup() {
  nav.innerHTML = '';
  app.innerHTML = `
    <section class="container">
      <div class="card" style="max-width:900px;margin:0 auto">
        <span class="eyebrow" style="color:var(--primary)">Join the network</span>
        <h1 style="font-size:clamp(30px,4vw,42px);letter-spacing:-.05em;margin:10px 0 8px">Create your donor profile</h1>
        <p class="subtitle">Add your details once and keep your availability up to date.</p>
        <div class="divider"></div>
        <form id="signup" class="grid">
          <div class="field"><label>Full Name</label><input name="full_name" autocomplete="name" required></div>
          <div class="field"><label>Age</label><input name="age" type="number" min="18" max="65" required></div>
          <div class="field"><label>Gender</label><select name="gender"><option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option></select></div>
          <div class="field"><label>Blood Group</label><select name="blood_group"><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select></div>
          <div class="field"><label>Phone Number</label><input name="phone" type="tel" autocomplete="tel" required></div>
          <div class="field"><label>Email</label><input name="email" type="email" autocomplete="email" required></div>
          <div class="field full"><label>Address</label><textarea name="address" required></textarea></div>
          <div class="field"><label>Last Blood Donation Date</label><input name="last_donation_date" type="date"></div>
          <div class="field"><label>Available to Donate</label><select name="available_to_donate"><option value="true">Yes</option><option value="false">No</option></select></div>
          <div class="field"><label>Password</label><input name="password" type="password" autocomplete="new-password" minlength="8" required></div>
          <div class="full actions"><button>Create account <span>→</span></button><button type="button" class="secondary" id="back">Back to login</button></div>
        </form>
        <div id="msg" class="msg"></div>
      </div>
    </section>`;

  document.getElementById('back').onclick = renderLogin;
  document.getElementById('signup').onsubmit = async e => {
    e.preventDefault();
    const o = Object.fromEntries(new FormData(e.target));
    o.age = Number(o.age);
    o.available_to_donate = o.available_to_donate === 'true';
    if (!o.last_donation_date) delete o.last_donation_date;
    try {
      await api('/api/auth/register', { method: 'POST', body: JSON.stringify(o) });
      toast('Account created. You can now log in.');
      renderLogin();
    } catch (x) {
      document.getElementById('msg').textContent = x.message;
    }
  };
}

function photoMarkup(url) {
  return url
    ? `<img class="photo" src="${esc(url)}" alt="Profile photo">`
    : `<div class="photo photo-placeholder" aria-label="No profile photo">♥</div>`;
}

function field(label, name, value, type = 'text', full = false) {
  return `<div class="field ${full ? 'full' : ''}"><label>${label}</label><input name="${name}" type="${type}" value="${esc(value)}" required></div>`;
}

async function renderDonor() {
  try {
    const d = await api('/api/me');
    nav.innerHTML = `<button class="secondary" onclick="renderDonor()">My Profile</button><button onclick="logout()">Logout</button>`;
    app.innerHTML = `
      <section class="container">
        <div class="dashboard-head">
          <div><span class="eyebrow" style="color:var(--primary)">Donor portal</span><h1>My Profile</h1><p class="muted">Keep your information and availability current.</p></div>
        </div>
        <div class="card profile-card">
          <div class="profile-head">${photoMarkup(d.profile_photo)}<div><h2>${esc(d.full_name)}</h2><span class="pill ${d.available_to_donate ? 'available' : 'unavailable'}">${d.available_to_donate ? 'Available to donate' : 'Currently unavailable'}</span></div></div>
          <div class="divider"></div>
          <form id="profile" class="grid">
            ${field('Full Name','full_name',d.full_name)}${field('Age','age',d.age,'number')}
            <div class="field"><label>Gender</label><select name="gender">${['Male','Female','Other','Prefer not to say'].map(x => `<option ${x === d.gender ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
            <div class="field"><label>Blood Group</label><select name="blood_group">${['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(x => `<option ${x === d.blood_group ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
            ${field('Phone Number','phone',d.phone)}${field('Email','email',d.email,'email')}${field('Address','address',d.address,'text',true)}${field('Last Donation Date','last_donation_date',d.last_donation_date || '','date')}
            <div class="field"><label>Available to Donate</label><select name="available_to_donate"><option value="true" ${d.available_to_donate ? 'selected' : ''}>Yes</option><option value="false" ${!d.available_to_donate ? 'selected' : ''}>No</option></select></div>
            <div class="field full"><label>Profile Photo</label><input id="photo" type="file" accept="image/png,image/jpeg,image/webp"></div>
            <div class="full actions"><button>Save changes <span>✓</span></button></div>
          </form>
          <div id="msg" class="msg"></div>
        </div>
        <div class="card">
          <div class="section-title"><div><h2>Donation History</h2><p class="muted" style="margin:5px 0 0">Your recorded blood donations.</p></div></div>
          ${d.donations.length ? `<div class="history-list">${d.donations.map(x => `<div class="history-item"><span class="history-date">${esc(x.donation_date)}</span><span class="muted">${esc(x.details || 'No details')}</span></div>`).join('')}</div>` : '<div class="empty-state">No donation history has been recorded yet.</div>'}
        </div>
      </section>`;

    document.getElementById('profile').onsubmit = async e => {
      e.preventDefault();
      const o = Object.fromEntries(new FormData(e.target));
      o.age = Number(o.age);
      o.available_to_donate = o.available_to_donate === 'true';
      if (!o.last_donation_date) delete o.last_donation_date;
      try {
        await api('/api/me', { method: 'PATCH', body: JSON.stringify(o) });
        const f = document.getElementById('photo').files[0];
        if (f) {
          const fd = new FormData();
          fd.append('file', f);
          await api('/api/me/photo', { method: 'POST', body: fd });
        }
        toast('Profile updated successfully.');
        renderDonor();
      } catch (x) {
        document.getElementById('msg').textContent = x.message;
      }
    };
  } catch (e) {
    if (/session|expired|unauthorized/i.test(e.message)) logout();
    else app.innerHTML = `<section class="container"><div class="card"><h2>Unable to load profile</h2><p class="muted">${esc(e.message)}</p></div></section>`;
  }
}

async function renderAdmin() {
  try {
    const s = await api('/api/admin/stats');
    nav.innerHTML = `<button class="secondary" onclick="renderAdmin()">Dashboard</button><button onclick="logout()">Logout</button>`;
    app.innerHTML = `
      <section class="container">
        <div class="dashboard-head">
          <div><span class="eyebrow" style="color:var(--primary)">Administration</span><h1>Donor Dashboard</h1><p class="muted">Manage your donor registry from one place.</p></div>
        </div>
        <div class="stats-grid">
          <div class="card stat-card"><div class="stat-icon">◎</div><div class="stat-label">Total donors</div><div class="stat">${s.total_donors}</div></div>
          <div class="card stat-card"><div class="stat-icon">✓</div><div class="stat-label">Available now</div><div class="stat">${s.available_donors}</div></div>
          <div class="card stat-card"><div class="stat-icon">!</div><div class="stat-label">Disabled</div><div class="stat">${s.disabled_donors}</div></div>
        </div>
        <div class="card">
          <div class="section-title"><div><h2>Donor Registry</h2><p class="muted" style="margin:5px 0 0">Search, view and manage donor profiles.</p></div></div>
          <div class="toolbar">
            <div class="search"><span class="search-icon">⌕</span><input id="search" placeholder="Search name, email or phone"></div>
            <select id="bg"><option value="">All blood groups</option>${['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(x => `<option>${x}</option>`).join('')}</select>
            <select id="av"><option value="">All availability</option><option value="true">Available</option><option value="false">Unavailable</option></select>
            <button onclick="loadDonors()">Search</button>
          </div>
          <div class="table-wrap"><table id="donors"></table></div>
        </div>
        <div id="detail" class="detail"></div>
      </section>`;
    loadDonors();
  } catch (e) {
    if (/session|expired|unauthorized/i.test(e.message)) logout();
    else app.innerHTML = `<section class="container"><div class="card"><h2>Unable to load dashboard</h2><p class="muted">${esc(e.message)}</p></div></section>`;
  }
}

async function loadDonors() {
  const q = new URLSearchParams();
  const s = document.getElementById('search').value;
  const b = document.getElementById('bg').value;
  const a = document.getElementById('av').value;
  if (s) q.set('search', s);
  if (b) q.set('blood_group', b);
  if (a) q.set('available', a);
  try {
    const ds = await api('/api/donors?' + q);
    document.getElementById('donors').innerHTML = `
      <thead><tr><th>Name</th><th>Blood</th><th>Age</th><th>Phone</th><th>Availability</th><th>Action</th></tr></thead>
      <tbody>${ds.length ? ds.map(d => `<tr><td><div class="table-name">${esc(d.full_name)}</div></td><td><span class="blood-badge">${esc(d.blood_group)}</span></td><td>${esc(d.age)}</td><td>${esc(d.phone)}</td><td><span class="pill ${d.available_to_donate ? 'available' : 'unavailable'}">${d.available_to_donate ? 'Available' : 'Unavailable'}</span></td><td><button class="secondary" onclick="showDonor(${d.id})">View</button></td></tr>`).join('') : '<tr><td colspan="6"><div class="empty-state">No donors match your filters.</div></td></tr>'}</tbody>`;
  } catch (e) {
    if (/session|expired|unauthorized/i.test(e.message)) logout();
    else toast(e.message);
  }
}

async function showDonor(id) {
  try {
    const d = await api('/api/donors/' + id);
    document.getElementById('detail').innerHTML = `
      <div class="card">
        <div class="section-title"><div><span class="eyebrow" style="color:var(--primary)">Donor details</span><h2 style="margin-top:7px">Profile & management</h2></div><button class="ghost" onclick="document.getElementById('detail').innerHTML=''">Close</button></div>
        <div class="profile-head">${photoMarkup(d.profile_photo)}<div><h2>${esc(d.full_name)}</h2><p class="muted" style="margin:0">${esc(d.email)} · ${esc(d.phone)}</p></div></div>
        <div class="divider"></div>
        <div class="grid">
          ${field('Full Name','full_name',d.full_name)}${field('Age','age',d.age,'number')}
          <div class="field"><label>Gender</label><select id="e_gender">${['Male','Female','Other','Prefer not to say'].map(x => `<option ${x === d.gender ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
          <div class="field"><label>Blood Group</label><select id="e_bg">${['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(x => `<option ${x === d.blood_group ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
          ${field('Phone','phone',d.phone)}${field('Email','email',d.email,'email')}${field('Address','address',d.address,'text',true)}${field('Last Donation','last_donation_date',d.last_donation_date || '','date')}
          <div class="field"><label>Availability</label><select id="e_av"><option value="true" ${d.available_to_donate ? 'selected' : ''}>Available</option><option value="false" ${!d.available_to_donate ? 'selected' : ''}>Unavailable</option></select></div>
          <div class="field"><label>Account Status</label><select id="e_status"><option ${d.account_status === 'ACTIVE' ? 'selected' : ''}>ACTIVE</option><option ${d.account_status === 'DISABLED' ? 'selected' : ''}>DISABLED</option></select></div>
        </div>
        <div class="actions"><button onclick="saveAdmin(${d.id})">Save changes</button><button class="secondary" onclick="addDonation(${d.id})">Record donation</button><button class="danger" onclick="deleteDonor(${d.id}, '${esc(d.full_name).replace(/'/g, "\\'")}')">Delete donor</button></div>
        <div class="divider"></div>
        <div class="section-title"><h3>Donation History</h3></div>
        ${d.donations.length ? `<div class="history-list">${d.donations.map(x => `<div class="history-item"><span class="history-date">${esc(x.donation_date)}</span><span class="muted">${esc(x.details || 'No details')}</span></div>`).join('')}</div>` : '<div class="empty-state">No donations recorded.</div>'}
      </div>`;
  } catch (e) { toast(e.message); }
}

async function saveAdmin(id) {
  const c = document.querySelectorAll('#detail input');
  const o = {};
  c.forEach(x => o[x.name] = x.value);
  o.age = Number(o.age);
  o.gender = document.getElementById('e_gender').value;
  o.blood_group = document.getElementById('e_bg').value;
  o.available_to_donate = document.getElementById('e_av').value === 'true';
  o.account_status = document.getElementById('e_status').value;
  if (!o.last_donation_date) delete o.last_donation_date;
  try {
    await api('/api/donors/' + id, { method: 'PATCH', body: JSON.stringify(o) });
    toast('Donor updated successfully.');
    showDonor(id);
    loadDonors();
  } catch (e) { toast(e.message); }
}

async function deleteDonor(id, name) {
  if (!confirm(`Delete donor "${name}"? This permanently removes the donor account, profile, and donation history.`)) return;
  try {
    await api('/api/donors/' + id, { method: 'DELETE' });
    document.getElementById('detail').innerHTML = '';
    toast('Donor deleted.');
    await loadDonors();
    await renderAdmin();
  } catch (e) { alert(e.message); }
}

async function addDonation(id) {
  const date = prompt('Donation date (YYYY-MM-DD):');
  if (!date) return;
  const details = prompt('Details (optional):') || null;
  try {
    await api('/api/donors/' + id + '/donations', { method: 'POST', body: JSON.stringify({ donation_date: date, details }) });
    toast('Donation recorded.');
    showDonor(id);
    loadDonors();
  } catch (e) { alert(e.message); }
}

function esc(v) {
  return String(v ?? '').replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));
}

function render() {
  if (!token) return renderLogin();
  if (role === 'ADMIN') return renderAdmin();
  return renderDonor();
}

render();
