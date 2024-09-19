import { Module } from '@nestjs/common';
import { BusinessController } from './controllers/business.controller';
import { LoginModule } from '../login/login.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    LoginModule,
    AuthModule,
  ],
  controllers: [BusinessController],
})
export class BusinessModule {}
