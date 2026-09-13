$(function () {
  // ==================================================================
  // ---- Set your WhatsApp business number here, country code first, digits only ----
  var WHATSAPP_NUMBER = "919800000000"; // e.g. 91 + 10-digit Indian mobile number
  // ==================================================================

  $('#year').text(new Date().getFullYear());

  /* =========================================================
     MOBILE NAV TOGGLE
  ========================================================= */
  var $menuBtn = $('#menuBtn');
  var $mobileMenu = $('#mobileMenu');

  function openMobileMenu() {
    $mobileMenu.addClass('is-open');
    $menuBtn.addClass('is-open').attr('aria-expanded', 'true').attr('aria-label', 'Close menu');
  }
  function closeMobileMenu() {
    $mobileMenu.removeClass('is-open');
    $menuBtn.removeClass('is-open').attr('aria-expanded', 'false').attr('aria-label', 'Open menu');
  }
  $menuBtn.on('click', function () {
    if ($mobileMenu.hasClass('is-open')) { closeMobileMenu(); } else { openMobileMenu(); }
  });
  $mobileMenu.find('a').on('click', function () {
    closeMobileMenu();
  });
  // close mobile menu with Escape key
  $(document).on('keyup', function (e) {
    if (e.key === 'Escape') closeMobileMenu();
  });

  /* =========================================================
     SMART NAVIGATION
     - shrink/shadow header on scroll
     - scroll-spy: highlight the nav link for the section in view
     - smooth-scroll with sticky-header offset
     - back-to-top button + scroll progress bar
  ========================================================= */
  var $header = $('header');
  var $navLinks = $('nav.links a[href^="#"]');
  var $sections = $('main section[id], .stats[id]');
  var headerOffset = 84;

  // sections referenced by nav also include the hero (#top) and stats block doesn't have id,
  // so build the list explicitly from nav hrefs that exist on the page
  var navTargets = [];
  $navLinks.each(function () {
    var hash = $(this).attr('href');
    if (hash && hash.charAt(0) === '#') {
      var $target = $(hash === '#top' ? '#top' : hash);
      if ($target.length) navTargets.push({ hash: hash, el: $target[0], top: 0 });
    }
  });

  function recalcTargetOffsets() {
    navTargets.forEach(function (t) {
      t.top = $(t.el).offset().top;
    });
  }
  recalcTargetOffsets();
  $(window).on('resize', recalcTargetOffsets);

  function setActiveNav(hash) {
    $navLinks.removeClass('is-active');
    $navLinks.filter('[href="' + hash + '"]').addClass('is-active');
  }

  // smooth scroll with offset for sticky header
  $(document).on('click', 'a[href^="#"]', function (e) {
    var hash = $(this).attr('href');
    if (hash.length < 2) return;
    var $target = $(hash);
    if (!$target.length) return;
    e.preventDefault();
    var top = hash === '#top' ? 0 : $target.offset().top - headerOffset + 1;
    $('html, body').stop().animate({ scrollTop: top }, 650, 'swing');
    setActiveNav(hash);
    if (history.pushState) history.pushState(null, null, hash);
  });

  var scrollTicking = false;
  function onScroll() {
    var scrollY = $(window).scrollTop();
    var docHeight = $(document).height() - $(window).height();
    var progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
    $('#scrollProgress').css('width', progress + '%');

    // header shrink/shadow
    $header.toggleClass('is-scrolled', scrollY > 12);

    // back to top visibility
    $('#backToTop').toggleClass('is-visible', scrollY > 480);

    // scroll-spy: find the last section whose top has been passed
    var current = navTargets[0] ? navTargets[0].hash : null;
    for (var i = 0; i < navTargets.length; i++) {
      if (scrollY + headerOffset + 10 >= navTargets[i].top) {
        current = navTargets[i].hash;
      }
    }
    if (current) setActiveNav(current);
    scrollTicking = false;
  }
  $(window).on('scroll', function () {
    if (!scrollTicking) {
      window.requestAnimationFrame(onScroll);
      scrollTicking = true;
    }
  });
  onScroll();

  $('#backToTop').on('click', function () {
    $('html, body').stop().animate({ scrollTop: 0 }, 600, 'swing');
    setActiveNav('#top');
  });

  /* =========================================================
     FLOATING WHATSAPP BUTTON
  ========================================================= */
  $('#waFloat').attr('href', 'https://wa.me/' + WHATSAPP_NUMBER);

  /* =========================================================
     FORM VALIDATION (Enquiry form)
  ========================================================= */
  var $form = $('#quoteForm');
  var $status = $('#form-status');
  var $submitBtn = $form.find('button[type="submit"]');

  var validators = {
    name: function (val) {
      if (!val.trim()) return 'Please enter your name.';
      if (val.trim().length < 2) return 'Name looks too short.';
      if (!/^[a-zA-Z\s.'-]+$/.test(val.trim())) return 'Name can only contain letters and spaces.';
      return '';
    },
    phone: function (val) {
      var digits = val.replace(/[^0-9]/g, '');
      if (!val.trim()) return 'Please enter a phone number.';
      if (digits.length < 10 || digits.length > 13) return 'Enter a valid phone number (10 digits).';
      return '';
    },
    location: function (val) {
      // optional field — only validate if filled
      if (val.trim() && val.trim().length < 2) return 'Location looks too short.';
      return '';
    },
    details: function (val) {
      // optional field — only validate if filled
      if (val.trim() && val.trim().length < 5) return 'Add a little more detail, or leave this blank.';
      return '';
    }
  };

  function getFieldGroup($field) {
    return $field.closest('div');
  }

  function showFieldError($field, message) {
    var $group = getFieldGroup($field);
    var $err = $group.find('.field-error');
    if (!$err.length) {
      $err = $('<div class="field-error" role="alert"></div>');
      $group.append($err);
    }
    if (message) {
      $err.text(message).addClass('show');
      $group.addClass('is-invalid').removeClass('is-valid');
      $field.attr('aria-invalid', 'true');
    } else {
      $err.text('').removeClass('show');
      $group.removeClass('is-invalid');
      if ($field.val() && $field.val().toString().trim()) {
        $group.addClass('is-valid');
      } else {
        $group.removeClass('is-valid');
      }
      $field.attr('aria-invalid', 'false');
    }
    return !message;
  }

  function validateField(name) {
    var $field = $form.find('[name="' + name + '"]');
    if (!$field.length || !validators[name]) return true;
    var message = validators[name]($field.val() || '');
    return showFieldError($field, message);
  }

  // live validation as the user types / leaves a field
  $.each(['name', 'phone', 'location', 'details'], function (_, name) {
    $form.find('[name="' + name + '"]').on('blur', function () {
      validateField(name);
    }).on('input', function () {
      var $group = getFieldGroup($(this));
      if ($group.hasClass('is-invalid')) validateField(name); // re-check live once an error is shown
    });
  });

  $form.on('submit', function (e) {
    e.preventDefault();

    var allValid = true;
    $.each(['name', 'phone', 'location', 'details'], function (_, name) {
      if (!validateField(name)) allValid = false;
    });

    if (!allValid) {
      $status.text('Please fix the highlighted fields before sending.').removeClass('success').addClass('show error');
      var $firstError = $form.find('.is-invalid').first();
      if ($firstError.length) {
        $('html, body').animate({ scrollTop: $firstError.offset().top - headerOffset - 20 }, 400);
        $firstError.find('input, select, textarea').first().trigger('focus');
      }
      return;
    }

    var data = {};
    $.each($form.serializeArray(), function (_, field) { data[field.name] = field.value; });
    var lines = [
      'New site enquiry from ' + (data.name || '-'),
      'Phone: ' + (data.phone || '-'),
      'Project type: ' + (data.type || '-'),
      'Location: ' + (data.location || '-'),
      'Details: ' + (data.details || '-')
    ];
    var message = encodeURIComponent(lines.join('\n'));
    var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + message;

    $submitBtn.addClass('is-loading').prop('disabled', true);
    $status.text('').removeClass('show success error');

    // tiny delay so the loading state is visible before WhatsApp opens
    setTimeout(function () {
      window.open(url, '_blank', 'noopener');
      $submitBtn.removeClass('is-loading').prop('disabled', false);
      $status.text('Opening WhatsApp with your enquiry filled in…').removeClass('error').addClass('show success');
      $form[0].reset();
      $form.find('.is-valid, .is-invalid').removeClass('is-valid is-invalid');
      $form.find('.field-error').removeClass('show').text('');
    }, 450);
  });

  /* =========================================================
     HERO PHOTO SLIDER
  ========================================================= */
  var $heroSlides = $('#heroSlider .hero-slide');
  var $heroDots = $('#heroSlider .hero-dot');
  var heroIndex = 0;
  var heroTimer;

  function goToHeroSlide(i) {
    heroIndex = (i + $heroSlides.length) % $heroSlides.length;
    $heroSlides.removeClass('is-active').eq(heroIndex).addClass('is-active');
    $heroDots.removeClass('is-active').eq(heroIndex).addClass('is-active');
  }
  function startHeroAuto() {
    clearInterval(heroTimer);
    heroTimer = setInterval(function () { goToHeroSlide(heroIndex + 1); }, 5500);
  }
  $('#heroSlider .hero-arrow.next').on('click', function () { goToHeroSlide(heroIndex + 1); startHeroAuto(); });
  $('#heroSlider .hero-arrow.prev').on('click', function () { goToHeroSlide(heroIndex - 1); startHeroAuto(); });
  $heroDots.on('click', function () { goToHeroSlide($heroDots.index(this)); startHeroAuto(); });
  startHeroAuto();

  /* =========================================================
     SITE GALLERY SLIDER
  ========================================================= */
  var $galleryTrack = $('#siteGallery .gallery-track');
  var $gallerySlides = $('#siteGallery .gallery-slide');
  var $galleryDotsWrap = $('#galleryDots');
  var galleryIndex = 0;
  var galleryTimer;

  $gallerySlides.each(function (i) {
    var $dot = $('<button class="gallery-dot" aria-label="Go to photo ' + (i + 1) + '"></button>');
    if (i === 0) $dot.addClass('is-active');
    $galleryDotsWrap.append($dot);
  });
  var $galleryDots = $galleryDotsWrap.find('.gallery-dot');

  function goToGallerySlide(i) {
    galleryIndex = (i + $gallerySlides.length) % $gallerySlides.length;
    $galleryTrack.css('transform', 'translateX(-' + (galleryIndex * 100) + '%)');
    $galleryDots.removeClass('is-active').eq(galleryIndex).addClass('is-active');
  }
  function startGalleryAuto() {
    clearInterval(galleryTimer);
    galleryTimer = setInterval(function () { goToGallerySlide(galleryIndex + 1); }, 4500);
  }
  $('#galleryNext').on('click', function () { goToGallerySlide(galleryIndex + 1); startGalleryAuto(); });
  $('#galleryPrev').on('click', function () { goToGallerySlide(galleryIndex - 1); startGalleryAuto(); });
  $galleryDots.on('click', function () { goToGallerySlide($galleryDots.index(this)); startGalleryAuto(); });
  $('#siteGallery').on('mouseenter', function () { clearInterval(galleryTimer); })
                    .on('mouseleave', startGalleryAuto);
  startGalleryAuto();

  /* =========================================================
     ANIMATED STAT COUNTERS (run once, when stats scroll into view)
  ========================================================= */
  function animateCount($el) {
    var raw = $el.text().trim();
    var match = raw.match(/^([\d.]+)(.*)$/);
    if (!match) return;
    var end = parseFloat(match[1]);
    var suffix = match[2] || '';
    var startTime = null;
    var duration = 1200;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = (end * eased);
      var display = (end % 1 === 0) ? Math.floor(current) : current.toFixed(1);
      $el.text(display + suffix);
      if (progress < 1) window.requestAnimationFrame(step);
      else $el.text(raw);
    }
    window.requestAnimationFrame(step);
  }

  /* =========================================================
     SCROLL-TRIGGERED REVEAL (+ stat counters)
  ========================================================= */
  var $revealTargets = $('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          $(entry.target).addClass('in-view');
          if ($(entry.target).hasClass('stats-grid')) {
            $(entry.target).find('.stat .num').each(function () { animateCount($(this)); });
          }
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    $revealTargets.each(function () { io.observe(this); });
  } else {
    $revealTargets.addClass('in-view');
  }
});
