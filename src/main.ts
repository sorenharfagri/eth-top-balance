import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();


  const config = new DocumentBuilder()
    .setTitle('Finetch')
    .setDescription('The API description')
    .setVersion('1.0')

    .setContact(
      'soren',
      'https://tenor.com/view/kawakaze-dance-neko-dance-anime-girl-cheeks-gif-19468824',
      'sorenharfagri@gmail.com',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(3000);
}
bootstrap();
