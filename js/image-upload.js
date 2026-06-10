/* ═══════════════════════════════════════════════
   image-upload.js — Mercado Gourmet
   Converte imagem local para base64 com preview
   ═══════════════════════════════════════════════ */

const MAX_SIZE_MB = 2;

// ── Converte File em base64 ───────────────────────────────

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result); // data:image/...;base64,...
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
    reader.readAsDataURL(file);
  });
}

// ── Remove imagem selecionada ─────────────────────────────

export function removeImage() {
  document.getElementById('image').value                     = '';
  document.getElementById('previewImg').src                  = '';
  document.getElementById('imageFile').value                 = '';
  document.getElementById('uploadPreview').style.display     = 'none';
  document.getElementById('uploadPlaceholder').style.display = 'flex';
}

// ── Exibe o preview e salva base64 no campo oculto ────────

export async function handleImageFile(file, toastFn) {
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    toastFn('Selecione um arquivo de imagem (JPG, PNG, WEBP…).', 'error');
    return;
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    toastFn(`A imagem deve ter no máximo ${MAX_SIZE_MB} MB.`, 'error');
    return;
  }

  try {
    const base64 = await fileToBase64(file);

    document.getElementById('image').value                     = base64;
    document.getElementById('previewImg').src                  = base64;
    document.getElementById('uploadPreview').style.display     = 'block';
    document.getElementById('uploadPlaceholder').style.display = 'none';
  } catch (err) {
    toastFn(err.message, 'error');
  }
}

// ── Inicializa eventos de upload (chamado pelo admin.js) ───

export function initImageUpload(toastFn) {
  document.getElementById('imageFile').addEventListener('change', e => {
    handleImageFile(e.target.files[0], toastFn);
  });

  document.getElementById('btnRemoveImg').addEventListener('click', removeImage);

  const uploadArea = document.getElementById('uploadArea');

  uploadArea.addEventListener('dragover', e => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', e => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    handleImageFile(e.dataTransfer.files[0], toastFn);
  });
}
