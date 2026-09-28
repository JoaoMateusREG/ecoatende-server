import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class DeleteOrganizationGatewayUseCase {
  private readonly GATEWAY_URL = process.env.API_ASAAS + '/customers';
  private readonly GATEWAY_API_KEY = process.env.ACESS_TOKEN_ASAAS;
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: this.GATEWAY_URL,
      headers: {
        'Content-Type': 'application/json',
        access_token: `${this.GATEWAY_API_KEY}`,
      },
    });
  }

  async execute(customerId: string): Promise<void> {
    try {
      await this.http.delete(`/${customerId}`);
    } catch (error: any) {
      if (error.response) {
        console.error('Erro de resposta do Gateway ao deletar cliente:', error.response.data);
        throw new InternalServerErrorException({
          message: `Falha na API do Gateway ao deletar cliente (${error.response.status})`,
          gatewayError: error.response.data,
        });
      }
      console.error('Erro de rede/conexão ao deletar cliente:', error.message);
      throw new InternalServerErrorException(
        'Falha ao conectar-se ao Gateway de Pagamento para deletar cliente.',
      );
    }
  }
}
