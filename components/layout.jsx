/** @jsx React.DOM */

var LoginButtons = React.createClass({
  render: function() {
    var user = this.props.user,
        loggingIn = this.props.loggingIn;
    if (loggingIn) {
      return (
        <p className="navbar-text navbar-right">Logging In...</p>
      )
    } else {
      if (user) {
        return (
          <p className="navbar-text navbar-right">
            <a href={user.profile.html_url}>{user.profile.login}</a>
            {' '}
            (<a href="javascript:void(0)" onClick={Login.logout}>logout</a>)
          </p>
        )
      } else {
        return (
          <p className="navbar-text navbar-right">
            <a href="javascript:void(0)" onClick={Login.login}>
              <span className="icon-github"></span> Login
            </a>
          </p>
        )
      }
    }
  }
});

Layout = React.createClass({
  render: function() {
    return (
      <div>
        <div className="navbar navbar-default navbar-static-top" role="navigation">
          <div className="container-fluid">
            <LoginButtons
              user={this.props.user}
              loggingIn={this.props.loggingIn} />

            <div className="navbar-header">
              <a className="navbar-brand" href={Routes.home()}>
                <span className="icon-github"></span>
                Release Watch
              </a>
            </div>
          </div>
        </div>
        <div className="container">
          {this.props.children}
        </div>

        <hr />

        <div className="text-center">
          <a href="http://octodex.github.com/inspectocat/">octocat</a> &copy; <a href="https://github.com">github</a> |
          made by <a href="https://github.com/mystor">Michael Layzell</a> |
          fork us on <a href="https://github.com/mystor/gh-release-watch">github</a>
        </div>

        <hr />
      </div>
    );
  }
});
