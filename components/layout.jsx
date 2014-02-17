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
            <a href="#" onClick={Login.logout}>(logout)</a>
          </p>
        )
      } else {
        return (
          <p className="navbar-text navbar-right">
            <a href="#" onClick={Login.login}><i className="fa fa-github"></i> Login</a>
          </p>
        )
      }
    }
  }
});

Layout = React.createClass({
  login: function() {
    console.log('heyo');
    // DO NOTHING!
  },
  render: function() {
    return (
      <div>
        <div className="navbar navbar-default navbar-static-top" role="navigation">
          <div className="container-fluid">
            <div className="navbar-header">
              <a className="navbar-brand" href={Routes.home()}>
                <i className="fa fa-github"></i>
                Release Watch
              </a>
            </div>

            <LoginButtons
              user={this.props.user}
              loggingIn={this.props.loggingIn} />
          </div>
        </div>
        <div className="container">
          {this.props.children}
        </div>

        <hr />

        <div className="text-center">
          <a href="/faq">faq</a> | <a href="mystor/gh-release-watch">github</a>
        </div>

        <hr />
      </div>
    );
  }
});
