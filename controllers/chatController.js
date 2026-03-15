const Chat = require("../schemas/Chat")
const Message = require("../schemas/Message")
class ChatController {
    async createChat(req, res) {
        try {
            const userId = req.user.userId;
            let chat = await Chat.findOne({ user: userId });
            if (!chat) {
                chat = await Chat.create({ user: userId });
            }
            res.status(200).json({ chat });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async sendMessage(req, res) {
        try {
            const { chatId } = req.params
            const { content, computerId } = req.body
            const senderRole = req.user.role
            const message = new Message(
                {
                    chat: chatId,
                    content,
                    senderRole,
                    computer: computerId || null
                }
            )
            await Chat.findByIdAndUpdate(chatId, {
                lastMessage: content,
                lastUpdatedAt: Date.now()
            })
            await message.save()
            res.status(200).json({ message })

        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getMessages(req, res) {
        try {
            const { chatId } = req.params
            const message = await Message.find({ chat: chatId }
            )
            .populate('computer', 'name price image slug')
                .sort({ createdAt: 1 })
            res.status(200).json(
                { message }
            )
        }
        catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
    async getAllChats(req, res) {
        try {
            const chat = await Chat.find().populate('user', ' fullname')
                .sort({ createdAt: -1 })
            res.status(200).json({ chat })
        }
        catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
}
module.exports = new ChatController