import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('debe devolver status ok', () => {
    const result = controller.check();
    expect(result.status).toBe('ok');
    expect(result.service).toBe('fuel-price-api');
    expect(result.timestamp).toBeDefined();
  });
});
