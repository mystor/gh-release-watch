Login = {
  login: function() {
    Meteor.loginWithGithub({
      requestPermissions: ['user:email']
    }, function (err) {
      if (err) {
        error(err);
      }
    });
  },

  logout: function() {
    Meteor.logout(function(err) {
      if (err)
        error(err);
    });
  }
};

