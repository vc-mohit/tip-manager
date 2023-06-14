require('dotenv').config()
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

function createJWTToken(emailId, role) {

    if (!emailId) {
        return false;
    }
    else {
        return jwt.sign({
            exp: Math.floor(Date.now() / 1000) + 86400,
            emailId: emailId,
            role: role
        }, jwtSecret);
    }

}

async function verifyJWTToken(token, secret) {
    return jwt.verify(token, secret, function (err, success) {
        if (err) {
            return false
        }
        return success;
    });
}

exports.createJWTToken = createJWTToken;
exports.verifyJWTToken = verifyJWTToken;
