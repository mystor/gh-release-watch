/** @jsx React.DOM */

About = React.createClass({
  render: function() {
    return (
      <div>
        <img src="images/inspectocat.png" className="octocat" />

        <h1>Github Release Watch</h1>
        <h4>Github Release Watch checks your favourite Github repositories for any new tags or releases.</h4>
        <h4>If they have, it sends you an email, making sure that you stay in the loop!</h4>

        <p className="text-center">
          <button type="button" className="btn btn-lg btn-primary text-center" onClick={Login.login}>
            {this.props.loggingIn ? 'Logging in...' : 'Login with Github'}
          </button>
        </p>
      </div>
    )
  }
});

