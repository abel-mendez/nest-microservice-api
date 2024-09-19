import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { BusinessModule } from './modules/business/business.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const microservice =
    await NestFactory.createMicroservice<MicroserviceOptions>(BusinessModule, {
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port: 8877,
      },
    });

  await microservice.listen();
  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
