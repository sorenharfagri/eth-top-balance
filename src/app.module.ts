import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { EthController } from './controllers/eth.controller';
import { EthService } from './services/eth.service';




@Module({
  imports: [
    HttpModule
  ],
  controllers: [EthController],
  providers: [EthService],
})
export class AppModule {}
