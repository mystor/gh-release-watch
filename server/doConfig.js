Meteor.startup(function() {
  // Initialize the github oauth system
  ServiceConfiguration.configurations.remove({
    service: 'github'
  });

  ServiceConfiguration.configurations.insert({
    service: 'github',
    clientId: Config.gh_client_id,
    secret: Config.gh_client_secret
  });
});

