Github Release Watch
====================

GitHub Release Watch (GHRW) makes sure that you always stay up-to-date on new releases of projects you love.  It does this by checking GitHub daily for new tags on your favourite repositories, and sends you an email if there are.

You can find GitHub Release Watch online at [http://gh-release-watch.com](http://gh-release-watch.com).

## Running Locally

GitHub Release Watch is written with [Meteor](http://meteor.com), but it uses some packages from [atmosphere](http://atmosphere.meteor.com).  Thus, you need to use [meteorite](https://github.com/oortcloud/meteorite) to install dependencies.
```bash
git clone https://github.com/mystor/gh-release-watch.git
cd gh-release-watch
mrt
```

## FAQ

### How often does GHRW check for new tags?
GHRW checks every for new tags from the GitHub API every hour.

### How are the repository suggestions generated?
When you first sign up, your stars are retrieved from GitHub, and used for suggestions. They are currently not being updated when you change your stars on GitHub, though that may change in the future.

### What do the emails look like?

Text:
```
The following projects have pushed new releases:
  meteor/meteor (release/0.7.1-rc1) [https://github.com/meteor/meteor]

Manage Watches: http://gh-release-watch.com/
Unsubscribe: http://gh-release-watch.com/unsubscribe/yzKz32eaS4qCLgtwY
```

HTML:
<p>The following projects have pushed new releases:</p><ul style="margin: 0px 0px 0px 20px; padding: 0px;"><li style="list-style-type: none; margin-bottom: 5px;"><a style="color: #4488AA; text-decoration: none;" href="https://github.com/meteor/meteor">meteor/meteor</a> (<a style="color: #4488AA; text-decoration: none;" href="https://github.com/meteor/meteor/releases/tag/release%2F0.7.1-rc1">release/0.7.1-rc1</a>)</li></ul><small style="margin-top: 20px; display: block;"><a style="color: #4488AA; text-decoration: none;" href="http://gh-release-watch.com/">manage watches</a> | <a style="color: #4488AA; text-decoration: none;" href=3D"http://gh-release-watch.com/unsubscribe/yzKz32eaS4qCLgtwY">unsubscribe</a></small>

### Can I change my email once I sign up?
Yes, at the bottom of the page there is a (change) link to allow you to change your email.  Your email defaults to your public one on GitHub.

### How does unsubscribing work?
When you click the `unsubscribe` link in an email, your account is deactivated.  Deactivated accounts will not receive updates.  If you re-activate your account at a later date, by logging in and pressing the reactivate button, then you will continue to recieve email.

Occasionally I may delete old accounts which are deactivated.  If this happens you will have to reselect your watches if you return.

## Contributing
I always want to make GitHub Release Watch better. If you find any bugs, or have suggestions, let me know by making an issue, or, even better, by fixing the problem and making a pull request.

## License

(The MIT License)

Copyright (c) 2013 Michael Layzell

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

