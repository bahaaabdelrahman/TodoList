const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "completed"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: {
      type: Date,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    completedAt: {
      type: Date,
    },
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
TaskSchema.index({ organizationId: 1, status: 1 });
TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ assignedTo: 1, status: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ organizationId: 1, priority: 1 });

// Virtual field for actions
TaskSchema.virtual("actions", {
  ref: "Action",
  localField: "_id",
  foreignField: "taskId",
  justOne: false,
});

// Cascade delete actions when a task is deleted
TaskSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    await this.model("Action").deleteMany({ taskId: this._id });
    next();
  }
);

module.exports = mongoose.model("Task", TaskSchema);
