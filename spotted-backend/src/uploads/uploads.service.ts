import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class UploadsService {
  private supabase: SupabaseClient;
  private bucket: string = 'spotted-images';

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || this.configService.get<string>('SUPABASE_KEY') || '';
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async uploadImage(file: Express.Multer.File, folder: string): Promise<string> {
    const timestamp = Date.now();
    const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.]/g, ''); 
    const fileName = `${folder.split('/')[1]}-${timestamp}-${cleanFileName}`;

    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      console.error('Supabase error when uploading:', error);
      throw new InternalServerErrorException('Failed to upload file to cloud');
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  }

  async deleteImage(fileUrl: string): Promise<void> {
    console.log(`Would delete: ${fileUrl}`);
  }

  async uploadMultiple(
      files: Express.Multer.File[],
      folder: string,
  ): Promise<string[]> {
    return Promise.all(files.map((file) => this.uploadImage(file, folder)));
  }
}