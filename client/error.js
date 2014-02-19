error = function(message) {
  Session.set('error', message);
  console.error(message);
}
