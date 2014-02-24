Package.describe({
  description: 'later packaged for Meteor'
});

Npm.depends({
  'later': '1.1.6'
});

Package.on_use(function(api) {
  api.add_files('later.js', 'server');

  api.export('later', 'server');
});
