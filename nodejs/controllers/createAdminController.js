const User = require('../schemas/user')
const Role = require('../schemas/role')
const bcrypt = require('bcrypt');

async function createAdmin() {
    const adminExist = await User.findOne({ username: 'nguyen' });
    if (adminExist) {
        console.log('Admin đã tồn tại');
        return;
    }
    const adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
        console.log('Không tìm thấy role admin');
        return;
    }
    const hashedPassword = await bcrypt.hash('nguyen123', 10);
    const adminUser = new User({
        username: 'nguyen',
        password: hashedPassword,
        email: 'nguyen@gmail.com',
        role: adminRole._id,
    });
    await adminUser.save();
    console.log('Admin đã được tạo thành công');
    
}
module.exports = createAdmin;
