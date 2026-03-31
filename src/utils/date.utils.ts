/**
 * Retorna um Date com o horário local do servidor "embutido" como UTC,
 * para que o Prisma grave o horário local no PostgreSQL (TIMESTAMP WITHOUT TIME ZONE).
 *
 * O Prisma sempre serializa Date em UTC ao enviar ao banco.
 * Como o servidor está em UTC-3, new Date() já reflete o horário local,
 * mas o Prisma subtrai 3h ao serializar. Este helper compensa isso.
 */
export function nowBrasilia(): Date {
  const now = new Date();
  // Compensa o offset do servidor para que o Prisma grave o horário local
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000);
}
