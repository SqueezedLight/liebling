import $ from 'jquery'
import slick from 'slick-carousel'
import stickybits from 'stickybits'
import mediumZoom from 'medium-zoom'
import fitvids from 'fitvids'
import shave from 'shave'
import {
  isRTL,
  isMobile
} from './helpers'

let $aosWrapper = null
let $progressCircle = null
let lastScrollingY = window.pageYOffset
let lastWindowHeight = 0
let lastDocumentHeight = 0
let circumference = 0
let isTicking = false

function onScrolling() {
  lastScrollingY = window.pageYOffset
  requestTicking()
}

function adjustShare(timeout) {
  if (!isMobile('1023px')) {
    stickybits('.js-sticky', { stickyBitStickyOffset: 100 })
    $('body').removeClass('share-menu-displayed')
  } else {
    $('body').addClass('share-menu-displayed')
    setTimeout(() => {
      $aosWrapper.removeAttr('data-aos')
    }, timeout)
  }
}

function onResizing() {
  setHeights()
  adjustShare(100)

  setTimeout(() => {
    setCircleStyles()
    requestTicking()
  }, 200)
}

function requestTicking() {
  if (!isTicking) {
    requestAnimationFrame(updating)
  }

  isTicking = true
}

function updating() {
  const progressMax = lastDocumentHeight - lastWindowHeight
  const percent = Math.ceil((lastScrollingY / progressMax) * 100)

  if (percent <= 100) {
    setProgress(percent)
  }

  isTicking = false
}

function setHeights() {
  lastWindowHeight = window.innerHeight
  lastDocumentHeight = $(document).height()
}

function setCircleStyles() {
  const svgWidth = $progressCircle.parent().width();
  const radiusCircle = svgWidth / 2
  const borderWidth = isMobile() ? 2 : 3

  $progressCircle.parent().attr('viewBox', `0 0 ${svgWidth} ${svgWidth}`)
  $progressCircle.attr('stroke-width', borderWidth)
  $progressCircle.attr('r', radiusCircle - (borderWidth - 1))
  $progressCircle.attr('cx', radiusCircle)
  $progressCircle.attr('cy', radiusCircle)

  circumference = radiusCircle * 2 * Math.PI

  $progressCircle[0].style.strokeDasharray = `${circumference} ${circumference}`
  $progressCircle[0].style.strokeDashoffset = circumference
}

function setProgress(percent) {
  if (percent <= 100) {
    const offset = circumference - percent / 100 * circumference
    $progressCircle[0].style.strokeDashoffset = offset
  }
}

function prepareProgressCircle() {
  $progressCircle = $('.js-progress')

  setHeights()
  setCircleStyles()
  updating()

  setTimeout(() => {
    $progressCircle.parent().css('opacity', 1)
  }, 300)
}

/* Functions for Elastic Results */
function renderPost(item) {
  const img = document.querySelector('.m-hero__picture');
  const style = img.currentStyle || window.getComputedStyle(img, false);
  const fallbackImageUrl = style.backgroundImage.slice(4, -1).replace(/"/g, "");

  const postImgUrl = item.post_img_path ? item.post_img_path : fallbackImageUrl;
  const url = `https://buddyme.me/microposts/${item.id}`;

  return `
    <div class="m-recommended-slider__item">
      <article class="m-article-card post">
        <div class="m-article-card__picture" style="background-image: url(${postImgUrl});">

          <a href="${url}" class="m-article-card__picture-link" aria-label="Article"></a>
          <a href="${url}}" class="m-article-card__author js-tooltip" aria-label="Authors">
            <div style="background-image: url(${item.user_infos.avatar});"></div>
          </a>
        </div>

        <div class="m-article-card__info">
          <a href=${url} class="m-article-card__tag">${item.location}</a>

          <a href="${url}" class="m-article-card__info-link">
            <div>
              <h2 class="m-article-card__title js-article-card-title js-article-card-title-no-image" title="${item.title}">
                ${item.title}
              </h2>
              <div class="m-article-card__desc">${item.content}</div>
            </div>
          </a>
        </div>
      </article>
    </div>`;
}

function buildContainer(content) {
  return `
    <section class="m-recommended">
      <div class="l-wrapper in-recommended">
        <h3 class="m-section-title in-recommended">Aktuell auf BuddyMe</h3>
        <div class="m-recommended-articles">
          <div class="m-recommended-slider js-recommended-articles">
            ${content}
          </div>
        </div>
      </div>
    </section>`;
}

function triggerSlick(element) {
  $(element).find('.js-recommended-articles').slick({
      arrows: true,
      infinite: true,
      prevArrow: '<button class="m-icon-button filled in-recommended-articles slick-prev" aria-label="Previous"><span class="icon-arrow-left"></span></button>',
      nextArrow: '<button class="m-icon-button filled in-recommended-articles slick-next" aria-label="Next"><span class="icon-arrow-right"></span></button>',
      mobileFirst: true,
      responsive: [
        {
          breakpoint: 720,
          settings: {
            slidesToShow: 2
          }
        },
        {
          breakpoint: 1023,
          settings: {
            arrows: true,
            slidesToShow: 2
          }
        }
      ],
      rtl: isRTL()
    });
}
/* END Functions for Elastic Results */

$(document).ready(() => {
  $aosWrapper = $('.js-aos-wrapper')
  const $scrollButton = $('.js-scrolltop')
  const $loadComments = $('.js-load-comments')
  const $commentsIframe = $('.js-comments-iframe')
  const $recommendedArticles = $('.js-recommended-articles')
  const shortcodes = document.querySelectorAll('.shortcode');

  fitvids('.js-post-content')

  function adjustImageGallery() {
    const images = document.querySelectorAll('.kg-gallery-image img')

    for (var i = 0, len = images.length; i < len; i++) {
      const container = images[i].closest('.kg-gallery-image')
      const width = images[i].attributes.width.value
      const height = images[i].attributes.height.value
      const ratio = width / height
      container.style.flex = `${ratio} 1 0%`
    }
  }

  adjustImageGallery()
  adjustShare(1000)

  if ($recommendedArticles.length > 0) {
    $recommendedArticles.on('init', function () {
      prepareProgressCircle()

      shave('.js-article-card-title', 100)
      shave('.js-article-card-title-no-image', 250)
    })

    $recommendedArticles.slick({
      arrows: true,
      infinite: true,
      prevArrow: '<button class="m-icon-button filled in-recommended-articles slick-prev" aria-label="Previous"><span class="icon-arrow-left"></span></button>',
      nextArrow: '<button class="m-icon-button filled in-recommended-articles slick-next" aria-label="Next"><span class="icon-arrow-right"></span></button>',
      mobileFirst: true,
      responsive: [
        {
          breakpoint: 720,
          settings: {
            slidesToShow: 2
          }
        },
        {
          breakpoint: 1023,
          settings: {
            arrows: false,
            slidesToShow: 3
          }
        }
      ],
      rtl: isRTL()
    })
  }

  if (shortcodes.length > 0) {
    for (let i = 0; i < shortcodes.length; i++) {
      let c = shortcodes[i];
      const q = c.getAttribute('data-q');
      const city = c.getAttribute('data-city');
      const limit = c.getAttribute('data-limit');
      const type = c.getAttribute('data-type');

      const cityParam = city ? `&city=${city}` : '';
      const limitParam = limit ? `&limit=${limit}` : '';
      const typeParam = type ? `&type=${type}` : '';

      const url = `https://buddyme.me/s/blog.js?q=${q}${cityParam}${limitParam}${typeParam}`;

      fetch(url)
      .then((resp) => resp.json())
      .then(function(data) {
        const results = data[0].mixedResults;
        let posts = '';

        // console.log('data!!!!', results);
        for (let j = 0; j < results.length; j++) {
          const item = results[j];
          posts += renderPost(item);
        }
        // const html = renderPost();
        c.innerHTML = buildContainer(posts);
        triggerSlick(c);
      })
      .catch(function(error) {
        console.log(error);
      });
    }
  }

  $scrollButton.click(() => {
    $('html, body').animate({
      scrollTop: 0
    }, 500)
  })

  $loadComments.click(() => {
    $loadComments.parent().hide()
    $commentsIframe.fadeIn('slow')
  })

  $('.js-post-content').find('img').each(function() {
    if (!$(this).closest('figure').hasClass('kg-bookmark-card')) {
      $(this).addClass('js-zoomable')
    }

    const $figcaption = $(this).parent().find('figcaption')
    if ($figcaption) {
      $(this).attr('alt', $figcaption.text())
    } else {
      $(this).attr('alt', '')
    }
  })

  mediumZoom('.js-zoomable')

  window.addEventListener('scroll', onScrolling, { passive: true })
  window.addEventListener('resize', onResizing, { passive: true })
})

$(window).on('load', () => {
  prepareProgressCircle()
})
