import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateOrganizationDto } from '../../dto/create-organization.dto';
import axios, { AxiosInstance } from 'axios';

interface GatewayResponse {
  id: string;
  name: string;
  cpfCnpj: string;
}

@Injectable()
export class CreatedOrganizationGatewayUseCase {
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
  async execute(
    organizationData: CreateOrganizationDto,
  ): Promise<GatewayResponse> {
    const payload = {
      name: organizationData.name,
      cpfCnpj: organizationData.cnpj,
      email: organizationData.email,
      phone: organizationData.phone,
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
      throw new InternalServerErrorException(
        'Falha ao conectar-se ao Gateway de Pagamento.',
      );
    }
  }
}
