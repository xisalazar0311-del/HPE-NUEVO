// Initialize GSAP
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {

    // 1. Initial Load Animations
    const tl = gsap.timeline();

    // Fade in Sidebar - REMOVED to prevent visibility issues
    // The sidebar will now be visible immediately via CSS


    // Stagger in Nav Items
    tl.from('.nav-list li', {
        x: -20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
    }, "-=0.5");

    // Fade in Header
    tl.from('header', {
        y: -30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
    }, "-=0.8");

    // Stagger Main Content Sections (that are visible)
    tl.from('#scroll-container > section:first-child', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
    }, "-=0.6");


    // 2. Timeline Animation (History)
    // Animate the progress bar line in the history section when it comes into view
    gsap.utils.toArray('.timeline-item').forEach((item, i) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                containerAnimation: null, // Vertical scroll default
                scroller: '#scroll-container',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            delay: i * 0.1,
            ease: 'back.out(1.7)'
        });
    });

    // 3. Stagger Animations for Cards
        gsap.from(selector, {
            scrollTrigger: {
                trigger: selector,
                scroller: '#scroll-container',
                start: 'top 90%',
            },
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out'
        });
    

    // 3. Stagger Animations for Cards
    const animateGrid = (selector) => {
        gsap.from(selector, {
            scrollTrigger: {
                trigger: selector,
                scroller: '#scroll-container',
                start: 'top 90%',
                toggleActions: 'play none none reverse'
            },
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            clearProps: 'opacity' // Ensure opacity is cleared after animation just in case
        });
    };

    // Removed individual area-card animation to prevent conflicts with section animation
    // animateGrid('.area-card'); 
    animateGrid('.tech-card');
    animateGrid('.hero-card');

    // New: Animate entire sections that have the 'section-fade' class
    gsap.utils.toArray('.section-fade').forEach(section => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                scroller: '#scroll-container',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            y: 30,
            opacity: 0, // Animate from 0 to 1
            duration: 0.8,
            ease: 'power3.out'
        });
    });
    animateGrid('.tech-card');
    animateGrid('.hero-card');


    // 4. Tech Card Hover 3D Effect
    const techCards = document.querySelectorAll('.tech-card');

    techCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate rotation based on mouse position
            const xPct = (x / rect.width) - 0.5;
            const yPct = (y / rect.height) - 0.5;

            gsap.to(card, {
                rotationY: xPct * 10,
                rotationX: -yPct * 10,
                duration: 0.4,
                ease: 'power1.out',
                transformPerspective: 1000
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotationY: 0,
                rotationX: 0,
                duration: 0.6,
                ease: 'elastic.out(1, 0.6)'
            });
        });
    });


    // 5. Navbar Interaction
    const navItems = document.querySelectorAll('.nav-list li');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active from all
            navItems.forEach(n => n.classList.remove('active'));
            // Add active to click
            item.classList.add('active');

            // Optional: Animate the icon
            const icon = item.querySelector('i');
            if (icon) {
                gsap.fromTo(icon,
                    { scale: 0.8, rotation: -20 },
                    { scale: 1, rotation: 0, duration: 0.4, ease: 'back.out(2)' }
                );
            }
        });
    });

    // 6. AI Chat Simulation (Looping typing)
    const chatDots = document.querySelectorAll('.typing-indicator .dot');
    if (chatDots.length) {
        // CSS animation handles the infinite loop, but we could add random pauses here if needed
    }

    gsap.from(".chat-widget-premium", {
    y: 20,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
    delay: 0.4
    });

gsap.from(".ai-avatar", {
    scale: 0,
    opacity: 0,
    duration: 1,
    ease: "elastic.out(1, 0.6)",
    delay: 0.7
    });


});