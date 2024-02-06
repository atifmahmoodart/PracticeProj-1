const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const { sendOTPToEmail } = require('../helpers/emailService');
const OTP = require('../models/otpModel');
const jwt = require('jsonwebtoken');
const responseMessages = require('../constants/responseMessages');
const { loginFormat } = require('../format/userFormat');


const userService = {

    verifyOTP: async (email, otp) => {
        const user = await OTP.findOne({ email });
        if (!user || user.otp !== otp) {
            throw new Error(responseMessages.INVALID_OTP);
        }
        user.emailVerifiedAt = new Date().getTime() + (5 * 60 * 60 * 1000);
        await user.save();
        return true;
    },

    register: async (userData) => {
        const { email, password } = userData;
        const user = await OTP.findOne({ email, emailVerifiedAt: { $exists: true } });
        if (user) {
            throw new Error(responseMessages.USER_ALREADY_VERIFIED);
        }
        let otpDoc = await OTP.findOne({ email });
        if (!otpDoc) {
            const otp = Math.floor(100000 + Math.random() * 900000);
            otpDoc = new OTP({ email, otp, lastOtpSent: new Date().getTime() + (5 * 60 * 60 * 1000) });
            await otpDoc.save();
        } else {
            const otpExpiration = 10 * 60 * 1000;
            const currentTime = new Date().getTime() + (5 * 60 * 60 * 1000);
            if (otpDoc.lastOtpSent && currentTime - otpDoc.lastOtpSent < otpExpiration) {
                throw new Error(responseMessages.OTP_RECENTLY_SENT);
            }
            otpDoc.otp = Math.floor(100000 + Math.random() * 900000);
            otpDoc.lastOtpSent = new Date().getTime() + (5 * 60 * 60 * 1000);
            await otpDoc.save();
        }
        await sendOTPToEmail(email, otpDoc.otp);
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ ...userData, password: hashedPassword });
        await newUser.save();
        return true;
    },

    login: async (email, password) => {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error(responseMessages.USER_NOT_FOUND);
        }
        const otp = await OTP.findOne({ email, emailVerifiedAt: { $exists: true } });
        if (!otp) {
            throw new Error(responseMessages.OTP_NOT_VERIFIED);
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            throw new Error(responseMessages.INVALID_CREDENTIALS);
        }
        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '1h',
        });
        user.accessToken = accessToken;
        await user.save();
        const loginFormatted = await loginFormat(user, accessToken);
        return loginFormatted;
    },
    
};

module.exports = userService;