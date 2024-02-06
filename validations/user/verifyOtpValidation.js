// const responseCodes = require('../../constants/responseCodes');
// const responseMessages = require('../../constants/responseMessages');

// function veifyOtpValidation(req, res, next) {
//     const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

//     if (!req.body.email) {
//         return res.status(responseCodes.BAD_REQUEST).json({ error: responseMessages.EMAIL_REQUIRED });
//     }

//     if (!req.body.otp) {
//         return res.status(responseCodes.BAD_REQUEST).json({ error: responseMessages.OTP_REQUIRED });
//     }

//     if (!emailRegex.test(req.body.email)) {
//         return res.status(responseCodes.BAD_REQUEST).json({ error: responseMessages.INVALID_EMAIL });
//     }

//     next();
// }

// module.exports = veifyOtpValidation;
const Joi = require('joi');

const responseCodes = require('../../constants/responseCodes');

function veifyOtpValidation(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        otp: Joi.string().required()
    });

    const { error } = schema.validate(req.body);

    if (error) {
        const errorMessage = error.details[0].message.replace(/"/g, ''); // Removing quotes from error message
        return res.status(responseCodes.BAD_REQUEST).json({ error: errorMessage });
    }
    next();
}

module.exports = veifyOtpValidation;
