Routes = {};

if (Meteor.isClient) {
  // Load google analytics
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-54612644-1', 'auto');
  ga('send', 'pageview'); // TODO: Better tracking
}

RouteCore.map(function () {
  Routes.home = this.route('/', function (ctx) {
    // Make sure that the user is sent down to the client
    // This will cause fast-render to embed the user object
    // into the request to the client
    this.subscribe('user');

    var user = this.user();
    var loggingIn = Meteor.isClient ? Meteor.loggingIn() : false;

    if (user) {
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
      // This is weird, but it happens sometimes.
      // Just display the notFound template while the subscription is created.
      return Layout({
        user: user,
        loggingIn: loggingIn
      }, NotFound(null));
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
