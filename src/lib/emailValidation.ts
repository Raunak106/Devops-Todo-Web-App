import { z } from "zod";

// List of common disposable email domains to block
const disposableEmailDomains = [
  'tempmail.com', 'throwaway.email', 'guerrillamail.com', 'mailinator.com',
  '10minutemail.com', 'temp-mail.org', 'fakeinbox.com', 'trashmail.com',
  'yopmail.com', 'getnada.com', 'mohmal.com', 'tempail.com', 'emailondeck.com',
  'discard.email', 'sharklasers.com', 'spam4.me', 'trash-mail.com'
];

// List of valid email domains (popular providers)
const validEmailProviders = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'live.com',
  'icloud.com', 'protonmail.com', 'aol.com', 'mail.com', 'zoho.com',
  'yandex.com', 'gmx.com', 'fastmail.com', 'tutanota.com', 'hey.com',
  'msn.com', 'comcast.net', 'verizon.net', 'att.net', 'sbcglobal.net',
  'me.com', 'mac.com', 'qq.com', '163.com', '126.com', 'rediffmail.com'
];

// Check if domain has valid MX-like pattern (basic check)
const hasValidDomainPattern = (domain: string): boolean => {
  // Must have at least one dot and valid TLD
  const parts = domain.split('.');
  if (parts.length < 2) return false;
  
  const tld = parts[parts.length - 1];
  // Common valid TLDs
  const validTlds = ['com', 'net', 'org', 'edu', 'gov', 'io', 'co', 'us', 'uk', 
    'ca', 'au', 'de', 'fr', 'jp', 'in', 'ru', 'br', 'it', 'es', 'nl', 'se', 
    'no', 'fi', 'dk', 'pl', 'cz', 'at', 'ch', 'be', 'pt', 'ie', 'nz', 'sg',
    'hk', 'kr', 'tw', 'my', 'th', 'id', 'ph', 'vn', 'za', 'mx', 'ar', 'cl'];
  
  return validTlds.includes(tld.toLowerCase());
};

// Email validation schema
export const emailSchema = z.string()
  .trim()
  .min(1, "Email is required")
  .max(254, "Email is too long")
  .email("Please enter a valid email address")
  .refine((email) => {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return false;
    return !disposableEmailDomains.includes(domain);
  }, "Disposable email addresses are not allowed")
  .refine((email) => {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return false;
    return hasValidDomainPattern(domain);
  }, "Please use a valid email domain");

// Password validation schema
export const passwordSchema = z.string()
  .min(6, "Password must be at least 6 characters")
  .max(72, "Password is too long")
  .refine((password) => /[A-Za-z]/.test(password), "Password must contain at least one letter")
  .refine((password) => /[0-9]/.test(password), "Password must contain at least one number");

// Name validation schema
export const nameSchema = z.string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name is too long")
  .refine((name) => /^[a-zA-Z\s'-]+$/.test(name), "Name can only contain letters, spaces, hyphens, and apostrophes");

// Phone validation schema
export const phoneSchema = z.string()
  .optional()
  .refine((phone) => {
    if (!phone || phone.trim() === '') return true;
    return /^\+?[1-9]\d{6,14}$/.test(phone.replace(/[\s-]/g, ''));
  }, "Please enter a valid phone number");

// Signup form schema
export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

// Login form schema
export const loginEmailSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required")
});

export const loginPhoneSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
  password: z.string().min(1, "Password is required")
});

export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginEmailFormData = z.infer<typeof loginEmailSchema>;
export type LoginPhoneFormData = z.infer<typeof loginPhoneSchema>;
