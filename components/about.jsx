/** @jsx React.DOM */

About = React.createClass({
  render: function() {
    return (
      <div>
        <img src="inspectocat.png" className="img-responsive pull-right" />

        <h1>Github Release Watch</h1>
        <h4>Github Release Watch checks your favourite Github repositories every day to see if any new tags or releases have been added.</h4>
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
