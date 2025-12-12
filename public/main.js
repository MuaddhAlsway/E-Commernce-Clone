let search = document.querySelector('.search-box');
let cart = document.querySelector('.cart');
let user = document.querySelector('.user');

document.querySelector('#search-icon').onclick = () => {
    search.classList.toggle('active')
    cart.classList.remove('active')
    user.classList.remove('active')

}

document.querySelector('#cart-icon').onclick = () => {
    cart.classList.toggle('active')
    search.classList.remove('active')
    user.classList.remove('active')

}

document.querySelector('#user-icon').onclick = () => {
    user.classList.toggle('active')
    search.classList.remove('active')
    cart.classList.remove('active')

}

  const swiper = new Swiper('.new-arrival', {
    // Optional parameters
    loop: true,
    speed: 800,
    slidesPerView: 3,
    spaceBetween: 20,

    // If you want pagination
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },

    // If you want navigation arrows
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },

    // If you want autoplay
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },

    // Responsive breakpoints
    breakpoints: {
      // when window width is >= 320px
      320: {
        slidesPerView: 1,
        spaceBetween: 10
      },
      // when window width is >= 768px
      768: {
        slidesPerView: 2,
        spaceBetween: 15
      },
      // when window width is >= 1024px
      1024: {
        slidesPerView: 3,
        spaceBetween: 20
      }
    }
  });
// Mobile Menu Toggle
let navbar = document.querySelector('.navbar');
let menuIcon = document.querySelector('#menu-icon');

menuIcon.onclick = () => {
    navbar.classList.toggle('active');
    search.classList.remove('active');
    cart.classList.remove('active');
    user.classList.remove('active');
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.navbar a').forEach(link => {
    link.onclick = () => {
        navbar.classList.remove('active');
    }
});

// Header scroll effect
window.addEventListener('scroll', () => {
    let header = document.querySelector('header');
    header.classList.toggle('sticky', window.scrollY > 0);
});

// Close all dropdowns when clicking outside
window.onclick = (e) => {
    if (!e.target.matches('#search-icon') && !e.target.closest('.search-box')) {
        search.classList.remove('active');
    }
    if (!e.target.matches('#cart-icon') && !e.target.closest('.cart')) {
        cart.classList.remove('active');
    }
    if (!e.target.matches('#user-icon') && !e.target.closest('.user')) {
        user.classList.remove('active');
    }
    if (!e.target.matches('#menu-icon') && !e.target.closest('.navbar')) {
        navbar.classList.remove('active');
    }
}