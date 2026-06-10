import { removeImage, initImageUpload } from './image-upload.js';

const API = 'https://base-back-dwpz.onrender.com';
const EP  = '/produtos';
let products  = [];
let deleteId  = null;
let isEditing = false;

function getToken() { return localStorage.getItem('accessToken'); }

function getAuthHeaders() {
  const h = { 'Content-Type': 'application/json' };
  if (getToken()) h['Authorization'] = 'Bearer ' + getToken();
  return h;
}

function toast(msg, type) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast ' + (type || 'info') + ' show';
  setTimeout(function() { el.classList.remove('show'); }, 3500);
}

function fmtPrice(v) {
  const n = parseFloat(v);
  return isNaN(n) ? '—' : n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userName');
  showLoginScreen();
}

function showLoginScreen() {
  document.querySelector('.layout').style.display = 'none';
  document.querySelector('header').style.display  = 'none';

  let screen = document.getElementById('loginScreen');
  if (!screen) {
    screen = document.createElement('div');
    screen.id = 'loginScreen';
    screen.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#f5f5f3;z-index:1000';
    const card = document.createElement('div');
    card.className = 'login-card';

    const h2 = document.createElement('h2');
    h2.textContent = 'Mercado Gourmet — Admin';

    const emailLabel = document.createElement('label');
    emailLabel.textContent = 'E-mail';
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.id = 'loginEmail';
    emailInput.value = 'admin@store.com';

    const senhaLabel = document.createElement('label');
    senhaLabel.textContent = 'Senha';
    const senhaInput = document.createElement('input');
    senhaInput.type = 'password';
    senhaInput.id = 'loginPassword';
    senhaInput.value = '123456';

    const btnLogin = document.createElement('button');
    btnLogin.id = 'btnLogin';
    btnLogin.className = 'btn btn-primary';
    btnLogin.style.width = '100%';
    btnLogin.textContent = 'Entrar';

    const errEl = document.createElement('p');
    errEl.id = 'loginError';
    errEl.style.cssText = 'color:#e53;display:none';

    card.appendChild(h2);
    card.appendChild(emailLabel);
    card.appendChild(emailInput);
    card.appendChild(senhaLabel);
    card.appendChild(senhaInput);
    card.appendChild(btnLogin);
    card.appendChild(errEl);
    screen.appendChild(card);
    document.body.appendChild(screen);
  } else {
    screen.style.display = 'flex';
  }

  document.getElementById('btnLogin').onclick = async function() {
    const errEl = document.getElementById('loginError');
    errEl.style.display = 'none';
    const response = await fetch(API + '/entrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: document.getElementById('loginEmail').value,
        senha: document.getElementById('loginPassword').value,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('userName', data.user?.nome || '');
      document.getElementById('loginScreen').style.display = 'none';
      showAdminScreen();
      loadProducts();
    } else {
      errEl.textContent = 'Credenciais inválidas.';
      errEl.style.display = 'block';
    }
  };
}

function showAdminScreen() {
  document.querySelector('.layout').style.display = '';
  document.querySelector('header').style.display  = '';
  if (!document.getElementById('btnLogout')) {
    const right = document.querySelector('.header-right');
    const btn = document.createElement('button');
    btn.id = 'btnLogout';
    btn.className = 'btn btn-secondary';
    btn.textContent = 'Sair';
    btn.onclick = logout;
    right.prepend(btn);
  }
}

async function loadProducts() {
  const response = await fetch(API + EP, { headers: getAuthHeaders() });
  if (response.status === 401) { logout(); return; }
  if (response.ok) {
    const json = await response.json();
    products = Array.isArray(json) ? json : (json.produtos || []);
    renderTable(products);
  } else {
    toast('Erro ao carregar produtos.', 'error');
  }
}

function renderTable(list) {
  const tbody = document.getElementById('tbody');
  tbody.textContent = '';
  document.getElementById('countBadge').textContent = list.length + ' produto(s)';

  for (let i = 0; i < list.length; i++) {
    const p = list[i];
    const inStock = parseInt(p.estoque) > 0;
    const btnEdit = document.createElement('button');
    btnEdit.className = 'btn btn-edit';
    btnEdit.textContent = 'Editar';
    btnEdit.onclick = function() { startEdit(p.id); };
    const btnDel = document.createElement('button');
    btnDel.className = 'btn btn-danger';
    btnDel.textContent = 'Excluir';
    btnDel.onclick = function() { openModal(p.id, p.nome || '—'); };
    const tr = document.createElement('tr');
    tr.id = 'row-' + p.id;

    const tdNome = document.createElement('td');
    tdNome.textContent = p.nome || '—';

    const tdCat = document.createElement('td');
    tdCat.textContent = p.categoriaId ? 'Cat. ' + p.categoriaId : '—';

    const tdPreco = document.createElement('td');
    tdPreco.textContent = fmtPrice(p.preco);

    const badge = document.createElement('span');
    badge.className = 'badge ' + (inStock ? 'badge-ok' : 'badge-out');
    badge.textContent = inStock ? p.estoque + ' ✓' : 'esgotado';
    const tdEstoque = document.createElement('td');
    tdEstoque.appendChild(badge);

    const tdAcoes = document.createElement('td');
    tdAcoes.appendChild(btnEdit);
    tdAcoes.appendChild(btnDel);

    tr.appendChild(tdNome);
    tr.appendChild(tdCat);
    tr.appendChild(tdPreco);
    tr.appendChild(tdEstoque);
    tr.appendChild(tdAcoes);
    tbody.appendChild(tr);
  }
}

function filterTable() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const filtered = [];
  for (let i = 0; i < products.length; i++) {
    if ((products[i].nome || '').toLowerCase().includes(q)) filtered.push(products[i]);
  }
  renderTable(q ? filtered : products);
}

async function handleSubmit() {
  const name  = document.getElementById('name').value.trim();
  const price = document.getElementById('price').value;
  const qty   = document.getElementById('quantity').value;
  if (!name)  { toast('Informe o nome.',    'error'); return; }
  if (!price) { toast('Informe o preço.',   'error'); return; }
  if (!qty)   { toast('Informe o estoque.', 'error'); return; }

  const id  = document.getElementById('productId').value;
  const url = isEditing ? API + EP + '/' + id : API + EP;
  const response = await fetch(url, {
    method:  isEditing ? 'PUT' : 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      nome:        name,
      descricao:   document.getElementById('description').value.trim(),
      preco:       parseFloat(price),
      estoque:     parseInt(qty),
      categoriaId: parseInt(document.getElementById('category').value) || 1,
      imagemUrl:   document.getElementById('image').value.trim() || null,
      ativo:       true,
    }),
  });

  if (response.status === 401) { logout(); return; }
  if (response.ok) {
    toast(isEditing ? 'Produto atualizado!' : 'Produto cadastrado!', 'success');
    resetForm();
    loadProducts();
  } else {
    toast('Erro ao salvar produto.', 'error');
  }
}

function startEdit(id) {
  const p = products.find(function(x) { return x.id == id; });
  if (!p) return;
  isEditing = true;
  document.getElementById('productId').value   = id;
  document.getElementById('name').value        = p.nome || '';
  document.getElementById('description').value = p.descricao || '';
  document.getElementById('price').value       = p.preco || '';
  document.getElementById('quantity').value    = p.estoque || '';
  document.getElementById('category').value    = p.categoriaId || '';
  const img = p.imagemUrl || '';
  document.getElementById('image').value = img;
  if (img) {
    document.getElementById('previewImg').src = img;
    document.getElementById('uploadPreview').style.display     = 'block';
    document.getElementById('uploadPlaceholder').style.display = 'none';
  } else { removeImage(); }
  document.getElementById('formTitle').textContent   = '✎ Editar Produto';
  document.getElementById('btnSubmit').textContent   = '✓ Salvar Alterações';
  document.getElementById('btnCancel').style.display = 'block';
  document.getElementById('editingBanner').classList.add('visible');
  document.getElementById('editingName').textContent = p.nome || '';
  document.querySelector('.sidebar').scrollIntoView({ behavior: 'smooth' });
}

function resetForm() {
  isEditing = false;
  ['productId','name','description','price','quantity','category'].forEach(function(id) {
    document.getElementById(id).value = '';
  });
  removeImage();
  document.getElementById('formTitle').textContent   = '✦ Cadastrar Produto';
  document.getElementById('btnSubmit').textContent   = '＋ Cadastrar Produto';
  document.getElementById('btnCancel').style.display = 'none';
  document.getElementById('editingBanner').classList.remove('visible');
}


function openModal(id, name) {
  deleteId = id;
  document.getElementById('deleteProductName').textContent = name;
  document.getElementById('overlay').classList.add('open');
}

function closeModal() {
  deleteId = null;
  document.getElementById('overlay').classList.remove('open');
}

async function confirmDelete() {
  if (!deleteId) return;
  const idToDelete = deleteId;
  closeModal();
  const response = await fetch(API + EP + '/' + idToDelete, { method: 'DELETE', headers: getAuthHeaders() });
  if (response.status === 401) { logout(); return; }
  if (response.ok) {
    toast('Produto excluído.', 'success');
    loadProducts();
    if (isEditing && document.getElementById('productId').value == idToDelete) resetForm();
  } else {
    toast('Erro ao excluir.', 'error');
  }
}

document.getElementById('btnSubmit').onclick        = handleSubmit;
document.getElementById('btnCancel').onclick        = resetForm;
document.getElementById('searchInput').oninput      = filterTable;
document.getElementById('btnConfirmDelete').onclick = confirmDelete;
document.getElementById('btnCancelDelete').onclick  = closeModal;
document.getElementById('overlay').onclick = function(e) {
  if (e.target === e.currentTarget) closeModal();
};

initImageUpload(toast);
if (getToken()) { showAdminScreen(); loadProducts(); } else { showLoginScreen(); }