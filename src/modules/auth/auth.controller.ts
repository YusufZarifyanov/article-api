import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import {
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
} from './dto';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    const { userId, accessToken } =
      await this.authService.register(registerDto);

    return new RegisterResponseDto(userId, accessToken);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    const { userId, accessToken } = await this.authService.login(loginDto);

    return new LoginResponseDto(userId, accessToken);
  }
}
