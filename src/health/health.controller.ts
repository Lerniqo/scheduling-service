import { Controller, Get } from '@nestjs/common';
import {
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
  ) {}

  @Get('live')
  liveness() {
    return {
      "status": "ok",
      "message": "Liveness probe successful"
    };
  }
}
