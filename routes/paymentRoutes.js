const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const orderController = require("../controllers/orderController");
const computerController = require("../controllers/computerController");
const qs = require("qs");
const crypto = require("crypto");
const moment = require("moment");
const config = require("../config/vnpayConfig");

function sortObject(obj) {
    let sorted = {};
    let str = [];
    for (let key in obj) { if (obj.hasOwnProperty(key)) str.push(key); }
    str.sort();
    for (let i = 0; i < str.length; i++) {
        sorted[str[i]] = encodeURIComponent(obj[str[i]]).replace(/%20/g, "+");
    }
    return sorted;
}

router.post("/create/:orderId", async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await orderController.findOrderById(orderId);

        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        if (order.status !== "PENDING") return res.status(400).json({ message: "Đơn không thể thanh toán" });

        const amount = Number(order.totalAmount);
        const createDate = moment(new Date()).format("YYYYMMDDHHmmss");
        const ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress;

        let vnp_Params = {
            "vnp_Version": "2.1.0",
            "vnp_Command": "pay",
            "vnp_TmnCode": config.vnp_TmnCode,
            "vnp_Locale": req.body.language || "vn",
            "vnp_CurrCode": "VND",
            "vnp_TxnRef": orderId.toString(),
            "vnp_OrderInfo": "Thanh_toan_don_hang_" + orderId,
            "vnp_OrderType": "other",
            "vnp_Amount": amount * 100,
            "vnp_ReturnUrl": config.vnp_ReturnUrl,
            "vnp_IpAddr": ipAddr,
            "vnp_CreateDate": createDate
        };

        vnp_Params = sortObject(vnp_Params);
        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", config.vnp_HashSecret);
        vnp_Params["vnp_SecureHash"] = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

        const vnpUrl = config.vnp_Url + "?" + qs.stringify(vnp_Params, { encode: false });

        let payment = await paymentController.findPaymentByOrderId(orderId);
        if (!payment) {
            await paymentController.createPayment({
                transactionId: orderId,
                amount: amount,
                paymentMethod: "VNPAY",
                status: "PENDING",
                order: orderId
            });
        }

        res.json({ paymentUrl: vnpUrl });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/vnpay_return", async (req, res) => {
    try {
        let vnp_Params = req.query;
        const secureHash = vnp_Params["vnp_SecureHash"];
        delete vnp_Params["vnp_SecureHash"];
        delete vnp_Params["vnp_SecureHashType"];

        vnp_Params = sortObject(vnp_Params);
        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", config.vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

        const frontendUrl = "http://localhost:5173/orders";

        if (secureHash === signed) {
            const orderId = vnp_Params["vnp_TxnRef"];
            const payment = await paymentController.findPaymentByOrderId(orderId);

            if (!payment) return res.redirect(`${frontendUrl}?payment=error`);
            if (payment.status === "SUCCESS") return res.redirect(`${frontendUrl}?payment=success`);

            if (vnp_Params["vnp_ResponseCode"] === "00") {
                await paymentController.updatePaymentById(payment._id, { transactionId: vnp_Params["vnp_TransactionNo"], status: "SUCCESS" });
                return res.redirect(`${frontendUrl}?payment=success`);
            } else {
                await paymentController.updatePaymentById(payment._id, { status: "FAILED" });
                await orderController.updateOrderById(orderId, { status: "CANCELLED" });
                return res.redirect(`${frontendUrl}?payment=failed`);
            }
        } else {
            return res.redirect(`${frontendUrl}?payment=error`);
        }
    } catch (error) {
        return res.redirect(`http://localhost:5173/orders?payment=error`);
    }
});

module.exports = router;