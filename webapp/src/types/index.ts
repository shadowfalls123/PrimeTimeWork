// Global type definitions for the application

// Environment variables
interface ImportMetaEnv {
  readonly VITE_APP_ENV: 'development' | 'uat' | 'production';
  readonly VITE_API_URL: string;
  readonly VITE_AWS_REGION: string;
  readonly VITE_USER_POOL_ID: string;
  readonly VITE_USER_POOL_WEB_CLIENT_ID: string;
  readonly VITE_IDENTITY_POOL_ID: string;
  readonly VITE_S3_BUCKET: string;
  readonly VITE_CLOUDFRONT_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Common component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'tutor' | 'admin';
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

// Exam types
export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  duration: number; // in minutes
  passingScore: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isPublished: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Package types
export interface Package {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  exams: Exam[];
  category: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  };
}

// Theme types
export interface ThemeColors {
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  secondary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};