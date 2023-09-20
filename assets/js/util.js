(function($) {
  // Generate an indented list of links from a nav.
  $.fn.navList = function() {
    const $this = $(this);
    const $a = $this.find('a');
    const list = [];

    $a.each(function() {
      const $this = $(this);
      const indent = Math.max(0, $this.parents('li').length - 1);
      const href = $this.attr('href');
      const target = $this.attr('target');

      const link = `
        <a class="link depth-${indent}" 
           ${target ? `target="${target}"` : ''} 
           ${href ? `href="${href}"` : ''}>
          <span class="indent-${indent}">${$this.text()}</span>
        </a>`;
      
      list.push(link);
    });

    return list.join('');
  };

  // Panel-ify an element.
  $.fn.panel = function(userConfig) {
    const $this = $(this);

    // No elements?
    if ($this.length === 0) {
      return $this;
    }

    // Multiple elements?
    if ($this.length > 1) {
      $this.each(function() {
        $(this).panel(userConfig);
      });

      return $this;
    }

    // Vars.
    const $body = $('body');
    const $window = $(window);
    const id = $this.attr('id');
    let config;

    // Config.
    config = $.extend({
      delay: 0,
      hideOnClick: false,
      hideOnEscape: false,
      hideOnSwipe: false,
      resetScroll: false,
      resetForms: false,
      side: null,
      target: $this,
      visibleClass: 'visible',
    }, userConfig);

    // Expand "target" if it's not a jQuery object already.
    if (typeof config.target !== 'jQuery') {
      config.target = $(config.target);
    }

    // Panel methods.
    $this._hide = function(event) {
      if (!config.target.hasClass(config.visibleClass)) {
        return;
      }

      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      config.target.removeClass(config.visibleClass);

      window.setTimeout(() => {
        if (config.resetScroll) {
          $this.scrollTop(0);
        }

        if (config.resetForms) {
          $this.find('form').each(function() {
            this.reset();
          });
        }
      }, config.delay);
    };

    // Vendor fixes.
    $this
      .css('-ms-overflow-style', '-ms-autohiding-scrollbar')
      .css('-webkit-overflow-scrolling', 'touch');

    // Hide on click.
    if (config.hideOnClick) {
      $this.find('a').css('-webkit-tap-highlight-color', 'rgba(0,0,0,0)');

      $this.on('click', 'a', function(event) {
        const $a = $(this);
        const href = $a.attr('href');
        const target = $a.attr('target');

        if (!href || href === '#' || href === '' || href === `#${id}`) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        $this._hide();

        window.setTimeout(() => {
          if (target === '_blank') {
            window.open(href);
          } else {
            window.location.href = href;
          }
        }, config.delay + 10);
      });
    }

    // Event: Touch stuff.
    $this.on('touchstart', (event) => {
      $this.touchPosX = event.originalEvent.touches[0].pageX;
      $this.touchPosY = event.originalEvent.touches[0].pageY;
    });

    $this.on('touchmove', (event) => {
      if ($this.touchPosX === null || $this.touchPosY === null) {
        return;
      }

      const diffX = $this.touchPosX - event.originalEvent.touches[0].pageX;
      const diffY = $this.touchPosY - event.originalEvent.touches[0].pageY;
      const th = $this.outerHeight();
      const ts = ($this.get(0).scrollHeight - $this.scrollTop());

      if (config.hideOnSwipe) {
        let result = false;
        const boundary = 20;
        const delta = 50;

        switch (config.side) {
          case 'left':
            result = (diffY < boundary && diffY > (-1 * boundary)) && (diffX > delta);
            break;

          case 'right':
            result = (diffY < boundary && diffY > (-1 * boundary)) && (diffX < (-1 * delta));
            break;

          case 'top':
            result = (diffX < boundary && diffX > (-1 * boundary)) && (diffY > delta);
            break;

          case 'bottom':
            result = (diffX < boundary && diffX > (-1 * boundary)) && (diffY < (-1 * delta));
            break;

          default:
            break;
        }

        if (result) {
          $this.touchPosX = null;
          $this.touchPosY = null;
          $this._hide();

          return false;
        }
      }

      if (($this.scrollTop() < 0 && diffY < 0) || (ts > (th - 2) && ts < (th + 2) && diffY > 0)) {
        event.preventDefault();
        event.stopPropagation();
      }
    });

    // Event: Prevent certain events inside the panel from bubbling.
    $this.on('click touchend touchstart touchmove', (event) => {
      event.stopPropagation();
    });

    // Event: Hide panel if a child anchor tag pointing to its ID is clicked.
    $this.on('click', `a[href="#${id}"]`, (event) => {
      event.preventDefault();
      event.stopPropagation();

      config.target.removeClass(config.visibleClass);
    });

    // Body.

    // Event: Hide panel on body click/tap.
    $body.on('click touchend', (event) => {
      $this._hide(event);
    });

    // Event: Toggle.
    $body.on('click', `a[href="#${id}"]`, (event) => {
      event.preventDefault();
      event.stopPropagation();

      config.target.toggleClass(config.visibleClass);
    });

    // Window.

    // Event: Hide on ESC.
    if (config.hideOnEscape) {
      $window.on('keydown', (event) => {
        if (event.keyCode === 27) {
          $this._hide(event);
        }
      });
    }

    return $this;
  };

  // Apply "placeholder" attribute polyfill to one or more forms.
  $.fn.placeholder = function() {
    if (typeof (document.createElement('input')).placeholder !== 'undefined') {
      return $(this);
    }

    // No elements?
    if (this.length === 0) {
      return $this;
    }

    // Multiple elements?
    if (this.length > 1) {
      this.each(function() {
        $(this).placeholder();
      });

      return $this;
    }

    // Vars.
    const $this = $(this);

    // Text, TextArea.
    $this.find('input[type=text],textarea').each(function() {
      const i = $(this);

      if (i.val() === '' || i.val() === i.attr('placeholder')) {
        i.addClass('polyfill-placeholder').val(i.attr('placeholder'));
      }
    }).on('blur', function() {
      const i = $(this);

      if (i.attr('name').match(/-polyfill-field$/)) {
        return;
      }

      if (i.val() === '') {
        i.addClass('polyfill-placeholder').val(i.attr('placeholder'));
      }
    }).on('focus', function() {
      const i = $(this);

      if (i.attr('name').match(/-polyfill-field$/)) {
        return;
      }

      if (i.val() === i.attr('placeholder')) {
        i.removeClass('polyfill-placeholder').val('');
      }
    });

    // Password.
    $this.find('input[type=password]').each(function() {
      const i = $(this);
      const x = $('<div>').append(i.clone()).remove().html()
        .replace(/type="password"/i, 'type="text"')
        .replace(/type=password/i, 'type=text');

      if (i.attr('id') !== '') {
        x.attr('id', `${i.attr('id')}-polyfill-field`);
      }

      if (i.attr('name') !== '') {
        x.attr('name', `${i.attr('name')}-polyfill-field`);
      }

      x.addClass('polyfill-placeholder').val(x.attr('placeholder')).insertAfter(i);

      if (i.val() === '') {
        i.hide();
      } else {
        x.hide();
      }

      i.on('blur', (event) => {
        event.preventDefault();

        const x = i.parent().find(`input[name=${i.attr('name')}-polyfill-field]`);

        if (i.val() === '') {
          i.hide();
          x.show();
        }
      });

      x.on('focus', (event) => {
        event.preventDefault();

        const i = x.parent().find(`input[name=${x.attr('name').replace('-polyfill-field', '')}]`);

        x.hide();

        i.show().focus();
      }).on('keypress', (event) => {
        event.preventDefault();
        x.val('');
      });
    });

    // Events.
    $this.on('submit', () => {
      $this.find('input[type=text],input[type=password],textarea').each(function() {
        const i = $(this);

        if (i.attr('name').match(/-polyfill-field$/)) {
          i.attr('name', '');
        }

        if (i.val() === i.attr('placeholder')) {
          i.removeClass('polyfill-placeholder');
          i.val('');
        }
      });
    }).on('reset', (event) => {
      event.preventDefault();

      $this.find('select').val($('option:first').val());

      $this.find('input,textarea').each(function() {
        const i = $(this);
        let x;

        i.removeClass('polyfill-placeholder');

        switch (this.type) {
          case 'submit':
          case 'reset':
            break;

          case 'password':
            i.val(i.attr('defaultValue'));

            x = i.parent().find(`input[name=${i.attr('name')}-polyfill-field]`);

            if (i.val() === '') {
              i.hide();
              x.show();
            } else {
              i.show();
              x.hide();
            }

            break;

          case 'checkbox':
          case 'radio':
            i.attr('checked', i.attr('defaultValue'));
            break;

          case 'text':
          case 'textarea':
            i.val(i.attr('defaultValue'));

            if (i.val() === '') {
              i.addClass('polyfill-placeholder');
              i.val(i.attr('placeholder'));
            }

            break;

          default:
            i.val(i.attr('defaultValue'));
            break;
        }
      });
    });

    return $this;
  };

  // Moves elements to/from the first positions of their respective parents.
  $.prioritize = function($elements, condition) {
    const key = '__prioritize';

    if (typeof $elements !== 'jQuery') {
      $elements = $($elements);
    }

    $elements.each(function() {
      const $e = $(this);
      const $p = $e.parent();

      // No parent? Bail.
      if ($p.length === 0) {
        return;
      }

      // Not moved? Move it.
      if (!$e.data(key)) {
        // Condition is false? Bail.
        if (!condition) {
          return;
        }

        // Get placeholder (which will serve as our point of reference for when this element needs to move back).
        const $placeholder = $e.prev();

        // Couldn't find anything? Means this element's already at the top, so bail.
        if ($placeholder.length === 0) {
          return;
        }

        // Move element to the top of parent.
        $e.prependTo($p);

        // Mark element as moved.
        $e.data(key, $placeholder);
      } else {
        // Condition is true? Bail.
        if (condition) {
          return;
        }

        // Get the placeholder.
        const $placeholder = $e.data(key);

        // Move element back to its original location (using our placeholder).
        $e.insertAfter($placeholder);

        // Unmark element as moved.
        $e.removeData(key);
      }
    });
  };
}(jQuery));
