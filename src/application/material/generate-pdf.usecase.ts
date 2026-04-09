import { IPDFGenerator, PDFSettings } from "../../domain/material/material.types";

export class GeneratePDFUseCase {
  constructor(private pdfGenerator: IPDFGenerator) {}

  async execute(images: string[], onProgress: (p: number) => void, settings?: PDFSettings): Promise<Blob> {
    if (images.length === 0) throw new Error("No images selected");
    return await this.pdfGenerator.generate(images, onProgress, settings);
  }
}
