Routes = {};

RouteCore.map(function () {
  Routes.home = this.route('/', function (ctx) {
    var user = this.user();
    var loggingIn = Meteor.isClient ? Meteor.loggingIn() : false;
    
    if (!loggingIn && user) {
      this.setDefault('repoHistory', user.profile.watching);
      if (Meteor.isClient)
        this.set('repoHistory',
                 _.union(this.get('repoHistory'),
                         user.profile.watching));

      return Layout({
        user: user,
        loggingIn: loggingIn
      }, WatchManager({
        user: user,
        watching: user.profile.watching,
        history: this.get('repoHistory')
      }));
    }

    return Layout({
      user: user,
      loggingIn: loggingIn
    }, About({loggingIn: loggingIn}));
  });

  Routes.unsubscribe = this.route('/unsubscribe/:token', function (ctx) {
    // We want to start unsubscribed when the page loads
    if (Meteor.isServer)
      Meteor.call('unsubscribe', ctx.params.token);

    var user = this.user();
    var loggingIn = Meteor.isClient ? Meteor.loggingIn() : false;

    if (this.subscribe('unsubscribe', ctx.params.token).ready()) {
      var theUser = Meteor.users.findOne({ unsubscribeToken: ctx.params.token });

      if (theUser) {
        return Layout({
          user: user,
          loggingIn: loggingIn
        }, Unsubscribe({ user: theUser }));
      } else {
        return Layout({
          user: user,
          loggingIn: loggingIn
        }, NotFound(null));
      }
    } else {
      // We're on the client (as subscriptions are always ready on the server
      // This must be from a link (how?), so we fall through to server calls
      return false;
    }
  });

  if (Meteor.isClient)
    this.route('*', function(ctx) {
      var user = this.user();
      var loggingIn = Meteor.isClient ? Meteor.loggingIn() : false;
      return Layout({
        user: user,
        loggingIn: loggingIn
      }, NotFound(null));
    });
});
