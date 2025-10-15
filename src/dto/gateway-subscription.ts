export interface GatewaySubscriptionWebhook {
  id: string;
  event: string;
  dateCreated: string;
  subscription: {
    object: string;
    id: string;
    dateCreated: string;
    customer: string;
    paymentLink: null;
    value: 19.9;
    nextDueDate: string;
    cycle: string;
    description: string;
    billingType: string;
    deleted: boolean;
    status: string;
  };
}

export interface GatewayCreateSubscription {
    billingType: string;
    cycle: string;
    customer: string;
    value: number;
    nextDueDate: string;
    description?: string;
    callback: {
        successUrl: string;
        autoRedirect: boolean;
    };
}