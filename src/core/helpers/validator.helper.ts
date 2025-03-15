import { BadRequestException, Injectable } from "@nestjs/common"   

@Injectable()
export class DtoValidator {

  async validate<T>(dtoInstance: T, clazz: new (data: T) => any): Promise<void> {
    const dto = new clazz(dtoInstance)   
    const errorMessage = dto.validate()   
    if (errorMessage) {
      throw new BadRequestException(errorMessage)   
    }
  }
}