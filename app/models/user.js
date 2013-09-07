var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  displayName: { type: String, unique: true }
});

UserSchema.virtual('date')
  .get(function() {
    return this._id.generationTime;
  });

// TODO add index

mongoose.model('User', UserSchema);