import { ErrorMessages, getErrorMessage, getErrorMessageByStatus } from '../../src/shared/errors/messages';

describe('Spanish Error Messages Integration Tests', () => {
  describe('ErrorMessages catalog', () => {
    it('should have Spanish messages for all error codes', () => {
      const errorCodes = Object.keys(ErrorMessages);

      expect(errorCodes.length).toBeGreaterThan(0);

      errorCodes.forEach((code) => {
        const message = ErrorMessages[code as keyof typeof ErrorMessages];
        expect(message).toBeTruthy();
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
      });
    });

    it('should have user-friendly messages without technical jargon', () => {
      // Check that messages are in Spanish and user-friendly
      expect(ErrorMessages.AUTH_INVALID_CREDENTIALS).toContain('Credenciales inválidas');
      expect(ErrorMessages.CUSTOMER_NOT_FOUND).toContain('No se encontró el cliente');
      expect(ErrorMessages.STORAGE_FILE_TOO_LARGE).toContain('excede el tamaño máximo');
      expect(ErrorMessages.INTERNAL_ERROR).toContain('error interno');
    });

    it('should use professional tone consistently', () => {
      // Messages should use formal "usted" form, not informal "tú"
      const messages = Object.values(ErrorMessages);

      messages.forEach((message) => {
        // Should use "tu" (formal) or neutral language
        expect(message).not.toContain('tienes que');
        expect(message).not.toContain('has sido');
      });
    });
  });

  describe('getErrorMessage with parameters', () => {
    it('should substitute single parameter', () => {
      const message = getErrorMessage('VALIDATION_REQUIRED_FIELD', { field: 'email' });

      expect(message).toBe('El campo email es obligatorio.');
    });

    it('should substitute multiple parameters', () => {
      const message = getErrorMessage('VALIDATION_MIN_LENGTH', { field: 'contraseña', min: '8' });

      expect(message).toBe('El campo contraseña debe tener al menos 8 caracteres.');
    });

    it('should handle numeric parameters', () => {
      const message = getErrorMessage('STORAGE_FILE_TOO_LARGE', { maxSize: 5 });

      expect(message).toContain('5MB');
    });

    it('should return original message when no parameters provided', () => {
      const message = getErrorMessage('CUSTOMER_NOT_FOUND');

      expect(message).toBe(ErrorMessages.CUSTOMER_NOT_FOUND);
    });
  });

  describe('getErrorMessageByStatus', () => {
    it('should return correct message for 400 status', () => {
      const message = getErrorMessageByStatus(400);

      expect(message).toBe(ErrorMessages.BAD_REQUEST);
    });

    it('should return correct message for 401 status', () => {
      const message = getErrorMessageByStatus(401);

      expect(message).toBe(ErrorMessages.AUTH_UNAUTHORIZED);
    });

    it('should return correct message for 404 status', () => {
      const message = getErrorMessageByStatus(404);

      expect(message).toBe(ErrorMessages.NOT_FOUND);
    });

    it('should return correct message for 429 status', () => {
      const message = getErrorMessageByStatus(429);

      expect(message).toBe(ErrorMessages.RATE_LIMIT_EXCEEDED);
    });

    it('should return correct message for 500 status', () => {
      const message = getErrorMessageByStatus(500);

      expect(message).toBe(ErrorMessages.INTERNAL_ERROR);
    });

    it('should return internal error for unknown status codes', () => {
      const message = getErrorMessageByStatus(418); // I'm a teapot

      expect(message).toBe(ErrorMessages.INTERNAL_ERROR);
    });
  });

  describe('error message formatting', () => {
    it('should format rate limit messages with time parameters', () => {
      const message = getErrorMessage('RATE_LIMIT_EXCEEDED', { seconds: '60' });

      expect(message).toContain('60 segundos');
    });

    it('should format validation range messages', () => {
      const message = getErrorMessage('VALIDATION_INVALID_RANGE', { min: '1', max: '100' });

      expect(message).toContain('1');
      expect(message).toContain('100');
    });

    it('should format storage type messages with allowed types', () => {
      const message = getErrorMessage('STORAGE_INVALID_TYPE', {
        types: 'JPEG, PNG, WebP'
      });

      expect(message).toContain('JPEG, PNG, WebP');
    });
  });
});
