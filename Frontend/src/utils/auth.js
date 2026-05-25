export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch (e) {
    return true;
  }
};

export const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
};

export const validatePhone = (phone) => {
  const cleanPhone = phone.replace(/[-+ ]/g, '');
  const re = /^[6-9]\d{9}$/;
  return re.test(cleanPhone);
};

export const checkPasswordStrength = (password) => {
  if (!password) return { isValid: false, message: 'Password is required' };
  if (password.length < 6) return { isValid: false, message: 'Password must be at least 6 characters' };
  
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (!hasLetter || !hasNumber || !hasSpecial) {
    return { 
      isValid: false, 
      message: 'Password must contain letters, numbers, and special characters' 
    };
  }
  return { isValid: true, message: '' };
};
