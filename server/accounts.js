// When new users are created, we want to use our access
// to the Github API to get some information about them.
// Namely, we want to know their email (so we can send them
// the update emails), and the repositories they are starring.
Accounts.onCreateUser(function (options, user) {
  var accessToken = user.services.github.accessToken;

  // Request more information from the server
  try {
    var result = Meteor.http.get('https://api.github.com/user', {
      params: {
        access_token: accessToken
      },
      headers: { "User-Agent": "gh-release-watch" }
    });

    // Limit the fields we want to store in the user's profile
    profile = _.pick(result.data,
      "login",
      "email",
      "url",
      "html_url",
      "starred_url");
    profile.watching = [];

    // Get the repositories which the user is starring
    var starredUrl = profile.starred_url.replace(/\{.*\}/g, '');
    try {
      result = Meteor.http.get(starredUrl, {
        params: {
          access_token: accessToken
        },
        headers: { 'User-Agent': 'gh-release-watch' }
      });

      var starredRepos = result.data;

      // The user will be watching every one of these repositories
      starredRepos.forEach(function(repo) {
        profile.watching.push(Repo.addByDocument(repo));
      });
    } catch (error) {
      // We don't worry too much about the stars for a user being captured
      // We don't need to get them, they are just for convenience for the user
      console.warn('Unable to get stars for user: ' + user._id);
    }

    profile.active = true;

    // Save the user's new profile
    user.profile = profile;
    user.unsubscribeToken = Random.id()
    return user;
  } catch (err) {
    throw new Meteor.Error(500, 'Unable to collect profile information')
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
    check(token, String);

    Meteor.users.update({ unsubscribeToken: token }, {
      $set: { 'profile.active' : true }
    });
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

