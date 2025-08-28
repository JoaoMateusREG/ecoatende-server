import { Transform } from 'class-transformer';
import { cleanCPF, isValidCPF } from '../utils/cpf-validator';
import { cleanCNPJ, isValidCNPJ } from '../utils/cnpj-validator';

export function TransformCPF() {
  return Transform(({ value }) => {
    if (!value) return value;
    
    const cleaned = cleanCPF(value);
    
    if (cleaned.length !== 11) {
      throw new Error('CPF deve conter 11 dígitos');
    }
    
    if (!isValidCPF(cleaned)) {
      throw new Error('CPF inválido - verifique os dígitos verificadores');
    }
    
    return cleaned;
  });
}

export function TransformCNPJ() {
  return Transform(({ value }) => {
    if (!value) return value;
    
    const cleaned = cleanCNPJ(value);
    
    if (cleaned.length !== 14) {
      throw new Error('CNPJ deve conter 14 dígitos');
    }
    
    if (!isValidCNPJ(cleaned)) {
      throw new Error('CNPJ inválido - verifique os dígitos verificadores');
    }
    
    return cleaned;
  });
} 