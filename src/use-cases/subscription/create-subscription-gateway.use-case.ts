import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

interface GatewayResponse {
  object: string;
  id: string;
  dateCreated: string;
  customer: string;
  billingType: string;
  cycle: string;
  value: number;
  nextDueDate: string;
}

export interface CreateSubscriptionGatewayDto {
    customer: string;
}

@Injectable()
export class CreateSubscriptionGatewayUseCase {

  private readonly GATEWAY_URL = 'https://api-sandbox.asaas.com/v3/subscriptions';
  private readonly GATEWAY_API_KEY = process.env.ACESS_TOKEN_ASAAS; 
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: this.GATEWAY_URL,
      headers: {
        'Content-Type': 'application/json',
        'access_token': `${this.GATEWAY_API_KEY}`,
      },
    });
  }

  /**
   * @returns {string}
   */
  private getCurrentFormattedDate(): string {
    const today = new Date();
    
    const year = today.getFullYear();
    
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  async execute(subscriptionData: CreateSubscriptionGatewayDto): Promise<GatewayResponse> {
    
    const nextDueDate = this.getCurrentFormattedDate(); 

    const payload = {
      billingType: 'UNDEFINED',
      cycle: 'MONTHLY',
      customer: subscriptionData.customer,
      value: 100,
      nextDueDate: nextDueDate, 
    };
    
    try {
      const response = await this.http.post<GatewayResponse>('', payload);
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
      throw new InternalServerErrorException('Falha ao conectar-se ao Gateway de Pagamento.');
    }
  }
}