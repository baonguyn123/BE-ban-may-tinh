const Role = require('../schemas/role');

class RoleController {
    // Trả dữ liệu, không gọi res
    async create(data) {
            const role = new Role(data);
            return await role.save();
    }

    // Nếu muốn có hàm getAll
    async getAll() {
       return await Role.find();
    }
}

module.exports = new RoleController();