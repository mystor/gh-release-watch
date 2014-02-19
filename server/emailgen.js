var entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function(s) {
    return entityMap[s];
  });
}

EmailGen = {
  subject: function(report) {
    var subject = "[GH Release Watch] ";
    subject += report.map(function(repo) {return repo.name;}).join(', ');

    return subject;
  },

  text: function(report, unsubscribeUrl, manageUrl) {
    var text = "The following projects have pushed new releases:\n";
    text += report.map(function(repo) {
      return '  ' + repo.full_name + ' (' + repo.newTags.join(', ') + ') [' + repo.html_url + ']'; 
    }).join('\n');
    text += '\n\nManage Watches: ' + manageUrl;
    text += '\nUnsubscribe: ' + unsubscribeUrl;

    return text;
  },

  html: function(report, unsubscribeUrl, manageUrl) {
    var styles = {
      a: 'color: #4488AA; text-decoration: none;',
      ul: 'margin: 0px 0px 0px 20px; padding: 0px;',
      li: 'list-style-type: none; margin-bottom: 5px;',
      small: 'margin-top: 20px; display: block;'
    };

    var html = "<p>The following projects have pushed new releases:</p>";
    html += '<ul style="'+styles.ul+'">'
    html += report.map(function(repo) {
      var tags = repo.newTags.map(function(tag) {
        // We have no better method finding the href for this
        // it doesn't appear to be returned by any API call
        var href = repo.html_url + '/releases/tag/' + encodeURIComponent(tag);

        return '<a style="'+styles.a+'" href="'+href+'">'+escapeHtml(tag)+'</a>';
      });

      var repoName = '<a style="'+styles.a+'" href="'+repo.html_url+'">'+escapeHtml(repo.full_name)+'</a>';

      return '<li style="'+styles.li+'">'+repoName+' (' + tags.join(', ') + ')</li>';
    }).join('');
    html += '</ul>';

    var manageLink = '<a style="'+styles.a+'" href="'+manageUrl+'">manage watches</a>';
    var unsubscribeLink = '<a style="'+styles.a+'" href="'+unsubscribeUrl+'">unsubscribe</a>';
    html += '<small style="'+styles.small+'">'+manageLink+' | '+unsubscribeLink+'</small>';

    return html;
  },

  generate: function(report, unsubscribeToken) {
    var manageUrl = 'http://gh-release-watch.com' + Routes.home();
    var unsubscribeUrl = 'http://gh-release-watch.com' + Routes.unsubscribe(unsubscribeToken);

    return {
      subject: EmailGen.subject(report),
      text: EmailGen.text(report, unsubscribeUrl, manageUrl),
      html: EmailGen.html(report, unsubscribeUrl, manageUrl)
    };
  }
};

