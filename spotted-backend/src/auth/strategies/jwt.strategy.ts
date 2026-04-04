import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
      private authService: AuthService,
      private configService: ConfigService,
  ) {
    const supabaseUrl = configService.get<string>('SUPABASE_URL');
    const testSecret = configService.get<string>('SUPABASE_JWT_SECRET');
    const isTest = process.env.NODE_ENV === 'test' && !!testSecret;

    super(
        isTest
            ? {
              jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
              ignoreExpiration: false,
              secretOrKey: testSecret,
              algorithms: ['HS256'],
            }
            : {
              jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
              ignoreExpiration: false,
              audience: 'authenticated',
              algorithms: ['ES256', 'HS256'],
              secretOrKeyProvider: passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
              }) as any,
            },
    );
  }

  async validate(payload: any) {
    return this.authService.validateUserFromSupabase(payload);
  }
}