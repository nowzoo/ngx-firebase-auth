import { OobModule } from './oob.module';

describe('OobModule', () => {
  let oobModule: OobModule;

  beforeEach(() => {
    oobModule = new OobModule();
  });

  it('should create an instance', () => {
    expect(oobModule).toBeTruthy();
  });
});
