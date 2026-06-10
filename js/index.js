// index.js — Mercado Gourmet · Catálogo

const API = 'https://base-back-dwpz.onrender.com';
let allProducts = [];

// Mostra uma mensagem rápida no topo
function showToast(msg, isError) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  if (isError) {
    toast.style.borderColor = '#e07060';
  } else {
    toast.style.borderColor = 'var(--gold)';
  }
  toast.classList.add('show');
  setTimeout(function() {
    toast.classList.remove('show');
  }, 3500);
}

// Formata número como moeda brasileira
function formatPrice(value) {
  const num = parseFloat(value);
  if (isNaN(num)) return '—';
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Retorna um emoji com base no nome do produto
function categoryEmoji(name) {
  name = name.toLowerCase();
  if (name.includes('queijo'))  return '🧀';
  if (name.includes('vinho'))   return '🍷';
  if (name.includes('pão'))     return '🍞';
  if (name.includes('doce'))    return '🍫';
  if (name.includes('azeite'))  return '🫒';
  if (name.includes('cafe'))    return '☕';
  if (name.includes('carne'))   return '🥩';
  if (name.includes('fruta'))   return '🍊';
  return '🛒';
}

// Mostra os produtos na tela
function renderProducts(products) {
  const grid = document.getElementById('grid');
  grid.textContent = '';

  if (products.length === 0) {
    const div = document.createElement('div');
    div.className = 'state-wrap';
    div.textContent = '🔍 Nenhum produto encontrado.';
    grid.appendChild(div);
    return;
  }

  for (let i = 0; i < products.length; i++) {
    const p = products[i];

    const name    = p.nome || 'Produto sem nome';
    const desc    = p.descricao || '';
    const price   = p.preco || 0;
    const inStock = parseInt(p.estoque) > 0;
    const imgUrl  = p.imagemUrl || '';

    // Card do produto
    const article = document.createElement('article');
    article.className = 'card';
    article.style.animationDelay = (i * 0.05) + 's';

    // Imagem ou emoji
    if (imgUrl) {
      const img = document.createElement('img');
      img.className = 'card-img';
      img.src = imgUrl;
      img.alt = name;

      const placeholder = document.createElement('div');
      placeholder.className = 'card-img-placeholder';
      placeholder.style.display = 'none';
      placeholder.textContent = categoryEmoji(name);

      img.onerror = function() {
        img.style.display = 'none';
        placeholder.style.display = 'flex';
      };

      article.appendChild(img);
      article.appendChild(placeholder);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'card-img-placeholder';
      placeholder.textContent = categoryEmoji(name);
      article.appendChild(placeholder);
    }

    // Corpo do card
    const body = document.createElement('div');
    body.className = 'card-body';

    const title = document.createElement('h2');
    title.className = 'card-title';
    title.textContent = name;
    body.appendChild(title);

    if (desc) {
      const descEl = document.createElement('p');
      descEl.className = 'card-desc';
      descEl.textContent = desc;
      body.appendChild(descEl);
    }

    // Preço
    const priceEl = document.createElement('div');
    priceEl.className = 'price';
    priceEl.textContent = formatPrice(price);
    body.appendChild(priceEl);

    // Badge disponível / esgotado
    const badge = document.createElement('span');
    badge.className = 'badge-stock';
    if (inStock) {
      badge.classList.add('in-stock');
      badge.textContent = 'Disponível';
    } else {
      badge.classList.add('out-stock');
      badge.textContent = 'Esgotado';
    }
    body.appendChild(badge);

    article.appendChild(body);
    grid.appendChild(article);
  }
}

// Busca os produtos na API
async function loadProducts() {
  const grid = document.getElementById('grid');
  grid.textContent = '';

  const loading = document.createElement('div');
  loading.className = 'state-wrap';
  loading.textContent = 'Carregando produtos…';
  grid.appendChild(loading);

  const response = await fetch(API + '/produtos');

  if (response.ok) {
    const json = await response.json();

    if (Array.isArray(json)) {
      allProducts = json;
    } else if (Array.isArray(json.produtos)) {
      allProducts = json.produtos;
    } else {
      allProducts = [];
    }

    renderProducts(allProducts);
    if (allProducts.length > 0) {
      showToast(allProducts.length + ' produto(s) carregado(s).');
    }
  } else {
    grid.textContent = '';
    const errDiv = document.createElement('div');
    errDiv.className = 'state-wrap';
    errDiv.textContent = '⚠️ Não foi possível carregar os produtos.';
    grid.appendChild(errDiv);
    showToast('Erro ao carregar produtos.', true);
  }
}

// Filtra os produtos pelo campo de busca
function filterProducts(query) {
  const q = query.toLowerCase();
  const filtered = [];

  for (let i = 0; i < allProducts.length; i++) {
    const name = (allProducts[i].nome || '').toLowerCase();
    const desc = (allProducts[i].descricao || '').toLowerCase();
    if (name.includes(q) || desc.includes(q)) {
      filtered.push(allProducts[i]);
    }
  }

  return filtered;
}

// Evento do campo de busca
document.getElementById('searchInput').addEventListener('input', function() {
  const query = document.getElementById('searchInput').value;
  if (query.trim() === '') {
    renderProducts(allProducts);
  } else {
    renderProducts(filterProducts(query));
  }
});

// Inicia
loadProducts();
setInterval(loadProducts, 30000);