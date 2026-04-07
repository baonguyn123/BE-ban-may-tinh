const Store = require('../schemas/store');

class StoreController {
    async getAllStores() {
        return await Store.find();
    }

    async getActiveStores() {
        return await Store.find({ isActive: true });
    }

    async createStore(data) {
        const store = new Store(data);
        return await store.save();
    }

    async updateStoreById(id, data) {
        return await Store.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteStoreById(id) {
        return await Store.findByIdAndDelete(id);
    }
}

module.exports = new StoreController();