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
    }),
  password: Joi.string()
    .min(6)
    .max(100)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 100 characters',
      'any.required': 'Password is required',
      'string.empty': 'Password cannot be empty'
    })
});

// User login validation schema
export const userLoginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
      'string.empty': 'Email cannot be empty'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
      'string.empty': 'Password cannot be empty'
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

// Post creation validation schema
export const postCreateSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.min': 'Title must be at least 1 character long',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required',
      'string.empty': 'Title cannot be empty'
    }),
  content: Joi.string()
    .min(1)
    .max(10000)
    .required()
    .messages({
      'string.min': 'Content must be at least 1 character long',
      'string.max': 'Content cannot exceed 10000 characters',
      'any.required': 'Content is required',
      'string.empty': 'Content cannot be empty'
    }),
  published: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'Published must be a boolean value'
    })
});

// Post update validation schema
export const postUpdateSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Title must be at least 1 character long',
      'string.max': 'Title cannot exceed 200 characters'
    }),
  content: Joi.string()
    .min(1)
    .max(10000)
    .optional()
    .messages({
      'string.min': 'Content must be at least 1 character long',
      'string.max': 'Content cannot exceed 10000 characters'
    }),
  published: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Published must be a boolean value'
    })
});

// Validation functions
export const validateUserSignup = (data: any) => {
  return userSignupSchema.validate(data, {
    abortEarly: false, // Return all validation errors
    stripUnknown: true // Remove unknown fields
  });
};

export const validateUserLogin = (data: any) => {
  return userLoginSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
};

export const validateUserUpdate = (data: any) => {
  return userUpdateSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
};

export const validatePostCreate = (data: any) => {
  return postCreateSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
};

export const validatePostUpdate = (data: any) => {
  return postUpdateSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
};

// Generic validation error handler
export const formatValidationErrors = (error: Joi.ValidationError) => {
  return error.details.map(detail => detail.message);
};
