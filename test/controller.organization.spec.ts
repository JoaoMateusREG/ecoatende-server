import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { SessionService } from '../src/auth/session.service';

describe('OrganizationController', () => {
  let app: INestApplication;

  const sessionsMock = [
    {
      sessionId: 'dashfjhsauidsnjhjafiuns',
      cpf: '19457544005',
      organizationCnpj: '12345678000199',
    },
  ];

  // Mock do SessionService
  const mockSessionService = {
    validateSession: jest.fn(),
    renewSession: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SessionService)
      .useValue(mockSessionService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Configura o mock para retornar uma sessão válida
    mockSessionService.validateSession.mockImplementation(
      (sessionId: string) => {
        const mockSession = sessionsMock.find((s) => s.sessionId === sessionId);
        if (mockSession) {
          return {
            cpf: mockSession.cpf,
            organizationCnpj: mockSession.organizationCnpj,
            sessionId: mockSession.sessionId,
          };
        }
        return null;
      },
    );

    mockSessionService.renewSession.mockResolvedValue(true);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  //Organization
  describe('GET /organizations', () => {
    it('should return 401 if no session is found', () => {
      return request(app.getHttpServer())
        .get('/organizations')
        .expect(401)
        .expect((response) => {
          expect(response.body.message).toBe('Sessão não encontrada');
          expect(response.body.error).toBe('Unauthorized');
        });
    });

    it('should return 401 if session is invalid', () => {
      mockSessionService.validateSession.mockReturnValue(null);
      return request(app.getHttpServer())
        .get('/organizations')
        .set('Authorization', `Session gnuvcudhnsjicmcxcfhgvn`)
        .expect(401)
        .expect((response) => {
          expect(response.body.message).toBe('Sessão inválida ou expirada');
          expect(response.body.error).toBe('Unauthorized');
        });
    });

    it('Should return 200 with no organizations', () => {
      return request(app.getHttpServer())
        .get('/organizations')
        .set('Authorization', `Session ${sessionsMock[0].sessionId}`)
        .expect(200)
        .expect((response) => {
          expect(response.body).toEqual([]);
        });
    });
  });

  //User
  describe('GET /users', () => {
    it('should return 401 if no session is found', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(401)
        .expect((response) => {
          expect(response.body.message).toBe('Sessão não encontrada');
          expect(response.body.error).toBe('Unauthorized');
        });
    });

    it('should return 401 if session is invalid', () => {
      mockSessionService.validateSession.mockReturnValue(null);
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Session gnuvcudhnsjicmcxcfhgvn`)
        .expect(401)
        .expect((response) => {
          expect(response.body.message).toBe('Sessão inválida ou expirada');
          expect(response.body.error).toBe('Unauthorized');
        });
    });

    it('Should return 200 with no users', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Session ${sessionsMock[0].sessionId}`)
        .expect(200)
        .expect((response) => {
          expect(response.body).toEqual([]);
        });
    });
  });

  //Organization
  describe('POST /organizations', () => {
    it('Should return 401 if no session is found', () => {
      return request(app.getHttpServer())
        .post('/organizations')
        .expect(401)
        .expect((response) => {
          expect(response.body.message).toBe('Sessão não encontrada');
          expect(response.body.error).toBe('Unauthorized');
        });
    });

    it('Should return 201 with organization created', async () => {
      // Primeiro, cria um usuário ADMIN para ter permissão
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Session ${sessionsMock[0].sessionId}`)
        .send({
          cpf: '00000000000', // CPF do admin
          name: 'ADMIN USER',
          password: 'admin123',
          role: 'ADMIN',
          organizationCnpj: '12345678000199',
        });

      // Atualiza o mock da sessão para usar o CPF do admin
      const adminSession = {
        sessionId: 'admin-session-id',
        cpf: '00000000000',
        organizationCnpj: '12345678000199',
      };
      sessionsMock.push(adminSession);

      return request(app.getHttpServer())
        .post('/organizations')
        .set('Authorization', `Session ${adminSession.sessionId}`)
        .send({
          name: 'Organization 1',
          cnpj: '12345678000199',
        })
        .expect(201)
        .expect((response) => {
          expect(response.body.name).toBe('Organization 1');
        });
    });
  });

  describe('GET /organizations/name/:name', () => {
    it('Should return organization 1', () => {
      return request(app.getHttpServer())
        .get('/organizations/name/Organization 1')
        .set('Authorization', `Session ${sessionsMock[0].sessionId}`)
        .expect(200)
        .expect((response) => {
          expect(response.body.name).toBe('Organization 1');
        });
    });
  });

  //User
  describe('POST /users', () => {
    it('Should return 401 if session is invalid', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Session gnuvcudhnsjicmcxcfhgvn`)
        .expect(401)
        .expect((response) => {
          expect(response.body.message).toBe('Sessão inválida ou expirada');
          expect(response.body.error).toBe('Unauthorized');
        });
    });

    it('Should return 201 with user created', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Session ${sessionsMock[0].sessionId}`)
        .send({
          cpf: '19457544005',
          name: 'USER 1',
          password: '123456',
          role: 'USER',
          organizationCnpj: '12345678000199',
        })
        .expect(201)
        .expect((response) => {
          expect(response.body.name).toBe('USER 1');
        });
    });
  });

  //Organization
  describe('GET /organizations/:cnpj', () => {
    it('Should return organization 1', () => {
      return request(app.getHttpServer())
        .get('/organizations/12345678000199')
        .set('Authorization', `Session ${sessionsMock[0].sessionId}`)
        .expect(200)
        .expect((response) => {
          expect(response.body.name).toBe('Organization 1');
        });
    });
  });

  describe('GET /organizations/:cnpj/users', () => {
    it('Should return user 1', () => {
      return request(app.getHttpServer())
        .get('/organizations/12345678000199/users')
        .set('Authorization', `Session ${sessionsMock[0].sessionId}`)
        .expect(200)
        .expect((response) => {
          expect(response.body.users.length).toBe(1);
          expect(response.body.users[0].name).toBe('USER 1');
        });
    });
  });

  describe('GET /organizations/:cnpj/services', () => {
    it('Should return service 1', () => {
      return request(app.getHttpServer())
        .get('/organizations/12345678000199/services')
        .set('Authorization', `Session ${sessionsMock[0].sessionId}`)
        .expect(200)
        .expect((response) => {
          expect(response.body.services).toEqual([]);
        });
    });
  });

  //User
  describe('GET /users/:cpf', () => {
    it('Should return user 1', () => {
      return request(app.getHttpServer())
        .get('/users/19457544005')
        .set('Authorization', `Session ${sessionsMock[0].sessionId}`)
        .expect(200)
        .expect((response) => {
          expect(response.body.name).toBe('USER 1');
        });
    });
  });
  describe('GET /users/organization/:organizationCnpj', () => {
    it('Should return 19457544005', () => {
      return request(app.getHttpServer())
        .get('/users/organization/12345678000199')
        .set('Authorization', `Session ${sessionsMock[0].sessionId}`)
        .expect(200)
        .expect((response) => {
          expect(response.body[0].cpf).toBe('19457544005');
        });
    });
  });

  //Organization
  describe('PUT /organizations/:cnpj', () => {
    it('Should return 200 with organization updated', () => {
      return request(app.getHttpServer())
        .put('/organizations/12345678000199')
        .set('Authorization', `Session ${sessionsMock[0].sessionId}`)
        .send({
          name: 'Organization 2',
          cnpj: '12345678000199',
        })
        .expect(200)
        .expect((response) => {
          expect(response.body.name).toBe('Organization 2');
        });
    });
  });

  //User
  describe('PUT /users/:cpf', () => {
    it('Should return 200 with user updated', () => {
      return request(app.getHttpServer())
        .put('/users/19457544005')
        .set('Authorization', `Session ${sessionsMock[0].sessionId}`)
        .send({
          name: 'USER 2',
          cpf: '19457544005',
          organizationCnpj: '12345678000199',
        })
        .expect(200)
        .expect((response) => {
          expect(response.body.name).toBe('USER 2');
        });
    });
  });

  describe('PUT /users/change-password', () => {
    it('Should return 200 with password changed', () => {
      return request(app.getHttpServer())
        .put('/users/change-password')
        .set('Authorization', `Session ${sessionsMock[0].sessionId}`)
        .send({
          currentPassword: '123456',
          newPassword: '1234567',
        })
        .expect(200)
        .expect((response) => {
          expect(response.body.message).toBe('Senha alterada com sucesso');
        });
    });
  });

  /*   //User 
        describe('DELETE /users/:cpf', () => {
            it('Should delete user 2', () => {
                return request(app.getHttpServer())
                    .delete('/users/19457544005')
                    .set('Authorization', `Session ${sessionsMock[0].sessionId}`)
                    .expect(204)
                    .expect(response => {
                        expect(response.body).toStrictEqual({});
                    })
            })
        })
    */

  /*   //Organization
       describe('DELETE /organizations/:cnpj', () => {
            it('Should delete organization 2', () => {
                return request(app.getHttpServer())
                    .delete('/organizations/12345678000199')
                    .set('Authorization', `Session ${sessionsMock[0].sessionId}`)
                    .expect(204)
                    .expect(response => {
                        expect(response.body).toStrictEqual({});
                    })
            })
        })
    */
});
