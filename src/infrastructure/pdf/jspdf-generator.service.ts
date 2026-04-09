import { jsPDF } from "jspdf";
import { IPDFGenerator, PDFSettings } from "../../domain/material/material.types";

export class JsPDFGenerator implements IPDFGenerator {
  async generate(images: string[], onProgress: (p: number) => void, settings?: PDFSettings): Promise<Blob> {
    const { format = "a4", orientation = "portrait", margin = 0 } = settings || {};
    const pdf = new jsPDF({ orientation, unit: "mm", format });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const drawAreaWidth = pageWidth - (margin * 2);
    const drawAreaHeight = pageHeight - (margin * 2);

    for (let i = 0; i < images.length; i++) {
      await this.addPageToPDF(pdf, images[i], i, drawAreaWidth, drawAreaHeight, margin);
      onProgress(((i + 1) / images.length) * 100);
    }

    return pdf.output("blob");
  }

  private async addPageToPDF(pdf: jsPDF, imageUrl: string, index: number, drawAreaWidth: number, drawAreaHeight: number, margin: number) {
    try {
      const base64 = await this.fetchImageAsBase64(imageUrl);
      if (index > 0) pdf.addPage();
      
      const { width, height } = await this.getImageDimensions(base64);
      const { drawWidth, drawHeight } = this.calculateDrawDimensions(width, height, drawAreaWidth, drawAreaHeight);
      
      const x = margin + (drawAreaWidth - drawWidth) / 2;
      const y = margin + (drawAreaHeight - drawHeight) / 2;
      pdf.addImage(base64, "JPEG", x, y, drawWidth, drawHeight);
    } catch (error) {
      console.error(`Error adding image ${index}:`, error);
    }
  }

  private async fetchImageAsBase64(imageUrl: string): Promise<string> {
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error("Failed to fetch image");
    const blob = await response.blob();
    return this.blobToBase64(blob);
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private getImageDimensions(base64: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.src = base64;
    });
  }

  private calculateDrawDimensions(imgW: number, imgH: number, pageW: number, pageH: number) {
    const ratio = imgW / imgH;
    let drawWidth = pageW;
    let drawHeight = pageW / ratio;
    
    if (drawHeight > pageH) {
      drawHeight = pageH;
      drawWidth = pageH * ratio;
    }
    return { drawWidth, drawHeight };
  }
}
