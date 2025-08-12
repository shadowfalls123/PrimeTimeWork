// Component variant definitions for consistent styling

export const buttonVariants = {
  base: 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  
  variants: {
    primary: 'bg-sage-500 text-white hover:bg-sage-600 focus:ring-sage-500 shadow-sm hover:shadow-md',
    secondary: 'bg-wood-400 text-white hover:bg-wood-500 focus:ring-wood-400 shadow-sm hover:shadow-md',
    outline: 'border-2 border-sage-500 text-sage-700 hover:bg-sage-50 focus:ring-sage-500 bg-white',
    ghost: 'text-sage-700 hover:bg-sage-50 focus:ring-sage-500',
    success: 'bg-success-500 text-white hover:bg-success-600 focus:ring-success-500 shadow-sm hover:shadow-md',
    warning: 'bg-warning-500 text-white hover:bg-warning-600 focus:ring-warning-500 shadow-sm hover:shadow-md',
    error: 'bg-error-500 text-white hover:bg-error-600 focus:ring-error-500 shadow-sm hover:shadow-md',
  },
  
  sizes: {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  },
} as const;

export const cardVariants = {
  base: 'bg-white rounded-xl border border-gray-200 shadow-card',
  
  variants: {
    default: '',
    elevated: 'shadow-lg',
    interactive: 'transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1 cursor-pointer',
    outlined: 'border-2 border-gray-200 shadow-none',
  },
  
  padding: {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  },
} as const;

export const inputVariants = {
  base: 'block w-full rounded-lg border px-3 py-2 text-base placeholder-gray-400 shadow-sm transition-colors duration-200 focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
  
  variants: {
    default: 'border-gray-300 focus:border-sage-500 focus:ring-sage-500',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    success: 'border-success-300 focus:border-success-500 focus:ring-success-500',
  },
  
  sizes: {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg',
  },
} as const;

export const badgeVariants = {
  base: 'inline-flex items-center justify-center font-medium rounded-full transition-colors duration-200',
  
  variants: {
    default: 'bg-sage-100 text-sage-800 border border-sage-200',
    success: 'bg-success-100 text-success-800 border border-success-200',
    warning: 'bg-warning-100 text-warning-800 border border-warning-200',
    error: 'bg-error-100 text-error-800 border border-error-200',
    info: 'bg-info-100 text-info-800 border border-info-200',
    outline: 'bg-white text-gray-700 border border-gray-300',
  },
  
  sizes: {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  },
} as const;

export const modalVariants = {
  overlay: 'fixed inset-0 z-50 flex items-center justify-center p-4',
  backdrop: 'fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300',
  content: 'relative bg-white rounded-xl shadow-xl w-full animate-scale-in',
  
  sizes: {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  },
} as const;

export const alertVariants = {
  base: 'rounded-lg p-4 border',
  
  variants: {
    success: 'bg-success-50 border-success-200 text-success-800',
    warning: 'bg-warning-50 border-warning-200 text-warning-800',
    error: 'bg-error-50 border-error-200 text-error-800',
    info: 'bg-info-50 border-info-200 text-info-800',
  },
} as const;

export const loadingVariants = {
  spinner: 'animate-spin rounded-full border-2 border-gray-300 border-t-sage-500',
  
  sizes: {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  },
} as const;

export const tableVariants = {
  table: 'min-w-full divide-y divide-gray-200',
  header: 'bg-gray-50',
  headerCell: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
  body: 'bg-white divide-y divide-gray-200',
  row: 'hover:bg-gray-50 transition-colors duration-200',
  cell: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
} as const;

export const navigationVariants = {
  nav: 'flex space-x-8',
  link: 'text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
  activeLink: 'text-sage-600 bg-sage-50 px-3 py-2 rounded-md text-sm font-medium',
} as const;

// Utility function to combine variant classes
export const combineVariants = (
  base: string,
  variants: Record<string, string>,
  selectedVariant: string,
  additionalClasses?: string
): string => {
  const variantClass = variants[selectedVariant] || '';
  return [base, variantClass, additionalClasses].filter(Boolean).join(' ');
};