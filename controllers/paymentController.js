const qs = require("qs")
const crypto = require("crypto")
const moment = require("moment")

const config = require("../config/vnpayConfig")

const Order = require("../schemas/order")
const Payment = require("../schemas/payment")
const OrderItem = require("../schemas/orderitem")
function sortObject(obj) {
    let sorted = {}
    let str = []
    let key

    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(key)
        }
    }

    str.sort()

    for (let i = 0; i < str.length; i++) {
        sorted[str[i]] = encodeURIComponent(obj[str[i]]).replace(/%20/g, "+")
    }

    return sorted
}

class PaymentController {

    // ================================
    // TẠO LINK THANH TOÁN
    // ================================
    async createPayment(req, res) {

        try {

            const { orderId } = req.params

            const order = await Order.findById(orderId)
                .populate("user", "name email phone")

            if (!order) {
                return res.status(404).json({
                    message: "Không tìm thấy đơn hàng"
                })
            }

            if (order.status !== "PENDING") {
                return res.status(400).json({
                    message: "Đơn hàng không thể thanh toán"
                })
            }

            const amount = Number(order.totalAmount)

            const date = new Date()

            const createDate = moment(date).format("YYYYMMDDHHmmss")

            const ipAddr =
                req.headers["x-forwarded-for"] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket?.remoteAddress

            const tmnCode = config.vnp_TmnCode
            const secretKey = config.vnp_HashSecret
            let vnpUrl = config.vnp_Url
            const returnUrl = config.vnp_ReturnUrl

            let locale = req.body.language
            if (!locale) locale = "vn"

            const currCode = "VND"

            let vnp_Params = {}

            vnp_Params["vnp_Version"] = "2.1.0"
            vnp_Params["vnp_Command"] = "pay"
            vnp_Params["vnp_TmnCode"] = tmnCode
            vnp_Params["vnp_Locale"] = locale
            vnp_Params["vnp_CurrCode"] = currCode

            vnp_Params["vnp_TxnRef"] = orderId.toString()

            vnp_Params["vnp_OrderInfo"] =
                "Thanh_toan_don_hang_" + orderId

            vnp_Params["vnp_OrderType"] = "other"

            vnp_Params["vnp_Amount"] = amount * 100

            vnp_Params["vnp_ReturnUrl"] = returnUrl

            vnp_Params["vnp_IpAddr"] = ipAddr

            vnp_Params["vnp_CreateDate"] = createDate

            vnp_Params = sortObject(vnp_Params)

            const signData = qs.stringify(vnp_Params, { encode: false })

            const hmac = crypto.createHmac("sha512", secretKey)

            const signed = hmac
                .update(Buffer.from(signData, "utf-8"))
                .digest("hex")

            vnp_Params["vnp_SecureHash"] = signed

            vnpUrl += "?" + qs.stringify(vnp_Params, { encode: false })

            let payment = await Payment.findOne({
                order: orderId
            })

            if (!payment) {

                payment = await Payment.create({
                    transactionId: orderId,
                    amount: amount,
                    paymentMethod: "VNPAY",
                    status: "PENDING",
                    order: orderId
                })

            }

            return res.json({
                paymentUrl: vnpUrl
            })

        } catch (error) {

            console.log(error)

            res.status(500).json({
                message: error.message
            })

        }

    }


    // ================================
    // RETURN URL
    // ================================
    async vnpayReturn(req, res) {

        try {

            let vnp_Params = req.query

            const secureHash = vnp_Params["vnp_SecureHash"]

            delete vnp_Params["vnp_SecureHash"]
            delete vnp_Params["vnp_SecureHashType"]

            vnp_Params = sortObject(vnp_Params)

            const secretKey = config.vnp_HashSecret

            const signData = qs.stringify(vnp_Params, {
                encode: false
            })

            const hmac = crypto.createHmac(
                "sha512",
                secretKey
            )

            const signed = hmac
                .update(Buffer.from(signData, "utf-8"))
                .digest("hex")

            if (secureHash === signed) {

                const orderId = vnp_Params["vnp_TxnRef"]

                const payment = await Payment.findOne({
                    order: orderId
                })

                if (!payment) {

                    return res.status(404).json({
                        message: "Không tìm thấy payment"
                    })

                }
                if (payment.status === "SUCCESS") {
                    return res.json({ message: "Đã thanh toán rồi" })
                }
                if (vnp_Params["vnp_ResponseCode"] === "00") {


                    payment.transactionId =
                        vnp_Params["vnp_TransactionNo"]
                    const orderItems = await OrderItem.find({ order: orderId })

                    for (const item of orderItems) {

                        const updatedStock = await Computer.findOneAndUpdate(
                            {
                                _id: item.computer,
                                stockQuantity: { $gte: item.quantity }
                            },
                            {
                                $inc: { stockQuantity: -item.quantity }
                            },
                            { new: true }
                        )

                        if (!updatedStock) {
                            throw new Error(`Sản phẩm ${item.productName} không đủ hàng`)
                        }
                    }

                    await Order.findByIdAndUpdate(orderId, {
                        status: "PENDING"
                    })

                    payment.status = "SUCCESS"

                    await payment.save()

                    return res.json({
                        message: "Thanh toán thành công"
                    })

                } else {

                    payment.status = "FAILED"

                    await payment.save()

                    return res.json({
                        message: "Thanh toán thất bại"
                    })

                }

            } else {

                return res.json({
                    message: "Sai chữ ký"
                })

            }

        } catch (error) {

            res.status(500).json({
                message: error.message
            })

        }

    }

}

module.exports = new PaymentController()