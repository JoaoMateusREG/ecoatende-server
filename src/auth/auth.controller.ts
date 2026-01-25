import { Controller, Post, Body, HttpStatus, HttpCode, HttpException, Res, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SessionAuthGuard } from './session-auth.guard';
import { CurrentSession } from '../decorators/current-session.decorator';
import type { SessionData } from './session.service';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fazer login' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login realizado com sucesso. Session ID enviado como cookie HttpOnly.',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            cpf: { type: 'string', example: '123.456.789-01' },
            name: { type: 'string', example: 'João Silva' },
            organizationCnpj: { type: 'string', example: '12.345.678/0001-90' },
            isActive: { type: 'boolean', example: true },
            services: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  name: { type: 'string', example: 'CIRURGIA' },
                  prefix: { type: 'string', example: 'C' }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    try {
      const result = await this.authService.login(loginDto);
      
      // Define o cookie HttpOnly com session ID
      response.cookie('session_id', result.sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true em produção (HTTPS)
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        path: '/'
      });

      // Retorna apenas os dados do usuário (sem o token)
      return {
        user: result.user
      };
    } catch (error: any) {
      throw new HttpException(
        { error: error.message },
        HttpStatus.UNAUTHORIZED
      );
    }
  }

    @Post('site')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fazer login' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login realizado com sucesso. Session ID enviado como cookie HttpOnly.',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            cpf: { type: 'string', example: '123.456.789-01' },
            name: { type: 'string', example: 'João Silva' },
            organizationCnpj: { type: 'string', example: '12.345.678/0001-90' },
            isActive: { type: 'boolean', example: true },
            services: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  name: { type: 'string', example: 'CIRURGIA' },
                  prefix: { type: 'string', example: 'C' }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async site(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    try {
      const result = await this.authService.site(loginDto);
      
      // Define o cookie HttpOnly com session ID
      response.cookie('session_id', result.sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true em produção (HTTPS)
        sameSite: 'strict',
        maxAge: 12 * 60 * 60 * 1000, // 12 horas
        path: '/'
      });

      // Retorna apenas os dados do usuário (sem o token)
      return {
        user: result.user
      };
    } catch (error: any) {
      throw new HttpException(
        { error: error.message },
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fazer logout' })
  @ApiResponse({ 
    status: 200, 
    description: 'Logout realizado com sucesso. Cookie de autenticação removido.'
  })
  async logout(@Res({ passthrough: true }) response: Response) {
    // Remove o cookie HttpOnly
    response.clearCookie('session_id', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    return { message: 'Logout realizado com sucesso' };
  }

  @Post('renew-session')
  @UseGuards(SessionAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar sessão do usuário' })
  @ApiResponse({ 
    status: 200, 
    description: 'Sessão renovada com sucesso'
  })
  @ApiResponse({ status: 401, description: 'Sessão inválida ou expirada' })
  async renewSession(@CurrentSession() session: SessionData) {
    try {
      const renewed = await this.authService.renewSession(session.sessionId);
      if (renewed) {
        return { message: 'Sessão renovada com sucesso' };
      } else {
        throw new HttpException(
          { error: 'Não foi possível renovar a sessão' },
          HttpStatus.BAD_REQUEST
        );
      }
    } catch (error: any) {
      throw new HttpException(
        { error: error.message },
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  @Get('session-stats')
  @ApiOperation({ summary: 'Obter estatísticas das sessões' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estatísticas das sessões'
  })
  async getSessionStats() {
    try {
      const stats = this.authService.getSessionStats();
      return stats;
    } catch (error: any) {
      throw new HttpException(
        { error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter dados do usuário atual' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dados completos do usuário atual obtidos com sucesso',
    schema: {
      type: 'object',
      properties: {
        cpf: { type: 'string', example: '123.456.789-01' },
        name: { type: 'string', example: 'João Silva' },
        password: { type: 'string', example: '$2b$10$...' },
        organizationCnpj: { type: 'string', example: '12.345.678/0001-90' },
        role: { type: 'string', example: 'ADMIN' },
        isActive: { type: 'boolean', example: true },
        services: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'CIRURGIA' },
              prefix: { type: 'string', example: 'C' },
              organizationCnpj: { type: 'string', example: '12.345.678/0001-90' }
            }
          }
        },
        organization: {
          type: 'object',
          properties: {
            cnpj: { type: 'string', example: '12.345.678/0001-90' },
            name: { type: 'string', example: 'CLINICA SAUDE PLUS' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token inválido ou expirado' })
  async getCurrentUser(@CurrentSession() session: SessionData) {
    try {
      const user = await this.authService.getCurrentUser(session.cpf);
      return user;
    } catch (error: any) {
      throw new HttpException(
        { error: error.message },
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  @Get('organization')
  @UseGuards(SessionAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter dados da organização do usuário atual' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dados da organização obtidos com sucesso',
    schema: {
      type: 'object',
      properties: {
        cnpj: { type: 'string', example: '12.345.678/0001-90' },
        name: { type: 'string', example: 'CLINICA SAUDE PLUS' },
        creationDate: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
        customerId: { type: 'string', example: '1234567890' },
        active: { type: 'boolean', example: true },
        logo: { type: 'string', example: 'https://example.com/logo.png' },
        users: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              cpf: { type: 'string', example: '123.456.789-01' },
              name: { type: 'string', example: 'João Silva' },
              role: { type: 'string', example: 'ADMIN' },
              isActive: { type: 'boolean', example: true }
            }
          }
        },
        services: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'CIRURGIA' },
              prefix: { type: 'string', example: 'C' },
              canCreateCards: { type: 'boolean', example: true },
              cardLimit: { type: 'number', example: 150 },
              category: { type: 'string', example: 'MEDICAL' },
              color: { type: 'string', example: '#FF5733' }
            }
          }
        },
        cards: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              card: { type: 'string', example: 'C001' },
              priority: { type: 'string', example: 'NORMAL' },
              status: { type: 'string', example: 'WAITING' },
              datehour: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' }
            }
          }
        },
        payments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'pay_123456789' },
              dateCreated: { type: 'string', example: '2024-01-15' },
              value: { type: 'number', example: 99.90 },
              status: { type: 'string', example: 'PAID' }
            }
          }
        },
        subscription: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'sub_123456789' },
              dateCreated: { type: 'string', example: '2024-01-15' },
              value: { type: 'number', example: 99.90 },
              nextDueDate: { type: 'string', example: '2024-02-15' },
              status: { type: 'string', example: 'ACTIVE' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token inválido ou expirado' })
  @ApiResponse({ status: 404, description: 'Usuário não possui organização associada' })
  async getCurrentUserOrganization(@CurrentSession() session: SessionData) {
    try {
      const organization = await this.authService.getCurrentUserOrganization(session.cpf);
      return organization;
    } catch (error: any) {
      throw new HttpException(
        { error: error.message },
        HttpStatus.UNAUTHORIZED
      );
    }
  }
} 