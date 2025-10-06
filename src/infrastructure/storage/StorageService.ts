import { supabaseAdmin } from '../../config/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface UploadOptions {
  bucket: 'business-logos' | 'pass-assets';
  file: Buffer;
  fileName: string;
  contentType: string;
  isPublic?: boolean;
}

export interface StorageFile {
  id: string;
  path: string;
  publicUrl?: string;
  signedUrl?: string;
}

export class StorageService {
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  /**
   * Upload a file to Supabase Storage
   */
  async upload(options: UploadOptions): Promise<StorageFile> {
    try {
      // Validate file size
      if (options.file.length > this.MAX_FILE_SIZE) {
        throw new Error(`File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
      }

      // Validate content type for images
      if (!this.ALLOWED_IMAGE_TYPES.includes(options.contentType)) {
        throw new Error(`Invalid content type. Allowed types: ${this.ALLOWED_IMAGE_TYPES.join(', ')}`);
      }

      // Generate unique file path
      const fileId = uuidv4();
      const extension = this.getFileExtension(options.fileName);
      const filePath = `${fileId}${extension}`;

      // Upload to Supabase Storage
      const { data, error } = await supabaseAdmin.storage
        .from(options.bucket)
        .upload(filePath, options.file, {
          contentType: options.contentType,
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Get public URL if bucket is public
      let publicUrl: string | undefined;
      if (options.isPublic || options.bucket === 'business-logos') {
        const { data: urlData } = supabaseAdmin.storage
          .from(options.bucket)
          .getPublicUrl(filePath);
        publicUrl = urlData.publicUrl;
      }

      return {
        id: fileId,
        path: data.path,
        publicUrl,
      };
    } catch (error) {
      throw new Error(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete a file from Supabase Storage
   */
  async delete(bucket: 'business-logos' | 'pass-assets', filePath: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        throw error;
      }
    } catch (error) {
      throw new Error(
        `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get a signed URL for private files
   */
  async getSignedUrl(
    bucket: 'business-logos' | 'pass-assets',
    filePath: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        throw error;
      }

      if (!data?.signedUrl) {
        throw new Error('Failed to generate signed URL');
      }

      return data.signedUrl;
    } catch (error) {
      throw new Error(
        `Failed to get signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * List files in a bucket with optional prefix
   */
  async list(
    bucket: 'business-logos' | 'pass-assets',
    prefix?: string
  ): Promise<Array<{ name: string; id: string; created_at: string }>> {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .list(prefix || '', {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      throw new Error(
        `Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get file metadata
   */
  async getMetadata(bucket: 'business-logos' | 'pass-assets', filePath: string) {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .list('', {
          search: filePath,
        });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('File not found');
      }

      return data[0];
    } catch (error) {
      throw new Error(
        `Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Download a file from storage
   */
  async download(bucket: 'business-logos' | 'pass-assets', filePath: string): Promise<Buffer> {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .download(filePath);

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('File not found');
      }

      // Convert Blob to Buffer
      const arrayBuffer = await data.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      throw new Error(
        `Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validate image file
   */
  validateImageFile(contentType: string, fileSize: number): void {
    if (!this.ALLOWED_IMAGE_TYPES.includes(contentType)) {
      throw new Error(`Invalid image type. Allowed: ${this.ALLOWED_IMAGE_TYPES.join(', ')}`);
    }

    if (fileSize > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${this.MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
  }

  /**
   * Clean up orphaned files (files not referenced in database)
   */
  async cleanupOrphanedFiles(bucket: 'business-logos' | 'pass-assets'): Promise<number> {
    try {
      // This would implement logic to find files in storage
      // that don't have corresponding database records
      // For MVP, we'll just log the intent
      console.log(`Cleanup orphaned files in ${bucket} - not implemented in MVP`);
      return 0;
    } catch (error) {
      throw new Error(
        `Failed to cleanup orphaned files: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
