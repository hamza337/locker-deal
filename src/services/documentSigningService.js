import { PDFDocument, rgb } from 'pdf-lib';

/**
 * Service for signing original documents (PDFs and images)
 * This service modifies the original files instead of creating new wrapper PDFs
 */
class DocumentSigningService {
  /**
   * Sign a PDF document by adding signature to the original PDF
   * @param {string} pdfUrl - URL of the original PDF
   * @param {string} signatureDataUrl - Base64 signature image
   * @param {Object} options - Signing options
   * @returns {Promise<Blob>} - Signed PDF as blob
   */
  async signPDF(pdfUrl, signatureDataUrl, options = {}) {
    try {
      // Fetch the original PDF
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch PDF');
      }
      const pdfArrayBuffer = await response.arrayBuffer();
      
      // Load the PDF document
      const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
      
      // Get the last page (or specified page)
      const pages = pdfDoc.getPages();
      const targetPage = pages[options.pageIndex || pages.length - 1];
      const { width, height } = targetPage.getSize();
      
      // Convert signature to PNG bytes
      const signatureBytes = await this.dataUrlToBytes(signatureDataUrl);
      const signatureImage = await pdfDoc.embedPng(signatureBytes);
      
      // Calculate signature position and size
      const signatureWidth = options.signatureWidth || 120;
      const signatureHeight = options.signatureHeight || 40;
      const x = options.x || (width - signatureWidth - 50); // Default: bottom right
      const y = options.y || 50; // Default: bottom margin
      
      // Add signature to the page
      targetPage.drawImage(signatureImage, {
        x,
        y,
        width: signatureWidth,
        height: signatureHeight,
      });
      
      // Add signature date text
      const dateText = `Signed: ${new Date().toLocaleDateString()}`;
      targetPage.drawText(dateText, {
        x: x,
        y: y - 15,
        size: 8,
        color: rgb(0, 0, 0),
      });
      
      // Save the modified PDF
      const pdfBytes = await pdfDoc.save();
      return new Blob([pdfBytes], { type: 'application/pdf' });
      
    } catch (error) {
      console.error('Error signing PDF:', error);
      throw new Error(`Failed to sign PDF: ${error.message}`);
    }
  }
  
  /**
   * Sign an image by adding signature overlay
   * @param {string} imageUrl - URL of the original image
   * @param {string} signatureDataUrl - Base64 signature image
   * @param {Object} options - Signing options
   * @returns {Promise<Blob>} - Signed image as blob
   */
  async signImage(imageUrl, signatureDataUrl, options = {}) {
    try {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Load original image
        const originalImg = new Image();
        originalImg.crossOrigin = 'anonymous';
        
        originalImg.onload = () => {
          try {
            // Set canvas size to match original image
            canvas.width = originalImg.width;
            canvas.height = originalImg.height;
            
            // Draw original image
            ctx.drawImage(originalImg, 0, 0);
            
            // Load signature image
            const signatureImg = new Image();
            signatureImg.onload = () => {
              try {
                // Calculate signature position and size
                const signatureWidth = options.signatureWidth || Math.min(200, canvas.width * 0.3);
                const signatureHeight = options.signatureHeight || (signatureWidth * 0.4);
                const x = options.x || (canvas.width - signatureWidth - 20);
                const y = options.y || (canvas.height - signatureHeight - 20);
                
                // Add semi-transparent white background for signature
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillRect(x - 10, y - 10, signatureWidth + 20, signatureHeight + 30);
                
                // Draw signature
                ctx.drawImage(signatureImg, x, y, signatureWidth, signatureHeight);
                
                // Add signature date
                ctx.fillStyle = 'black';
                ctx.font = '12px Arial';
                ctx.textAlign = 'left';
                const dateText = `Signed: ${new Date().toLocaleDateString()}`;
                ctx.fillText(dateText, x, y + signatureHeight + 15);
                
                // Convert canvas to blob
                canvas.toBlob((blob) => {
                  if (blob) {
                    resolve(blob);
                  } else {
                    reject(new Error('Failed to create image blob'));
                  }
                }, 'image/jpeg', 0.9);
                
              } catch (error) {
                reject(error);
              }
            };
            
            signatureImg.onerror = () => {
              reject(new Error('Failed to load signature image'));
            };
            
            signatureImg.src = signatureDataUrl;
            
          } catch (error) {
            reject(error);
          }
        };
        
        originalImg.onerror = () => {
          reject(new Error('Failed to load original image'));
        };
        
        originalImg.src = imageUrl;
      });
      
    } catch (error) {
      console.error('Error signing image:', error);
      throw new Error(`Failed to sign image: ${error.message}`);
    }
  }
  
  /**
   * Main method to sign any document (PDF or image)
   * @param {Object} document - Document object with type, url, name, etc.
   * @param {string} signatureDataUrl - Base64 signature image
   * @param {Object} options - Signing options
   * @returns {Promise<{blob: Blob, fileName: string}>} - Signed document
   */
  async signDocument(document, signatureDataUrl, options = {}) {
    try {
      let signedBlob;
      let fileExtension;
      
      if (document.type === 'image' || this.isImageFile(document.name)) {
        signedBlob = await this.signImage(document.mediaUrl || document.url, signatureDataUrl, options);
        fileExtension = this.getImageExtension(document.name) || 'jpg';
      } else {
        // Assume it's a PDF
        signedBlob = await this.signPDF(document.mediaUrl || document.url, signatureDataUrl, options);
        fileExtension = 'pdf';
      }
      
      // Generate signed file name
      const originalName = document.name.split('.')[0];
      const timestamp = Date.now();
      const signedFileName = `${originalName}_signed_${timestamp}.${fileExtension}`;
      
      return {
        blob: signedBlob,
        fileName: signedFileName
      };
      
    } catch (error) {
      console.error('Error signing document:', error);
      throw error;
    }
  }
  
  /**
   * Helper method to convert data URL to bytes
   * @param {string} dataUrl - Base64 data URL
   * @returns {Promise<Uint8Array>} - Bytes array
   */
  async dataUrlToBytes(dataUrl) {
    const response = await fetch(dataUrl);
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }
  
  /**
   * Check if file is an image based on name
   * @param {string} fileName - File name
   * @returns {boolean} - True if image file
   */
  isImageFile(fileName) {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const extension = fileName.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(extension);
  }
  
  /**
   * Get image file extension
   * @param {string} fileName - File name
   * @returns {string} - File extension
   */
  getImageExtension(fileName) {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension) ? extension : 'jpg';
  }
}

// Export singleton instance
export default new DocumentSigningService();