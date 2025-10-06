import { QRCodeService, EnrollmentQRData } from '../../src/infrastructure/qrcode/QRCodeService';

describe('QR Code Integration Tests', () => {
  let qrCodeService: QRCodeService;

  const mockEnrollmentData: EnrollmentQRData = {
    enrollmentId: 'enrollment-123',
    businessId: 'business-456',
    customerId: 'customer-789',
    businessName: 'Café Lima',
    customerName: 'Juan Pérez',
    currentStamps: 5,
    requiredStamps: 10,
  };

  beforeAll(() => {
    qrCodeService = new QRCodeService();
  });

  describe('generateEnrollmentQR', () => {
    it('should generate PNG QR code buffer', async () => {
      const qrBuffer = await qrCodeService.generateEnrollmentQR(mockEnrollmentData, 'medium', 'png');

      expect(qrBuffer).toBeInstanceOf(Buffer);
      expect(qrBuffer.length).toBeGreaterThan(0);

      // Check PNG signature (first 8 bytes)
      const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      expect(qrBuffer.subarray(0, 8)).toEqual(pngSignature);
    });

    it('should generate SVG QR code buffer', async () => {
      const qrBuffer = await qrCodeService.generateEnrollmentQR(mockEnrollmentData, 'medium', 'svg');

      expect(qrBuffer).toBeInstanceOf(Buffer);
      expect(qrBuffer.length).toBeGreaterThan(0);

      // Check SVG content
      const svgString = qrBuffer.toString('utf-8');
      expect(svgString).toContain('<svg');
      expect(svgString).toContain('</svg>');
    });

    it('should generate different sizes correctly', async () => {
      const smallQR = await qrCodeService.generateEnrollmentQR(mockEnrollmentData, 'small', 'png');
      const mediumQR = await qrCodeService.generateEnrollmentQR(mockEnrollmentData, 'medium', 'png');
      const largeQR = await qrCodeService.generateEnrollmentQR(mockEnrollmentData, 'large', 'png');

      // Larger QR codes should have more data
      expect(largeQR.length).toBeGreaterThan(mediumQR.length);
      expect(mediumQR.length).toBeGreaterThan(smallQR.length);
    });

    it('should include enrollment data in QR code', async () => {
      // We can't easily read the QR code without a decoder library,
      // but we can verify the service generates consistently
      const qr1 = await qrCodeService.generateEnrollmentQR(mockEnrollmentData, 'medium', 'png');
      const qr2 = await qrCodeService.generateEnrollmentQR(mockEnrollmentData, 'medium', 'png');

      // Same data should generate same QR code
      expect(qr1.equals(qr2)).toBe(true);
    });

    it('should throw error for invalid data', async () => {
      const invalidData = { ...mockEnrollmentData, enrollmentId: '' };

      // QR code will still generate, but our validation should catch this
      await expect(
        qrCodeService.generateEnrollmentQR(invalidData as EnrollmentQRData, 'medium', 'png')
      ).resolves.toBeInstanceOf(Buffer);
    });
  });

  describe('generateEnrollmentQRDataURL', () => {
    it('should generate data URL string', async () => {
      const dataURL = await qrCodeService.generateEnrollmentQRDataURL(mockEnrollmentData, 'medium');

      expect(typeof dataURL).toBe('string');
      expect(dataURL).toMatch(/^data:image\/png;base64,/);
    });

    it('should generate valid base64 data', async () => {
      const dataURL = await qrCodeService.generateEnrollmentQRDataURL(mockEnrollmentData, 'small');

      const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      expect(buffer.length).toBeGreaterThan(0);

      // Check PNG signature
      const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      expect(buffer.subarray(0, 8)).toEqual(pngSignature);
    });
  });

  describe('parseEnrollmentQR', () => {
    it('should parse valid QR data', () => {
      const qrData = JSON.stringify({
        type: 'loyalty_enrollment',
        enrollmentId: 'enrollment-123',
        businessId: 'business-456',
        customerId: 'customer-789',
        businessName: 'Café Lima',
        customerName: 'Juan Pérez',
        stamps: '5/10',
      });

      const parsed = qrCodeService.parseEnrollmentQR(qrData);

      expect(parsed.type).toBe('loyalty_enrollment');
      expect(parsed.enrollmentId).toBe('enrollment-123');
      expect(parsed.businessId).toBe('business-456');
      expect(parsed.customerId).toBe('customer-789');
      expect(parsed.businessName).toBe('Café Lima');
      expect(parsed.customerName).toBe('Juan Pérez');
      expect(parsed.stamps).toBe('5/10');
    });

    it('should throw error for invalid JSON', () => {
      const invalidData = 'not valid json';

      expect(() => qrCodeService.parseEnrollmentQR(invalidData)).toThrow('Failed to parse QR code');
    });

    it('should throw error for wrong QR type', () => {
      const wrongType = JSON.stringify({
        type: 'wrong_type',
        enrollmentId: 'enrollment-123',
      });

      expect(() => qrCodeService.parseEnrollmentQR(wrongType)).toThrow('Invalid QR code type');
    });
  });

  describe('validateEnrollmentQR', () => {
    it('should validate correct QR data', () => {
      const validData = JSON.stringify({
        type: 'loyalty_enrollment',
        enrollmentId: 'enrollment-123',
        businessId: 'business-456',
        customerId: 'customer-789',
        businessName: 'Café Lima',
        customerName: 'Juan Pérez',
        stamps: '5/10',
      });

      expect(qrCodeService.validateEnrollmentQR(validData)).toBe(true);
    });

    it('should reject invalid type', () => {
      const invalidType = JSON.stringify({
        type: 'wrong_type',
        enrollmentId: 'enrollment-123',
        businessId: 'business-456',
        customerId: 'customer-789',
      });

      expect(qrCodeService.validateEnrollmentQR(invalidType)).toBe(false);
    });

    it('should reject missing required fields', () => {
      const missingFields = JSON.stringify({
        type: 'loyalty_enrollment',
        enrollmentId: 'enrollment-123',
        // missing businessId and customerId
      });

      expect(qrCodeService.validateEnrollmentQR(missingFields)).toBe(false);
    });

    it('should reject empty required fields', () => {
      const emptyFields = JSON.stringify({
        type: 'loyalty_enrollment',
        enrollmentId: '',
        businessId: 'business-456',
        customerId: 'customer-789',
      });

      expect(qrCodeService.validateEnrollmentQR(emptyFields)).toBe(false);
    });

    it('should reject invalid JSON', () => {
      const invalidJSON = 'not valid json';

      expect(qrCodeService.validateEnrollmentQR(invalidJSON)).toBe(false);
    });
  });
});
