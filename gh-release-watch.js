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

  if (Meteor.isClient)
    this.route('*', function () {this.redirect('/');});
});
