import { plainToInstance } from "class-transformer"
import { validate } from "class-validator"
import { Readable } from "stream"
import * as csv from 'csv-parser'
import { Injectable } from "@nestjs/common"

@Injectable()
export class CsvFileValidator {
  async validate<T extends Object>(buffer: Buffer, dtoClass: new () => T): Promise<{ valid: T[], invalid: any[] }> {
    const rows: any[] = []

    return new Promise((resolve, reject) => {
      Readable.from(buffer)
        .pipe(csv())
        .on('data', (data) => {
          // Remove keys with empty string headers (e.g. from trailing commas)
          Object.keys(data).forEach((key) => {
            if (key.trim() === '') {
              delete data[key]
            }
          })

          // Check if the row is not entirely empty
          const hasNonEmptyField = Object.values(data).some(
            (value) => String(value).trim() !== '',
          )

          if (hasNonEmptyField) {
            rows.push(data)
          }
        })
        .on('end', async () => {
          const valid: T[] = []
          const invalid: any[] = []

          for (const row of rows) {
            // Clean up field names and values
            const normalizedRow = Object.fromEntries(
              Object.entries(row).map(([key, value]) => [key.trim(), value]),
            )

            const instance = plainToInstance(dtoClass, normalizedRow)
            const errors = await validate(instance)

            if (errors.length > 0) {
              invalid.push({ data: instance, errors })
            } else {
              valid.push(instance)
            }
          }

          resolve({ valid, invalid })
        })
        .on('error', (error) => reject(error))
    })
  }
}
