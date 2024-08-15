import { Injectable } from "@nestjs/common";
import { PropertyComplex } from "./model/property.complex.model";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Property } from "./model/property.model";
import { CreatePropertyComplexDto } from "src/domain/property/dto/request/create.property.complex.dto";

@Injectable()
export class PropertyRepository {
  constructor(
    @InjectModel(PropertyComplex.name) private readonly complexModel: Model<PropertyComplex>,
    @InjectModel(Property.name) private readonly propertyModel: Model<Property>
  ) { }

  /**
   * 
   * @param user 
   * @param data 
   * @returns 
   */
  async createComplex(user: string, data: CreatePropertyComplexDto): Promise<PropertyComplex> {
    const complex: PropertyComplex = {
      account: new Types.ObjectId(user),
      name: data.name,
      description: data.description,
      allowPets: data.allowPets,
      media: data.media,
      address: data.address
    }

    return await this.complexModel.create(complex)
  }

  /**
   * 
   * @param user 
   * @param complex 
   * @param data 
   * @returns 
   */
  async updateComplex(user: string, complex: string, data: CreatePropertyComplexDto): Promise<PropertyComplex> {
    return await this.complexModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(complex),
        account: new Types.ObjectId(user)
      }, {
      name: data.name,
      description: data.description,
      allowPets: data.allowPets,
      media: data.media,
      address: data.address
    }, { returnDocument: 'after' })
  }
}
