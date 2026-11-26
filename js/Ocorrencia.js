(function () {
    'use strict';

    const CLASSE_VISIVEL   = 'anim-visivel';
    const PASSO_DELAY      = 130;

    const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* =========================================================
       ANIMAÇÃO BASE
       ========================================================= */
    function forcarReflow() { void document.body.offsetHeight; }

    function delayDoElemento(el) {
        let n = 0;
        el.classList.forEach(function (c) {
            const m = c.match(/^delay-(\d+)$/);
            if (m) n = parseInt(m[1], 10);
        });
        return n * PASSO_DELAY;
    }

    function revelarVarios(itens) {
        itens = itens.filter(function (i) { return !!i.el; });
        if (!itens.length) return;
        itens.forEach(function (item) {
            if (item.direcao && !item.el.classList.contains('anim-' + item.direcao)) {
                item.el.classList.add('anim-' + item.direcao);
            }
        });
        forcarReflow();
        itens.forEach(function (item) {
            if (typeof item.delay === 'number') {
                item.el.style.transitionDelay = item.delay + 'ms';
            }
            item.el.classList.add(CLASSE_VISIVEL);
        });
    }

    /* =========================================================
       IMAGENS FADE-IN
       ========================================================= */
    function ativarImagem(img) {
        if (!img || img.dataset.fadeAtivado) return;
        img.dataset.fadeAtivado = 'true';
        if (!img.hasAttribute('data-fade')) img.setAttribute('data-fade', '');
        function ok() {
            if (!img.classList.contains('img-carregada')) img.classList.add('img-carregada');
        }
        if (img.complete && img.naturalWidth > 0) {
            requestAnimationFrame(function () { requestAnimationFrame(ok); });
            return;
        }
        img.addEventListener('load', ok, { once: true });
        img.addEventListener('error', function () { setTimeout(ok, 100); }, { once: true });
        setTimeout(ok, 2000);
    }
    function animarImagensGerais() {
        document.querySelectorAll('img:not(.card-mural-foto)').forEach(ativarImagem);
    }

    /* =========================================================
       HEADER
       ========================================================= */
    function animarHeader() {
        const logo   = document.querySelector('.logo-container');
        const botoes = document.querySelector('.botoes-topo');
        const itens  = document.querySelectorAll('.menu li');
        if (logo)   logo.classList.add('header-anim');
        if (botoes) botoes.classList.add('header-anim');
        itens.forEach(function (li, i) {
            li.classList.add('header-anim-item');
            li.style.transitionDelay = (200 + i * 80) + 'ms';
        });
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                itens.forEach(function (li) { li.classList.add('header-visivel'); });
            });
        });
    }

    /* =========================================================
       BLOBS E SCROLL PROGRESS
       ========================================================= */
    function criarBlobs() {
        if (semMovimento || document.querySelector('.blobs-decor')) return;
        const wrap = document.createElement('div');
        wrap.className = 'blobs-decor';
        wrap.setAttribute('aria-hidden', 'true');
        wrap.innerHTML =
            '<span class="blob blob-1"></span><span class="blob blob-2"></span>' +
            '<span class="blob blob-3"></span><span class="blob blob-4"></span>';
        document.body.appendChild(wrap);
    }
    
    function criarProgresso() {
        if (document.querySelector('.scroll-progresso')) return;
        const barra = document.createElement('div');
        barra.className = 'scroll-progresso';
        barra.setAttribute('aria-hidden', 'true');
        document.body.appendChild(barra);
        let agendado = false;
        function atualizar() {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            barra.style.transform = 'scaleX(' + (h > 0 ? Math.min(window.scrollY / h, 1) : 0) + ')';
            agendado = false;
        }
        window.addEventListener('scroll', function () {
            if (!agendado) { requestAnimationFrame(atualizar); agendado = true; }
        }, { passive: true });
    }
    
    function parallaxBlobs() {
        if (semMovimento) return;
        const blobs = document.querySelectorAll('.blob');
        if (!blobs.length) return;
        let agendado = false;
        function atualizar() {
            const sy = window.scrollY;
            blobs.forEach(function (b, i) {
                b.style.translate = '0 ' + (sy * (0.1 + i * 0.05)).toFixed(1) + 'px';
            });
            agendado = false;
        }
        window.addEventListener('scroll', function () {
            if (!agendado) { requestAnimationFrame(atualizar); agendado = true; }
        }, { passive: true });
        atualizar();
    }

    /* =========================================================
       TILT E MAGNÉTICO
       ========================================================= */
    function configurarTilt(root) {
        if (semMovimento) return;
        (root || document).querySelectorAll('[data-tilt]:not([data-tilt-ready])').forEach(function (el) {
            el.dataset.tiltReady = 'true';
            const forca = parseFloat(el.dataset.tiltStrength) || 12;
            el.addEventListener('mousemove', function (e) {
                const r = el.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width  - 0.5;
                const py = (e.clientY - r.top)  / r.height - 0.5;
                el.style.setProperty('--tilt-x', (-py * forca).toFixed(2) + 'deg');
                el.style.setProperty('--tilt-y', ( px * forca).toFixed(2) + 'deg');
                el.style.setProperty('--shine-x', ((px + 0.5) * 100).toFixed(1) + '%');
                el.style.setProperty('--shine-y', ((py + 0.5) * 100).toFixed(1) + '%');
            });
            el.addEventListener('mouseleave', function () {
                el.style.setProperty('--tilt-x', '0deg');
                el.style.setProperty('--tilt-y', '0deg');
            });
        });
    }
    function configurarMagneticos() {
        if (semMovimento) return;
        document.querySelectorAll('[data-magnetic]').forEach(function (el) {
            el.addEventListener('mousemove', function (e) {
                const r = el.getBoundingClientRect();
                const mx = e.clientX - r.left - r.width  / 2;
                const my = e.clientY - r.top  - r.height / 2;
                el.style.setProperty('--mag-x', (mx * 0.3).toFixed(1) + 'px');
                el.style.setProperty('--mag-y', (my * 0.3).toFixed(1) + 'px');
            });
            el.addEventListener('mouseleave', function () {
                el.style.setProperty('--mag-x', '0px');
                el.style.setProperty('--mag-y', '0px');
            });
        });
    }
    function aplicarTiltMagneticos() {
        // Aplica em todos os cards novos e antigos
        document.querySelectorAll('.card-ocorrencia, .featured-news, .grid-item, .card-dica, .status-card').forEach(function (el) {
            if (!el.hasAttribute('data-tilt')) el.setAttribute('data-tilt', '');
            if (!el.dataset.tiltStrength) el.dataset.tiltStrength = '8';
        });
        document.querySelectorAll('.btn-register, .btn-abrir-mural, .btn-registrar-mural, .btn-entrar, .btn-registrar-topo')
            .forEach(function (el) { el.setAttribute('data-magnetic', ''); });
    }

    /* =========================================================
       FILTROS
       ========================================================= */
    function configurarFiltros() {
        const btns = document.querySelectorAll('.filtro-btn');
        const cards = document.querySelectorAll('.card-ocorrencia');
        btns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                btns.forEach(function (b) { b.classList.remove('ativo'); });
                btn.classList.add('ativo');
                const filtro = btn.dataset.filtro;
                cards.forEach(function (card) {
                    const cat = (card.querySelector('.badge-categoria')?.textContent || '').toLowerCase();
                    if (filtro === 'todas' || cat.includes(filtro)) {
                        card.style.display = '';
                        card.classList.remove(CLASSE_VISIVEL);
                        forcarReflow();
                        card.classList.add(CLASSE_VISIVEL);
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    /* =========================================================
       OBSERVAR SEÇÕES
       ========================================================= */
    const SECOES = [
        { seletor: '.secao-dicas',       direcao: 'de-baixo',   stagger: 100 },
        { seletor: '.secao-status',      direcao: 'de-baixo',   stagger: 100 },
        { seletor: '.secao-filtros',     direcao: 'de-baixo',   stagger: 110 },
        { seletor: '.secao-ocorrencias', direcao: 'de-baixo',   stagger: 120 },
        { seletor: '.rodape-escuro',     direcao: 'de-baixo',   stagger: 150 }
    ];

    function observarSecao(config) {
        const secao = document.querySelector(config.seletor);
        if (!secao) return;
        const elementos = secao.querySelectorAll('.anim-entrada');
        if (!elementos.length) return;
        function revelarSecao() {
            revelarVarios(Array.from(elementos).map(function (el, i) {
                const temDelay = /(^|\s)delay-\d+/.test(el.className);
                return {
                    el: el,
                    direcao: config.direcao,
                    delay: temDelay ? delayDoElemento(el) : i * config.stagger
                };
            }));
        }
        if (!('IntersectionObserver' in window)) { revelarSecao(); return; }
        const obs = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (e) {
                if (!e.isIntersecting) return;
                revelarSecao();
                obs.disconnect();
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
        obs.observe(secao);
    }

    /* =========================================================
       SCROLL SUAVE
       ========================================================= */
    function scrollSuave() {
        document.querySelectorAll('a[href^="#"]').forEach(function (a) {
            a.addEventListener('click', function (e) {
                const href = a.getAttribute('href');
                if (!href || href === '#') return;
                const destino = document.querySelector(href);
                if (!destino) return;
                e.preventDefault();
                destino.scrollIntoView({
                    behavior: semMovimento ? 'auto' : 'smooth',
                    block: 'start'
                });
            });
        });
    }

    /* =========================================================
       INICIALIZAÇÃO
       ========================================================= */
    function iniciar() {
        criarBlobs();
        criarProgresso();
        animarImagensGerais();
        animarHeader();
        SECOES.forEach(observarSecao);
        scrollSuave();
        parallaxBlobs();
        aplicarTiltMagneticos();
        configurarTilt();
        configurarMagneticos();
        configurarFiltros();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }
})();