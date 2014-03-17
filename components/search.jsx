/** @jsx React.DOM */

function getUserRepos(user) {
  user = user.toLowerCase();

  var uRepos = UserRepos.findOne({user: user});
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
}

// no var, as it is used in watchmanager.jsx
AddWatchForm = React.createClass({
  getInitialState: function() {
    return {
      query: '',
      selectedRow: -1,
      laggedWatching: this.props.user.profile.watching
    };
  },

  display: function() {
    var query = this.state.query.toLowerCase();

    if (query.length === 0)
      return [];

    var display = this.props.user.profile.starred;
    var watching = this.state.laggedWatching;
    var queryParts = query.split('/');

    if (queryParts.length > 1) {
      var targetUser = queryParts[0];
      display = _.union(
        display,
        getUserRepos(targetUser)
      );
    }


    display = _.filter(display, function(repo) {
      // Ignore the item if it is currently being watched
      if (watching.indexOf(repo) !== -1)
        return false;

      var lrepo = repo.toLowerCase();
      var parts = lrepo.split('/');

      if (queryParts.length > 1) {
        if (parts[0].indexOf(queryParts[0]) === -1)
          return false;
        if (parts[1].indexOf(queryParts[1]) === -1)
          return false;
      } else if (lrepo.indexOf(query) === -1) {
        return false;
      }

      return true;
    });

    // Don't display more than 20
    if (display.length > 30)
      display = display.slice(0, 30)

    return display;
  },

  type: function(e) {
    this.setState({
      // Set the new query value
      query: e.target.value,

      // Reset the currently selected row and lagged watching
      selectedRow: -1,
      laggedWatching: this.props.user.profile.watching
    });
  },

  submit: function(e) {
    var full_name = document.getElementById('new-repo-name').value;

    var row = this.state.selectedRow;
    if (row !== -1)
      full_name = this.display()[row];

    Meteor.call('watch', full_name, function(err) {
      if (err)
        error(err);
    });

    this.setState({
      query: '',
      selectedRow: -1,
      laggedWatching: this.props.user.profile.watching
    });

    e.preventDefault();
  },

  keyDown: function(e) {
    var selectedRow = this.state.selectedRow;
    if (e.keyCode === 38) {// UP
      if (selectedRow > 0) {
        this.setState({
          selectedRow: selectedRow - 1
        });
      }

      e.preventDefault();
    } else if (e.keyCode === 40) {
      if (selectedRow < this.display().length - 1) {
        this.setState({
          selectedRow: selectedRow + 1
        });
      }

      e.preventDefault();
    }
  },

  render: function() {
    var display = this.display();
    var watching = this.props.user.profile.watching;
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
          {display.map(function(repo, i) {
              return <SingleWatch
                repo={repo}
                watching={watching}
                key={repo}
                selected={selectedRow === i} />
            })}
          </ul>
        </form>
      </div>
    );
  }
});

