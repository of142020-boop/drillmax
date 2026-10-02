const fs = require('fs');
const path = require('path');

const layoutPath = path.join(__dirname, 'src', 'layouts', 'MainLayout.astro');
let content = fs.readFileSync(layoutPath, 'utf8');

// Add Mobile Menu Button
if (!content.includes('mobile-menu-btn')) {
  content = content.replace(
    '</nav>\n        <a href="/contact/" class="cta-header-btn">تواصل معنا</a>',
    `</nav>\n        <a href="/contact/" class="cta-header-btn hide-on-mobile">تواصل معنا</a>\n        <button class="mobile-menu-btn" aria-label="Toggle Menu">\n          <span></span>\n          <span></span>\n          <span></span>\n        </button>`
  );
}

// Add Scroll To Top and Floating Call Buttons
if (!content.includes('floating-call')) {
  content = content.replace(
    '<!-- Floating WhatsApp Button -->',
    `<!-- Floating Call Button -->\n    <a href="tel:01070046464" class="floating-call" aria-label="اتصل بنا">\n      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"/></svg>\n    </a>\n\n    <!-- Scroll to Top Button -->\n    <button class="scroll-to-top" aria-label="للأعلى" onclick="window.scrollTo({top: 0, behavior: 'smooth'})">\n      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor"><path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/></svg>\n    </button>\n\n    <!-- Floating WhatsApp Button -->`
  );
}

// Add CSS for Mobile Menu, Call, and Top button
if (!content.includes('.mobile-menu-btn {')) {
  const cssInjection = `
  /* Floating Buttons */
  .floating-call {
    position: fixed;
    bottom: 90px;
    left: 20px;
    width: 60px;
    height: 60px;
    background-color: var(--primary);
    color: white;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    z-index: 1000;
    transition: transform 0.3s ease;
  }
  .floating-call svg { width: 25px; height: 25px; }
  .floating-call:hover { transform: scale(1.1); }

  .scroll-to-top {
    position: fixed;
    bottom: 160px;
    left: 20px;
    width: 50px;
    height: 50px;
    background-color: var(--header-bg);
    color: white;
    border: none;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    z-index: 1000;
    cursor: pointer;
    transition: all 0.3s ease;
    opacity: 0;
    visibility: hidden;
  }
  .scroll-to-top.visible {
    opacity: 1;
    visibility: visible;
  }
  .scroll-to-top svg { width: 20px; height: 20px; }
  .scroll-to-top:hover { background-color: var(--primary); }

  /* Mobile Responsive */
  .mobile-menu-btn {
    display: none;
    flex-direction: column;
    gap: 6px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 10px;
  }
  .mobile-menu-btn span {
    display: block;
    width: 30px;
    height: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 2px;
  }
  .hide-on-mobile { display: block; }

  @media (max-width: 992px) {
    .top-bar-contact {
      flex-direction: column;
      gap: 10px;
      align-items: center;
      width: 100%;
    }
    .top-bar-contact span { font-size: 0.9rem; }
    .hide-on-mobile { display: none !important; }
    .mobile-menu-btn { display: flex; }

    .header-container {
      position: relative;
    }
    .main-nav {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background-color: var(--header-bg);
      flex-direction: column;
      display: none;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      z-index: 999;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    .main-nav.active {
      display: flex;
    }
    .main-nav ul {
      flex-direction: column;
      width: 100%;
    }
    .main-nav ul li {
      width: 100%;
      text-align: center;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .main-nav ul li a {
      display: block;
      padding: 15px;
    }
    .footer-content {
      flex-direction: column;
      text-align: center;
      gap: 30px;
    }
  }
</style>
`;
  content = content.replace('</style>', cssInjection);
}

// Add JS for toggling menu and scroll to top
if (!content.includes('const scrollBtn')) {
  const jsInjection = `
<script>
  document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.main-nav');
    if (menuBtn && nav) {
      menuBtn.addEventListener('click', () => {
        nav.classList.toggle('active');
        
        // Animate hamburger
        const spans = menuBtn.querySelectorAll('span');
        if (nav.classList.contains('active')) {
          spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
          spans[1].style.opacity = '0';
          spans[2].style.transform = 'rotate(-45deg) translate(6px, -7px)';
        } else {
          spans[0].style.transform = 'none';
          spans[1].style.opacity = '1';
          spans[2].style.transform = 'none';
        }
      });
    }

    // Scroll to Top
    const scrollBtn = document.querySelector('.scroll-to-top');
    if (scrollBtn) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
          scrollBtn.classList.add('visible');
        } else {
          scrollBtn.classList.remove('visible');
        }
      });
    }
  });
</script>
</body>
`;
  content = content.replace('</body>', jsInjection);
}

fs.writeFileSync(layoutPath, content, 'utf8');
console.log('✅ MainLayout updated with responsive design and floating buttons.');
