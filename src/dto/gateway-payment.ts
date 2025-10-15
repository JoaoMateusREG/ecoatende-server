export interface GatewayPaymentWebhook {

   id: string;
   event: string;
   dateCreated: string;
   payment:{
      object: string;
      id: string;
      dateCreated: string;
      customer: string;
      subscription?: string; 
         // somente quando pertencer a uma assinatura
      installment: string;
         // somente quando pertencer a um parcelamento
      paymentLink?: string;
         // identificador do link de pagamento
      dueDate?:"2021-01-01",
      originalDueDate?:"2021-01-01",
      value?:100,
      netValue?:94.51,
      originalValue?:null,
         // para quando o valor pago é diferente do valor da cobrança
      transactionReceiptUrl: string;
         // url do comprovante de pagamento
      description?:string;
   }
}