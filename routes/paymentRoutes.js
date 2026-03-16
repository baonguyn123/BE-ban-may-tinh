const express = require("express")
const router = express.Router()
const paymentController = require("../controllers/paymentController")

router.post("/create/:orderId", paymentController.createPayment)

router.get("/vnpay_return", paymentController.vnpayReturn)

module.exports = router