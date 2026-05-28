// JavaScript Principal du Portfolio de Volonté Mukovi

document.addEventListener('DOMContentLoaded', () => {
    // Initialiser les icônes Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    initNavbarScroll();
    initMobileMenu();
    initTypewriter();
    initScrollAnimations();
    initContactForm();
});

/* ==========================================================================
   1. NAVIGATION & EFFET DE DÉFILEMENT (SCROLL)
   ========================================================================== */
function initNavbarScroll() {
    const header = document.querySelector('header');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        // Changement de style du header au scroll
        if (window.scrollY > 50) {
            header.classList.add('glass-nav', 'shadow-md', 'py-3');
            header.classList.remove('py-5', 'border-transparent');
        } else {
            header.classList.remove('glass-nav', 'shadow-md', 'py-3');
            header.classList.add('py-5', 'border-transparent');
        }

        // Scroll Spy : Détecter la section active
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('text-indigo-600', 'font-semibold');
            link.classList.add('text-slate-600');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('text-indigo-600', 'font-semibold');
                link.classList.remove('text-slate-600');
            }
        });
    });
}

/* ==========================================================================
   2. MENU MOBILE
   ========================================================================== */
function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuLinks = mobileMenu?.querySelectorAll('a');

    if (!menuBtn || !mobileMenu) return;

    menuBtn.addEventListener('click', () => {
        const isHidden = mobileMenu.classList.contains('hidden');
        if (isHidden) {
            mobileMenu.classList.remove('hidden');
            mobileMenu.classList.add('flex');
            // Animation d'ouverture
            setTimeout(() => {
                mobileMenu.classList.remove('opacity-0', '-translate-y-4');
            }, 10);
        } else {
            closeMenu();
        }
    });

    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    function closeMenu() {
        mobileMenu.classList.add('opacity-0', '-translate-y-4');
        setTimeout(() => {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('flex');
        }, 300);
    }
}

/* ==========================================================================
   3. MACHINE À ÉCRIRE (TYPEWRITER)
   ========================================================================== */
function initTypewriter() {
    const typewriterElement = document.getElementById('typewriter');
    if (!typewriterElement) return;

    const words = [
        "Développeur Python / Django",
        "Développeur React.js",
        "Créateur de Solutions IoT (Arduino)",
        "Directeur Technique @ Innovation Group",
        "Étudiant en Informatique @ UNILUK"
    ];
    
    let wordIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let delay = 100;

    function type() {
        const currentWord = words[wordIdx];
        
        if (isDeleting) {
            typewriterElement.textContent = currentWord.substring(0, charIdx - 1);
            charIdx--;
            delay = 50; // Efface plus vite
        } else {
            typewriterElement.textContent = currentWord.substring(0, charIdx + 1);
            charIdx++;
            delay = 120; // Vitesse d'écriture normale
        }

        // Fin de l'écriture d'un mot
        if (!isDeleting && charIdx === currentWord.length) {
            isDeleting = true;
            delay = 1800; // Temps de pause avant effacement
        } 
        // Fin de l'effacement d'un mot
        else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            wordIdx = (wordIdx + 1) % words.length;
            delay = 400; // Pause avant le mot suivant
        }

        setTimeout(type, delay);
    }

    type();
}

/* ==========================================================================
   4. ANIMATIONS AU DÉFILEMENT (INTERSECTION OBSERVER)
   ========================================================================== */
function initScrollAnimations() {
    const fadeElements = document.querySelectorAll('.section-fade-in');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optionnel : arrêter d'observer une fois affiché
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => {
        observer.observe(el);
    });
}

/* ==========================================================================
   5. FORMULAIRE DE CONTACT
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const toast = document.getElementById('success-toast');
    
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Simuler le chargement d'envoi
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg> Envoi en cours...
        `;

        setTimeout(() => {
            // Rétablir le bouton
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            
            // Afficher le toast de succès
            if (toast) {
                toast.classList.remove('hidden', 'opacity-0', 'translate-y-4');
                toast.classList.add('flex', 'opacity-100', 'translate-y-0');
                
                // Masquer le toast après 5 secondes
                setTimeout(() => {
                    toast.classList.add('opacity-0', 'translate-y-4');
                    setTimeout(() => {
                        toast.classList.add('hidden');
                        toast.classList.remove('flex');
                    }, 300);
                }, 5000);
            }
            
            form.reset();
        }, 1800);
    });
}
