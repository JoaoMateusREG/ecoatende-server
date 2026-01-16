export function cleanCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

export function isValidCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/\D/g, '');

  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) {
    return false;
  }

  // Verifica se todos os dígitos são iguais (CNPJ inválido)
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
    return false;
  }

  // Validação do primeiro dígito verificador
  let sum = 0;
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights1[i];
  }
  let remainder = sum % 11;
  if (remainder < 2) {
    remainder = 0;
  } else {
    remainder = 11 - remainder;
  }
  if (remainder !== parseInt(cleanCNPJ.charAt(12))) {
    return false;
  }

  // Validação do segundo dígito verificador
  sum = 0;
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights2[i];
  }
  remainder = sum % 11;
  if (remainder < 2) {
    remainder = 0;
  } else {
    remainder = 11 - remainder;
  }
  if (remainder !== parseInt(cleanCNPJ.charAt(13))) {
    return false;
  }

  return true;
}

export function formatCNPJ(cnpj: string): string {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/\D/g, '');

  // Aplica máscara: XX.XXX.XXX/XXXX-XX
  return cleanCNPJ.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    '$1.$2.$3/$4-$5',
  );
}
