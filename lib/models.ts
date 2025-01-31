import mongoose, { Document, Model, Schema, Types } from 'mongoose';

// Interfaces for TypeScript type checking
export interface IShader {
  _id?: Types.ObjectId;
  type: 'vertex' | 'fragment';
  code: string;
  createdAt: Date;
  lastModified: Date;
}

export interface IProgram {
  _id?: Types.ObjectId;
  name: string;
  userSub: string;
  description?: string;
  shaders: {
    vertex: IShader;
    fragment: IShader;
  };
  createdAt: Date;
  lastModified: Date;
}

export interface IWorkspace {
  _id?: Types.ObjectId;
  name: string;
  userSub: string;
  description?: string;
  programs: IProgram[];
  createdAt: Date;
  lastModified: Date;
}

// Document interfaces that extend the base interfaces with Mongoose Document methods
export interface IShaderDocument extends IShader, Omit<Document, '_id'> { }
export interface IProgramDocument extends IProgram, Omit<Document, '_id'> { }
export interface IWorkspaceDocument extends IWorkspace, Omit<Document, '_id'> { }

// Shader Schema
const ShaderSchema = new Schema<IShaderDocument>({
  _id: {
    type: Schema.Types.ObjectId,
    auto: true
  },
  type: {
    type: String,
    enum: ['vertex', 'fragment'],
    required: true
  },
  code: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  // Ensure _id is included in toJSON and toObject transformations
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Program Schema
const ProgramSchema = new Schema<IProgramDocument>({
  _id: {
    type: Schema.Types.ObjectId,
    auto: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  userSub: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  shaders: {
    vertex: {
      type: ShaderSchema,
      default: () => ({ type: 'vertex', code: '' })
    },
    fragment: {
      type: ShaderSchema,
      default: () => ({ type: 'fragment', code: '' })
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Workspace Schema
const WorkspaceSchema = new Schema<IWorkspaceDocument>({
  _id: {
    type: Schema.Types.ObjectId,
    auto: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  userSub: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  programs: [ProgramSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to update lastModified
WorkspaceSchema.pre('save', function (next) {
  this.lastModified = new Date();
  next();
});

ProgramSchema.pre('save', function (next) {
  this.lastModified = new Date();
  next();
});

// Create and export models with typed interfaces
export const Workspace: Model<IWorkspaceDocument> = mongoose.models.Workspace || mongoose.model<IWorkspaceDocument>('Workspace', WorkspaceSchema);
export const Program: Model<IProgramDocument> = mongoose.models.Program || mongoose.model<IProgramDocument>('Program', ProgramSchema);
export const Shader: Model<IShaderDocument> = mongoose.models.Shader || mongoose.model<IShaderDocument>('Shader', ShaderSchema);
