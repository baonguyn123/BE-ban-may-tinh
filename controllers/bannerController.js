const Banner = require('../schemas/banner');

class BannerController {
    async getAllBanners() {
        return await Banner.find();
    }

    async createBanner(data) {
        const banner = new Banner(data);
        return await banner.save();
    }
}

module.exports = new BannerController();