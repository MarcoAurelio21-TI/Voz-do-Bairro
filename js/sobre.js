(function () {
    'use strict';

    const CLASSE_VISIVEL = 'anim-visivel';
    const PASSO_DELAY = 130;
    const DURACAO_CONTADOR = 1500;
    const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Seções para aplicar o observer (igual ao inicio.js)
    const SECOES = [
        { seletor: '.secao-historia',    direcao: 'de-baixo', stagger: 110 },
        { seletor: '.secao-timeline',    direcao: 'de-baixo', stagger: 110 },
        { seletor: '.secao-mvv',         direcao: 'de-baixo', stagger: 110 },
        { seletor: '.secao-passos',      direcao: 'de-baixo', stagger: 110 },
        { seletor: '.secao-mural',       direcao: 'de-baixo', stagger: 110 },
        { seletor: '.secao-depoimentos', direcao: 'de-baixo', stagger: 130 },
        { seletor: '.secao-equipe',      direcao: 'de-baixo', stagger: 130 },
        { seletor: '.secao-faq',         direcao: 'de-baixo', stagger: 110 },
        { seletor: '.secao-voluntario',  direcao: 'de-baixo', stagger: 110 },
        { seletor: '.secao-cta',         direcao: 'de-baixo', stagger: 110 },
        { seletor: '.rodape-escuro',     direcao: 'de-baixo', stagger: 150 }
    ];

    // Funções utilitárias baseadas no inicio.js
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

    // --- ANIMAÇÃO HERO (Copiada do inicio.js) ---
    function animarHero() {
        const elements = [
            { sel: '.coluna-texto .tag', dir: 'de-baixo', delay: 100 },
            { sel: '.titulo-principal', dir: 'de-baixo', delay: 250 },
            { sel: '.descricao', dir: 'de-baixo', delay: 400 },
            { sel: '.botoes-acao', dir: 'de-baixo', delay: 550 },
            { sel: '.secao-numeros', dir: 'de-baixo', delay: 700 },
            { sel: '.coluna-imagem.anim-entrada-imagem', dir: 'especial', delay: 400 } // Animação CSS própria (zoomInFade)
        ];

        elements.forEach(function(item) {
            const el = document.querySelector(item.sel);
            if (!el) return;
            
            if (item.dir === 'especial') {
                setTimeout(() => el.classList.add(CLASSE_VISIVEL), item.delay);
            } else {
                setTimeout(() => revelarVarios([{ el: el, direcao: item.dir }]), item.delay);
            }
        });

        // Chama os contadores depois que o Hero aparece
        setTimeout(configurarContadores, 1000);
    }

    // --- OBSERVER DE SEÇÕES (Copiado do inicio.js) ---
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
        
        if (semMovimento || !('IntersectionObserver' in window)) { 
            revelarSecao(); 
            return; 
        }
        
        const obs = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (e) {
                if (!e.isIntersecting) return;
                revelarSecao();
                obs.disconnect();
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
        
        obs.observe(secao);
    }

    // --- TILT E MAGNÉTICO (Copiados do inicio.js) ---
    function configurarTilt() {
        if (semMovimento) return;
        document.querySelectorAll('[data-tilt]:not([data-tilt-ready])').forEach(function (el) {
            el.dataset.tiltReady = 'true';
            const forca = parseFloat(el.dataset.tiltStrength) || 10;
            const brilho = el.querySelector('.card-brilho');

            el.addEventListener('mousemove', function (e) {
                const r = el.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width  - 0.5;
                const py = (e.clientY - r.top)  / r.height - 0.5;
                
                el.style.setProperty('--tilt-x',  (-py * forca).toFixed(2) + 'deg');
                el.style.setProperty('--tilt-y',  ( px * forca).toFixed(2) + 'deg');
                
                if (brilho) {
                    brilho.style.setProperty('--shine-x', ((px + 0.5) * 100).toFixed(1) + '%');
                    brilho.style.setProperty('--shine-y', ((py + 0.5) * 100).toFixed(1) + '%');
                }
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
            if (el.dataset.magReady) return;
            el.dataset.magReady = 'true';
            
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

    // --- CONTADORES ---
    function configurarContadores() {
        const contadores = document.querySelectorAll('[data-contador]');
        if (!contadores.length) return;

        function animar(el) {
            const alvo = parseInt(el.dataset.contador, 10) || 0;
            const sufixo = el.dataset.sufixo || '';
            if (semMovimento) { el.textContent = alvo.toLocaleString('pt-BR') + sufixo; return; }
            
            const inicio = performance.now();
            function passo(agora) {
                const progresso = Math.min((agora - inicio) / DURACAO_CONTADOR, 1);
                const eased = 1 - Math.pow(1 - progresso, 3);
                el.textContent = Math.floor(eased * alvo).toLocaleString('pt-BR') + sufixo;
                
                if (progresso < 1) requestAnimationFrame(passo);
                else {
                    el.textContent = alvo.toLocaleString('pt-BR') + sufixo;
                    el.classList.add('stat-pulso');
                    setTimeout(() => el.classList.remove('stat-pulso'), 500);
                }
            }
            requestAnimationFrame(passo);
        }

        if (!('IntersectionObserver' in window)) { contadores.forEach(animar); return; }
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { animar(entry.target); obs.unobserve(entry.target); }
            });
        }, { threshold: 0.4 });
        contadores.forEach(c => obs.observe(c));
    }

    // --- PROGRESSO / BLOBS / FAQ ---
    function configurarScrollProgresso() {
        const barra = document.getElementById('scroll-progresso');
        if (!barra) return;
        let ticking = false;
        const atualizar = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const progresso = max > 0 ? window.scrollY / max : 0;
            barra.style.transform = `scaleX(${Math.min(progresso, 1)})`;
            ticking = false;
        };
        window.addEventListener('scroll', () => {
            if (!ticking) { requestAnimationFrame(atualizar); ticking = true; }
        }, { passive: true });
        atualizar();
    }

    function configurarBlobsParallax() {
        if (semMovimento) return;
        const blobs = document.querySelectorAll('.blob');
        if (!blobs.length) return;
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const y = window.scrollY;
                blobs.forEach((b, i) => { b.style.translate = `0 ${y * (0.05 + i * 0.025)}px`; });
                ticking = false;
            });
        }, { passive: true });
    }

    function configurarFAQ() {
        const itens = document.querySelectorAll('.faq-item');
        itens.forEach(item => {
            const botao = item.querySelector('.faq-pergunta');
            if (!botao) return;
            botao.addEventListener('click', () => {
                const jaAtivo = item.classList.contains('ativo');
                itens.forEach(i => {
                    i.classList.remove('ativo');
                    const b = i.querySelector('.faq-pergunta');
                    if (b) b.setAttribute('aria-expanded', 'false');
                });
                if (!jaAtivo) {
                    item.classList.add('ativo');
                    botao.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }

    // --- INIT GERAL ---
    function iniciar() {
        animarHero();
        SECOES.forEach(observarSecao);
        
        configurarTilt();
        configurarMagneticos();
        configurarScrollProgresso();
        configurarBlobsParallax();
        configurarFAQ();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }
})();