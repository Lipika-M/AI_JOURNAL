import mongoose, { Schema } from "mongoose";
const journalSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      
    },
    content: {
      type: String,
      required: true,
    },
    sentiment: {
      type: String,
      enum: ["positive", "negative", "neutral"],
      default: "neutral",
      lowercase: true,
      trim: true,
    },
    moodScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5,
    },
    summary: {
      type: String,
    },
    aiStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  tags: {
  type: [String],
  default: [],
  set: tags => [...new Set(tags.map(t => t.toLowerCase().trim()))],
},

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true,
    toJSON:{
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
   }
);

journalSchema.index({ owner: 1, isDeleted: 1, createdAt: -1 });
journalSchema.index({ owner: 1, isDeleted: 1, _id: 1 });
journalSchema.index({ owner: 1, sentiment: 1 });
journalSchema.index({ owner: 1, tags: 1 });
export const Journal=mongoose.model("Journal", journalSchema);