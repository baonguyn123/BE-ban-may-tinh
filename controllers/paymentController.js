const Payment = require("../schemas/payment");

class PaymentController {
    async findPaymentByOrderId(orderId) {
        return await Payment.findOne({ order: orderId });
    }

    async createPayment(data) {
        const payment = new Payment(data);
        return await payment.save();
    }

    async updatePaymentById(paymentId, updateData) {
        return await Payment.findByIdAndUpdate(paymentId, updateData, { new: true });
    }
}

module.exports = new PaymentController();