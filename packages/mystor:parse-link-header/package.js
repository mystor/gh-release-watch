Package.describe({
  name: 'mystor:parse-link-header',
  description: 'parse-link-header packaged for Meteor',
  version: '0.1.0'
});

Npm.depends({
  'parse-link-header': '0.1.0'
});

Package.on_use(function(api) {
  api.add_files('parse-link-header.js', 'server');

  api.export('parseLinkHeader', 'server');
});
