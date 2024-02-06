const Joi = require('joi');

const responseCodes = require('../../constants/responseCodes');

function userRegisterValidation(req, res, next) {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        userType: Joi.string().required().valid('p','d')
    });

    const { error } = schema.validate(req.body);

    if (error) {
        const errorMessage = error.details[0].message.replace(/"/g, ''); // Removing quotes from error message
        return res.status(responseCodes.BAD_REQUEST).json({ error: errorMessage });
    }
    next();
}

module.exports = userRegisterValidation;
