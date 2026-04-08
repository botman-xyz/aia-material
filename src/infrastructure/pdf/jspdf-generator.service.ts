import { jsPDF } from "jspdf";
import { IPDFGenerator } from "../../domain/material/material.types";

export class JsPDFGenerator implements IPDFGenerator {
  async generate(images: string[], onProgress: (p: number) => void): Promise<Blob> {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < images.length; i++) {
      await this.addPageToPDF(pdf, images[i], i, pageWidth, pageHeight);
      onProgress(((i + 1) / images.length) * 100);
    }

    return pdf.output("blob");
  }

  private async addPageToPDF(pdf: jsPDF, imageUrl: string, index: number, pageWidth: number, pageHeight: number) {
    try {
      const base64 = await this.fetchImageAsBase64(imageUrl);
      if (index > 0) pdf.addPage();
      
      const { width, height } = await this.getImageDimensions(base64);
      const { drawWidth, drawHeight } = this.calculateDrawDimensions(width, height, pageWidth, pageHeight);
      
      const x = (pageWidth - drawWidth) / 2;
      const y = (pageHeight - drawHeight) / 2;
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
