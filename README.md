# supersaber

A free and open source clone of [Beat Saber](https://beatsaber.com) that lets
you play over 6000 community songs from [Beat Saver](https://beatsaver.com/)
songs without having to install any mods.

We are big fans of Beat Saber and what it has done for VR. As an homage, we
built Super Saber with [A-Frame](https://aframe.io) and JavaScript to show that
the Web is capable of great VR.

<img src="https://user-images.githubusercontent.com/674727/49785956-0cefa400-fcd7-11e8-9320-d272ce5b41b7.jpg" height="190" width="32%">
<img src="https://user-images.githubusercontent.com/674727/49785957-0cefa400-fcd7-11e8-94b2-7dd9abf9db9d.jpg" height="190" width="32%">
<img src="https://user-images.githubusercontent.com/674727/49785958-0cefa400-fcd7-11e8-9fdb-c2ae754a0519.jpg" height="190" width="32%">
<img src="https://user-images.githubusercontent.com/674727/49785959-0eb96780-fcd7-11e8-9b13-9e0ca704063f.png" height="190" width="32%">
<img src="https://user-images.githubusercontent.com/674727/49786046-4cb68b80-fcd7-11e8-8e3c-4701c435fae0.jpg" height="190" width="32%">
<img src="https://user-images.githubusercontent.com/674727/49786049-52ac6c80-fcd7-11e8-8805-0adc76606aaf.jpg" height="190" width="32%">

**Play Super Saber now** for free on HTC Vive or Oculus Rift via
**[Supermedium](https://supermedium.com)**, the browser for the VR Internet!

<a href="https://store.steampowered.com/app/803010/Supermedium/">
  <img src="https://user-images.githubusercontent.com/674727/48661907-84ab1580-ea2e-11e8-844a-63a111cccd13.png" width="33%">
</a>
<a href="https://www.oculus.com/experiences/rift/1629560483789871/">
  <img src="https://user-images.githubusercontent.com/674727/48661906-84127f00-ea2e-11e8-8cd9-6b98cf05eb85.png" width="33%">
</a>

## Development

Super Saber is built with [A-Frame](https://aframe.io) (incl.
[three.js](https://threejs.org) and JavaScript).

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

## Contact

We love'd if you provide feedback, bug reports, and feature requests! And trust
us, there are bugs!

- [Supermedium](https://supermedium.com)
- Hang out with us on [Discord](https://supermedium.com/discord/).
- Follow us on [Twitter](https://twitter.com/supermediumvr)!
- [Beat Saber Modding Discord](https://discordapp.com/invite/6JcXMq3)

## Credits

- [Beat Saber](https://beatsaber.com) from [Hyperbolic Magnetism](http://www.hyperbolicmagnetism.com/). Please support them with the purchase!
- [BeatSaver](https://beatsaver.com), the community that created all the custom songs and beat maps.
