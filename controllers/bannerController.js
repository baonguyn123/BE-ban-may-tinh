const Banner = require('../schemas/banner');

class BannerController {
    // FE sẽ gọi hàm này để lấy tất cả ảnh hiển thị
    async getAll() {
        return await Banner.find();
    }

    // Admin (Postman) dùng hàm này để upload ảnh
    async create(data, file) {
        if (!file)
            throw new Error('Vui lòng chọn ảnh');
        const banner = new Banner(
            {
                image: file.filename,
                type: data.type || 'main',
                link: data.link || '/products'
            }
        );
        return await banner.save();
    }
}

module.exports = new BannerController();