/** @jsx React.DOM */

NotFound = React.createClass({
  render: function() {
    return (
      <div className="text-center">
        <h1>404</h1>
        <h3>There doesn&apos;t seem to be anything here</h3>
        <p>Go <a href={Routes.home()}>Home</a>?</p>
      </div>
    );
  }
});
