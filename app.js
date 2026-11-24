const $ = (selector) => document.querySelector(selector);
const dropZone = $('#drop-zone');
const input = $('#file-input');
const queue = $('#queue');
const readButton = $('#read-button');
const result = $('#result');
const status = $('#status');
const history = $('#history');
const progressWrap = $('#progress-wrap');
const progressText = $('#progress-text');
const progressValue = $('#progress-value');
const progressBar = $('#progress-bar');
let files = [];
const cacheKey = 'ocr-da-lala-history-v1';

function historyItems() { try { return JSON.parse(localStorage.getItem(cacheKey)) || []; } catch { return []; } }
function saveHistory(item) { localStorage.setItem(cacheKey, JSON.stringify([item, ...historyItems()].slice(0, 20))); renderHistory(); }
function renderHistory() {
  const items = historyItems();
  history.innerHTML = items.length ? '' : '<p class="empty">Ainda não há leituras salvas.</p>';
  items.forEach((item) => {
    const card = document.createElement('article'); card.className = 'history-item';
    card.innerHTML = `<time>${new Date(item.date).toLocaleString('pt-BR')}</time><p>${escapeHtml(item.text || '(sem texto reconhecido)')}</p>`;
    card.onclick = () => { result.value = item.text; status.textContent = `Resultado recuperado do cache: ${item.name}.`; $('#copy-button').disabled = !item.text; window.scrollTo({ top: 0, behavior: 'smooth' }); };
    history.append(card);
  });
}
function escapeHtml(text) { const node = document.createElement('span'); node.textContent = text; return node.innerHTML; }
function renderQueue() {
  queue.innerHTML = ''; readButton.disabled = !files.length;
  files.forEach((file, index) => { const item = document.createElement('div'); item.className = 'preview'; item.innerHTML = `<img alt="Prévia de ${escapeHtml(file.name)}" src="${URL.createObjectURL(file)}"><button title="Remover" aria-label="Remover ${escapeHtml(file.name)}">×</button>`; item.querySelector('button').onclick = (event) => { event.preventDefault(); files.splice(index, 1); renderQueue(); }; queue.append(item); });
}
function addFiles(list) { files = [...files, ...[...list].filter(file => file.type.startsWith('image/'))]; renderQueue(); status.textContent = files.length ? `${files.length} imagem(ns) pronta(s) para leitura.` : 'Selecione uma imagem válida.'; }
input.onchange = () => addFiles(input.files);
['dragenter','dragover'].forEach(type => dropZone.addEventListener(type, event => { event.preventDefault(); dropZone.classList.add('dragging'); }));
['dragleave','drop'].forEach(type => dropZone.addEventListener(type, event => { event.preventDefault(); dropZone.classList.remove('dragging'); }));
dropZone.addEventListener('drop', event => addFiles(event.dataTransfer.files));
$('#copy-button').onclick = async () => { await navigator.clipboard.writeText(result.value); status.textContent = 'Texto copiado para a área de transferência.'; };
$('#clear-history').onclick = () => { if (confirm('Apagar todo o histórico salvo neste navegador?')) { localStorage.removeItem(cacheKey); renderHistory(); } };
readButton.onclick = async () => {
  readButton.disabled = true; progressWrap.hidden = false; result.value = ''; const language = $('#language').value;
  try {
    for (let index = 0; index < files.length; index++) {
      const file = files[index]; status.textContent = `Lendo ${file.name}...`;
      const output = await Tesseract.recognize(file, language, { logger(message) { if (message.status === 'recognizing text') { const percent = Math.round(((index + message.progress) / files.length) * 100); progressText.textContent = 'Reconhecendo texto...'; progressValue.textContent = `${percent}%`; progressBar.style.width = `${percent}%`; } } });
      result.value += `${result.value ? '\n\n' : ''}${output.data.text.trim()}`;
    }
    $('#copy-button').disabled = !result.value.trim(); status.textContent = 'Leitura concluída e salva somente no cache deste navegador.';
    saveHistory({ date: Date.now(), name: files.map(file => file.name).join(', '), text: result.value });
  } catch (error) { console.error(error); status.textContent = 'Não foi possível ler a imagem. Verifique sua conexão e tente novamente.'; }
  finally { readButton.disabled = !files.length; progressText.textContent = 'Concluído'; progressValue.textContent = '100%'; progressBar.style.width = '100%'; }
};
renderHistory();
