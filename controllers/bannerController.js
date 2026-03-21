const Banner = require('../schemas/banner');

class BannerController {
    // FE sẽ gọi hàm này để lấy tất cả ảnh hiển thị
    async getAll(req, res) {
        try {
            const banners = await Banner.find();
            res.status(200).json(banners);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Admin (Postman) dùng hàm này để upload ảnh
    async create(req, res) {
        try {
            if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn ảnh' });

            const banner = new Banner({
                image: req.file.filename,
                type: req.body.type || 'main',
                link: req.body.link || '/products'
            });
            await banner.save();
            res.status(201).json(banner);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new BannerController();