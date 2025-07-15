import { Response } from 'express';
import ApiError from './api-error';
import httpStatusCodes from './http-status-codes';

const sendResponseError = (error: unknown, response: Response) => {
  let statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
  let cause = 'Unknown internal error.';

  if (error instanceof ApiError && typeof error.statusCode === 'number') {
    statusCode = error.statusCode;
  }

  if (error instanceof Error) {
    cause = error.message;
  }

  response.status(statusCode).json({ cause });
};

export default sendResponseError;
