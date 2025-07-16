import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3001),
  
  // Database
  DB_TYPE: Joi.string().valid('oracle', 'sqlite').required(),
  DB_TNS_ADMIN: Joi.string().when('DB_TYPE', { is: 'oracle', then: Joi.required() }),
  DB_CONNECT_STRING: Joi.string().when('DB_TYPE', { is: 'oracle', then: Joi.required() }),
  DB_USER: Joi.string().when('DB_TYPE', { is: 'oracle', then: Joi.required() }),
  DB_PASS: Joi.string().when('DB_TYPE', { is: 'oracle', then: Joi.required() }),
  DB_DATABASE: Joi.string().when('DB_TYPE', { is: 'sqlite', then: Joi.string().default('dev.sqlite') }),
  
  // JWT
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  
  // Google OAuth
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().uri().default('http://localhost:3001/auth/google/callback'),
  
  // Frontend & CORS
  FRONTEND_URL: Joi.string().uri().default('http://localhost:5173'),
  CORS_ALLOWED_ORIGINS: Joi.string().default('http://localhost:5173,http://127.0.0.1:5173'),
  
  // Wings API
  WINGS_API_URL: Joi.string().uri().default('http://localhost:8080'),
});

export const databaseConfig = () => ({
  type: process.env.DB_TYPE,
  connectString: process.env.DB_CONNECT_STRING,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  tnsAdmin: process.env.DB_TNS_ADMIN,
});

export const jwtConfig = () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN,
});

export const googleConfig = () => ({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackUrl: process.env.GOOGLE_CALLBACK_URL,
});

export const appConfig = () => ({
  nodeEnv: process.env.NODE_ENV,
  port: parseInt(process.env.PORT || '3001', 10),
  frontendUrl: process.env.FRONTEND_URL,
  isProduction: process.env.NODE_ENV === 'production',
});

export const wingsConfig = () => ({
  apiUrl: process.env.WINGS_API_URL,
});
