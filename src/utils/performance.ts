/**
 * Performance Optimization Utilities
 * Handles lazy loading, image optimization, and resource hints
 */

/**
 * Register core web vitals metrics
 */
export function observeWebVitals(callback: (metric: any) => void): void {
  // Largest Contentful Paint (LCP)
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const metric = {
          name: 'LCP',
          value: entry.startTime,
          id: (entry as PerformanceEntry & { url?: string }).url,
        };
        callback(metric);
      }
    });
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    // PerformanceObserver not supported
  }

  // Cumulative Layout Shift (CLS)
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          callback({
            name: 'CLS',
            value: clsValue,
          });
        }
      }
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  } catch (e) {
    // PerformanceObserver not supported
  }

  // First Input Delay (FID) / Interaction to Next Paint (INP)
  try {
    const inpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        callback({
          name: 'INP',
          value: (entry as any).processingDuration,
        });
      }
    });
    inpObserver.observe({ entryTypes: ['first-input', 'event'] });
  } catch (e) {
    // PerformanceObserver not supported
  }
}

/**
 * Preload an image (useful for next/upcoming views)
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    img.src = src;
  });
}

/**
 * Create a low-quality placeholder (blur-up effect)
 * Returns a canvas-based data URL or uses a solid color as fallback
 */
export function createPlaceholder(width: number = 10, height: number = 10, color: string = '#f7f4ed'): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, width, height);
    }
    return canvas.toDataURL('image/jpeg', 0.7);
  } catch (e) {
    // Fallback: return solid color as data URL
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Crect fill='${color.replace('#', '%23')}' width='${width}' height='${height}'/%3E%3C/svg%3E`;
  }
}

/**
 * Lazy load images with Intersection Observer
 * Apply the `data-src` attribute instead of `src` on images
 */
export function setupLazyLoading(): void {
  if (typeof window === 'undefined') return;

  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        }
      });
    },
    {
      rootMargin: '50px', // Start loading 50px before image enters viewport
    }
  );

  // Observe all images with data-src attribute
  document.querySelectorAll('img[data-src]').forEach((img) => {
    imageObserver.observe(img);
  });
}

/**
 * Defer non-critical CSS with link preload
 */
export function deferNonCriticalCSS(href: string): void {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.onload = () => {
    link.onload = null;
  };
  document.head.appendChild(link);

  // Fallback for browsers that don't support onload
  const noscript = document.createElement('noscript');
  noscript.innerHTML = `<link rel="stylesheet" href="${href}">`;
  document.head.appendChild(noscript);
}

/**
 * Request idle callback wrapper with fallback
 */
export function requestIdleCallback(callback: IdleRequestCallback, options?: IdleRequestOptions): number {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return (window.requestIdleCallback as any)(callback, options);
  }
  // Fallback: use setTimeout
  return globalThis.setTimeout(() => callback({} as IdleDeadline), 1000) as unknown as number;
}

/**
 * Measure performance metric
 */
export function measurePerformance(label: string, fn: () => void): number {
  const start = performance.now();
  fn();
  const end = performance.now();
  const duration = end - start;
  console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  return duration;
}

/**
 * Send beacon data (analytics) without blocking page unload
 */
export function sendBeacon(url: string, data: Record<string, any>): boolean {
  if (navigator.sendBeacon) {
    return navigator.sendBeacon(url, JSON.stringify(data));
  }
  // Fallback: use fetch with keepalive
  fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => {
    // Silently fail if beacon fails
  });
  return true;
}

/**
 * Prefetch DNS for external domains
 */
export function prefetchDNS(domain: string): void {
  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = `//${domain}`;
  document.head.appendChild(link);
}

/**
 * Preconnect to external domain (DNS + TCP + TLS)
 */
export function preconnect(domain: string, crossOrigin: boolean = false): void {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = `https://${domain}`;
  if (crossOrigin) {
    link.crossOrigin = 'anonymous';
  }
  document.head.appendChild(link);
}

/**
 * Dynamic code splitting helper
 * Lazy load a component module
 */
export async function lazyLoadComponent<T>(
  modulePath: string,
  exportName: string = 'default'
): Promise<T> {
  try {
    const module = await import(modulePath);
    return module[exportName] as T;
  } catch (error) {
    console.error(`Failed to lazy load component from ${modulePath}:`, error);
    throw error;
  }
}

/**
 * Cache manager for service worker
 */
export const cacheManager = {
  /**
   * Cache a resource
   */
  async set(cacheName: string, request: Request | string, response: Response | string): Promise<void> {
    if (typeof caches !== 'undefined') {
      const cache = await caches.open(cacheName);
      const cachedResponse = typeof response === "string" ? new Response(response) : response;
      await cache.put(request, cachedResponse);
    }
  },

  /**
   * Retrieve a cached resource
   */
  async get(cacheName: string, request: Request | string): Promise<Response | undefined> {
    if (typeof caches !== 'undefined') {
      const cache = await caches.open(cacheName);
      return await cache.match(request);
    }
  },

  /**
   * Delete a cache
   */
  async delete(cacheName: string): Promise<boolean> {
    if (typeof caches !== 'undefined') {
      return await caches.delete(cacheName);
    }
    return false;
  },

  /**
   * Clear all caches matching a prefix
   */
  async deleteByPrefix(prefix: string): Promise<void> {
    if (typeof caches !== 'undefined') {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name.startsWith(prefix))
          .map((name) => caches.delete(name))
      );
    }
  },
};
