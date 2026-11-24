# OCR da Lala

Aplicação estática de OCR: imagens são processadas localmente no navegador com Tesseract.js. Nenhuma imagem ou resultado é enviado a um backend; o histórico usa o `localStorage` do navegador.

## Publicar no GitHub Pages

1. Envie o conteúdo desta pasta para o repositório.
2. No GitHub, abra **Settings → Pages**.
3. Em **Build and deployment**, selecione **Deploy from a branch**, a branch `main` e a pasta `/(root)`.
4. Salve. O GitHub exibirá a URL pública após a publicação.

É necessária conexão na primeira utilização para carregar a biblioteca de OCR e seus dados de idioma pelo CDN; o processamento da imagem continua ocorrendo no dispositivo.
