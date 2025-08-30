// Simple authentication utilities
const CORRECT_PIN = "123321"; // You can change this to your desired number

export const validatePin = (pin: string): boolean => {
  return pin === CORRECT_PIN;
};

export const setAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', 'authenticated');
  }
};

export const getAuthToken = (): boolean => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token') === 'authenticated';
  }
  return false;
};

export const clearAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
};
