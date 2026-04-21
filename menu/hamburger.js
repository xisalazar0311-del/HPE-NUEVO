/**
 * HPE Menu - Mobile Hamburger Menu Controller
 * Shared script for all menu pages in /menu/
 * Handles sidebar open/close, overlay, and responsive behavior.
 */
(function () {
  'use strict';

  // Wait for DOM to be ready
  function init() {
    var sidebar = document.getElementById('sidebar');
    var mobileBtn = document.getElementById('mobileMenuBtn');
    var overlay = document.getElementById('menuOverlay');

    if (!sidebar || !mobileBtn) {
      console.warn('[Hamburger] Missing sidebar or mobileMenuBtn element.');
      return;
    }

    function closeSidebar() {
      sidebar.classList.remove('mobile-open');
      if (overlay) overlay.classList.remove('active');
      mobileBtn.classList.remove('is-active');
      document.body.style.overflow = '';
    }

    function openSidebar() {
      sidebar.classList.add('mobile-open');
      if (overlay) overlay.classList.add('active');
      mobileBtn.classList.add('is-active');
      document.body.style.overflow = 'hidden';
    }

    function toggleSidebar(e) {
      e.stopPropagation();
      if (sidebar.classList.contains('mobile-open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    }

    // Hamburger button click
    mobileBtn.addEventListener('click', toggleSidebar);

    // Overlay click closes sidebar
    if (overlay) {
      overlay.addEventListener('click', closeSidebar);
    }

    // Clicking a nav item closes the sidebar on mobile
    document.querySelectorAll('.nav-item, .nav-list li a, .nav-list li').forEach(function (item) {
      item.addEventListener('click', function () {
        // Don't close sidebar when clicking Companies (it toggles submenu)
        if (item.id === 'companiesBtn') return;
        if (window.innerWidth <= 768) {
          setTimeout(closeSidebar, 150);
        }
      });
    });

    // Close sidebar on resize to desktop
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (window.innerWidth > 768) {
          closeSidebar();
        }
      }, 100);
    });

    // Close sidebar on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sidebar.classList.contains('mobile-open')) {
        closeSidebar();
      }
    });

    // ========================
    // COMPANIES SUBMENU TOGGLE
    // ========================
    var companiesBtn = document.getElementById('companiesBtn');
    var companiesSubmenu = document.getElementById('companiesSubmenu');

    if (companiesBtn && companiesSubmenu) {
      companiesBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        companiesSubmenu.classList.toggle('open');
      });

      document.addEventListener('click', function (e) {
        if (!companiesBtn.contains(e.target) && !companiesSubmenu.contains(e.target)) {
          companiesSubmenu.classList.remove('open');
        }
      });

      // Handle submenu item clicks (data-url navigation)
      var submenuItems = document.querySelectorAll('.nav-submenu-item');
      submenuItems.forEach(function (item) {
        item.addEventListener('click', function (e) {
          e.stopPropagation();
          var url = item.getAttribute('data-url');
          if (url) {
            window.location.href = url;
          }
          companiesSubmenu.classList.remove('open');
        });
      });
    }

    // ========================
    // SIDEBAR FOOTER (Profile Popup)
    // ========================
    var footerBtn = document.getElementById('sidebarFooterBtn');
    var userPopup = document.getElementById('userMenuPopup');

    if (footerBtn && userPopup) {
      footerBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        userPopup.classList.toggle('active');
      });

      document.addEventListener('click', function (e) {
        if (!userPopup.contains(e.target) && !footerBtn.contains(e.target)) {
          userPopup.classList.remove('active');
        }
      });
    }
  }

  // Run init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
