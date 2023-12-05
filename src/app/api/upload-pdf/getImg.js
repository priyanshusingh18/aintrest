const { readFileSync, writeFileSync } = require("fs");
const { PDFDocumentFactory, PDFDocumentWriter, drawImage } = require("pdf-lib");

// Function to extract images from a PDF using dynamic import
async function extractImagesFromPDF(pdfPath) {
  const pdfBytes = readFileSync(pdfPath);
  const pdfDoc = await PDFDocumentFactory.load(pdfBytes);
  const images = [];
  const pages = pdfDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const pageImages = page.getAllImages();
    images.push(...pageImages);
  }
  return images;
}

// Path to the uploaded PDF file
const pdfPath = "./gesc103.pdf";

// Extract images from the PDF
extractImagesFromPDF(pdfPath)
  .then((extractedImages) => {
    // Save the extracted images to files
    const imagePaths = [];
    for (let i = 0; i < extractedImages.length; i++) {
      const imagePath = `./img/extracted_image_${i}.png`;
      writeFileSync(imagePath, extractedImages[i]);
      imagePaths.push(imagePath);
    }
  })
  .catch((error) => {
    console.error("Error extracting images:", error);
  });
