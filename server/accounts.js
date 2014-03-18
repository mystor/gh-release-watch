// When new users are created, we want to use our access
// to the Github API to get some information about them.
// Namely, we want to know their email (so we can send them
// the update emails)
Accounts.onCreateUser(function (options, user) {
  var accessToken = user.services.github.accessToken;

  // Request more information from the server
  try {
    var result = Meteor.http.get('https://api.github.com/user', {
      params: {
        access_token: accessToken
      },
      headers: { 'User-Agent': Config.user_agent }
    });

    // Create the user's initial profile
    profile = _.pick(result.data,
      "login",
      "email",
      "url",
      "html_url",
      "starred_url");
    profile.watching = [];
    profile.active = true;

    user.profile = profile;

    // Generate an unsubscribeToken
    user.unsubscribeToken = Random.id();

    // Return the fully formed user
    return user;
  } catch (err) {
    throw new Meteor.Error(500, 'Unable to collect profile information');
  }
});

// Prevent users from directly modifying their profile field
// instead, they should use methods to do so
Meteor.users.deny({ update: function() { return true; } });

Meteor.methods({
  updateEmail: function(newEmail) {
    check(newEmail, String);

    if (!this.userId)
      throw new Meteor.Error(403, 'Must be logged in to change email');

    // It should look like an email (one @ sign)
    if (newEmail.split('@').length !== 2)
      throw new Meteor.Error(400, 'Must enter an email');

    Meteor.users.update({ _id: this.userId }, {
      $set: { 'profile.email': newEmail }
    });
  },

  unsubscribe: function(token) {
    check(token, String);

    Meteor.users.update({ unsubscribeToken: token }, {
      $set: { 'profile.active': false }
    });
  },

  resubscribe: function(token) {
    if (token) {
      check(token, String);

      Meteor.users.update({ unsubscribeToken: token }, {
        $set: { 'profile.active': true }
      });
    } else {
      if (!this.userId)
        throw new Meteor.Error(403, 'Must be logged in or have unsubscribe token to resubscribe');

      Meteor.users.update({ _id: this.userId }, {
        $set: { 'profile.active': true }
      });
    }
  }
});

Meteor.publish('unsubscribe', function(token) {
  return Meteor.users.find({ unsubscribeToken: token }, {
    fields: {
      _id: 1,
      profile: 1,
      unsubscribeToken: 1
    }
  });
});

Meteor.publish('user', function() {
  if (!this.userId)
    return [];

  return Meteor.users.find({ _id: this.userId }, {
    fields: {
      _id: 1,
      profile: 1
    }
  });
});
