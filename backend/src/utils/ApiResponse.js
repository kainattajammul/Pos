export class ApiResponse {
  static success(res, { statusCode = 200, message, data, meta }) {
    const body = { success: true, message };
    if (data !== undefined) body.data = data;
    if (meta) body.meta = meta;
    return res.status(statusCode).json(body);
  }

  static error(res, { statusCode, message, errors }) {
    const body = {
      success: false,
      message,
    };
    if (errors?.length) body.errors = errors;
    return res.status(statusCode).json(body);
  }
}
