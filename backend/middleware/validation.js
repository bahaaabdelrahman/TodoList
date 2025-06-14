const { body, validationResult } = require("express-validator");

// Validation error handler
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors.array(),
    });
  }
  next();
};

// User validation rules
exports.validateUserRegistration = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Must be a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
  body("organizationName")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Organization name must be between 2 and 100 characters"),
];

exports.validateUserLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Must be a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Task validation rules
exports.validateTask = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
  body("status")
    .optional()
    .isIn(["todo", "in-progress", "completed"])
    .withMessage("Status must be one of: todo, in-progress, completed"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be one of: low, medium, high"),
  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid date"),
  body("assignedTo")
    .optional()
    .isMongoId()
    .withMessage("Assigned user must be a valid ID"),
];

// Organization validation rules
exports.validateOrganization = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Organization name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
];

// Action validation rules
exports.validateAction = [
  body("description")
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Description must be between 1 and 500 characters"),
  body("type")
    .optional()
    .isIn([
      "note",
      "status-change",
      "assignment",
      "priority-change",
      "due-date-change",
      "other",
    ])
    .withMessage("Type must be one of the predefined values"),
];
