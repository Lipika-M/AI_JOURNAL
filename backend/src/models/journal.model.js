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
      min: -1,
      max: 1,
      default: 0,
    },
    summary: {
      type: String,
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
export const Journal=mongoose.model("Journal", journalSchema);