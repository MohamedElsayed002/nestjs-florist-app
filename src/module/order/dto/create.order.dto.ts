import {
  IsBoolean,
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class ShippingAddressDto {
  @IsNotEmpty()
  street: string;
  @IsNotEmpty()
  city: string;
  @IsNotEmpty()
  phone: string;
}

export class statusShippingDto {
  @IsNotEmpty()
  @IsBoolean()
  isDelivered: boolean;

  @IsOptional()
  @IsDate()
  deliveredAt: Date;
}

export class isMongoID {
  @IsMongoId()
  orderId: string;
}
