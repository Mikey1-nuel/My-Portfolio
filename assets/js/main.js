// Wrap your code in a self-invoking function to avoid global scope pollution.
(function ($) {
  // Define variables.
  const $window = $(window);
  const $body = $('body');
  const $header = $('#header');
  let $titleBar = null;
  const $nav = $('#nav');
  const $wrapper = $('#wrapper');

  // Breakpoints.
  breakpoints({
    xlarge: ['1281px', '1680px'],
    large: ['1025px', '1280px'],
    medium: ['737px', '1024px'],
    small: ['481px', '736px'],
    xsmall: [null, '480px'],
  });

  // Function to handle animations.
  function handleAnimations() {
    window.setTimeout(() => {
      $body.removeClass('is-preload');
    }, 100);
  }

  // Play initial animations on page load.
  $window.on('load', handleAnimations);

  // Tweak: Polyfill Object fit.
  if (!browser.canUse('object-fit')) {
    $('.image[data-position]').each(function () {
      const $this = $(this);
      const $img = $this.children('img');

      // Apply img as background.
      $this.css({
        'background-image': `url("${$img.attr('src')}")`,
        'background-position': $this.data('position'),
        'background-size': 'cover',
        'background-repeat': 'no-repeat',
      });

      // Hide img.
      $img.css('opacity', '0');
    });
  }

  // Header Panel.

  // Function to handle navigation clicks.
  function handleNavClick() {
    const $this = $(this);

    // External link? Bail.
    if ($this.attr('href').charAt(0) !== '#') {
      return;
    }

    // Deactivate all links.
    $nav_a.removeClass('active');

    // Activate link *and* lock it.
    $this.addClass('active active-locked');
  }

  // Nav.
  const $nav_a = $nav.find('a');
  $nav_a.addClass('scrolly').on('click', handleNavClick);

  // Function to handle section scrolling.
  function handleSectionScroll() {
    const $this = $(this);
    const id = $this.attr('href');
    const $section = $(id);

    // No section for this link? Bail.
    if ($section.length < 1) {
      return;
    }

    // Scrollex.
    $section.scrollex({
      mode: 'middle',
      top: '5vh',
      bottom: '5vh',
      initialize() {
      // Deactivate section.
        $section.addClass('inactive');
      },
      enter() {
      // Activate section.
        $section.removeClass('inactive');

        // No locked links? Deactivate all links and activate this section's one.
        if ($nav_a.filter('.active-locked').length === 0) {
          $nav_a.removeClass('active');
          $this.addClass('active');
        }
        // Otherwise, if this section's link is the one that's locked, unlock it.
        else if ($this.hasClass('active-locked')) {
          $this.removeClass('active-locked');
        }
      },
    });
  }

  // Iterate through navigation links and handle section scrolling.
  $nav_a.each(handleSectionScroll);

  // Title Bar.
  $titleBar = $(`<div id="titleBar"><a href="#header" class="toggle"></a><span class="title">${$('#logo').html()}</span></div>`).appendTo($body);

  // Panel.
  $header.panel({
    delay: 500,
    hideOnClick: true,
    hideOnSwipe: true,
    resetScroll: true,
    resetForms: true,
    side: 'right',
    target: $body,
    visibleClass: 'header-visible',
});

// Scrolly.
  $('.scrolly').scrolly({
    speed: 1000,
    offset() {
      if (breakpoints.active('<=medium')) {
        return $titleBar.height();
      }
      return 0;
    },
  });
}(jQuery));
