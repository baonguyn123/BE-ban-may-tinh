// chat.controller.js
const Chat = require("../schemas/chat");
const Message = require("../schemas/message");

class ChatController {

    async createChat(userId) {
        let chat = await Chat.findOne({ user: userId });
        if (!chat) {
            chat = await Chat.create({ user: userId });
        }
        return chat;
    }

    async sendMessage(user, chatId, data) {
        const { content, computerId } = data;
        const message = new Message({
            chat: chatId,
            content,
            senderRole: user.role,
            computer: computerId || null
        });

        await Chat.findByIdAndUpdate(chatId, {
            lastMessage: content,
            lastUpdatedAt: Date.now()
        });

        await message.save();
        return message;
    }

    async getMessages(chatId) {
        const messages = await Message.find({ chat: chatId })
            .populate('computer', 'name price image slug')
            .sort({ createdAt: 1 });

        return messages;
    }

    async getAllChats() {
        const chats = await Chat.find()
            .populate('user', 'fullname')
            .sort({ createdAt: -1 });
        return chats;
    }
}

module.exports = new ChatController();