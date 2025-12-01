/**
 * Download utilities for the modular monolith.
 * Provides file download functionality for browsers.
 */

/**
 * Abstract base class for download services.
 */
export abstract class BaseDownloadService {
  /**
   * Download content as a file.
   * @param filename - The name of the file to download
   * @param content - The content of the file
   * @param mimeType - The MIME type of the file
   */
  abstract downloadFile(filename: string, content: string, mimeType?: string): void;
}

/**
 * Browser-based download service using DOM elements.
 */
export class BrowserDownloadService extends BaseDownloadService {
  private static instance: BrowserDownloadService | null = null;

  private constructor() {
    super();
  }

  /**
   * Get or create the singleton instance.
   */
  static getInstance(): BrowserDownloadService {
    if (!BrowserDownloadService.instance) {
      BrowserDownloadService.instance = new BrowserDownloadService();
    }
    return BrowserDownloadService.instance;
  }

  /**
   * Reset the singleton instance (useful for testing).
   */
  static resetInstance(): void {
    BrowserDownloadService.instance = null;
  }

  /**
   * Download content as a text file.
   * @param filename - The name of the file to download
   * @param content - The content of the file
   * @param mimeType - The MIME type of the file (default: text/plain)
   */
  downloadFile(filename: string, content: string, mimeType: string = 'text/plain'): void {
    if (!filename || filename.length === 0 || !content || content.length === 0) {
      return;
    }

    if (typeof document === 'undefined') {
      return;
    }

    const element = document.createElement('a');
    element.setAttribute('href', `data:${mimeType};charset=utf-8,` + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';

    document.body.appendChild(element);
    element.click();

    document.body.removeChild(element);
  }

  /**
   * Download content as a text file (alias for downloadFile).
   * @param filename - The name of the file to download
   * @param content - The content of the file
   */
  downloadTextFile(filename: string, content: string): void {
    this.downloadFile(filename, content, 'text/plain');
  }
}

// Legacy default export for backward compatibility
const DownloadFileService = {
  downloadTextFile: (filename: string, content: string) => {
    BrowserDownloadService.getInstance().downloadTextFile(filename, content);
  },
};

export default DownloadFileService;
