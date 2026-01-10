import mongoose from 'mongoose';

const designSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    name: {
      type: String,
      required: [true, 'Design name is required'],
      trim: true,
      maxlength: [100, 'Design name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    baseModel: {
      id: {
        type: String,
        required: [true, 'Base model ID is required'],
      },
      name: {
        type: String,
        required: [true, 'Base model name is required'],
      },
      image: {
        type: String,
        default: null,
      },
    },
    colors: {
      laces: {
        type: String,
        required: [true, 'Laces color is required'],
      },
      mesh: {
        type: String,
        required: [true, 'Mesh color is required'],
      },
      caps: {
        type: String,
        required: [true, 'Caps color is required'],
      },
      inner: {
        type: String,
        required: [true, 'Inner color is required'],
      },
      sole: {
        type: String,
        required: [true, 'Sole color is required'],
      },
      stripes: {
        type: String,
        required: [true, 'Stripes color is required'],
      },
      band: {
        type: String,
        required: [true, 'Band color is required'],
      },
      patch: {
        type: String,
        required: [true, 'Patch color is required'],
      },
    },
    thumbnail: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['draft', 'production'],
      default: 'draft',
    },
    tags: {
      type: [String],
      default: [],
    },
    totalEdits: {
      type: Number,
      default: 1,
      min: [1, 'Total edits must be at least 1'],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
designSchema.index({ user: 1 });
designSchema.index({ status: 1 });
designSchema.index({ createdAt: -1 });
designSchema.index({ name: 'text', description: 'text' }); // Text search index
// Unique constraint: design name must be unique per user
designSchema.index({ user: 1, name: 1 }, { unique: true });

// Virtual for accent color (uses the first non-white color)
designSchema.virtual('accent').get(function () {
  const colorValues = Object.values(this.colors);
  const nonWhiteColor = colorValues.find((color) => color.toLowerCase() !== '#ffffff' && color.toLowerCase() !== 'white');
  return nonWhiteColor || colorValues[0] || '#000000';
});

const Design = mongoose.model('Design', designSchema);

export default Design;





