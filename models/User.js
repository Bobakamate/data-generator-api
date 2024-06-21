const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ParameterSchema = new mongoose.Schema({
  id: { type: Number, required: false },
  parametreName: { type: String, required: false },
  valeurs: [[String]]
});

const ConditionSchema = new mongoose.Schema({
  id: { type: Number, required: false },
  parametreName: { type: String, required: false },
  parametreId: { type: Number, required: false },
  operator: { type: String, required: false },
  value: { type: String, required: false },
  NextId: { type: Number, required: false },
  NextName: { type: String, required: false }
});

const InjectionSchema = new mongoose.Schema({
  id: { type: Number, required: false },
  parametreName: { type: String, required: false },
  parametreId: { type: Number, required: false },
  operator: { type: String, required: false },
  value: { type: String, required: false },
  conditions: [[String]]
});

const ParameterInjectionSchema = new mongoose.Schema({
  id: { type: Number, required: false },
  parametreName: { type: String, required: false },
  valeurs: [[String]]
});

const InjectionLineParameterSchema = new mongoose.Schema({
  id: { type: Number, required: false },
  parametreName: { type: String, required: false },
  parametreId: { type: Number, required: false },
  value: { type: String, required: false }
});

const DynamicParameterSchema = new mongoose.Schema({
  id: { type: Number, required: false },
  parametreName: { type: String, required: false },
  parametreId: { type: Number, required: false },
  value: [String]
});

const InjectionsLineSchema = new mongoose.Schema({
  parameters: [InjectionLineParameterSchema],
  dynamicParameter: [DynamicParameterSchema],
  reference: [[String]]
});

const DataSchema = new mongoose.Schema({
  parametres: [ParameterSchema],
  regles: [ConditionSchema],
  injections: [InjectionSchema],
  injectionsColunm: [ParameterInjectionSchema],
  injectionsLine: InjectionsLineSchema
});

const ProjectSchema = new mongoose.Schema({
  id: { type: Number, required: false },
  data: DataSchema,
  titre: { type: String, required: false },
  description: { type: String, required: false }
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  projects: [ProjectSchema]
});

UserSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
