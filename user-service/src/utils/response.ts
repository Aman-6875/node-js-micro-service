import { Response } from "express";


export class ApiResponse {
    static success <T> (res: Response, data: T, statusCode: number = 200, message: string = 'Success'): void {
        res.status(statusCode).json({
            success: true,
            message,
            data
        });
    }

    static error (res: Response, message: string = 'An error occurred', statusCode: number = 500): void {
        res.status(statusCode).json({
            success: false,
            message
        });
    }

    static validationError (res:Response,  errors: {field: string, message: string}[]) : void {
        res.status(422).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }
} 
    