import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportElementToPdf(
  element: HTMLElement,
  filename: string = "茶叶审评报告.pdf",
  a4 = true
): Promise<void> {
  const originalOverflow = element.style.overflow;
  element.style.overflow = "visible";

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#fffef8",
      logging: false,
      windowWidth: element.scrollWidth,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = a4
      ? new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" })
      : new jsPDF();

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;
    const ratio = canvas.width / canvas.height;
    const contentHeight = contentWidth / ratio;

    const totalHeight = contentHeight;
    let heightLeft = totalHeight;
    let position = margin;

    pdf.addImage(imgData, "PNG", margin, position, contentWidth, contentHeight);
    heightLeft -= pageHeight - margin * 2;

    while (heightLeft > 0) {
      position = heightLeft - contentHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", margin, position, contentWidth, contentHeight);
      heightLeft -= pageHeight - margin * 2;
    }

    pdf.save(filename);
  } finally {
    element.style.overflow = originalOverflow;
  }
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    try {
      ta.select();
      document.execCommand("copy");
      resolve();
    } catch (e) {
      reject(e);
    } finally {
      document.body.removeChild(ta);
    }
  });
}
