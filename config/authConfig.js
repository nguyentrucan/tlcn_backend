const jwt = require("jsonwebtoken");
const {nanoid} = require ('nanoid');

var nanoId = nanoid();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: 60 });
};

const generateRefreshToken = () => {
    const refreshToken = {
        token: nanoId,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Thêm 7 ngày (milliseconds)
    };
    return refreshToken;
};

module.exports = {generateToken, generateRefreshToken};