const Joi = require('joi');

// Validation schemas
const schemas = {
    referralCode: Joi.object({
        referralCode: Joi.string()
            .pattern(/^GRP-SDS\d{3}-[A-Z]{2}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid referral code format. Expected format: GRP-SDS001-XX',
                'any.required': 'Referral code is required'
            })
    }),

    redeemPoints: Joi.object({
        amount: Joi.number()
            .positive()
            .integer()
            .required()
            .messages({
                'number.base': 'Amount must be a number',
                'number.positive': 'Amount must be positive',
                'number.integer': 'Amount must be an integer',
                'any.required': 'Amount is required'
            }),
        description: Joi.string()
            .min(1)
            .max(200)
            .required()
            .messages({
                'string.empty': 'Description cannot be empty',
                'string.max': 'Description cannot exceed 200 characters',
                'any.required': 'Description is required'
            })
    }),

    updateReferralProgress: Joi.object({
        deliveriesCompleted: Joi.number()
            .min(0)
            .integer()
            .optional(),
        totalEarnings: Joi.number()
            .min(0)
            .optional(),
        daysActive: Joi.number()
            .min(0)
            .integer()
            .optional()
    })
};

// Validation middleware
const validate = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        if (!schema) {
            return res.status(500).json({
                success: false,
                error: `Validation schema '${schemaName}' not found`
            });
        }

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.details[0].message
            });
        }

        req.body = value;
        next();
    };
};

// Specific validation functions
const validateReferralCode = (req, res, next) => {
    const { referralCode } = req.body;
    if (!referralCode) {
        return res.status(400).json({
            success: false,
            error: 'Referral code is required'
        });
    }

    if (!/^GRP-SDS\d{3}-[A-Z]{2}$/.test(referralCode)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid referral code format. Expected format: GRP-SDS001-XX'
        });
    }

    next();
};

module.exports = {
    validate,
    validateReferralCode,
    schemas
};
