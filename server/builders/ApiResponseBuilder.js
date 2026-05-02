class ApiResponseBuilder {
  constructor() {
    this._success = true;
    this._statusCode = 200;
    this._message = "";
    this._data = undefined;
    this._meta = undefined;
    this._error = undefined;
  }

  success() {
    this._success = true;
    return this;
  }

  failure() {
    this._success = false;
    return this;
  }

  status(code) {
    this._statusCode = code;
    return this;
  }

  message(msg) {
    this._message = msg;
    return this;
  }

  data(payload) {
    this._data = payload;
    return this;
  }

  meta(meta) {
    this._meta = meta;
    return this;
  }

  error(err) {
    this._error = err instanceof Error ? err.message : err;
    return this;
  }

  build() {
    const response = {
      success: this._success,
      message: this._message,
    };
    if (this._data !== undefined) response.data = this._data;
    if (this._meta !== undefined) response.meta = this._meta;
    if (this._error !== undefined) response.error = this._error;
    return response;
  }

  send(res) {
    return res.status(this._statusCode).json(this.build());
  }
}

module.exports = ApiResponseBuilder;
