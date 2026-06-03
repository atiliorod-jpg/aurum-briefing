// Utilitário leve (sem dependências pesadas) para baixar um Blob no navegador.
// Mantido separado dos geradores (jspdf/jszip/docx) para que estes possam ser
// carregados sob demanda, sem pesar no carregamento inicial do app.
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
