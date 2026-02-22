/**
 * Utility functions for processing files asynchronously without blocking the UI thread.
 * Provides chunked file reading and batch processing capabilities.
 */

/**
 * Read a file as Uint8Array with proper async handling to prevent UI blocking
 */
export async function readFileAsUint8Array(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(reader.result));
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('File reading failed'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Process files in batches with delays to prevent UI freezing
 * @param files Array of files to process
 * @param processor Function to process each file
 * @param batchSize Number of files to process before yielding (default: 1)
 * @param delayMs Delay between batches in milliseconds (default: 50)
 */
export async function processFilesInBatches<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  batchSize: number = 1,
  delayMs: number = 50
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, Math.min(i + batchSize, items.length));
    
    // Process batch
    for (let j = 0; j < batch.length; j++) {
      const result = await processor(batch[j], i + j);
      results.push(result);
    }
    
    // Yield control back to browser between batches
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}

/**
 * Delay execution to allow UI updates
 */
export function yieldToUI(ms: number = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
