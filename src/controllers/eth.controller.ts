import { Controller, Get } from '@nestjs/common';
import { EthService } from 'src/services/eth.service';

@Controller('eth')
export class EthController {
  constructor(private ethService: EthService) {}

  @Get()
  getTopBalance() {
    return this.ethService.getTopChangesBalance();
  }
}
