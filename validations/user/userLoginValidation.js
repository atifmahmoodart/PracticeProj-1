const Joi = require('joi');

const responseCodes = require('../../constants/responseCodes');

function userLoginValidation(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        const errorMessage = error.details[0].message.replace(/"/g, ''); // Removing quotes from error message
        return res.status(responseCodes.BAD_REQUEST).json({ error: errorMessage });
    }
    next();
}

module.exports = userLoginValidation;
