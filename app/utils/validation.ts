export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string;
}

export const validateField = (field: string, value: string, rules: { [key: string]: (value: string) => string | null }): string | null => {
  if (rules[field]) {
    return rules[field](value);
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return null;
};

export const validatePhone = (phone: string): string | null => {
  const phoneRegex = /^\+?[0-9\s\-()]{8,20}$/;
  if (!phone) return "Phone number is required";
  if (!phoneRegex.test(phone)) return "Please enter a valid phone number";
  return null;
};

export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || value.trim() === '') return `${fieldName} is required`;
  return null;
};

export const validateUrl = (url: string): string | null => {
  if (!url) return null; // URL is optional
  
  // Check if URL has a protocol, if not add https://
  const urlWithProtocol = url.match(/^https?:\/\//) ? url : `https://${url}`;
  
  try {
    new URL(urlWithProtocol);
    
    // Additional validation for website format
    const websiteRegex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+(\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)?$/;
    if (!websiteRegex.test(urlWithProtocol)) {
      return "Please enter a valid website URL (e.g., example.com or www.example.com)";
    }
    
    return null;
  } catch (e) {
    return "Please enter a valid website URL";
  }
};

export const validateAddress = (address: string): string | null => {
  if (!address) return "Business location is required";
  
  if (address.trim().length < 5) {
    return "Please enter a complete address";
  }
  
  // Check if address has at least two components (street and city/state)
  const addressParts = address.split(',').filter(part => part.trim().length > 0);
  if (addressParts.length < 2) {
    return "Please include street, city, and state/country";
  }
  
  // Check for numeric component (likely street number)
  const hasNumber = /\d/.test(address);
  if (!hasNumber) {
    return "Please include a street number in your address";
  }
  
  return null;
};

// Add password validation
export const validatePassword = (password: string): string | null => {
  if (!password || password.trim() === "") {
    return "Password is required";
  }
  
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  
  return null;
};

export const validatePasswordMatch = (password: string, confirmPassword: string): string | null => {
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
  
  return null;
};
