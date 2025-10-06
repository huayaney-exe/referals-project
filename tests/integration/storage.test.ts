import { StorageService } from '../../src/infrastructure/storage/StorageService';
import { supabaseAdmin } from '../../src/config/supabase';

describe('Storage Integration Tests', () => {
  let storageService: StorageService;

  beforeAll(() => {
    storageService = new StorageService();
  });

  describe('upload', () => {
    it('should throw error for files exceeding size limit', async () => {
      const largeFile = Buffer.alloc(6 * 1024 * 1024); // 6MB

      await expect(
        storageService.upload({
          bucket: 'business-logos',
          file: largeFile,
          fileName: 'large-image.jpg',
          contentType: 'image/jpeg',
        })
      ).rejects.toThrow('File size exceeds maximum allowed size');
    });

    it('should throw error for invalid content types', async () => {
      const file = Buffer.from('test');

      await expect(
        storageService.upload({
          bucket: 'business-logos',
          file,
          fileName: 'file.pdf',
          contentType: 'application/pdf',
        })
      ).rejects.toThrow('Invalid content type');
    });

    it('should upload valid image file', async () => {
      const file = Buffer.from('fake-image-data');

      // Mock Supabase upload
      const uploadMock = jest.fn().mockResolvedValue({
        data: { path: 'test-uuid.jpg' },
        error: null,
      });

      const getPublicUrlMock = jest.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/test-uuid.jpg' },
      });

      jest.spyOn(supabaseAdmin.storage, 'from').mockReturnValue({
        upload: uploadMock,
        getPublicUrl: getPublicUrlMock,
      } as any);

      const result = await storageService.upload({
        bucket: 'business-logos',
        file,
        fileName: 'logo.jpg',
        contentType: 'image/jpeg',
        isPublic: true,
      });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('path');
      expect(result).toHaveProperty('publicUrl');
      expect(uploadMock).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete file from storage', async () => {
      const removeMock = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      jest.spyOn(supabaseAdmin.storage, 'from').mockReturnValue({
        remove: removeMock,
      } as any);

      await expect(
        storageService.delete('business-logos', 'test-file.jpg')
      ).resolves.not.toThrow();

      expect(removeMock).toHaveBeenCalledWith(['test-file.jpg']);
    });

    it('should throw error when delete fails', async () => {
      const removeMock = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Delete failed' },
      });

      jest.spyOn(supabaseAdmin.storage, 'from').mockReturnValue({
        remove: removeMock,
      } as any);

      await expect(
        storageService.delete('business-logos', 'test-file.jpg')
      ).rejects.toThrow('Failed to delete file');
    });
  });

  describe('getSignedUrl', () => {
    it('should generate signed URL for private files', async () => {
      const createSignedUrlMock = jest.fn().mockResolvedValue({
        data: { signedUrl: 'https://example.com/signed-url' },
        error: null,
      });

      jest.spyOn(supabaseAdmin.storage, 'from').mockReturnValue({
        createSignedUrl: createSignedUrlMock,
      } as any);

      const url = await storageService.getSignedUrl('pass-assets', 'test-file.jpg', 3600);

      expect(url).toBe('https://example.com/signed-url');
      expect(createSignedUrlMock).toHaveBeenCalledWith('test-file.jpg', 3600);
    });

    it('should throw error when signed URL generation fails', async () => {
      const createSignedUrlMock = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'URL generation failed' },
      });

      jest.spyOn(supabaseAdmin.storage, 'from').mockReturnValue({
        createSignedUrl: createSignedUrlMock,
      } as any);

      await expect(
        storageService.getSignedUrl('pass-assets', 'test-file.jpg')
      ).rejects.toThrow('Failed to get signed URL');
    });
  });

  describe('validateImageFile', () => {
    it('should throw error for invalid content type', () => {
      expect(() => {
        storageService.validateImageFile('application/pdf', 1024);
      }).toThrow('Invalid image type');
    });

    it('should throw error for file size exceeding limit', () => {
      expect(() => {
        storageService.validateImageFile('image/jpeg', 10 * 1024 * 1024);
      }).toThrow('File size exceeds');
    });

    it('should not throw for valid image file', () => {
      expect(() => {
        storageService.validateImageFile('image/jpeg', 1024);
      }).not.toThrow();
    });
  });
});
