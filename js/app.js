const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let characters = [];        // 全部角色(從 Supabase 讀)
let filteredData = [];      // 篩選後顯示用
let currentBookIndex = 0;
let currentTheme = 'retro';
const ITEMS_PER_PAGE = 18;
let deletingId = null;      // 待刪除角色 id
let pendingFile = null;     // 表單選取但還沒上傳的頭貼檔

const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const val = id => document.getElementById(id).value.trim();
const imgOf = item => item.avatar_url || DEFAULT_IMG;

/* ---------- 讀取資料 ---------- */
async function loadCharacters() {
  const { data, error } = await db.from('characters')
    .select('*').order('created_at', { ascending: false });
  if (error) { console.error(error); alert('讀取失敗：' + error.message); return; }
  characters = data || [];
  populateParentFilter();
  filterCards();
}

function populateParentFilter() {
  const sel = document.getElementById('parentFilter');
  const cur = sel.value;
  const owners = [...new Set(characters.map(c => c.owner).filter(Boolean))];
  sel.innerHTML = '<option value="ALL">全部顯示</option>' +
    owners.map(o => `<option value="${esc(o)}">${esc(o)}</option>`).join('');
  if ([...sel.options].some(o => o.value === cur)) sel.value = cur;
}

/* ---------- 主題切換(四種風格) ---------- */
function switchTheme(theme) {
  currentTheme = theme;
  const body = document.getElementById('appBody');
  const headerBg = document.getElementById('headerBg');
  const headerIcon = document.getElementById('headerIcon');
  const headerTitle = document.getElementById('headerTitle');
  const fabBtn = document.getElementById('fabBtn');
  const bookView = document.getElementById('bookView');
  const gridView = document.getElementById('gridView');
  const themeSelector = document.getElementById('themeSelector');
  const parentFilter = document.getElementById('parentFilter');
  const modalBox = document.getElementById('modalBox');
  const modalTopBox = document.getElementById('modalTopBox');
  const modalBottomBox = document.getElementById('modalBottomBox');
  const formModalBox = document.getElementById('formModalBox');
  const deleteModalBox = document.getElementById('deleteModalBox');
  const cancelBtn = document.getElementById('cancelBtn');
  const saveBtn = document.getElementById('saveBtn');
  const uploadBtn = document.getElementById('uploadBtn');
  const deleteCancelBtn = document.getElementById('deleteCancelBtn');

  if (theme === 'retro') {
    body.className = "bg-library-paper min-h-screen font-serif text-stone-900 p-4 sm:p-6 relative pb-24 transition-all";
    headerBg.className = "max-w-7xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-md shadow-md border-2 border-amber-900/30 bg-[#fbf5e6]";
    headerIcon.className = "fa-solid fa-book-bookmark text-2xl text-amber-800";
    headerTitle.innerText = "皇家檔案館 · 大型典籍書冊";
    fabBtn.className = "fixed bottom-6 right-6 z-40 bg-amber-800 text-amber-100 w-14 h-14 rounded-lg shadow-2xl border-2 border-amber-600 flex items-center justify-center text-xl";
    const selectStyle = "bg-[#f4ebd0] border-2 border-amber-900/40 text-amber-950 text-xs rounded block p-2 outline-none cursor-pointer shadow-sm font-bold transition-all";
    themeSelector.className = selectStyle; parentFilter.className = selectStyle;
    modalBox.className = "w-full max-w-lg h-[480px] bg-[#fbf5e6] rounded-md shadow-2xl p-6 border-4 border-amber-900/40 flex flex-col justify-between relative transition-all text-stone-900";
    modalTopBox.className = "bg-[#f4ebd0] p-3.5 rounded border border-amber-900/30 shadow-sm text-xs";
    modalBottomBox.className = "bg-[#f4ebd0] p-3.5 rounded border border-amber-900/30 shadow-sm text-xs flex-1 flex flex-col overflow-hidden";
    formModalBox.className = "w-full max-w-lg bg-[#fbf5e6] rounded-md shadow-2xl p-6 border-4 border-amber-900/40 flex flex-col gap-4 relative max-h-[90vh] overflow-y-auto text-stone-900 font-serif";
    deleteModalBox.className = "w-full max-w-sm bg-[#fbf5e6] rounded-md shadow-2xl p-6 text-center space-y-4 border-4 border-amber-900/40 text-stone-900 font-serif";
    updateInputStyles("bg-[#f4ebd0] border-2 border-amber-900/30 text-amber-950 placeholder-stone-500 focus:border-amber-700");
    uploadBtn.className = "bg-amber-900/10 hover:bg-amber-900/20 text-amber-950 px-3 py-2 rounded font-bold transition shrink-0 border border-amber-900/30";
    cancelBtn.className = "px-4 py-2 bg-amber-900/10 hover:bg-amber-900/20 text-stone-800 rounded font-bold transition";
    saveBtn.className = "px-5 py-2 bg-amber-800 hover:bg-amber-900 text-amber-100 rounded font-bold shadow transition";
    deleteCancelBtn.className = "px-4 py-2 bg-amber-900/10 hover:bg-amber-900/20 text-stone-800 rounded font-bold text-xs transition";
    bookView.classList.remove('hidden'); gridView.classList.add('hidden');
    renderBookPages();

  } else if (theme === 'cyber') {
    body.className = "bg-cyber-grid min-h-screen font-mono text-slate-100 p-4 sm:p-6 relative pb-24 transition-all";
    headerBg.className = "max-w-7xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-none shadow-lg border border-pink-500/40 bg-slate-900/90";
    headerIcon.className = "fa-solid fa-skull text-2xl text-pink-500";
    headerTitle.innerText = "CYBER_BOUNTY_WALL // 通緝牆";
    fabBtn.className = "fixed bottom-6 right-6 z-40 bg-pink-600 text-slate-950 font-bold w-14 h-14 rounded-none shadow-[0_0_15px_rgba(236,72,153,0.8)] flex items-center justify-center text-xl";
    const selectStyle = "bg-slate-950 border border-pink-500/60 text-pink-400 text-xs rounded-none block p-2 outline-none cursor-pointer shadow-sm font-mono font-bold transition-all";
    themeSelector.className = selectStyle; parentFilter.className = selectStyle;
    modalBox.className = "w-full max-w-lg h-[480px] bg-slate-900 rounded-none shadow-2xl p-6 border-2 border-pink-500 flex flex-col justify-between relative transition-all text-slate-100 font-mono";
    modalTopBox.className = "bg-slate-950 p-3.5 rounded-none border border-emerald-500/40 shadow-sm text-xs text-emerald-400 font-mono";
    modalBottomBox.className = "bg-slate-950 p-3.5 rounded-none border border-pink-500/40 shadow-sm text-xs flex-1 flex flex-col overflow-hidden text-slate-200 font-mono";
    formModalBox.className = "w-full max-w-lg bg-slate-900 rounded-none shadow-2xl p-6 border-2 border-pink-500 flex flex-col gap-4 relative max-h-[90vh] overflow-y-auto text-slate-100 font-mono";
    deleteModalBox.className = "w-full max-w-sm bg-slate-900 rounded-none shadow-2xl p-6 text-center space-y-4 border-2 border-pink-500 text-slate-100 font-mono";
    updateInputStyles("bg-slate-950 border border-pink-500/50 text-pink-300 placeholder-slate-600 focus:border-pink-400");
    uploadBtn.className = "bg-pink-950 hover:bg-pink-900 text-pink-400 px-3 py-2 rounded-none font-bold transition shrink-0 border border-pink-500/50";
    cancelBtn.className = "px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-none font-bold transition border border-slate-700";
    saveBtn.className = "px-5 py-2 bg-pink-600 hover:bg-pink-500 text-slate-950 font-black rounded-none shadow-[0_0_10px_rgba(236,72,153,0.5)] transition";
    deleteCancelBtn.className = "px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-none font-bold text-xs transition border border-slate-700";
    bookView.classList.add('hidden'); gridView.classList.remove('hidden');
    renderGridCards('cyber');

  } else if (theme === 'white') {
    body.className = "bg-pure-white min-h-screen font-sans text-stone-900 p-4 sm:p-6 relative pb-24 transition-all";
    headerBg.className = "max-w-7xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl shadow-sm border border-stone-200 bg-white/90 backdrop-blur-md";
    headerIcon.className = "fa-regular fa-square text-2xl text-stone-900";
    headerTitle.innerText = "MINIMALIST · 極簡純白";
    fabBtn.className = "fixed bottom-6 right-6 z-40 bg-stone-900 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-xl";
    const selectStyle = "bg-white border border-stone-300 text-stone-900 text-xs rounded-lg block p-2 outline-none cursor-pointer shadow-sm font-medium transition-all";
    themeSelector.className = selectStyle; parentFilter.className = selectStyle;
    modalBox.className = "w-full max-w-lg h-[480px] bg-white rounded-2xl shadow-2xl p-6 border border-stone-200 flex flex-col justify-between relative transition-all text-stone-900 font-sans";
    modalTopBox.className = "bg-stone-50 p-3.5 rounded-xl border border-stone-200 shadow-sm text-xs";
    modalBottomBox.className = "bg-stone-50 p-3.5 rounded-xl border border-stone-200 shadow-sm text-xs flex-1 flex flex-col overflow-hidden";
    formModalBox.className = "w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 border border-stone-200 flex flex-col gap-4 relative max-h-[90vh] overflow-y-auto text-stone-900 font-sans";
    deleteModalBox.className = "w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center space-y-4 border border-stone-200 text-stone-900 font-sans";
    updateInputStyles("bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 focus:bg-white focus:border-stone-400");
    uploadBtn.className = "bg-stone-100 hover:bg-stone-200 text-stone-800 px-3 py-2 rounded-lg font-bold transition shrink-0 border border-stone-200";
    cancelBtn.className = "px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-bold transition";
    saveBtn.className = "px-5 py-2 bg-stone-900 hover:bg-black text-white rounded-lg font-bold shadow transition";
    deleteCancelBtn.className = "px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-bold text-xs transition";
    bookView.classList.add('hidden'); gridView.classList.remove('hidden');
    renderGridCards('white');

  } else if (theme === 'dark') {
    body.className = "bg-oled-black min-h-screen font-sans text-neutral-100 p-4 sm:p-6 relative pb-24 transition-all";
    headerBg.className = "max-w-7xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl shadow-lg border border-neutral-800 bg-neutral-950/90 backdrop-blur-md";
    headerIcon.className = "fa-solid fa-circle text-2xl text-neutral-100";
    headerTitle.innerText = "OLED_DARK · 極致純黑";
    fabBtn.className = "fixed bottom-6 right-6 z-40 bg-neutral-100 text-neutral-950 font-bold w-14 h-14 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center text-xl";
    const selectStyle = "bg-neutral-900 border border-neutral-700 text-neutral-100 text-xs rounded-lg block p-2 outline-none cursor-pointer shadow-sm font-medium transition-all";
    themeSelector.className = selectStyle; parentFilter.className = selectStyle;
    modalBox.className = "w-full max-w-lg h-[480px] bg-neutral-900 rounded-2xl shadow-2xl p-6 border border-neutral-800 flex flex-col justify-between relative transition-all text-neutral-100 font-sans";
    modalTopBox.className = "bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 shadow-sm text-xs text-neutral-200";
    modalBottomBox.className = "bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 shadow-sm text-xs flex-1 flex flex-col overflow-hidden text-neutral-300";
    formModalBox.className = "w-full max-w-lg bg-neutral-900 rounded-2xl shadow-2xl p-6 border border-neutral-800 flex flex-col gap-4 relative max-h-[90vh] overflow-y-auto text-neutral-100 font-sans";
    deleteModalBox.className = "w-full max-w-sm bg-neutral-900 rounded-2xl shadow-2xl p-6 text-center space-y-4 border border-neutral-800 text-neutral-100 font-sans";
    updateInputStyles("bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 focus:border-neutral-600");
    uploadBtn.className = "bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3 py-2 rounded-lg font-bold transition shrink-0 border border-neutral-700";
    cancelBtn.className = "px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-bold transition";
    saveBtn.className = "px-5 py-2 bg-neutral-100 hover:bg-white text-neutral-950 font-bold rounded-lg shadow transition";
    deleteCancelBtn.className = "px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-bold text-xs transition";
    bookView.classList.add('hidden'); gridView.classList.remove('hidden');
    renderGridCards('dark');
  }
}

function updateInputStyles(className) {
  document.querySelectorAll('.form-input').forEach(input => {
    input.className = `form-input w-full p-2 rounded outline-none transition-all ${className}`;
  });
}

/* ---------- 圖書館大書 ---------- */
function renderBookPages() {
  const leftGrid = document.getElementById('leftBookGrid');
  const rightGrid = document.getElementById('rightBookGrid');
  leftGrid.innerHTML = ''; rightGrid.innerHTML = '';
  const startIdx = currentBookIndex * ITEMS_PER_PAGE;
  const leftItems = filteredData.slice(startIdx, startIdx + 9);
  const rightItems = filteredData.slice(startIdx + 9, startIdx + 18);
  leftItems.forEach(item => leftGrid.appendChild(createMiniBookCard(item)));
  rightItems.forEach(item => rightGrid.appendChild(createMiniBookCard(item)));
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE) || 1;
  document.getElementById('pageIndicator').innerText = `PAGE ${currentBookIndex + 1} / ${totalPages}`;
}

function createMiniBookCard(item) {
  const div = document.createElement('div');
  div.className = 'bg-[#f4ebd0] border border-amber-900/30 p-2 rounded shadow-sm hover:border-amber-700 cursor-pointer group flex flex-col justify-between transition relative';
  div.onclick = () => openCharacterModal(item);
  div.innerHTML = `
    <div class="absolute top-1 right-1 z-10 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-amber-100/90 p-0.5 rounded border border-amber-900/20" onclick="event.stopPropagation()">
      <button onclick="openEditModal('${item.id}')" class="text-stone-600 hover:text-amber-900 text-[10px] px-1"><i class="fa-solid fa-pen"></i></button>
      <button onclick="openDeleteModal('${item.id}')" class="text-stone-600 hover:text-rose-700 text-[10px] px-1"><i class="fa-solid fa-trash"></i></button>
    </div>
    <div>
      <div class="w-full h-24 bg-stone-200 border border-amber-900/30 overflow-hidden mb-1.5 shadow-inner">
        <img src="${esc(imgOf(item))}" onerror="this.src='${DEFAULT_IMG}'" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
      </div>
      <h4 class="text-xs font-bold text-amber-950 truncate">${esc(item.name)}</h4>
      <p class="text-[10px] text-amber-800 truncate">種族：${esc(item.race || '-')}</p>
    </div>
    <div class="text-[9px] text-stone-600 pt-1 mt-1 border-t border-amber-900/10 flex justify-between items-center">
      <span class="truncate">${esc(item.owner || '—')}</span>
      <span class="text-amber-900 font-bold group-hover:underline shrink-0">詳情 ➔</span>
    </div>`;
  return div;
}

function prevBookPage() { if (currentBookIndex > 0) { currentBookIndex--; renderBookPages(); } }
function nextBookPage() { if ((currentBookIndex + 1) * ITEMS_PER_PAGE < filteredData.length) { currentBookIndex++; renderBookPages(); } }

/* ---------- 網格列表(賽博 / 純白 / 純黑) ---------- */
function renderGridCards(style) {
  const gridView = document.getElementById('gridView');
  gridView.innerHTML = '';
  filteredData.forEach(item => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card-item relative h-[380px] cursor-pointer group transition-all';
    cardDiv.onclick = () => openCharacterModal(item);
    const src = esc(imgOf(item));

    if (style === 'cyber') {
      cardDiv.innerHTML = `
        <div class="w-full h-full p-3 pt-5 bg-slate-900 border border-pink-500/50 hover:border-pink-400 transition-all flex flex-col justify-between relative shadow-[0_0_15px_rgba(236,72,153,0.15)]">
          <div class="cyber-warning-stripe absolute top-0 left-0 right-0 h-3"></div>
          <div class="absolute top-4 right-2 z-10 flex gap-1 bg-slate-950 p-1 border border-pink-500/30 opacity-80 group-hover:opacity-100" onclick="event.stopPropagation()">
            <button onclick="openEditModal('${item.id}')" class="text-slate-400 hover:text-pink-400 text-xs px-1"><i class="fa-solid fa-pen"></i></button>
            <button onclick="openDeleteModal('${item.id}')" class="text-slate-400 hover:text-rose-500 text-xs px-1"><i class="fa-solid fa-trash"></i></button>
          </div>
          <div class="text-center font-black tracking-widest text-pink-500 text-sm font-mono mt-1">WANTED // DEAD OR ALIVE</div>
          <div class="w-full h-44 bg-slate-950 border border-pink-500/40 my-2 overflow-hidden">
            <img src="${src}" onerror="this.src='${DEFAULT_IMG}'" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-100 font-mono truncate">${esc(item.name)}</h2>
            <p class="text-xs text-emerald-400"><i class="fa-solid fa-dna mr-1"></i>種族：${esc(item.race || '-')}</p>
          </div>
          <div class="text-[10px] text-slate-400 flex justify-between items-center pt-2 border-t border-slate-800">
            <span class="truncate">家長：${esc(item.owner || '—')}</span>
            <span class="text-pink-400 shrink-0">檔案 ➔</span>
          </div>
        </div>`;
    } else if (style === 'white') {
      cardDiv.innerHTML = `
        <div class="w-full h-full p-3 rounded-2xl shadow-sm border bg-white border-stone-200 hover:shadow-md transition-all flex flex-col justify-between relative">
          <div class="absolute top-2 right-2 z-10 flex gap-1 bg-white/90 p-1 rounded-lg shadow-sm border border-stone-200 opacity-80 group-hover:opacity-100" onclick="event.stopPropagation()">
            <button onclick="openEditModal('${item.id}')" class="text-stone-500 hover:text-stone-900 text-xs px-1"><i class="fa-solid fa-pen"></i></button>
            <button onclick="openDeleteModal('${item.id}')" class="text-stone-500 hover:text-rose-600 text-xs px-1"><i class="fa-solid fa-trash"></i></button>
          </div>
          <div class="w-full h-52 bg-stone-100 overflow-hidden relative rounded-xl border border-stone-100">
            <img src="${src}" onerror="this.src='${DEFAULT_IMG}'" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
          </div>
          <div class="pt-3 pb-1 px-1 flex-1 flex flex-col justify-between">
            <div>
              <h2 class="text-lg font-bold text-stone-900 tracking-wide truncate">${esc(item.name)}</h2>
              <p class="text-xs text-stone-500 font-medium mt-0.5"><i class="fa-solid fa-dna mr-1"></i>種族：${esc(item.race || '-')}</p>
            </div>
            <div class="text-xs text-stone-400 border-t border-stone-100 pt-2 flex items-center justify-between">
              <span class="truncate">家長：${esc(item.owner || '—')}</span>
              <span class="text-[10px] text-stone-900 font-bold shrink-0">詳情 ➔</span>
            </div>
          </div>
        </div>`;
    } else if (style === 'dark') {
      cardDiv.innerHTML = `
        <div class="w-full h-full p-3 rounded-2xl shadow-lg border bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between relative">
          <div class="absolute top-2 right-2 z-10 flex gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800 opacity-80 group-hover:opacity-100" onclick="event.stopPropagation()">
            <button onclick="openEditModal('${item.id}')" class="text-neutral-400 hover:text-neutral-100 text-xs px-1"><i class="fa-solid fa-pen"></i></button>
            <button onclick="openDeleteModal('${item.id}')" class="text-neutral-400 hover:text-rose-500 text-xs px-1"><i class="fa-solid fa-trash"></i></button>
          </div>
          <div class="w-full h-52 bg-neutral-950 overflow-hidden relative rounded-xl border border-neutral-800">
            <img src="${src}" onerror="this.src='${DEFAULT_IMG}'" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
          </div>
          <div class="pt-3 pb-1 px-1 flex-1 flex flex-col justify-between">
            <div>
              <h2 class="text-lg font-bold text-neutral-100 tracking-wide truncate">${esc(item.name)}</h2>
              <p class="text-xs text-neutral-400 font-medium mt-0.5"><i class="fa-solid fa-dna mr-1"></i>種族：${esc(item.race || '-')}</p>
            </div>
            <div class="text-xs text-neutral-500 border-t border-neutral-800 pt-2 flex items-center justify-between">
              <span class="truncate">家長：${esc(item.owner || '—')}</span>
              <span class="text-[10px] text-neutral-200 font-bold shrink-0">詳情 ➔</span>
            </div>
          </div>
        </div>`;
    }
    gridView.appendChild(cardDiv);
  });
}

/* ---------- 詳情彈窗(設定 + 故事) ---------- */
function openCharacterModal(item) {
  if (!item) return;
  document.getElementById('modalName').innerText = item.name;
  document.getElementById('modalSubInfo').innerText = `種族：${item.race || '-'} ｜ 家長：${item.owner || '-'}`;
  document.getElementById('modalSetting').innerText = item.setting || '尚無設定。';
  document.getElementById('modalStory').innerText = item.story || '尚無背景故事。';
  document.getElementById('cardModal').classList.remove('hidden');
  document.getElementById('cardModal').classList.add('flex');
}

/* ---------- 新增 / 編輯 ---------- */
function openAddModal() {
  document.getElementById('formModalTitle').innerText = "新增角色";
  document.getElementById('editIndex').value = "-1";
  document.getElementById('characterForm').reset();
  document.getElementById('imagePreviewContainer').classList.add('hidden');
  pendingFile = null;
  document.getElementById('formModal').classList.remove('hidden');
  document.getElementById('formModal').classList.add('flex');
}

function openEditModal(id) {
  const item = characters.find(c => c.id === id);
  if (!item) return;
  document.getElementById('formModalTitle').innerText = "編輯角色";
  document.getElementById('editIndex').value = id;
  document.getElementById('formName').value = item.name || '';
  document.getElementById('formParent').value = item.owner || '';
  document.getElementById('formRace').value = item.race || '';
  document.getElementById('formImg').value = item.avatar_url || '';
  document.getElementById('formSetting').value = item.setting || '';
  document.getElementById('formStory').value = item.story || '';
  pendingFile = null;
  const prevWrap = document.getElementById('imagePreviewContainer');
  if (item.avatar_url) {
    document.getElementById('imagePreview').src = item.avatar_url;
    prevWrap.classList.remove('hidden'); prevWrap.classList.add('flex');
  } else { prevWrap.classList.add('hidden'); }
  document.getElementById('formModal').classList.remove('hidden');
  document.getElementById('formModal').classList.add('flex');
}

function openDeleteModal(id) {
  const item = characters.find(c => c.id === id);
  deletingId = id;
  document.getElementById('deleteTargetName').innerText = `準備刪除：【${item ? item.name : ''}】`;
  document.getElementById('deleteModal').classList.remove('hidden');
  document.getElementById('deleteModal').classList.add('flex');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
  document.getElementById(modalId).classList.remove('flex');
}

/* 選檔:先本地預覽,存檔時才上傳 */
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  pendingFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('imagePreview').src = e.target.result;
    const wrap = document.getElementById('imagePreviewContainer');
    wrap.classList.remove('hidden'); wrap.classList.add('flex');
  };
  reader.readAsDataURL(file);
}

async function uploadAvatar(file) {
  const ext = (file.name.split('.').pop() || 'png').toLowerCase();
  const path = crypto.randomUUID() + '.' + ext;
  const { error } = await db.storage.from('avatars').upload(path, file, { upsert: false });
  if (error) throw error;
  return db.storage.from('avatars').getPublicUrl(path).data.publicUrl;
}

async function handleFormSubmit(event) {
  event.preventDefault();
  const saveBtn = document.getElementById('saveBtn');
  saveBtn.disabled = true; const label = saveBtn.innerText; saveBtn.innerText = '儲存中…';
  try {
    const rec = {
      name: val('formName'),
      owner: val('formParent'),
      race: val('formRace'),
      setting: val('formSetting'),
      story: val('formStory'),
    };
    if (pendingFile) rec.avatar_url = await uploadAvatar(pendingFile);
    else if (val('formImg')) rec.avatar_url = val('formImg');
    // 留空則不寫 avatar_url → 顯示時自動用 DEFAULT_IMG

    const id = document.getElementById('editIndex').value;
    if (id && id !== '-1') {
      const { error } = await db.from('characters').update(rec).eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await db.from('characters').insert(rec);
      if (error) throw error;
    }
    closeModal('formModal'); pendingFile = null;
    await loadCharacters();
  } catch (err) {
    alert('儲存失敗：' + (err.message || err));
  } finally {
    saveBtn.disabled = false; saveBtn.innerText = label;
  }
}

async function executeDelete() {
  if (!deletingId) return;
  const { error } = await db.from('characters').delete().eq('id', deletingId);
  if (error) { alert('刪除失敗：' + error.message); return; }
  deletingId = null;
  closeModal('deleteModal');
  await loadCharacters();
}

/* ---------- 篩選 ---------- */
function filterCards() {
  const selectedParent = document.getElementById('parentFilter').value;
  filteredData = characters.filter(item => selectedParent === 'ALL' || item.owner === selectedParent);
  currentBookIndex = 0;
  if (currentTheme === 'retro') renderBookPages();
  else renderGridCards(currentTheme);
}

/* ---------- 啟動 ---------- */
switchTheme('retro');
loadCharacters();
db.channel('characters-realtime')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'characters' }, loadCharacters)
  .subscribe();
