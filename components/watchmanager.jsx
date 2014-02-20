/** @jsx React.DOM */

function ghUrl(repo) {
  return 'http://github.com/' + repo;
}

function watch(repo) {
  return function(e) {
    Meteor.call('watch', repo, function(err) {
      if (err)
        error(err);
    });

    e.preventDefault();
  }
}

function unwatch(repo) {
  return function(e) {
    Meteor.call('unwatch', repo, function(err) {
      if (err)
        error(err);
    });

    e.preventDefault();
  }
}

function unwatchAll(e) {
  Meteor.call('unwatchAll', function(err) {
    if (err)
      error(err);
  });

  e.preventDefault();
}

function resubscribe(e) {
  Meteor.call('resubscribe', function(err) {
    if (err)
      error(err);
  });

  e.preventDefault();
}

var AddWatchForm = React.createClass({
  type: function(e) {
    var newQuery = e.target.value;
    var newDisplay;

    if (newQuery.length > 0) {
      newDisplay = this.props.user.profile.starred;
      var watching = this.props.user.profile.watching;

      var parts = newQuery.split('/');

      newDisplay = _.filter(newDisplay, function(star) {
        // Don't suggest things they're already watching
        if (watching.indexOf(star) !== -1)
          return false;

        var good = true;
        var starParts = star.split('/');

        if (parts.length > 1) {
          good = good && (starParts[0].indexOf(parts[0]) !== -1);
          good = good && (starParts[1].indexOf(parts[1]) !== -1);
        } else {
          good = good && (star.indexOf(newQuery) !== -1);
        }

        return good;
      });

      if (newDisplay.length > 3)
        newDisplay = newDisplay.slice(0, 3);
    } else {
      newDisplay = [];
    }

    this.setState({
      query: newQuery,
      display: newDisplay
    });
  },

  submit: function(e) {
    var textfield = document.getElementById('new-repo-name');
    var full_name = textfield.value;

    Meteor.call('watch', full_name, function(err) {
      if (err)
        error(err);
    });

    this.setState({
      query: '',
      display: []
    });

    e.preventDefault();
  },

  getInitialState: function() {
    return {
      display: [],
      query: ''
    };
  },

  // Parameters:
  // -- none --
  render: function() {
    var user = this.props.user;
    var watching = user.profile.watching;

    return (
      <div>
        <form onSubmit={this.submit}>
          <div className="input-group">
            <input type="text"
              id="new-repo-name"
              className="form-control"
              placeholder="e.g. mystor/gh-release-watch"
              value={this.state.query}
              onChange={this.type} />

            <span className="input-group-btn">
              <button type="button"
                className="btn btn-primary">
                Watch
              </button>
            </span>
          </div>
        </form>

        <ul className="list-group">
          {this.state.display.map(function(repo) {
            return <SingleWatch repo={repo} watching={watching} key={repo} />
          })}
        </ul>
      </div>
    )
  }
});

var SingleWatch = React.createClass({
  // Parameters:
  // @repo - the repository in question
  // @watching - the repositories currently being watched
  render: function() {
    var watchBtn,
        repo = this.props.repo,
        watching = this.props.watching;

    if (watching.indexOf(repo) !== -1) {
      watchBtn = (
        <button type="button"
          className="btn btn-info btn-xs pull-right"
          onClick={unwatch(repo)}>
          Watching
        </button>
      );
    } else {
      watchBtn = (
        <button type="button"
          className="btn btn-primary btn-xs pull-right"
          onClick={watch(repo)}>
          Not Watching
        </button>
      );
    }

    return (
      <li className="list-group-item">
        {watchBtn}
        <span className="icon-book repo-icon"></span>
        <a href={ghUrl(repo)}>{repo}</a>
      </li>
    );
  }
});

var WatchList = React.createClass({
  getInitialState: function() {
    return {
      history: this.props.watching
    };
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      history: _.union(this.state.history, nextProps.watching)
    });
  },

  // Parameters:
  // @watching - the respositories currently being watched
  render: function() {
    var history = this.state.history;
    var watching = this.props.watching;

    return (
      <ul className="list-group">
        {history.map(function(repo) {
          return <SingleWatch repo={repo} watching={watching} key={repo} />
        })}
      </ul>
    );
  }
});

var EmailDisplay = React.createClass({
  getInitialState: function() {
    return {editing: false};
  },

  startEditing: function(e) {
    e.preventDefault();
    this.setState({
      editing: true,
      email: this.props.user.profile.email,
      valid: true
    });
  },

  type: function(e) {
    var newEmail = e.target.value;
    var valid = newEmail.split('@').length === 2
    this.setState({
      email: newEmail,
      valid: valid
    });
  },

  stopEditing: function(e) {
    e.preventDefault();
    if (!this.state.valid)
      return;

    var textbox = document.getElementById('email-address');
    var newEmail = textbox.value;
    Meteor.call('updateEmail', newEmail, function(err) {
      if (err)
        error(err);
    });
    this.setState({editing: false});
  },

  // Parameters:
  // @user - the user object
  render: function() {
    var user = this.props.user;

    if (this.state.editing)
      return (
        <form onSubmit={this.stopEditing}
          className={this.state.valid ? 'has-success' : 'has-error'}>
          <div className="input-group">
            <input type="text"
              id="email-address"
              className="form-control"
              value={this.state.email}
              onChange={this.type} />
            <span className="input-group-btn">
              <button type="submit"
                className={'btn ' + (this.state.valid ? 'btn-success' : 'btn-danger')}
                disabled={!this.state.valid}>
                Save
              </button>
            </span>
          </div>
        </form>
      );
    else
      return (
        <span>
          <strong>{user.profile.email + ' '}</strong>
          (<a href="javascript:void(0)"
            onClick={this.startEditing}>change</a>)
        </span>
      );
  }
});

var UnsubscribedWarning = React.createClass({
  render: function() {
    if (!this.props.user.profile.active)
      return (
        <div className="alert alert-info">
          <strong>Unsubscribed</strong>
          You are currently unsubscribed, and will not receive emails.
          <a href="javascript:void(0)"
            className="alert-link"
            onClick={resubscribe}>Resubscribe</a>?
        </div>
      );
    else
      return <span />;
  }
});

WatchManager = React.createClass({
  render: function() {
    return (
      <div>
        <UnsubscribedWarning user={this.props.user} />

        <h5>Watch New Repository</h5>

        <AddWatchForm user={this.props.user} />

        <hr />

        <a className="unwatch-all"
          href="javascript:void(0)"
          onClick={unwatchAll}>
          Unwatch All
        </a>

        <h5>Manage Current Watches</h5>
        <WatchList
          watching={this.props.watching}
          history={this.props.history} />

        <p>
          When there are new releases, send an email to <EmailDisplay user={this.props.user} />
        </p>
      </div>
    )
  }
});

