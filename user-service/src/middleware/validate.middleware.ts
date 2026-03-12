import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ApiResponse } from '../utils/response';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return ApiResponse.validationError(res, result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      })));  
    }

    req.body = result.data;
    next();
  };
};
