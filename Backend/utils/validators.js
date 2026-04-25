/**
 * Validate phone number format
 * Basic validation: checks if phone contains only digits and has 10-15 characters
 * @param {string} phone - Phone number to validate
 * @returns {boolean} true if valid, false otherwise
 */
function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  // Remove whitespace and common separators
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check if starts with + (optional) followed by 10-15 digits
  const phoneRegex = /^\+?\d{10,15}$/;
  return phoneRegex.test(cleaned);
}

module.exports = { isValidPhone };
