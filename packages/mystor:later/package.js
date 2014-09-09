Package.describe({
  name: 'mystor:later',
  description: 'later packaged for Meteor',
  version: '0.1.0'
});

Npm.depends({
  'later': '1.1.6'
});

Package.on_use(function(api) {
  api.add_files('later.js', 'server');

  api.export('later', 'server');
});
