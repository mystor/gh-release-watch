function checkTags(repo) {
  var new_tags = [];

  console.log('# Checking Tags for ' + repo.full_name);

  var headers = { 'User-Agent': 'gh-release-watch' };
  if (repo.ETag)
    headers['If-None-Match'] = repo.ETag;
  try {
    var result = Meteor.http.get(repo.tags_url, {
      params: {
        client_id: Config.gh_client_id,
        client_secret: Config.gh_client_secret
      },
      headers: headers
    });

    if (result.statusCode === 304) {
      console.log('-> 304 Not Modified');
      return []; // The file hasn't changed since last time we looked at it
    }

    var tag_names = result.data.map(function(tag) {
      return tag.name;
    });

    if (!repo.fresh) {
      new_tags = tag_names.filter(function(tag) {
        return repo.tags.indexOf(tag) === -1
      });
    }

    console.log('-> Found ' + new_tags.length + ' New Tags');

    Repos.update({ _id: repo._id }, {
      $set: {
        fresh: false,
        tags: tag_names,
        ETag: result.headers.etag
      }
    });
  } catch (err) {
    console.warn('-> Error getting tags for ' + repo.full_name + '.');
    console.warn(err);
  }
  return new_tags;
}

function checkAllTags() {
  console.log('!! Checking Tags');
  var repos = Repos.find();
  var newTags = {};

  repos.forEach(function(repo) {
    newTags[repo.full_name] = _.extend(repo, {
      newTags: checkTags(repo)
    });
  });

  console.log('!! Done Checking Tags');

  return newTags;
}

function notifyUsers(newTags) {
  console.log('!! Notifying Users');
  var users = Meteor.users.find();

  users.forEach(function(user) {
    if (!user.profile.active)
      return;

    var watching = user.profile.watching;

    var report = watching.map(function(repoName) {
      return newTags[repoName];
    }).filter(function(repo) {
      return repo.newTags.length > 0;
    });

    if (report.length === 0)
      return;


    var email = EmailGen.generate(report, user.unsubscribeToken);

    console.log('-> Emailing ' + user.profile.email + ' - ' + email.subject);
    Email.send({
      to: user.profile.email,
      from: 'today@gh-release-watch.com',
      subject: email.subject,
      text: email.text,
      html: email.html
    });
  });
  console.log('!! Done Notifying Users');
}

function checkAndNotify() {
  notifyUsers(checkAllTags());
}

