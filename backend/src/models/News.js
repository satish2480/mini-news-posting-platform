const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    headline: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true,
      default: "General"
    },
    imageUrl: {
      type: String,
      trim: true,
      default: ""
    },
    sourceName: {
      type: String,
      trim: true,
      default: ""
    },
    sourceUrl: {
      type: String,
      trim: true,
      default: ""
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
);

newsSchema.index({ headline: "text", content: "text", category: "text" });
newsSchema.index({ category: 1, timestamp: -1 });

module.exports = mongoose.model("News", newsSchema);
