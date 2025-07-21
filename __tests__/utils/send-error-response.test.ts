import ApiError from '@/utils/api-error';
import httpStatusCodes from '@/utils/http-status-codes';
import sendResponseError from '@/utils/send-error-response';
import { Response } from 'express';

describe('sendResponseError', () => {
  let mockResponse: Response;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockResponse = { status: mockStatus } as unknown as Response;
  });

  it('should send ApiError with custom status code', () => {
    const error = new ApiError('Custom error message.', {
      statusCode: httpStatusCodes.BAD_REQUEST,
    });

    sendResponseError(error, mockResponse);

    expect(mockStatus).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith({ cause: 'Custom error message.' });
  });

  it('should send regular Error with 500 status code', () => {
    const error = new Error('Regular error message.');

    sendResponseError(error, mockResponse);

    expect(mockStatus).toHaveBeenCalledWith(
      httpStatusCodes.INTERNAL_SERVER_ERROR,
    );
    expect(mockJson).toHaveBeenCalledWith({ cause: 'Regular error message.' });
  });

  it('should handle unknown error types', () => {
    const error = 'string error';

    sendResponseError(error, mockResponse);

    expect(mockStatus).toHaveBeenCalledWith(
      httpStatusCodes.INTERNAL_SERVER_ERROR,
    );
    expect(mockJson).toHaveBeenCalledWith({ cause: 'Unknown internal error.' });
  });

  it('should handle null error', () => {
    sendResponseError(null, mockResponse);

    expect(mockStatus).toHaveBeenCalledWith(
      httpStatusCodes.INTERNAL_SERVER_ERROR,
    );
    expect(mockJson).toHaveBeenCalledWith({ cause: 'Unknown internal error.' });
  });
});
