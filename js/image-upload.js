const MAX_SIZE_MB = 2;

const CLOUD_NAME  = 'daomcqvpt';
const PRESET_NAME = 'fotos_contato';

async function uploadParaCloudinary(file) {
  const data = new FormData();
  data.append('file', file);
  data.append('upload_preset', PRESET_NAME);

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const response = await fetch(url, { method: 'POST', body: data });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro no upload (HTTP ${response.status})`);
  }

  const link = await response.json();
  return link.secure_url;
}

export function removeImage() {
  document.getElementById('image').value                     = '';
  document.getElementById('previewImg').src                  = '';
  document.getElementById('imageFile').value                 = '';
  document.getElementById('uploadPreview').style.display     = 'none';
  document.getElementById('uploadPlaceholder').style.display = 'flex';
}

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

  const localUrl = URL.createObjectURL(file);
  document.getElementById('previewImg').src                  = localUrl;
  document.getElementById('uploadPreview').style.display     = 'block';
  document.getElementById('uploadPlaceholder').style.display = 'none';

  const btnRemove = document.getElementById('btnRemoveImg');
  const originalText = btnRemove.textContent;
  btnRemove.textContent = '⏳ Enviando…';
  btnRemove.disabled = true;

  try {
    const secureUrl = await uploadParaCloudinary(file);

    document.getElementById('image').value    = secureUrl;
    document.getElementById('previewImg').src = secureUrl;
    URL.revokeObjectURL(localUrl);

    toastFn('Imagem enviada com sucesso!', 'success');
  } catch (err) {
    toastFn(err.message, 'error');
    removeImage();
    URL.revokeObjectURL(localUrl);
  } finally {
    btnRemove.textContent = originalText;
    btnRemove.disabled = false;
  }
}

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