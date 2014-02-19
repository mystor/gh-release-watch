function checkTags(repo) {
  var result = Meteor.http.get(repo.tags_url, {
    params: {
      client_id: Config.gh_client_id,
      client_secret: Config.gh_client_secret
    },
    headers: { 'User-Agent': 'gh-release-watch' }
  });

  if (result.error)
    throw result.error

  var tag_names = result.data.map(function(tag) {
    return tag.name;
  });

  var new_tags = [];

  if (!repo.fresh) {
    new_tags = tag_names.filter(function(tag) {
      return repo.tags.indexOf(tag) === -1
    });
  }

  Repos.update({ _id: repo._id }, {
    $set: {
      fresh: false,
      tags: tag_names
    }
  });
  return new_tags;
}

function checkAllTags() {
  var repos = Repos.find();
  var newTags = {};

  repos.forEach(function(repo) {
    newTags[repo.full_name] = _.extend(repo, {
      newTags: checkTags(repo)
    });
  });

  return newTags;
}

function notifyUsers(newTags) {
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

    /* Email.send({
      to: user.profile.email,
      from: 'today@gh-release-watch.com',
      subject: email.subject,
      text: email.text,
      html: email.html
      }); */
    console.log('sent email: ' + email.text);
  });
}

function checkAndNotify() {
  notifyUsers(checkAllTags());
}

Meteor.startup(function() {
  checkAndNotify();
});

