import React, { useEffect } from 'react';
import { PageMetadata, SchemaMarkup, getPageMetadata } from '../seo/metadata';

interface SEOHeadProps {
  page: string;
  customMetadata?: Partial<PageMetadata>;
  schemaMarkup?: SchemaMarkup | SchemaMarkup[];
}

/**
 * SEOHead Component
 * Dynamically injects meta tags, Open Graph tags, and JSON-LD schema markup
 * Handles client-side meta updates for SPA routing
 */
export default function SEOHead({ page, customMetadata, schemaMarkup }: SEOHeadProps) {
  useEffect(() => {
    // Merge custom metadata with page defaults
    const metadata = {
      ...getPageMetadata(page),
      ...customMetadata,
    };

    // Update document title
    document.title = metadata.title;

    // Helper to set or update meta tag
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement;

      if (!element) {
        element = document.createElement('meta');
        isProperty ? element.setAttribute('property', name) : element.setAttribute('name', name);
        document.head.appendChild(element);
      }

      element.content = content;
    };

    // Update standard meta tags
    setMetaTag('description', metadata.description);
    if (metadata.keywords) {
      setMetaTag('keywords', metadata.keywords.join(', '));
    }
    if (metadata.robots) {
      setMetaTag('robots', metadata.robots);
    }
    if (metadata.author) {
      setMetaTag('author', metadata.author);
    }

    // Update Open Graph tags
    setMetaTag('og:title', metadata.title, true);
    setMetaTag('og:description', metadata.description, true);
    setMetaTag('og:image', metadata.ogImage || '/og-image.png', true);
    setMetaTag('og:type', metadata.ogType || 'website', true);
    setMetaTag('og:url', metadata.canonical || window.location.href, true);
    setMetaTag('og:site_name', 'AYU.VIBEE', true);

    // Update Twitter Card tags
    setMetaTag('twitter:card', metadata.twitterCard || 'summary_large_image', true);
    setMetaTag('twitter:title', metadata.title, true);
    setMetaTag('twitter:description', metadata.description, true);
    setMetaTag('twitter:image', metadata.ogImage || '/og-image.png', true);

    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = metadata.canonical || window.location.href;

    // Inject JSON-LD schema markup
    if (schemaMarkup) {
      // Remove existing schema script if present
      const existingSchema = document.querySelector('script[type="application/ld+json"]');
      if (existingSchema) {
        existingSchema.remove();
      }

      // Create and inject new schema
      const schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.innerHTML = JSON.stringify(
        Array.isArray(schemaMarkup) ? { '@context': 'https://schema.org', '@graph': schemaMarkup } : schemaMarkup
      );
      document.head.appendChild(schemaScript);
    }
  }, [page, customMetadata, schemaMarkup]);

  // Component doesn't render anything; it only manages document head
  return null;
}
