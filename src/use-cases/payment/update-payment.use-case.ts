import { Inject } from "@nestjs/common";
import type { PaymentRepository } from "../../repositories/payment.repository";
import { UpdatePaymentDto } from "src/dto/update-payment.dto";
import { Payment } from "src/entities/payment";

export class UpdatePaymentUseCase {
    constructor(@Inject('PaymentRepository') private paymentRepository: PaymentRepository) {}

    async execute (updatePaymentDto: UpdatePaymentDto & {id: string}): Promise<Payment> {

        const existingPayment = await this.paymentRepository.findById(updatePaymentDto.id);
        if (!existingPayment) {
            throw new Error('Pagamento não encontrado');
        }

        const updatedPayment = Payment.create({
            ...existingPayment,
            ...updatePaymentDto,
        });

        return this.paymentRepository.update(updatedPayment);
            }
        }