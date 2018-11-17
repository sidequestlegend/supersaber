# supersaber

Free and open source clone of Beat Saber that lets you play from over 6000
community songs from [Beat Saver](https://beatsaver.com/) songs without having
to install any mods.

Built with [A-Frame](https://aframe.io) and JavaScript on the Web so it loads
in seconds without any installs!

![Supersaber](https://user-images.githubusercontent.com/674727/48661927-bf14b280-ea2e-11e8-8dec-4ca76992322b.png)

Play Super Saber now for free on HTC Vive or Oculus Rift via
**[Supermedium](https://supermedium.com)**, the browser for the VR Internet!
Available for free on:

<a href="https://store.steampowered.com/app/803010/Supermedium/">
  <img src="https://user-images.githubusercontent.com/674727/48661907-84ab1580-ea2e-11e8-844a-63a111cccd13.png" width="50%">
</a>
<a href="https://www.oculus.com/experiences/rift/1629560483789871/">
  <img src="https://user-images.githubusercontent.com/674727/48661906-84127f00-ea2e-11e8-8cd9-6b98cf05eb85.png" width="50%">
</a>

![Supermedium](https://user-images.githubusercontent.com/674727/45821011-07b52700-bc9d-11e8-9fc6-356c93b13be7.png)

## Development

Built with [A-Frame](https://aframe.io) and JavaScript, from the creators of A-Frame!

```
npm install
npm run start
```

Then head to `localhost:3000` in your browser.

Also uses
[aframe-state-component](https://www.npmjs.com/package/aframe-state-component)
as state container and [Nunjucks](https://mozilla.github.io/nunjucks/) to
assist HTML templating.

### Debug Flags

| Flag          | Description             |
|---------------|-------------------------|
| ?debug        | Move sabers with mouse. |
| ?debugloading | Show loading screen.    |
| ?debugvictory | Show victory screen.    |
| ?godmode      | Never die.              |
| ?synctest     | Log beat timestamps.    |

## Chat

Hi, we're the [Supermedium](https://supermedium.com) team! We'd love if you
provide feedback, bug reports, and feature requests! A-Frame and the Web lets
us iterate and deploy new features very quickly.

- Hang out with us on [Discord](https://supermedium.com/discord/).
- Follow us on [Twitter](https://twitter.com/supermediumvr)!
