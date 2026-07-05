/**
 * Centralized SEO metadata configuration
 * Used by SEOHead component for dynamic meta tag injection
 */

export interface PageMetadata {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  keywords?: string[];
  author?: string;
  robots?: string;
}

export interface SchemaMarkup {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://ayuvibee.com';
const SITE_NAME = 'AYU.VIBEE';
const AUTHOR_NAME = 'Ayush Bhattacharya';
const DEFAULT_OG_IMAGE = '/og-image.png';

export const defaultMetadata: PageMetadata = {
  title: `${SITE_NAME} | Photography Portfolio & Blog | ${AUTHOR_NAME}`,
  description: 'Explore stunning photography, visual storytelling, and insights into the art of capturing moments. Welcome to AYU.VIBEE.',
  canonical: SITE_URL,
  ogImage: DEFAULT_OG_IMAGE,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  keywords: ['photography', 'portfolio', 'visual storytelling', 'photography blog', 'ayush bhattacharya'],
  author: AUTHOR_NAME,
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
};

export const pageMetadata: Record<string, PageMetadata> = {
  portfolio: {
    title: `Portfolio | ${SITE_NAME}`,
    description: 'Discover a curated collection of photographs spanning travel, portraits, landscapes, and conceptual work.',
    canonical: `${SITE_URL}/`,
    ogType: 'website',
  },
  stories: {
    title: `Stories | ${SITE_NAME}`,
    description: 'Behind-the-scenes narratives, photography tips, and visual essays exploring the art of capture and storytelling.',
    canonical: `${SITE_URL}/stories`,
    ogType: 'website',
  },
  about: {
    title: `About | ${SITE_NAME}`,
    description: `Learn about ${AUTHOR_NAME}, the photographer and artist behind AYU.VIBEE. Philosophy, journey, and creative vision.`,
    canonical: `${SITE_URL}/about`,
    ogType: 'profile',
  },
  contact: {
    title: `Contact | ${SITE_NAME}`,
    description: 'Get in touch for photography inquiries, collaborations, or general questions. Reach out to AYU.VIBEE.',
    canonical: `${SITE_URL}/contact`,
    ogType: 'website',
  },
  terms: {
    title: `Terms & Conditions | ${SITE_NAME}`,
    description: 'Legal terms and conditions for AYU.VIBEE. Usage rights, licensing, and important information.',
    canonical: `${SITE_URL}/terms`,
    ogType: 'website',
    robots: 'noindex, follow',
  },
};

/**
 * Get metadata for a specific page with fallback to defaults
 */
export function getPageMetadata(page: string): PageMetadata {
  return {
    ...defaultMetadata,
    ...(pageMetadata[page] || {}),
  };
}

/**
 * Generate JSON-LD schema markup for structured data
 */
export function generateWebsiteSchema(): SchemaMarkup {
  return {
    '@context': 'https://schema.org',
    '@type': 'Website',
    name: SITE_NAME,
    url: SITE_URL,
    description: defaultMetadata.description,
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
    },
    image: {
      '@type': 'ImageObject',
      url: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
      width: 1200,
      height: 630,
    },
  };
}

/**
 * Generate JSON-LD schema for a photographer/person
 */
export function generatePhotographerSchema(): SchemaMarkup {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: AUTHOR_NAME,
    url: SITE_URL,
    jobTitle: 'Photographer',
    description: 'Professional photographer and visual storyteller',
    image: `${SITE_URL}/og-image.png`,
    sameAs: [
      'https://instagram.com', // Update with actual URLs
      'https://twitter.com',
    ],
  };
}

/**
 * Generate JSON-LD schema for an image gallery
 */
export function generateImageGallerySchema(
  title: string,
  images: Array<{ url: string; name?: string; description?: string }>
): SchemaMarkup {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: title,
    associatedMedia: images.map((img) => ({
      '@type': 'ImageObject',
      url: img.url,
      name: img.name,
      description: img.description,
    })),
  };
}

/**
 * Generate JSON-LD breadcrumb schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): SchemaMarkup {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
