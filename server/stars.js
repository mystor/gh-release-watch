Stars = {
  getStars: function(user) {
    console.log("Getting stars for user " + user.profile.login);
    var accessToken = user.services.github.accessToken;
    var ETag = user.starredETag || '';

    var stars = [];
    var starredUrl = user.profile.starred_url.replace(/\{.*\}/g, '');

    try {
      // Perform the initial request (check ETag)
      var result = Meteor.http.get(starredUrl, {
        params: {
          access_token: accessToken,
          per_page: 100
        },
        headers: {
          'User-Agent': Config.user_agent,
          'If-None-Match': ETag
        }
      });

      if (result.statusCode === 304) {
        console.log("Stars have not chanegd [304]")
        return {  // No need to update
          ETag: ETag,
          starred: user.profile.starred
        };
      }

      // We have a new ETag
      ETag = result.headers.etag;

      while (true) {
        // Record the repositories which are found!
        result.data.forEach(function(repo) {
          stars.push(repo.full_name);
        });

        // Parse the link header
        // I use a library to do this, because it looks annoying
        var links = parseLinkHeader(result.headers.link);
        if (!links)
          break;

        var next = links.next;
        if (!next)
          break;

        // Make the request for the next page
        result = Meteor.http.get(starredUrl, {
          params: {
            access_token: accessToken,
            page: next.page,
            per_page: next.per_page
          },
          headers: { 'User-Agent': Config.user_agent }
        });
      }
    } catch (err) {
      console.warn('Could not get stars for ' + user.profile.login);
      console.error(err);
    }

    return {
      ETag: ETag,
      starred: stars
    };
  }
};

var hour = 1000 * 60 * 60; // 1 hour in milliseconds
Meteor.methods({
  getStars: function() {
    if (!this.userId)
      throw new Meteor.Error(403, 'You must be logged in to get your stars');

    var user = Meteor.users.findOne({ _id: this.userId });

    var now = new Date();
    var delta = now - user.profile.starred_checked;

    if (delta > hour || delta !== delta) {
      var props = Stars.getStars(user);

      Meteor.users.update({ _id: this.userId }, {
        $set: {
          'profile.starred': props.starred,
          'starredETag': props.ETag,
          'profile.starred_checked': now
        }
      });
    }
  }
});

