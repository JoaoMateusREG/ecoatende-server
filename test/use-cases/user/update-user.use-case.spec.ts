import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserUseCase } from '../../../src/use-cases/user/update-user.use-case';
import { UserRole } from '../../../src/utils/user-role';
import { User } from '../../../src/entities/user';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  let userRepository: any;

  beforeEach(async () => {
    userRepository = {
      findByCpf: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserUseCase,
        {
          provide: 'UserRepository',
          useValue: userRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw error if user to update is not found', async () => {
    userRepository.findByCpf.mockResolvedValue(null);

    const userToUpdate = { cpf: '123' } as User;

    await expect(useCase.execute(userToUpdate)).rejects.toThrow('Usuário não encontrado');
  });

  it('should throw error if requesting user is not found', async () => {
    userRepository.findByCpf
      .mockResolvedValueOnce({ cpf: '123' }) // current user
      .mockResolvedValueOnce(null); // requesting user

    const userToUpdate = { cpf: '123' } as User;

    await expect(useCase.execute(userToUpdate, 'req_cpf')).rejects.toThrow('Usuário solicitante não encontrado');
  });

  it('should throw error if USER tries to edit another user', async () => {
    userRepository.findByCpf
      .mockResolvedValueOnce({ cpf: '123' })
      .mockResolvedValueOnce({ cpf: 'req_cpf', role: UserRole.USER });

    const userToUpdate = { cpf: '123' } as User;

    await expect(useCase.execute(userToUpdate, 'req_cpf')).rejects.toThrow('Você não tem permissão para editar outros usuários');
  });

  it('should allow USER to edit themselves', async () => {
    const mockUser = { cpf: '123', password: 'old_password', role: UserRole.USER };
    userRepository.findByCpf
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(mockUser);
    
    userRepository.update.mockResolvedValue({ ...mockUser, name: 'New Name' });

    const userToUpdate = { cpf: '123', name: 'New Name' } as User;
    
    const result = await useCase.execute(userToUpdate, '123');

    expect(userRepository.update).toHaveBeenCalled();
    expect(result.name).toBe('New Name');
  });

  it('should throw error if ORGANIZATION_ADMIN tries to edit ADMIN', async () => {
    userRepository.findByCpf
      .mockResolvedValueOnce({ cpf: '123', role: UserRole.ADMIN, organizationCnpj: 'org1' })
      .mockResolvedValueOnce({ cpf: 'req_cpf', role: UserRole.ORGANIZATION_ADMIN, organizationCnpj: 'org1' });

    const userToUpdate = { cpf: '123' } as User;

    await expect(useCase.execute(userToUpdate, 'req_cpf')).rejects.toThrow('Você não tem permissão para editar administradores');
  });

  it('should throw error if ORGANIZATION_ADMIN tries to edit user from another org', async () => {
    userRepository.findByCpf
      .mockResolvedValueOnce({ cpf: '123', role: UserRole.USER, organizationCnpj: 'org1' })
      .mockResolvedValueOnce({ cpf: 'req_cpf', role: UserRole.ORGANIZATION_ADMIN, organizationCnpj: 'org2' });

    const userToUpdate = { cpf: '123' } as User;

    await expect(useCase.execute(userToUpdate, 'req_cpf')).rejects.toThrow('Você só pode editar usuários da sua própria organização');
  });

  it('should hash new password if password has changed', async () => {
    const currentUser = { cpf: '123', password: 'old_password' };
    userRepository.findByCpf.mockResolvedValue(currentUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');
    userRepository.update.mockResolvedValue(true);

    const userToUpdate = { cpf: '123', password: 'new_password' } as User;
    await useCase.execute(userToUpdate);

    expect(bcrypt.hash).toHaveBeenCalledWith('new_password', 10);
    const updatedArgs = userRepository.update.mock.calls[0][0];
    expect(updatedArgs.password).toBe('new_hashed_password');
  });

  it('should keep old password if password is unchanged or not provided', async () => {
    const currentUser = { cpf: '123', password: 'old_hashed_password' };
    userRepository.findByCpf.mockResolvedValue(currentUser);
    userRepository.update.mockResolvedValue(true);

    const userToUpdate = { cpf: '123' } as User; // No password provided
    await useCase.execute(userToUpdate);

    const updatedArgs = userRepository.update.mock.calls[0][0];
    expect(updatedArgs.password).toBe('old_hashed_password');
  });
});
