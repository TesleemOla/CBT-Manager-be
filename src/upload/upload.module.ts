import { Module } from '@nestjs/common';

// Placeholder – file uploads are handled directly in QuestionsController
// via FileFieldsInterceptor with memoryStorage.
// This module exists for future upload-specific logic (e.g. cloud storage).
@Module({})
export class UploadModule {}
