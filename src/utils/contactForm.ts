/**
 * Contact Form Utilities
 * Handles validation, rate limiting, and submission logic
 */

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactFormError {
  field: keyof ContactFormData | 'general' | 'submit';
  message: string;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate contact form data
 */
export function validateContactForm(data: ContactFormData): ContactFormError[] {
  const errors: ContactFormError[] = [];

  // Name validation
  if (!data.name.trim()) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (data.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  } else if (data.name.length > 100) {
    errors.push({ field: 'name', message: 'Name must be under 100 characters' });
  }

  // Email validation
  if (!data.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  // Subject validation (optional, but validate if provided)
  if (data.subject && data.subject.length > 100) {
    errors.push({ field: 'subject', message: 'Subject must be under 100 characters' });
  }

  // Message validation
  if (!data.message.trim()) {
    errors.push({ field: 'message', message: 'Message is required' });
  } else if (data.message.trim().length < 10) {
    errors.push({ field: 'message', message: 'Message must be at least 10 characters' });
  } else if (data.message.length > 5000) {
    errors.push({ field: 'message', message: 'Message must be under 5000 characters' });
  }

  return errors;
}

/**
 * Rate limiting - store submission timestamps in localStorage
 * Limit: 5 submissions per 24 hours per IP/client
 */
const RATE_LIMIT_KEY = 'contact_form_submissions';
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function checkRateLimit(): { allowed: boolean; remainingAttempts: number; resetTime?: Date } {
  const now = Date.now();
  let submissions: number[] = [];

  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    if (stored) {
      submissions = JSON.parse(stored).filter((time: number) => now - time < RATE_LIMIT_WINDOW);
    }
  } catch {
    // If localStorage fails, allow the submission
    return { allowed: true, remainingAttempts: RATE_LIMIT_MAX };
  }

  if (submissions.length >= RATE_LIMIT_MAX) {
    const oldestSubmission = Math.min(...submissions);
    const resetTime = new Date(oldestSubmission + RATE_LIMIT_WINDOW);
    return {
      allowed: false,
      remainingAttempts: 0,
      resetTime,
    };
  }

  return {
    allowed: true,
    remainingAttempts: RATE_LIMIT_MAX - submissions.length - 1,
  };
}

/**
 * Record a submission in rate limit tracker
 */
export function recordSubmission(): void {
  try {
    const now = Date.now();
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    let submissions: number[] = [];

    if (stored) {
      submissions = JSON.parse(stored);
    }

    submissions.push(now);
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(submissions));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

/**
 * Format contact form data for email body
 */
export function formatEmailBody(data: ContactFormData): string {
  return `
Name: ${data.name}
Email: ${data.email}
Subject: ${data.subject || '(No subject provided)'}

Message:
${data.message}

---
Sent from ayu.vibee contact form
`;
}

/**
 * Sanitize string to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}
