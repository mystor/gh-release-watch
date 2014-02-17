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
      console.error(err);
    else
      textfield.value = '';
  });

  e.preventDefault();
}

function watch(repo) {
  return function(e) {
    Meteor.call('watch', repo, function(err) {
      if (err)
        console.error(err);
    });

    e.preventDefault();
  }
}

function unwatch(repo) {
  return function(e) {
    Meteor.call('unwatch', repo, function(err) {
      if (err)
        console.error(err);
    });

    e.preventDefault();
  }
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
        <i className="fa fa-book" style={{
          'margin-left': '-5px', 'margin-right': '10px'
        }}></i>
        <a href={ghUrl(repo)}>{repo}</a>
      </li>
    );
  }
});

var WatchList = React.createClass({
  // Parameters:
  // @history - all repositories to show
  // @watching - the respositories currently being watched
  render: function() {
    var self = this;

    return (
      <ul className="list-group">
        {this.props.history.map(function(repo) {
          return <SingleWatch repo={repo} watching={self.props.watching} key={repo} />
        })}
      </ul>
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

        <h5>Manage Current Watches</h5>
        <WatchList
          watching={this.props.watching} 
          history={this.props.history} />

        <h5>Every day, we will check the repositories above for you, and send you an email if a new release has occured.  These emails are currently being sent to:</h5>
        <span>
          {this.props.user.profile.email + ' '}
          <a href="#">(change)</a>
        </span>
      </div>
    )
  }
});
