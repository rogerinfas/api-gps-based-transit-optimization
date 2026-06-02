import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@gps-transit.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'User123!' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
