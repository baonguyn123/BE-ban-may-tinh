const Chat = require("../schemas/chat");
const Message = require("../schemas/message");

class ChatController {
    async findChatByUser(userId) {
        return await Chat.findOne({ user: userId });
    }

    async createChat(data) {
        return await Chat.create(data);
    }

    async updateChatById(chatId, updateData) {
        return await Chat.findByIdAndUpdate(chatId, updateData, { new: true });
    }

    async createMessage(data) {
        const message = new Message(data);
        return await message.save();
    }

    async findMessagesByChatId(chatId) {
        return await Message.find({ chat: chatId }).populate('computer', 'name price image slug').sort({ createdAt: 1 });
    }

    async findAllChats() {
        return await Chat.find().populate('user', 'fullname').sort({ createdAt: -1 });
    }
}

module.exports = new ChatController();