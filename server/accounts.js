// When new users are created, we want to use our access
// to the Github API to get some information about them.
// Namely, we want to know their email (so we can send them
// the update emails), and the repositories they are starring.
Accounts.onCreateUser(function (options, user) {
  var accessToken = user.services.github.accessToken;

  // Request more information from the server
  var result = Meteor.http.get('https://api.github.com/user', {
    params: {
      access_token: accessToken
    },
    headers: { "User-Agent": "gh-release-watch" }
  });

  if (result.error)
    throw result.error

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
  result = Meteor.http.get(starredUrl, {
    params: {
      access_token: accessToken
    },
    headers: { 'User-Agent': 'gh-release-watch' }
  });

  if (result.error)
    throw result.error

  var starredRepos = result.data;

  // The user will be watching every one of these repositories
  starredRepos.forEach(function(repo) {
    profile.watching.push(Repo.addByDocument(repo));
  });

  // Save the user's new profile
  user.profile = profile;
  return user;
});
