/** @jsx React.DOM */

Unsubscribe = React.createClass({
  resubscribe: function(e) {
    var token = this.props.user.unsubscribeToken;
    Meteor.call('resubscribe', token, function(err) {
      error(err);
    });
  },

  unsubscribe: function(e) {
    var token = this.props.user.unsubscribeToken;
    Meteor.call('unsubscribe', token, function(err) {
      error(err);
    });
  },

  render: function() {
    var user = this.props.user;
    if (user.profile.active)
      return (
        <div className="text-center">
          <h1>You&apos;re Subscribed</h1>
          <h3>You will get update emails</h3>

          <p>Changed your mind?</p>
          <button type="button"
            className="btn btn-warning"
            onClick={this.unsubscribe}>
            Unsubscribe
          </button>
        </div>
      );
    else
      return (
        <div className="text-center">
          <h1>You&apos;ve Unsubscribed</h1>
          <h3>You won&apos;t get another update email!</h3>

          <p>Changed your mind?</p>
          <button type="button"
            className="btn btn-success"
            onClick={this.resubscribe}>
            Resubscribe!
          </button>
        </div>
      );
  }
});
