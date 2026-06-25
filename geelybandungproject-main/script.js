// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        if (this.getAttribute('href') !== '#') {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Form submission (UI message)
const form = document.getElementById('contactForm');
if (form) {
    const getOrCreateMsg = () => {
        let msg = form.querySelector('.form-message');
        if (!msg) {
            msg = document.createElement('div');
            msg.className = 'form-message';
            form.appendChild(msg);
        }
        return msg;
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const msg = getOrCreateMsg();
        msg.textContent = 'Terima kasih! Pesan Anda telah terkirim. Tim sales kami akan menghubungi segera.';
        msg.classList.add('visible');

        form.reset();

        window.clearTimeout(window.__geelyMsgTimeout);
        window.__geelyMsgTimeout = window.setTimeout(() => {
            msg.classList.remove('visible');
            msg.textContent = '';
        }, 4500);
    });
}

// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        const isActive = navLinks.classList.toggle('active');
        menuToggle.classList.toggle('is-active', isActive);
    });

    // close menu after click on link (mobile)
    navLinks.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('is-active');
            }
        });
    });
}

// Intersection Observer for Scroll Animations
const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

console.log('%cGeely Bandung Website Loaded Successfully', 'color: #d4d4d4; font-size: 14px;');