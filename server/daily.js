function checkTags(repo) {
  var new_tags = [];
  var tag_names = [];

  var page = 1;

  var etags = [];

  var existing_tags = repo.tags;
  if (existing_tags === undefined)
    existing_tags = [];
  console.log('# ' + repo.full_name + ' - Existing tags: ' + existing_tags);

  while (true) {
    try {
      var headers = { 'User-Agent': Config.user_agent };
      if (repo.ETag !== undefined && page-1 in repo.ETag)
        headers['If-None-Match'] = repo.ETag[page-1];
      var result = Meteor.http.get(repo.tags_url, {
        params: {
          client_id: Config.gh_client_id,
          client_secret: Config.gh_client_secret,
          page: page
        },
        headers: headers
      });
    } catch (err) {
      console.warn('-> Error getting tags for ' + repo.full_name + '.');
      console.warn(err);
      return [];
    }

    if (result.statusCode === 304) {
      console.log('# ' + repo.full_name + ' - 304 Not Modified');
    } else if (result.statusCode === 403) {
      console.warn('-> Rate limited during ' + repo.full_name + ' check until ' + result.headers.x-ratelimit-reset);
      break;
    } else {
      var addl_tag_names = result.data.map(function(tag) {
        return tag.name;
      });

      console.log('# ' + repo.full_name + ' - Page ' + page + ' tags: ' + addl_tag_names);

      tag_names = tag_names.concat(addl_tag_names);
    }

    etags[page-1] = result.headers.etag;

    if ('link' in result.headers) {
      next = parseLinkHeader(result.headers.link).next;
      if (next === undefined) {
        break;
      }
      page = next.page;
    } else if (repo.ETag !== undefined && page < repo.ETag.length) {
      page++;
    } else {
      break;
    }
  }

  console.log('# ' + repo.full_name + ' - All tags: ' + tag_names);

  if (!repo.fresh) {
    new_tags = tag_names.filter(function(tag) {
      return existing_tags.indexOf(tag) === -1
    });
  } else {
    existing_tags = tag_names;
  }

  console.log('# ' + repo.full_name + ' - Found ' + new_tags.length + ' New Tags');
  console.log('# ' + repo.full_name + ' - New tags: ' + new_tags);

  Repos.update({ _id: repo._id }, {
    $set: {
      fresh: false,
      tags: existing_tags.concat(new_tags),
      ETag: etags
    }
  });

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
      from: 'GH Release Watch <releases@gh-release-watch.com>',
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

later.setInterval(Meteor.bindEnvironment(function() {
  Repos.remove({ refs: 0 });

  checkAndNotify();
}, function(e) {
  console.error(e);
}), later.parse.recur().every(1).hour());

