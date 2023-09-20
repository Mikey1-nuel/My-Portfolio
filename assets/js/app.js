$(() => {
  /* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
  particlesJS.load('particles-js', 'assets/js/particles.json', () => {
    console.log('callback - particles.js config loaded');
  });
});
