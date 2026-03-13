const Role = require('../schemas/role')
class RoleController{
    async create(req, res) {
        try {
            const role = new Role(req.body);
            await role.save();
            res.status(201).json(role);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}
module.exports = new RoleController();