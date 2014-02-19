Repo = {
  // Refer to an existing repository - increases
  // the number of refs.
  refer: function(_id) {
    Repos.update({ _id: _id }, {
      $inc: {
        refs: 1
      }
    });
  },

  // Create a new repository based on a document
  // retrieved from github's API
  create: function(repo) {
    var newRepo = _.pick(repo,
                         'full_name',
                         'name',
                         'tags_url',
                         'url',
                         'html_url');
    newRepo.fresh = true;
    newRepo.refs = 1;
    Repos.insert(newRepo);
  },

  addByFullName: function(full_name) {
    var doc = Repos.findOne({ full_name: full_name });

    if (doc) {
      Repo.refer(doc._id);
    } else {
      // Search for the repository
      var path = full_name.split('/').map(function (c) {
        return encodeURIComponent(c);
      }).join('/');
      var url = 'https://api.github.com/repos/' + path;
      try {
        var result = Meteor.http.get(url, {
          params: {
            client_id: Config.gh_client_id,
            client_secret: Config.gh_client_secret
          },
          headers: { 'User-Agent': 'gh-release-watch' }
        });

        Repo.create(result.data);
      } catch (err) {
        if (err.response && err.response.statusCode === 404)
          throw new Meteor.Error(404, 'The repository ' + full_name + ' does not exist');
        else
          throw err;
      }
    }

    return full_name;
  },

  addByDocument: function(repo) {
    var doc = Repos.findOne({ full_name: repo.full_name });

    if (doc) {
      Repo.refer(doc._id);
    } else {
      Repo.create(repo);
    }

    return repo.full_name;
  },

  removeByFullName: function(full_name) {
    var doc = Repos.findOne({ full_name: full_name });

    if (doc) {
      Repos.update({ _id: doc._id }, {
        $inc: {
          refs: -1
        }
      });
    }

    return full_name;
  }
};

Meteor.methods({
  watch: function(full_name) {
    check(full_name, String);

    if (!this.userId)
      throw new Meteor.Error(403, 'Must be logged in to watch a repository');

    if (full_name.split('/').length !== 2)
      throw new Meteor.Error(400, 'Invalid repository name');

    var user = Meteor.users.findOne({_id: this.userId});
    // Ensure that the user isn't already following
    if (user.profile.watching.indexOf(full_name) !== -1)
      throw new Meteor.Error(400, 'Already watching ' + full_name);

    Meteor.users.update({
      _id: this.userId
    }, {
      $push: {
        'profile.watching': Repo.addByFullName(full_name)
      }
    });
  },

  unwatch: function(full_name) {
    check(full_name, String);

    if (!this.userId)
      throw new Meteor.Error(403, 'Must be logged in to unwatch a repository');

    if (full_name.split('/').length !== 2)
      throw new Meteor.Error(400, 'Invalid repository name');

    var user = Meteor.users.findOne({ _id: this.userId });

    if (user.profile.watching.indexOf(full_name) === -1)
      throw new Meteor.Error(400, 'Not watching ' + full_name);

    Meteor.users.update({
      _id: this.userId
    }, {
      $pull: {
        'profile.watching': Repo.removeByFullName(full_name)
      }
    });
  },

  unwatchAll: function() {
    if (!this.userId)
      throw new Meteor.Error(403, 'Must be logged in to unwatch a repository');

    // Drop references
    var user = Meteor.users.findOne({ _id: this.userId });
    user.profile.watching.forEach(function(repo) {
      Repo.removeByFullName(repo);
    });

    // Update the user
    Meteor.users.update({
      _id: this.userId
    }, {
      $set: {
        'profile.watching': []
      }
    });
  }
});

