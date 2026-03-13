//kiểm tra token có hợp lệ hay không
const jwt = require('jsonwebtoken')
function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Không có token' });
    }
    try{
        const decoded = jwt.verify(token, 'secretKey');
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Token không hợp lệ' });
    }
}
module.exports = authMiddleware;