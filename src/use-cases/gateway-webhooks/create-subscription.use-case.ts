import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GatewayCreateSubscription } from 'src/dto/gateway-subscription';
import axios, { AxiosInstance } from 'axios';

interface GatewayResponse {
  object: string;
  id: string;
  dateCreated: string;
  customer: string;
  paymentLink?: string | null;
  billingType: string;
  cycle: string;
  value: string;
  nextDueDate: string;
  description: string;
  status: string;
}

@Injectable()
export class CreateSubscriptionUseCase {

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
  async execute(createSubscription: GatewayCreateSubscription) {
    const createsubscription = {
      billingType: createSubscription.billingType,
      cycle: createSubscription.cycle,
      customer: createSubscription.customer,
      value: createSubscription.value,
      nextDueDate: createSubscription.nextDueDate,
      description: createSubscription.description ?? '',
      callback: {
        successUrl: createSubscription.callback.successUrl,
        autoRedirect: createSubscription.callback.autoRedirect,
      },
    };
    
    try {
      const response = await this.http.post<GatewayResponse>('', createsubscription);
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