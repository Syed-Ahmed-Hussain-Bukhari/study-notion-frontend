const Course = require("../models/Course");

class CourseFactory {
  static async create(status, courseData) {
    switch (status) {
      case "Published":
        return CourseFactory._createPublished(courseData);
      case "Draft":
      default:
        return CourseFactory._createDraft(courseData);
    }
  }
  static async _createDraft(data) {
    return Course.create({ ...data, status: "Draft" });
  }
  static async _createPublished(data) {
    if (!data.price || Number(data.price) <= 0) {
      throw new Error("Published courses must have a price greater than 0");
    }
    return Course.create({ ...data, status: "Published" });
  }
}

module.exports = CourseFactory;
