Package.describe({
  description: 'node-cron packaged for Meteor'
});

Npm.depends({
  'cron': '1.0.3',
  'time': '0.10.0'
});

Package.on_use(function(api) {
  api.add_files('cronjob.js', 'server');

  api.export('CronJob', 'server');
});
