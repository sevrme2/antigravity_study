// const { api } = window;

// State Variables
let allClubs = [];
let bookmarks = [];
let notifications = [];
let users = [];
let currentUser = null;

// Filter State
let activeCategory = 'all';
let activeKeywords = new Set();
let activeStatus = new Set(); // e.g. "모집중", "상시모집"
let currentSearch = '';
let showFavoritesOnly = false;
let currentSort = 'category';

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const mainScreen = document.getElementById('main-screen');

// Login Elements
const viewLogin = document.getElementById('view-login');
const loginIdInput = document.getElementById('login-id');
const loginPwInput = document.getElementById('login-pw');
const autoLoginCheck = document.getElementById('auto-login-check');
const btnLoginSubmit = document.getElementById('btn-login-submit');

// Signup Elements
const viewSignup = document.getElementById('view-signup');
const signupEmail = document.getElementById('signup-email');
const btnSendAuth = document.getElementById('btn-send-auth');
const authCodeGroup = document.getElementById('auth-code-group');
const signupAuthCode = document.getElementById('signup-auth-code');
const btnVerifyAuth = document.getElementById('btn-verify-auth');
const authStatusMsg = document.getElementById('auth-status-msg');
const signupStudentid = document.getElementById('signup-studentid');
const signupName = document.getElementById('signup-name');
const signupPw = document.getElementById('signup-pw');
const btnSignupSubmit = document.getElementById('btn-signup-submit');

// Forgot Password Elements
const viewForgot = document.getElementById('view-forgot');
const forgotEmail = document.getElementById('forgot-email');
const btnForgotSend = document.getElementById('btn-forgot-send');
const forgotCodeGroup = document.getElementById('forgot-code-group');
const forgotAuthCode = document.getElementById('forgot-auth-code');
const btnForgotVerify = document.getElementById('btn-forgot-verify');
const forgotStatusMsg = document.getElementById('forgot-status-msg');
const forgotNewPwGroup = document.getElementById('forgot-new-pw-group');
const forgotNewPw = document.getElementById('forgot-new-pw');
const btnForgotSubmit = document.getElementById('btn-forgot-submit');

// State for Auth
let isSignupVerified = false;
let isForgotVerified = false;

// Initialization
async function init() {
  try {
    users = await api.loadUsers();
  } catch (err) {
    console.error('Failed to load users:', err);
    users = [];
  }
  
  // Check Auto Login
  const savedAutoLogin = localStorage.getItem('ku_autologin_user');
  if (savedAutoLogin) {
    const autoUser = users.find(u => u.id === savedAutoLogin);
    if (autoUser) {
      currentUser = autoUser;
      enterApp(true); // skip animation
    }
  }

  setupAuthEvents();
  setupEventListeners();
  await loadData();
}

function setupAuthEvents() {
  // View Switcher
  document.querySelectorAll('.auth-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = e.currentTarget.dataset.target;
      if(!targetId) return;
      document.querySelectorAll('.login-container').forEach(v => {
        v.classList.remove('active-view');
        v.classList.add('hidden-view');
      });
      document.getElementById(targetId).classList.remove('hidden-view');
      document.getElementById(targetId).classList.add('active-view');
    });
  });

  // Login
  btnLoginSubmit.addEventListener('click', handleLogin);
  document.getElementById('btn-logout').addEventListener('click', handleLogout);

  // Signup Flow
  btnSendAuth.addEventListener('click', () => {
    const email = signupEmail.value.trim();
    if(!email) return alert('이메일을 입력해주세요.');
    if(users.some(u => u.email === email)) return alert('이미 가입된 이메일입니다.');
    authStatusMsg.textContent = '인증번호가 발송되었습니다. (테스트용: 1234)';
    authStatusMsg.className = 'status-msg';
    authCodeGroup.style.display = 'flex';
  });

  btnVerifyAuth.addEventListener('click', () => {
    if(signupAuthCode.value.trim() === '1234') {
      authStatusMsg.textContent = '이메일 인증이 완료되었습니다.';
      authStatusMsg.className = 'status-msg success';
      // Remove disabled toggle logic since inputs are enabled by default
      isSignupVerified = true;
    } else {
      authStatusMsg.textContent = '인증번호가 일치하지 않습니다.';
      authStatusMsg.className = 'status-msg';
    }
  });

  btnSignupSubmit.addEventListener('click', async () => {
    if(!isSignupVerified) return alert('먼저 이메일 인증을 완료해주세요.');
    const email = signupEmail.value.trim();
    const studentid = signupStudentid.value.trim();
    const name = signupName.value.trim();
    const pw = signupPw.value.trim();

    if(!studentid) return alert('학번/아이디를 입력해주세요.');
    if(!name || !pw) return alert('모든 정보를 입력해주세요.');
    if(users.some(u => u.id === studentid)) return alert('이미 가입된 아이디입니다.');

    const newUser = { id: studentid, email, name, pw };
    users.push(newUser);
    await api.saveUsers(users);
    
    // Auto login
    currentUser = newUser;
    enterApp(false);
  });

  // Forgot PW Flow
  btnForgotSend.addEventListener('click', () => {
    const email = forgotEmail.value.trim();
    if(!users.some(u => u.email === email)) return alert('해당 이메일로 가입된 계정이 없습니다.');
    forgotStatusMsg.textContent = '인증번호가 발송되었습니다. (테스트용: 1234)';
    forgotStatusMsg.className = 'status-msg';
    forgotCodeGroup.style.display = 'flex';
  });

  btnForgotVerify.addEventListener('click', () => {
    if(forgotAuthCode.value.trim() === '1234') {
      forgotStatusMsg.textContent = '이메일 인증이 완료되었습니다.';
      forgotStatusMsg.className = 'status-msg success';
      forgotEmail.disabled = true;
      forgotAuthCode.disabled = true;
      btnForgotSend.disabled = true;
      btnForgotVerify.disabled = true;
      
      forgotNewPwGroup.style.display = 'block';
      isForgotVerified = true;
    } else {
      forgotStatusMsg.textContent = '인증번호가 일치하지 않습니다.';
      forgotStatusMsg.className = 'status-msg';
    }
  });

  btnForgotSubmit.addEventListener('click', async () => {
    if(!isForgotVerified) return;
    const email = forgotEmail.value.trim();
    const newPw = forgotNewPw.value.trim();
    if(!newPw) return alert('새 비밀번호를 입력해주세요.');

    const user = users.find(u => u.email === email);
    user.pw = newPw;
    await api.saveUsers(users);

    alert('비밀번호가 성공적으로 변경되었습니다.');
    document.querySelector('.auth-link[data-target="view-login"]').click();
    
    // reset forgot form
    forgotEmail.disabled = false; forgotEmail.value = '';
    forgotAuthCode.disabled = false; forgotAuthCode.value = '';
    btnForgotSend.disabled = false; btnForgotVerify.disabled = false;
    forgotStatusMsg.textContent = '';
    forgotCodeGroup.style.display = 'none';
    forgotNewPwGroup.style.display = 'none';
    isForgotVerified = false;
  });
}

async function handleLogin() {
  const id = loginIdInput.value.trim();
  const pw = loginPwInput.value.trim();
  if (!id || !pw) return alert('아이디와 비밀번호를 입력해주세요.');
  
  // id can be studentid or email
  const user = users.find(u => (u.id === id || u.email === id) && u.pw === pw);
  if (user) {
    currentUser = user;
    if (autoLoginCheck.checked) {
      localStorage.setItem('ku_autologin_user', user.id);
    }
    enterApp(false);
  } else {
    loginIdInput.classList.add('shake-error');
    loginPwInput.classList.add('shake-error');
    setTimeout(() => {
      loginIdInput.classList.remove('shake-error');
      loginPwInput.classList.remove('shake-error');
    }, 400);
  }
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem('ku_autologin_user');
  loginIdInput.value = '';
  loginPwInput.value = '';
  authScreen.style.opacity = '1';
  authScreen.style.visibility = 'visible';
  mainScreen.style.display = 'none';
}

function enterApp(skipAnimation = false) {
  document.getElementById('current-user-name').textContent = currentUser.name;
  
  if(skipAnimation) {
    authScreen.style.visibility = 'hidden';
    authScreen.style.opacity = '0';
    mainScreen.style.display = 'block';
    renderAll();
  } else {
    authScreen.style.opacity = '0';
    setTimeout(() => {
      authScreen.style.visibility = 'hidden';
      mainScreen.style.display = 'block';
      renderAll();
    }, 500);
  }
}

// Data Parsing
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = [];
    let currentVal = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      let char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentVal);
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal);
    
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h.trim()] = values[idx] ? values[idx].trim() : '';
    });
    if (obj.keywords) {
      obj.keywordArray = obj.keywords.split(';').map(k => k.trim()).filter(k => k);
    } else {
      obj.keywordArray = [];
    }
    return obj;
  }).filter(club => club.name);
}

async function loadData() {
  try {
    const response = await fetch('./clubs.csv');
    const csvContent = await response.text();
    
    allClubs = parseCSV(csvContent);
    
    bookmarks = JSON.parse(
      localStorage.getItem('bookmarks') || '[]'
    );
    
    notifications = JSON.parse(
      localStorage.getItem('notification') || '[]'
    );

    console.log('클럽 수:', allclubs.length);

  } catch (err) {
    console.error('Data load error:', err);
  }
}

function setupEventListeners() {
  // Category Filters
  document.querySelectorAll('.cat-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeCategory = e.target.dataset.category;
      renderAll();
    });
  });

  // Status Filters
  document.querySelectorAll('.status-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const status = e.target.dataset.status;
      if (activeStatus.has(status)) {
        activeStatus.delete(status);
        e.target.classList.remove('active');
      } else {
        activeStatus.add(status);
        e.target.classList.add('active');
      }
      renderAll();
    });
  });

  // Search
  document.getElementById('search-input').addEventListener('input', (e) => {
    currentSearch = e.target.value.toLowerCase();
    renderAll();
  });

  // Favorites
  document.getElementById('favorites-toggle-btn').addEventListener('click', (e) => {
    showFavoritesOnly = !showFavoritesOnly;
    e.target.style.color = showFavoritesOnly ? 'var(--color-voltage-lime)' : 'var(--color-midnight-ink)';
    renderAll();
  });

  // Sort
  document.getElementById('sort-select').addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderAll();
  });
  
  // Clear Filters
  document.getElementById('clear-all-filters').addEventListener('click', clearFilters);
  
  // Modals
  document.getElementById('modal-close').addEventListener('click', () => {
    document.getElementById('club-modal').style.display = 'none';
  });
  document.querySelector('.modal-overlay').addEventListener('click', (e) => {
    if(e.target === document.getElementById('club-modal')) {
      document.getElementById('club-modal').style.display = 'none';
    }
  });
}

function clearFilters() {
  activeCategory = 'all';
  activeKeywords.clear();
  activeStatus.clear();
  currentSearch = '';
  showFavoritesOnly = false;
  
  document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
  document.querySelector('.cat-pill[data-category="all"]').classList.add('active');
  
  document.querySelectorAll('.status-pill').forEach(b => b.classList.remove('active'));
  document.getElementById('search-input').value = '';
  document.getElementById('favorites-toggle-btn').style.color = 'var(--color-midnight-ink)';
  
  renderAll();
}

function renderAll() {
  renderKeywordFilters();
  renderCategoryTabCounts();
  renderActiveFiltersBanner();
  renderClubs();
}

function renderCategoryTabCounts() {
  const counts = {};
  allClubs.forEach(club => {
    counts[club.category] = (counts[club.category] || 0) + 1;
  });
  
  document.querySelectorAll('.cat-pill').forEach(tab => {
    const cat = tab.dataset.category;
    const existing = tab.querySelector('.tab-count');
    if (existing) existing.remove();
    
    const count = cat === 'all' ? allClubs.length : (counts[cat] || 0);
    if (count > 0) {
      const span = document.createElement('span');
      span.className = 'tab-count';
      span.textContent = `(${count})`;
      tab.appendChild(span);
    }
  });
}

function renderKeywordFilters() {
  const kwContainer = document.getElementById('keyword-filters');
  // Generate top keywords for currently visible clubs (or all)
  const kwCounts = {};
  allClubs.forEach(club => {
    club.keywordArray.forEach(k => {
      kwCounts[k] = (kwCounts[k] || 0) + 1;
    });
  });
  
  const topKeywords = Object.entries(kwCounts)
    .sort((a,b) => b[1] - a[1])
    .slice(0, 15)
    .map(entry => entry[0]);

  kwContainer.innerHTML = topKeywords.map(kw => `
    <button class="filter-pill kw-pill ${activeKeywords.has(kw) ? 'active' : ''}" data-kw="${kw}">#${kw}</button>
  `).join('');
  
  document.querySelectorAll('.kw-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const kw = e.target.dataset.kw;
      if (activeKeywords.has(kw)) activeKeywords.delete(kw);
      else activeKeywords.add(kw);
      renderAll();
    });
  });
}

function renderActiveFiltersBanner() {
  const banner = document.getElementById('active-filters-banner');
  const bar = document.getElementById('active-filters-bar');
  const pills = [];
  
  if (activeCategory !== 'all') pills.push(`<span class="kw-tag">${activeCategory}</span>`);
  if (currentSearch) pills.push(`<span class="kw-tag">검색: ${currentSearch}</span>`);
  if (showFavoritesOnly) pills.push(`<span class="kw-tag" style="background:var(--color-midnight-ink); color:white;">관심 동아리</span>`);
  activeStatus.forEach(s => pills.push(`<span class="kw-tag" style="background:var(--color-bordeaux-maroon); color:white;">${s}</span>`));
  activeKeywords.forEach(k => pills.push(`<span class="kw-tag">#${k}</span>`));
  
  if (pills.length > 0) {
    bar.innerHTML = pills.join('');
    banner.style.display = 'flex';
  } else {
    banner.style.display = 'none';
  }
}

async function toggleBookmark(e, clubId) {
  e.stopPropagation();
  if (bookmarks.includes(clubId)) {
    bookmarks = bookmarks.filter(id => id !== clubId);
  } else {
    bookmarks.push(clubId);
  }
  await api.saveBookmarks(bookmarks);
  renderAll();
}

function showClubModal(club) {
  const modal = document.getElementById('club-modal');
  const body = document.getElementById('modal-body');
  
  body.innerHTML = `
    <div style="margin-bottom: 24px;">
      <span class="card-category">${club.category}</span>
      <h2 style="font-size:32px; font-weight:800; margin-top:8px;">${club.name}</h2>
    </div>
    
    <div style="background:var(--color-bone-canvas); padding:24px; border-radius:16px; margin-bottom:24px;">
      <h4 style="font-weight:700; margin-bottom:8px;">주요 활동</h4>
      <p style="font-size:15px; white-space:pre-wrap;">${club.description}</p>
    </div>
    
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
      <div style="border:1px solid var(--color-cement-gray); padding:16px; border-radius:12px;">
        <h4 style="font-weight:700; font-size:12px; color:var(--color-slate-mute);">모집 상태</h4>
        <p style="font-weight:700;">${club.status}</p>
      </div>
      <div style="border:1px solid var(--color-cement-gray); padding:16px; border-radius:12px;">
        <h4 style="font-weight:700; font-size:12px; color:var(--color-slate-mute);">마감일</h4>
        <p style="font-weight:700;">${club.deadline || '상시'}</p>
      </div>
      <div style="border:1px solid var(--color-cement-gray); padding:16px; border-radius:12px;">
        <h4 style="font-weight:700; font-size:12px; color:var(--color-slate-mute);">연락처</h4>
        <p style="font-weight:700;">${club.instagram || '-'}</p>
      </div>
    </div>
    
    <div style="margin-top:24px;">
      ${club.keywordArray.map(k => `<span class="kw-tag">#${k}</span>`).join('')}
    </div>
  `;
  modal.style.display = 'flex';
}

function renderClubs() {
  const grid = document.getElementById('club-grid');
  
  let filtered = allClubs.filter(club => {
    // Category
    if (activeCategory !== 'all' && club.category !== activeCategory) return false;
    // Search
    if (currentSearch) {
      const target = `${club.name} ${club.category} ${club.description} ${club.keywords}`.toLowerCase();
      if (!target.includes(currentSearch)) return false;
    }
    // Favorites
    if (showFavoritesOnly && !bookmarks.includes(club.id)) return false;
    // Keywords
    if (activeKeywords.size > 0) {
      const hasAll = Array.from(activeKeywords).every(k => club.keywordArray.includes(k));
      if (!hasAll) return false;
    }
    // Status
    if (activeStatus.size > 0 && !activeStatus.has(club.status)) return false;
    
    return true;
  });

  document.getElementById('club-count-number').textContent = filtered.length;

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state"><h3>결과가 없습니다.</h3><p>다른 필터를 선택해보세요.</p></div>`;
    return;
  }

  // Sorting
  if (currentSort === 'name') {
    filtered.sort((a,b) => a.name.localeCompare(b.name));
  } else if (currentSort === 'recruiting') {
    filtered.sort((a,b) => {
      const sA = a.status === '모집중' ? 0 : a.status === '상시모집' ? 1 : 2;
      const sB = b.status === '모집중' ? 0 : b.status === '상시모집' ? 1 : 2;
      return sA - sB;
    });
  }

  grid.innerHTML = '';

  // Group by category if sort is 'category'
  if (currentSort === 'category') {
    const grouped = {};
    filtered.forEach(club => {
      if (!grouped[club.category]) grouped[club.category] = [];
      grouped[club.category].push(club);
    });

    Object.keys(grouped).forEach(cat => {
      const header = document.createElement('div');
      header.className = 'group-header';
      header.textContent = `${cat} (${grouped[cat].length})`;
      grid.appendChild(header);
      
      grouped[cat].forEach(club => {
        grid.appendChild(createCard(club));
      });
    });
  } else {
    filtered.forEach(club => {
      grid.appendChild(createCard(club));
    });
  }
}

function createCard(club) {
  const isFav = bookmarks.includes(club.id);
  const card = document.createElement('div');
  card.className = 'club-card';
  card.innerHTML = `
    <div class="card-top">
      <span class="card-category">${club.category}</span>
      <button class="bookmark-btn ${isFav ? 'active' : ''}">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>
    </div>
    <div class="card-title">${club.name}</div>
    <div class="card-desc">${club.description.substring(0, 70)}${club.description.length > 70 ? '...' : ''}</div>
    <div class="card-tags">
      ${club.keywordArray.slice(0,3).map(k => `<span class="kw-tag">#${k}</span>`).join('')}
    </div>
    <div class="card-bottom">
      <span class="status-badge" data-status="${club.status}">${club.status}</span>
    </div>
  `;
  
  card.querySelector('.bookmark-btn').addEventListener('click', (e) => toggleBookmark(e, club.id));
  card.addEventListener('click', () => showClubModal(club));
  return card;
}

// Start
init();
