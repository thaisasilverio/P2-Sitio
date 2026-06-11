const API = 'https://base-back-dwpz.onrender.com';
let allProducts = [];

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

function formatPrice(value) {
  const num = parseFloat(value);
  if (isNaN(num)) return '—';
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}


function renderProducts(products) {
  const grid = document.getElementById('grid');
  grid.textContent = '';

  if (products.length === 0) {
    const div = document.createElement('div');
    div.className = 'state-wrap';
    div.textContent = ' Nenhum produto encontrado.';
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
    const article = document.createElement('article');
    article.className = 'card';
    article.style.animationDelay = (i * 0.05) + 's';

    if (imgUrl) {
      const img = document.createElement('img');
      img.className = 'card-img';
      img.src = imgUrl;
      img.alt = name;

      const placeholder = document.createElement('div');
      placeholder.className = 'card-img-placeholder';
      placeholder.style.display = 'none';
      img.onerror = function() {
        img.style.display = 'none';
        placeholder.style.display = 'flex';
      };

      article.appendChild(img);
      article.appendChild(placeholder);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'card-img-placeholder';
      article.appendChild(placeholder);
    }

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

    const priceEl = document.createElement('div');
    priceEl.className = 'price';
    priceEl.textContent = formatPrice(price);
    body.appendChild(priceEl);

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
    errDiv.textContent = ' Não foi possível carregar os produtos.';
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

document.getElementById('searchInput').addEventListener('input', function() {
  const query = document.getElementById('searchInput').value;
  if (query.trim() === '') {
    renderProducts(allProducts);
  } else {
    renderProducts(filterProducts(query));
  }
});

loadProducts();