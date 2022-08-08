import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { JwtConfiguration } from '../../config/app/configuration';
import { User } from '../../entities/user.entity';
import { UserRepository } from '../users/user.repository';
import { JwtPayload } from './jwt.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {
    const jwtSetting = configService.get<JwtConfiguration>('jwt');
    const passportStrategy: StrategyOptions = {
      secretOrKey: jwtSetting.secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ...jwtSetting.signOptions,
    };
    super(passportStrategy);
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { username } = payload;
    const user = await this.userRepository.findOne({ username });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
