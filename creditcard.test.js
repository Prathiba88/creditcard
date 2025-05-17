describe('Credit Card Validation Web App - All Test Cases', () => {
    // TC01 - Empty form
    test('TC01 - Validate empty form submission', () => {
      const result = validateForm('', '', '');
      expect(result.error).toBe("⚠️ Invalid input! Please check all fields.");
    });
  
    // TC02 - Invalid card (<16 digits)
    test('TC02 - Validate invalid credit card number (less than 16 digits)', () => {
      const result = validateForm('John Doe', '123456789012', '+919876543210');
      expect(result.error).toBe('Invalid input message');
    });
  
    // TC03 - Invalid card (Luhn fail)
    test('TC03 - Validate invalid credit card number (fails Luhn check)', () => {
      const result = validateForm('John Doe', '1234 5678 9012 3456', '+919876543210');
      expect(result.error).toBe('❌ Invalid credit card number (Luhn check failed).');
    });
  
    // TC04 - Invalid mobile
    test('TC04 - Validate invalid mobile number (missing + or short)', () => {
      const result = validateForm('John Doe', '4539 1488 0343 6467', '12345');
      expect(result.error).toBe('Invalid input message');
    });
  
    // TC05 - Success case
    test('TC05 - Validate successful form submission', () => {
      const result = validateForm('John Doe', '4539 1488 0343 6467', '+919876543210');
      expect(result.success).toBe(true);
      expect(result.message).toMatch(/Card is valid/);
    });
  
    // TC06 - Invalid mobile format
    test('TC06 - Validate mobile formatting', () => {
      const result = validateForm('John Doe', '4539 1488 0343 6467', '+91abc456789');
      expect(result.error).toBe('Invalid input message');
    });
  
    // TC07 - Card input formatting
    test('TC07 - Validate card formatting on input', () => {
      const input = '1234567812345678';
      const formatted = formatCardInput(input);
      expect(formatted).toBe('1234 5678 1234 5678');
    });
  
    // TC08 - Server error simulation
    test('TC08 - Validate server error response', () => {
      const response = simulateServerError();
      expect(response.status).toBe(500);
      expect(response.message).toMatch(/Server error/);
    });
  
    // TC09 - Backend expired card error
    test('TC09 - Validate backend response with failure message', () => {
      const response = simulateExpiredCardResponse();
      expect(response.success).toBe(false);
      expect(response.message).toBe('Card expired');
    });
  
    // TC10 - Mobile responsiveness
    test('TC10 - Mobile responsiveness check', () => {
      const screenWidth = 767;
      const layout = adjustLayout(screenWidth);
      expect(layout.width).toBeLessThanOrEqual(767);
    });
  });
  
  
  // ----------------------------
  // 🔧 Helper Functions (Mocks)
  // ----------------------------
  
  function validateForm(name, card, mobile) {
    if (!name || !card || !mobile) {
      return { error: '⚠️ Invalid input! Please check all fields.' };
    }
  
    if (!/^\d{4} \d{4} \d{4} \d{4}$/.test(card)) {
      return { error: 'Invalid input message' };
    }
  
    if (!passesLuhn(card)) {
      return { error: '❌ Invalid credit card number (Luhn check failed).' };
    }
  
    if (!/^\+91\d{10}$/.test(mobile)) {
      return { error: 'Invalid input message' };
    }
  
    return { success: true, message: '✅ Card is valid. Redirecting...' };
  }
  
  function passesLuhn(cardNumber) {
    const digits = cardNumber.replace(/\s/g, '').split('').map(Number);
    let sum = 0;
    let shouldDouble = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = digits[i];
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  }
  
  function formatCardInput(input) {
    return input.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  }
  
  function simulateServerError() {
    return { status: 500, message: "⚠️ Server error. Try again later." };
  }
  
  function simulateExpiredCardResponse() {
    return { success: false, message: "Card expired" };
  }
  
  function adjustLayout(width) {
    return { width: width < 768 ? width : 1024 };
  }
  