import { Injectable } from "@nestjs/common";
import { AccountAdmin } from "../model/account.admin.model";
import { Mapper } from "src/core/util/mapper";
import { AccountAdminResponseDto } from "src/feature/admin/dto/response/account.admin.response.dto";;

@Injectable()
export class AccountAdminToDtoMapper implements Mapper<AccountAdmin, AccountAdminResponseDto> {
  map(from: AccountAdmin): AccountAdminResponseDto {
    return {
      id: (from as any)._id,
      lastName: from.lastName,
      firstName: from.firstName,
      email: {
        value: from.email.value,
        verified: from.email.verified
      },
      phone: from.phone,
      photo: from.photo,
    }
  }
}
