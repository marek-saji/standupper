var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  displayName: { type: String },
  avatarUrl: String,
  gravatarId: String,
  emails: [String],
  ids: [
    { provider: String, id: String }
  ]
});

UserSchema.statics.findByEmails = function (emails) {
  var query = this.findOne();

  if (typeof emails === 'string' || emails instanceof String)
  {
    emails = [ emails ];
  }

  emails = (emails || []).filter(function (email) {
    return !!email;
  });

  if (emails.length)
  {
    query.where('emails').elemMatch({ $in: emails });
  }
  else
  {
    // HACK Always false condition
    query.where('', false);
  }

  return query;
};

UserSchema.statics.findByProvider = function (provider, id) {
  var query = this.findOne();

  if (provider && id)
  {
    query.where('ids').elemMatch({
      provider: '' + provider,
      id:       '' + id
    });
  }
  else
  {
    // HACK Always false condition
    query.where('', false);
  }

  return query;
};

UserSchema.virtual('date')
  .get(function() {
    return this._id.generationTime;
  });

UserSchema.pre('save', function (next) {

  var providerIds;

  // remove duplicated and empty e-mails
  if (this.emails && this.emails.length)
  {
    this.emails = this.emails.filter(function (e, i, a) {
      return e && a.lastIndexOf(e) === i;
    });
  }

  // ids duplicates
  if (this.ids && this.ids.length)
  {
    providerIds = this.ids.map(function (provider) {
      return provider.id;
    });
    this.ids = this.ids.filter(function (e, i, a) {
      return providerIds.lastIndexOf(e.id) === i;
    });
  }

  next();
});

// TODO validation
// TODO add index

mongoose.model('User', UserSchema); 
