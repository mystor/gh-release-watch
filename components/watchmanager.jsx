/** @jsx React.DOM */

function ghUrl(repo) {
  return 'http://github.com/' + repo;
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

function getUserRepos(user) {
  user = user.toLowerCase();
  var uRepos = Deps.nonreactive(function() {
    return UserRepos.findOne({user: user});
  });
  if (uRepos)
    return uRepos.repos;

  UserRepos.insert({
    user: user,
    repos: []
  });
  var url = 'https://api.github.com/users/'+user+'/repos';
  HTTP.get(url, function(err, res) {
    if (err) {
      // Don't display an error, the user may not exist
      // or we may have run out of unauthenticated api calls
      return;
    }

    UserRepos.update({user: user}, {
      $set: {
        repos: res.data.map(function(repo) {
          return repo.full_name
        })
      }
    });
  });

  return [];
};

var AddWatchForm = React.createClass({
  type: function(e) {
    var newQuery = e.target.value;
    var effectiveQuery = newQuery.toLowerCase();
    var newDisplay;

    if (newQuery.length > 0) {
      newDisplay = this.props.user.profile.starred;
      var watching = this.props.user.profile.watching;

      var parts = effectiveQuery.split('/');

      if (parts.length > 1) {
        var targetUser = parts[0];
        newDisplay = _.union(
          newDisplay,
          getUserRepos(targetUser)
        );
      }

      newDisplay = _.filter(newDisplay, function(star) {
        // Don't suggest things they're already watching
        if (watching.indexOf(star) !== -1)
          return false;

        lower_star = star.toLowerCase();

        var good = true;
        var starParts = lower_star.split('/');

        if (parts.length > 1) {
          good = good && (starParts[0].indexOf(parts[0]) !== -1);
          good = good && (starParts[1].indexOf(parts[1]) !== -1);
        } else {
          good = good && (lower_star.indexOf(effectiveQuery) !== -1);
        }

        return good;
      });

      if (newDisplay.length > 30)
        newDisplay = newDisplay.slice(0, 30);
    } else {
      newDisplay = [];
    }

    this.setState({
      query: newQuery,
      display: newDisplay,
      selectedRow: -1
    });
  },

  submit: function(e) {
    var textfield = document.getElementById('new-repo-name');
    var full_name = textfield.value;

    // Detect when a suggestion is currently selected
    if (this.state.selectedRow !== -1) {
      full_name = this.state.display[this.state.selectedRow];
    }

    // Tell meteor to start watching the repository
    Meteor.call('watch', full_name, function(err) {
      if (err)
        error(err);
    });

    this.setState({
      query: '',
      display: [],
      selectedRow: -1
    });

    e.preventDefault();
  },

  keyDown: function(e) {
    var selectedRow = this.state.selectedRow;
    var display = this.state.display;

    if (e.keyCode === 38) { // UP
      if (selectedRow > 0)
        this.setState({
          selectedRow: selectedRow - 1
        });

      e.preventDefault();
    } else if (e.keyCode === 40) { // DOWN
      if (selectedRow < display.length - 1)
        this.setState({
          selectedRow: selectedRow + 1
        });

      e.preventDefault();
    }
  },

  getInitialState: function() {
    return {
      display: [],
      query: '',
      selectedRow: -1
    };
  },

  // Parameters:
  // -- none --
  render: function() {
    var user = this.props.user;
    var watching = user.profile.watching;
    var selectedRow = this.state.selectedRow;

    return (
      <div>
        <form onSubmit={this.submit}>
          <div className="input-group">
            <input type="text"
              id="new-repo-name"
              className="form-control"
              placeholder="e.g. mystor/gh-release-watch"
              value={this.state.query}
              onChange={this.type}
              onKeyDown={this.keyDown} />

            <span className="input-group-btn">
              <button type="button"
                className="btn btn-primary">
                Watch
              </button>
            </span>
          </div>
          <ul className="list-group" style={{
            'max-height': '400px',
            'overflow-y': 'auto'
          }}>
          {this.state.display.map(function(repo, i) {
              return <SingleWatch
                repo={repo}
                watching={watching}
                key={repo}
                selected={selectedRow === i} />
            })}
          </ul>
        </form>
      </div>
    )
  }
});

var SingleWatch = React.createClass({
  watch: function(e) {
    if (e.target.href)
      return;

    Meteor.call('watch', this.props.repo, function(err) {
      if (err)
        error(err);
    });
  },

  unwatch: function(e) {
    if (e.target.href)
      return;

    Meteor.call('unwatch', this.props.repo, function(err) {
      if (err)
        error(err);
    });
  },

  // Parameters:
  // @repo - the repository in question
  // @watching - the repositories currently being watched
  render: function() {
    var watchBtn,
        repo = this.props.repo,
        watching = this.props.watching.indexOf(repo) !== -1,
        selected = this.props.selected;

    return (
      <li className={"list-group-item" + (selected ? ' active' : '')}
        onClick={watching ? this.unwatch : this.watch}>

        <button type="button"
          className={'btn btn-xs pull-right ' + (watching ? 'btn-info' : 'btn-primary')}>
          {watching ? 'Watching' : 'Not Watching'}
        </button>

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

    if (history.length > 0)
      return (
        <ul className="list-group">
          {history.map(function(repo) {
            return <SingleWatch repo={repo} watching={watching} key={repo} />
          }).reverse()}
        </ul>
      );
    else
      return (
        <div className="empty-watch">
          ~~ You aren&apos;t watching anything! Start by typing above ~~
        </div>
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

