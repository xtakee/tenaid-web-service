export class BulkUploadResponseDto {
  inserted: number
  updated: number
  errorEntries?: number
  updatedEntries?: string[]
}