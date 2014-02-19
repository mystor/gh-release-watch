/** @jsx React.DOM */

function ghUrl(repo) {
  return 'http://github.com/' + repo;
}

function customWatch(e) {
  var textfield = document.getElementById('new-repo-name');
  var full_name = textfield.value;
  textfield.value = '';

  Meteor.call('watch', full_name, function(err) {
    if (err)
      error(err);
    else
      textfield.value = '';
  });

  e.preventDefault();
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

var AddWatchForm = React.createClass({
  // Parameters:
  // -- none --
  render: function() {
    return (
      <form onSubmit={customWatch}>
        <div className="input-group">
          <input type="text" 
            id="new-repo-name"
            className="form-control" 
            placeholder="e.g. mystor/gh-release-watch" />

          <span className="input-group-btn">
            <button type="button"
              className="btn btn-primary">
              Watch
            </button>
          </span>
        </div>
      </form>
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
          Unwatch
        </button>
      );
    } else {
      watchBtn = (
        <button type="button"
          className="btn btn-primary btn-xs pull-right"
          onClick={watch(repo)}>
          Watch
        </button>
      );
    }

    return (
      <li className="list-group-item">
        {watchBtn}
        <span className="icon-book" style={{
          'margin-left': '-5px', 'margin-right': '10px'
        }}></span>
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

WatchManager = React.createClass({
  render: function() {
    return (
      <div>
        <h5>Watch New Repository</h5>

        <AddWatchForm />

        <hr />

        <small className="pull-right" style={{'margin-right': '10px'}}>
          <a href="javascript:void(0)"
            onClick={unwatchAll}>
            Unwatch All
          </a>
        </small>
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