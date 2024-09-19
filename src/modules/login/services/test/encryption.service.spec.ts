import { Test, TestingModule } from '@nestjs/testing';
import { EncryptionService } from '../encryption.service';

describe('EncryptionService Unit Test', () => {
  let service: EncryptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EncryptionService],
    }).compile();

    service = module.get<EncryptionService>(EncryptionService);
  });

  it('should hash a password', async () => {
    const plainPassword = 'Password!1234';
    const hashedPassword = await service.hashPassword(plainPassword);

    expect(hashedPassword).not.toEqual(plainPassword);
  });

  it('should compare a password successfully', async () => {
    const plainPassword = 'Password!1234';
    const hashedPassword = await service.hashPassword(plainPassword);

    const isMatch = await service.comparePassword(
      plainPassword,
      hashedPassword,
    );
    expect(isMatch).toBe(true);
  });

  it('should return false for an incorrect password', async () => {
    const plainPassword = 'Password!1234';
    const hashedPassword = await service.hashPassword(plainPassword);

    const wrongPassword = 'Password!12345';
    const isMatch = await service.comparePassword(
      wrongPassword,
      hashedPassword,
    );
    expect(isMatch).toBe(false);
  });
});
