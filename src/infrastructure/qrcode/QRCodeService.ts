import QRCode from 'qrcode';

export interface EnrollmentQRData {
  enrollmentId: string;
  businessId: string;
  customerId: string;
  businessName: string;
  customerName: string;
  currentStamps: number;
  requiredStamps: number;
}

export type QRCodeSize = 'small' | 'medium' | 'large';
export type QRCodeFormat = 'png' | 'svg';

export class QRCodeService {
  private readonly sizeMap: Record<QRCodeSize, number> = {
    small: 200,
    medium: 400,
    large: 600,
  };

  /**
   * Generate a QR code for an enrollment
   * QR contains enrollment data that can be scanned by business owner to add stamps
   */
  async generateEnrollmentQR(
    data: EnrollmentQRData,
    size: QRCodeSize = 'medium',
    format: QRCodeFormat = 'png'
  ): Promise<Buffer> {
    try {
      // Create compact JSON payload for QR code
      const qrPayload = {
        type: 'loyalty_enrollment',
        enrollmentId: data.enrollmentId,
        businessId: data.businessId,
        customerId: data.customerId,
        // Include display info for validation
        businessName: data.businessName,
        customerName: data.customerName,
        stamps: `${data.currentStamps}/${data.requiredStamps}`,
      };

      const qrDataString = JSON.stringify(qrPayload);
      const width = this.sizeMap[size];

      if (format === 'svg') {
        const svgString = await QRCode.toString(qrDataString, {
          type: 'svg',
          width,
          errorCorrectionLevel: 'M',
          margin: 2,
        });
        return Buffer.from(svgString, 'utf-8');
      }

      // Generate PNG
      return await QRCode.toBuffer(qrDataString, {
        type: 'png',
        width,
        errorCorrectionLevel: 'M',
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
    } catch (error) {
      throw new Error(
        `Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate a data URL for embedding in HTML/WhatsApp
   */
  async generateEnrollmentQRDataURL(
    data: EnrollmentQRData,
    size: QRCodeSize = 'medium'
  ): Promise<string> {
    try {
      const qrPayload = {
        type: 'loyalty_enrollment',
        enrollmentId: data.enrollmentId,
        businessId: data.businessId,
        customerId: data.customerId,
        businessName: data.businessName,
        customerName: data.customerName,
        stamps: `${data.currentStamps}/${data.requiredStamps}`,
      };

      const qrDataString = JSON.stringify(qrPayload);
      const width = this.sizeMap[size];

      return await QRCode.toDataURL(qrDataString, {
        width,
        errorCorrectionLevel: 'M',
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
    } catch (error) {
      throw new Error(
        `Failed to generate QR data URL: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Parse QR code data back to enrollment info
   * Used for validation when scanning
   */
  parseEnrollmentQR(qrData: string): {
    type: string;
    enrollmentId: string;
    businessId: string;
    customerId: string;
    businessName: string;
    customerName: string;
    stamps: string;
  } {
    try {
      const parsed = JSON.parse(qrData);

      if (parsed.type !== 'loyalty_enrollment') {
        throw new Error('Invalid QR code type');
      }

      return parsed;
    } catch (error) {
      throw new Error(
        `Failed to parse QR code: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validate QR code data structure
   */
  validateEnrollmentQR(qrData: string): boolean {
    try {
      const parsed = this.parseEnrollmentQR(qrData);

      return (
        parsed.type === 'loyalty_enrollment' &&
        typeof parsed.enrollmentId === 'string' &&
        typeof parsed.businessId === 'string' &&
        typeof parsed.customerId === 'string' &&
        parsed.enrollmentId.length > 0 &&
        parsed.businessId.length > 0 &&
        parsed.customerId.length > 0
      );
    } catch {
      return false;
    }
  }
}
