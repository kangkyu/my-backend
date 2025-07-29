import Joi from 'joi';

// User signup validation schema
export const userSignupSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } }) // Allow any TLD
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
      'string.empty': 'Email cannot be empty'
    }),
  name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'Name must be at least 1 character long',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required',
      'string.empty': 'Name cannot be empty'
    })
});

// User update validation schema (optional fields)
export const userUpdateSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
  name: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Name must be at least 1 character long',
      'string.max': 'Name cannot exceed 100 characters'
    })
});

// Validation functions
export const validateUserSignup = (data: any) => {
  return userSignupSchema.validate(data, {
    abortEarly: false, // Return all validation errors
    stripUnknown: true // Remove unknown fields
  });
};

export const validateUserUpdate = (data: any) => {
  return userUpdateSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
};

// Generic validation error handler
export const formatValidationErrors = (error: Joi.ValidationError) => {
  return error.details.map(detail => detail.message);
};
