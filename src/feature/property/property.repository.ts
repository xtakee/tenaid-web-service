import { Injectable } from "@nestjs/common";
import { PropertyComplex } from "./model/property.complex.model";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Property } from "./model/property.model";
import { CreatePropertyComplexDto } from "src/domain/property/dto/request/create.property.complex.dto";
import { BasicPropertyInfoDto } from "src/domain/property/dto/request/basic.property.info.dto";
import { PropertyFinanceDto } from "src/domain/property/dto/request/property.finance.dto";

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
    }, { returnDocument: 'after' }).exec()
  }

  /**
   * 
   * @param complex 
   * @returns 
   */
  async getComplexById(complex: string): Promise<PropertyComplex> {
    return await this.complexModel.findById(complex)
  }

  /**
   * 
   * @param complex 
   * @param user 
   * @returns 
   */
  async getUserComplexById(complex: string, user: string): Promise<PropertyComplex> {
    return await this.complexModel.findOne({ _id: new Types.ObjectId(complex), account: new Types.ObjectId(user) })
  }

  /**
   * 
   * @param data 
   * @returns 
   */
  async updateBasicPropertyInfo(data: BasicPropertyInfoDto): Promise<Property> {
    return await this.propertyModel.findByIdAndUpdate(data.property, {
      name: data.name,
      complex: new Types.ObjectId(data.complex),
      description: data.description,
      bathrooms: data.bathrooms,
      size: data.size,
      bedrooms: data.bedrooms,
      type: data.type
    }, { returnDocument: 'after' }).exec()
  }

  /**
   * 
   * @param data 
   * @returns 
   */
  async createBasicPropertyInfo(data: BasicPropertyInfoDto, user: string): Promise<Property> {
    const property: Property = {
      complex: new Types.ObjectId(data.complex),
      account: new Types.ObjectId(user),
      name: data.name,
      description: data.description,
      bathrooms: data.bathrooms,
      bedrooms: data.bedrooms,
      size: data.size,
      type: data.type
    }

    return await this.propertyModel.create(property)
  }

  /**
   * 
   * @param data 
   * @param property 
   * @param user 
   * @returns 
   */
  async createProperyFinanceInfo(data: PropertyFinanceDto, property: string, user: string): Promise<Property> {
    return await this.propertyModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(property),
        account: new Types.ObjectId(user)
      },
      {
        price: data.price,
        customFees: data.customFees,
        caution: data.caution,
        legal: data.legal,
        leasePeriod: data.leasePeriod
      }, { returnDocument: 'after' }).exec()
  }
}
