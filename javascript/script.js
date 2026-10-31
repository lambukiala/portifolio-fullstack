(() => {
    'use strict';

    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Texto animado do hero ---------- */
    const roles = ['Técnico de TI', 'Dev Fullstack', 'Mobile Júnior'];
    const slider = $('#slider');
    let roleIndex = 0;

    function showRole() {
        if (!slider) return;
        const text = roles[roleIndex];
        slider.textContent = '';

        Array.from(text).forEach((char, i) => {
            const letter = document.createElement('span');
            letter.className = 'letter';
            letter.textContent = char === ' ' ? '\u00A0' : char;
            letter.style.animationDelay = `${i * 0.08}s`;
            slider.appendChild(letter);
        });

        roleIndex = (roleIndex + 1) % roles.length;
        slider.classList.remove('is-out');
        setTimeout(() => slider.classList.add('is-out'), 2600);
        setTimeout(showRole, 3000);
    }
    showRole();

    /* ---------- Menu mobile ---------- */
    const menu = $('#menu');
    const menuBtn = $('.menu-btn');
    const menuIcon = menuBtn ? $('i', menuBtn) : null;
    const desktopQuery = window.matchMedia('(min-width: 992px)');

    function setMenu(open) {
        if (!menu || !menuBtn) return;
        menu.classList.toggle('active', open);
        document.body.classList.toggle('no-scroll', open);
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
        if (menuIcon) menuIcon.className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    }

    if (menu && menuBtn) {
        menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('active')));
        // Fechar o menu ao escolher uma secção (antes ficava aberto a tapar a página)
        $$('a', menu).forEach(link => link.addEventListener('click', () => setMenu(false)));
        document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
        desktopQuery.addEventListener('change', e => { if (e.matches) setMenu(false); });
    }

    /* ---------- Link ativo conforme a secção visível ---------- */
    const navLinks = $$('.menu a');
    const sections = $$('main section[id]');

    if ('IntersectionObserver' in window && sections.length) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${entry.target.id}`) {
                        link.setAttribute('aria-current', 'true');
                    } else {
                        link.removeAttribute('aria-current');
                    }
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        sections.forEach(section => observer.observe(section));
    }

    /* ---------- ScrollReveal (só se a biblioteca carregou) ---------- */
    if (!reduceMotion && typeof ScrollReveal === 'function') {
        const sr = ScrollReveal({
            origin: 'bottom',
            distance: '40px',
            duration: 900,
            easing: 'ease-out',
            reset: false
        });
        sr.reveal('.hero-text', {});
        sr.reveal('.hero-img', { delay: 120 });
        sr.reveal('.heading, .about-text, .about-card', { interval: 100 });
        sr.reveal('.services-list, .portfolio-content, #contact_form', {});
    }

    /* ---------- Formulário de contacto (EmailJS) ---------- */
    const form = $('#contact_form');
    const statusEl = $('#form-status');
    const submitButton = $('#submit_Button');

    const EMAILJS_PUBLIC_KEY = 'pQTi7NYr9CCaALCim';
    const SERVICE_ID = 'service_k1hp6yg';
    const TEMPLATE_ID = 'template_rtxlllt';

    if (typeof emailjs !== 'undefined') {
        emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    }

    function notify(message, type) {
        if (statusEl) statusEl.textContent = message;
        if (typeof Toastify === 'function') {
            Toastify({
                text: message,
                duration: 4000,
                gravity: 'top',
                position: 'right',
                style: {
                    background: type === 'success' ? '#28a745' : '#dc3545',
                    color: '#f4f4f4'
                }
            }).showToast();
        }
    }

    if (form && submitButton) {
        const defaultLabel = submitButton.value;

        form.addEventListener('submit', async event => {
            event.preventDefault();

            // Campo-armadilha: só robôs o preenchem
            if (form.elements.website && form.elements.website.value) return;

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            if (typeof emailjs === 'undefined') {
                notify('Serviço de email indisponível. Tente novamente mais tarde.', 'error');
                return;
            }

            const formData = {
                name: form.elements.name.value.trim(),
                email: form.elements.email.value.trim(),
                number: form.elements.number.value.trim(),
                subject: form.elements.subject.value.trim(),
                message: form.elements.message.value.trim()
            };

            // Num <input type="submit"> o texto muda com .value (não com .textContent)
            submitButton.value = 'A enviar...';
            submitButton.disabled = true;

            try {
                await emailjs.send(SERVICE_ID, TEMPLATE_ID, formData);
                notify('E-mail enviado com sucesso!', 'success');
                form.reset();
            } catch (error) {
                console.error('Erro no envio', error);
                notify('Erro ao enviar e-mail!', 'error');
            } finally {
                submitButton.value = defaultLabel;
                submitButton.disabled = false;
            }
        });
    }
})();
