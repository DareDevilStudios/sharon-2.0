// Cache invalidation utilities for admin panel

/**
 * Invalidate cache paths immediately (when online)
 */
export const invalidateCache = async (paths = []) => {
  try {
    // Ensure we always have at least the home page
    const pathsToInvalidate = paths.length > 0 ? paths : ['/'];
    
    const response = await fetch('/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paths: pathsToInvalidate }),
    });

    if (!response.ok) {
      throw new Error(`Cache invalidation failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Cache invalidated successfully:', result);
    return result;
  } catch (error) {
    console.error('Cache invalidation error:', error);
    throw error;
  }
};

/**
 * Queue cache invalidation for offline operations
 */
export const queueCacheInvalidation = (paths = []) => {
  try {
    const queueKey = 'cache_invalidation_queue';
    const existing = JSON.parse(localStorage.getItem(queueKey) || '[]');
    
    // Ensure we always have at least the home page
    const pathsToQueue = paths.length > 0 ? paths : ['/'];
    
    const newItem = {
      id: Date.now() + Math.random(),
      paths: pathsToQueue,
      timestamp: new Date().toISOString(),
      retries: 0
    };

    existing.push(newItem);
    localStorage.setItem(queueKey, JSON.stringify(existing));
    
    console.log('Cache invalidation queued for offline sync:', newItem);
    return newItem;
  } catch (error) {
    console.error('Failed to queue cache invalidation:', error);
    throw error;
  }
};

/**
 * Process queued cache invalidations (when coming back online)
 */
export const processQueuedInvalidations = async () => {
  try {
    const queueKey = 'cache_invalidation_queue';
    const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
    
    if (queue.length === 0) {
      console.log('No queued cache invalidations to process');
      return { processed: 0, failed: 0 };
    }

    console.log(`Processing ${queue.length} queued cache invalidations...`);
    
    let processed = 0;
    let failed = 0;
    const failedItems = [];

    for (const item of queue) {
      try {
        await invalidateCache(item.paths);
        processed++;
        console.log(`Processed cache invalidation: ${item.id}`);
      } catch (error) {
        failed++;
        item.retries = (item.retries || 0) + 1;
        
        // Keep items that haven't exceeded retry limit
        if (item.retries < 3) {
          failedItems.push(item);
        }
        
        console.error(`Failed to process cache invalidation ${item.id}:`, error);
      }
    }

    // Update queue with only failed items that can be retried
    localStorage.setItem(queueKey, JSON.stringify(failedItems));
    
    console.log(`Cache invalidation processing complete: ${processed} processed, ${failed} failed`);
    
    return { processed, failed, remaining: failedItems.length };
  } catch (error) {
    console.error('Error processing queued invalidations:', error);
    throw error;
  }
};

/**
 * Clear the invalidation queue (use with caution)
 */
export const clearInvalidationQueue = () => {
  localStorage.removeItem('cache_invalidation_queue');
  console.log('Cache invalidation queue cleared');
};

/**
 * Get current queue status
 */
export const getQueueStatus = () => {
  try {
    const queueKey = 'cache_invalidation_queue';
    const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
    return {
      count: queue.length,
      items: queue.map(item => ({
        id: item.id,
        paths: item.paths,
        timestamp: item.timestamp,
        retries: item.retries || 0
      }))
    };
  } catch (error) {
    console.error('Error getting queue status:', error);
    return { count: 0, items: [] };
  }
};

/**
 * Smart cache invalidation - automatically handles online/offline
 */
export const smartInvalidateCache = async (paths = [], isOnline = navigator.onLine) => {
  if (isOnline) {
    try {
      await invalidateCache(paths);
      return { method: 'immediate', success: true };
    } catch (error) {
      // If immediate invalidation fails, queue it
      queueCacheInvalidation(paths);
      return { method: 'queued_fallback', success: true, error };
    }
  } else {
    queueCacheInvalidation(paths);
    return { method: 'queued', success: true };
  }
};

// Default paths for invalidation
export const CACHE_PATHS = {
  HOME: '/',
  PRODUCTS_PAGE: '/products',
  ALL: ['/', '/products']
};