import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
interface GatewayResponse {
  object: string;
  id: string;
  customer: string;
  billingType: string;
  nextDueDate: string;
  status: string;
}

export interface UpdateSubscriptionGatewayDto {
  status: string;
  subscriptionId: string;
}

@Injectable()
export class UpdateSubscriptionGatewayUseCase {
  private readonly GATEWAY_BASE_HOST ='https://api-sandbox.asaas.com/v3/subscriptions';
  private readonly GATEWAY_API_KEY = process.env.ACESS_TOKEN_ASAAS;
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: this.GATEWAY_BASE_HOST,
      headers: {
        'Content-Type': 'application/json',
        access_token: `${this.GATEWAY_API_KEY}`,
      },
    });
  }

  async execute(
    subscriptionData: UpdateSubscriptionGatewayDto,
  ): Promise<GatewayResponse> {
    const payload = {
      status: subscriptionData.status,
    };

    try {
      const relativeUrl = `/${subscriptionData.subscriptionId}`;
      const response = await this.http.put<GatewayResponse>(
        relativeUrl,
        payload,
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error('Erro de resposta do Gateway:', error.response.data);
        throw new InternalServerErrorException({
          message: `Falha na API do Gateway (${error.response.status})`,
          gatewayError: error.response.data,
        });
      }
      console.error('Erro de rede/conexão:', error.message);
      throw new InternalServerErrorException(
        'Falha ao conectar-se ao Gateway de Pagamento.',
      );
    }
  }
}
