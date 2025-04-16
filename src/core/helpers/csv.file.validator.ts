// import { validate } from "class-validator";
// import { Readable } from "stream";

// export class CsvFileValidator {
//   async validate<T>(buffer: Buffer, dtoClass: new () => T) : Promise<{ valid: T[]; invalid: any[] }> {
//     const rows: any[] = [];

//     return new Promise((resolve, reject) => {
//       Readable.from(buffer)
//         .pipe(csv())
//         .on('data', (data) => rows.push(data))
//         .on('end', async () => {
//           const valid: T[] = [];
//           const invalid: any[] = [];
  
//           for (const row of rows) {
//             const instance = plainToInstance(dtoClass, row);
//             const errors = await validate(instance);
  
//             if (errors.length > 0) {
//               invalid.push({ row, errors });
//             } else {
//               valid.push(instance);
//             }
//           }
  
//           resolve({ valid, invalid });
//         })
//         .on('error', (error) => reject(error));
//     });
//   }
// }

// function csv(): any {
//   throw new Error("Function not implemented.");
// }


// function plainToInstance(UserCsvDto: any, row: any) {
//   throw new Error("Function not implemented.");
// }
