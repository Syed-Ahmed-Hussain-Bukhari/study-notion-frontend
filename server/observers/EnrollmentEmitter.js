const EventEmitter = require("events");

class EnrollmentEmitter extends EventEmitter {
  static #instance = null;

  constructor() {
    super();
    this.setMaxListeners(20);
  }

  static getInstance() {
    if (!EnrollmentEmitter.#instance) {
      EnrollmentEmitter.#instance = new EnrollmentEmitter();
    }
    return EnrollmentEmitter.#instance;
  }
}

module.exports = EnrollmentEmitter.getInstance();
