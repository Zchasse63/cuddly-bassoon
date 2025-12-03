/**
 * Password Validation and Strength Utilities
 */

export interface PasswordValidation {
  isValid: boolean;
  score: number; // 0-4 (weak to very strong)
  feedback: string[];
  requirements: PasswordRequirement[];
}

export interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
}

const PASSWORD_MIN_LENGTH = 8;

/**
 * Validate password strength
 */
export function validatePassword(password: string): PasswordValidation {
  const requirements: PasswordRequirement[] = [
    {
      id: 'length',
      label: `At least ${PASSWORD_MIN_LENGTH} characters`,
      met: password.length >= PASSWORD_MIN_LENGTH,
    },
    {
      id: 'uppercase',
      label: 'Contains uppercase letter',
      met: /[A-Z]/.test(password),
    },
    {
      id: 'lowercase',
      label: 'Contains lowercase letter',
      met: /[a-z]/.test(password),
    },
    {
      id: 'number',
      label: 'Contains number',
      met: /[0-9]/.test(password),
    },
    {
      id: 'special',
      label: 'Contains special character',
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
  ];

  const metCount = requirements.filter((r) => r.met).length;
  const isValid = requirements.slice(0, 4).every((r) => r.met); // First 4 are required

  // Calculate score based on requirements met
  let score = 0;
  if (password.length >= PASSWORD_MIN_LENGTH) score++;
  if (password.length >= 12) score++;
  if (requirements.filter((r) => r.met).length >= 4) score++;
  if (metCount === requirements.length) score++;

  const feedback: string[] = [];

  if (password.length < PASSWORD_MIN_LENGTH) {
    feedback.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }

  if (!requirements.find((r) => r.id === 'uppercase')?.met) {
    feedback.push('Add an uppercase letter for better security');
  }

  if (!requirements.find((r) => r.id === 'number')?.met) {
    feedback.push('Add a number for better security');
  }

  return {
    isValid,
    score,
    feedback,
    requirements,
  };
}

/**
 * Get strength label from score
 */
export function getStrengthLabel(score: number): string {
  switch (score) {
    case 0:
      return 'Very Weak';
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Strong';
    case 4:
      return 'Very Strong';
    default:
      return 'Unknown';
  }
}

/**
 * Get strength color from score
 */
export function getStrengthColor(score: number): string {
  switch (score) {
    case 0:
      return 'bg-red-500';
    case 1:
      return 'bg-orange-500';
    case 2:
      return 'bg-yellow-500';
    case 3:
      return 'bg-green-500';
    case 4:
      return 'bg-emerald-500';
    default:
      return 'bg-gray-300';
  }
}

/**
 * Check if passwords match
 */
export function doPasswordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword && password.length > 0;
}

/**
 * Generate a random secure password
 */
export function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}';

  const allChars = uppercase + lowercase + numbers + special;

  let password = '';

  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill remaining length
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}
