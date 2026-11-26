document.addEventListener('DOMContentLoaded', function () {
    const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ============================================================
    // BASE DE DADOS
    // ============================================================
    const NOTICIAS = window.NOTICIAS_VOZ_DO_BAIRRO || [];

    // Sanity check no console (abra o DevTools para conferir)
    console.log('[Acompanhamento] Total de notícias carregadas:', NOTICIAS.length);
    if (NOTICIAS.length) {
        const porCat = NOTICIAS.reduce((acc, n) => {
            const k = normalizar(n.categoria || 'outros');
            acc[k] = (acc[k] || 0) + 1;
            return acc;
        }, {});
        console.log('[Acompanhamento] Distribuição por categoria:', porCat);
    }

    const ROTULOS = {
        'alertas':   'Alertas',
        'seguranca': 'Segurança',
        'animais':   'Animais',
        'obras':     'Obras',
        'outros':    'Outros'
    };

    const IMG_FALLBACK = {
        'alertas':   'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&w=600&q=80',
        'seguranca': 'https://images.unsplash.com/photo-1555636222-cae831e670b3?auto=format&fit=crop&w=600&q=80',
        'animais':   'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
        'obras':     'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80',
        'outros':    'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&w=600&q=80'
    };

    // ============================================================
    // NORMALIZAÇÃO
    // ============================================================
    function normalizar(texto) {
        return String(texto || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    // ============================================================
    // CONTATO
    // ============================================================
    function obterInfoContato(contato) {
        if (!contato) return { icone: 'fa-solid fa-circle-info', rotulo: 'Contato' };
        if (contato.includes('@')) return { icone: 'fa-solid fa-envelope', rotulo: 'E-mail' };
        return { icone: 'fa-solid fa-phone', rotulo: 'Telefone' };
    }

    function formatarContato(contato) {
        if (!contato) return 'Não informado';
        if (contato.includes('@')) {
            return `<a href="mailto:${contato}" class="contato-link contato-email">
                        <i class="fa-solid fa-envelope"></i> ${contato}
                    </a>`;
        }
        const digits = contato.replace(/\D/g, '');
        return `<a href="https://wa.me/55${digits}" target="_blank" rel="noopener" class="contato-link contato-telefone">
                    <i class="fa-brands fa-whatsapp"></i> ${contato}
                </a>`;
    }

    // ============================================================
    // REVELAÇÃO AO SCROLL
    // ============================================================
    function observarAnimacoes() {
        const elementos = document.querySelectorAll('.anim-entrada:not(.anim-visivel)');
        if (!('IntersectionObserver' in window)) {
            elementos.forEach(el => el.classList.add('anim-visivel'));
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('anim-visivel');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        elementos.forEach(el => observer.observe(el));
    }

    // ============================================================
    // SCROLL PROGRESS
    // ============================================================
    function configurarScrollProgresso() {
        const barra = document.getElementById('scroll-progresso');
        if (!barra) return;
        function atualizar() {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const progresso = max > 0 ? window.scrollY / max : 0;
            barra.style.transform = 'scaleX(' + Math.min(progresso, 1) + ')';
        }
        window.addEventListener('scroll', atualizar, { passive: true });
        window.addEventListener('resize', atualizar);
        atualizar();
    }

    // ============================================================
    // LOGO
    // ============================================================
    function configurarLogo() {
        const brasao = document.querySelector('.brasao');
        if (!brasao) return;
        brasao.addEventListener('click', function () {
            brasao.animate([
                { transform: 'rotate(0deg) scale(1)' },
                { transform: 'rotate(-15deg) scale(1.22)' },
                { transform: 'rotate(12deg) scale(1.12)' },
                { transform: 'rotate(0deg) scale(1)' }
            ], { duration: 700, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });
        });
    }

    // ============================================================
    // TILT 3D
    // ============================================================
    function configurarTilt() {
        if (semMovimento) return;
        const elementos = document.querySelectorAll('.card-ocorrencia, .featured-news, .grid-item');
        elementos.forEach(function (el) {
            if (el.dataset.tiltBound) return;
            el.dataset.tiltBound = 'true';
            el.addEventListener('mousemove', function (e) {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centroX = rect.width / 2;
                const centroY = rect.height / 2;
                const rotX = ((y - centroY) / centroY) * -4;
                const rotY = ((x - centroX) / centroX) * 4;
                el.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
            });
            el.addEventListener('mouseleave', function () {
                el.style.transform = '';
            });
        });
    }

    // ============================================================
    // LINK DE DETALHES
    // ============================================================
    function gerarLinkDetalhes(oc) {
        const params = new URLSearchParams({
            id:        oc.id,
            titulo:    oc.titulo,
            categoria: oc.categoria,
            data:      oc.data,
            descricao: oc.descricao,
            img:       oc.imagem || '',
            bairro:    oc.bairro,
            autor:     oc.autor,
            contato:   oc.contato || '',
            status:    oc.status
        });
        return './detalhe-acompanhamento.html?' + params.toString();
    }

    // ============================================================
    // DESTAQUES LATERAIS
    // ============================================================
    function renderizarDestaques() {
        const container = document.getElementById('sidebar-destaques');
        if (!container) return;

        const destaquesIds = [20, 35, 15];
        const destaques = destaquesIds
            .map(id => NOTICIAS.find(n => n.id === id))
            .filter(Boolean);

        if (destaques.length === 0) {
            container.innerHTML = '<p class="feed-vazio">Sem destaques no momento.</p>';
            return;
        }

        let html = '';
        const principal = destaques[0];
        const imgPrincipal = principal.imagem || IMG_FALLBACK[normalizar(principal.categoria)] || IMG_FALLBACK.outros;
        html += `
            <div class="featured-news">
                <img src="${imgPrincipal}" alt="${principal.titulo}" loading="lazy">
                <div class="news-caption">
                    <p><strong>${principal.titulo}</strong><br>
                    ${principal.descricao.substring(0, 80)}... <a href="${gerarLinkDetalhes(principal)}">Saiba Mais</a></p>
                </div>
            </div>
        `;

        if (destaques.length > 1) {
            html += '<div class="photo-grid">';
            for (let i = 1; i < destaques.length; i++) {
                const item = destaques[i];
                const img = item.imagem || IMG_FALLBACK[normalizar(item.categoria)] || IMG_FALLBACK.outros;
                html += `
                    <div class="grid-item">
                        <img src="${img}" alt="${item.titulo}" loading="lazy">
                        <div class="caption">
                            <p><strong>${item.titulo}</strong><br>
                            ${item.descricao.substring(0, 60)}... <a href="${gerarLinkDetalhes(item)}">Saiba Mais</a></p>
                        </div>
                    </div>
                `;
            }
            html += '</div>';
        }

        container.innerHTML = html;
        setTimeout(() => configurarTilt(), 50);
    }

    // ============================================================
    // RENDERIZAR CARDS
    // ============================================================
    function renderizarCards() {
        const container = document.getElementById('lista-acompanhamento');
        if (!container) return;

        container.innerHTML = '';

        if (NOTICIAS.length === 0) {
            container.innerHTML = '<p class="feed-vazio">Nenhuma ocorrência registrada ainda. <a href="./nova-ocorrencia.html" style="color:var(--cor-primaria);font-weight:bold;">Seja o primeiro a registrar!</a></p>';
            atualizarContadores();
            return;
        }

        const basePath = window.location.pathname.replace(/[^/]*$/, '');
        const detailFile = 'detalhe-acompanhamento.html';

        NOTICIAS.forEach((oc, index) => {
            if (!oc || !oc.id) return;

            const catSlug = normalizar(oc.categoria || 'outros');
            const catLabel = ROTULOS[catSlug] || 'Outros';

            const imgSrc = oc.imagem || IMG_FALLBACK[catSlug] || IMG_FALLBACK.outros;
            const statusClass = oc.status === 'concluido'
                ? 'concluido'
                : (oc.status === 'andamento' ? 'andamento' : 'aberto');
            const statusLabel = oc.status === 'concluido'
                ? 'Concluída'
                : (oc.status === 'andamento' ? 'Em andamento' : 'Em aberto');

            const params = new URLSearchParams({
                id:        oc.id,
                titulo:    oc.titulo,
                categoria: oc.categoria,
                data:      oc.data,
                descricao: oc.descricao,
                img:       oc.imagem || '',
                bairro:    oc.bairro,
                autor:     oc.autor,
                contato:   oc.contato || '',
                status:    statusClass
            });
            const linkDetalhes = './' + detailFile + '?' + params.toString();

            const shareUrlAbs = window.location.origin + basePath + detailFile + '?' + params.toString();
            const urlShare = encodeURIComponent(shareUrlAbs);
            const textoShare = encodeURIComponent('Confira no Voz do Bairro: ' + oc.titulo);

            const infoContato = obterInfoContato(oc.contato);
            const linhaContato = oc.contato
                ? `<br><strong><i class="${infoContato.icone}" style="margin-right:4px;"></i>${infoContato.rotulo}:</strong> ${formatarContato(oc.contato)}`
                : '';

            const cardHTML = `
                <article class="card-ocorrencia anim-entrada anim-de-baixo"
                         data-status="${statusClass}"
                         data-categoria="${catSlug}"
                         data-categoria-label="${catLabel}"
                         style="transition-delay: ${(index % 6) * 100}ms;">
                    <div class="card-ocorrencia-foto">
                        <img src="${imgSrc}" alt="${oc.titulo}" loading="lazy"
                             onerror="this.onerror=null;this.src='${IMG_FALLBACK.outros}';">
                    </div>
                    <div class="card-ocorrencia-corpo">
                        <header class="card-ocorrencia-topo">
                            <span class="badge-categoria">${catLabel} · ${oc.bairro}</span>
                            <span class="badge-status status-${statusClass}">${statusLabel}</span>
                        </header>
                        <h3 class="card-ocorrencia-titulo">${oc.titulo}</h3>
                        <p class="card-ocorrencia-resumo">${oc.descricao}</p>
                        <footer class="card-ocorrencia-rodape">
                            <strong>Local:</strong> ${oc.bairro} <br>
                            <strong>Por:</strong> ${oc.autor} · ${oc.data}
                            ${linhaContato}
                        </footer>
                        <div class="card-acoes">
                            <a href="${linkDetalhes}" class="btn-acao-mini" style="width:auto; padding:0 10px; border-radius:4px; background:#f1f5f9; color:#334155; text-decoration:none; font-size:11px; font-weight:700;">Ver Detalhes</a>
                            <a href="https://wa.me/?text=${textoShare}%20${urlShare}" target="_blank" class="btn-acao-mini whatsapp" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
                            <a href="https://www.facebook.com/sharer/sharer.php?u=${urlShare}" target="_blank" class="btn-acao-mini facebook" title="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
                        </div>
                    </div>
                </article>
            `;
            container.insertAdjacentHTML('beforeend', cardHTML);
        });

        // 🔥 CONTADORES BASEADOS NO DOM RENDERIZADO — sempre batem
        atualizarContadores();

        setTimeout(() => {
            observarAnimacoes();
            configurarTilt();
        }, 100);

        configurarFiltros();
    }

    // ============================================================
    // ATUALIZA CONTADORES LENDO DO DOM (fonte da verdade)
    // ============================================================
    function atualizarContadores() {
        const container = document.getElementById('lista-acompanhamento');
        if (!container) return;

        const cards = container.querySelectorAll('.card-ocorrencia');
        const contar = (slug) => {
            if (!slug) return cards.length;
            return container.querySelectorAll(`.card-ocorrencia[data-categoria="${slug}"]`).length;
        };

        const setCount = (id, valor) => {
            const el = document.getElementById(id);
            if (el) el.textContent = valor;
        };

        const total = cards.length;
        const alertas = contar('alertas');
        const seguranca = contar('seguranca');
        const animais = contar('animais');
        const obras = contar('obras');
        const outros = contar('outros');

        setCount('count-todas', total);
        setCount('count-alertas', alertas);
        setCount('count-seguranca', seguranca);
        setCount('count-animais', animais);
        setCount('count-obras', obras);
        setCount('count-outros', outros);

        console.log('[Acompanhamento] Contadores renderizados →',
            { todas: total, alertas, seguranca, animais, obras, outros });
    }

    // ============================================================
    // FILTROS E BUSCA
    // ============================================================
    function configurarFiltros() {
        const container = document.getElementById('lista-acompanhamento');
        if (!container) return;

        const filtros = document.querySelectorAll('.filter-item');
        const inputBusca = document.getElementById('busca-ocorrencias');

        let aviso = document.getElementById('aviso-sem-resultados');
        if (!aviso) {
            aviso = document.createElement('p');
            aviso.id = 'aviso-sem-resultados';
            aviso.className = 'feed-vazio';
            aviso.style.display = 'none';
            aviso.textContent = 'Nenhuma ocorrência encontrada para este filtro.';
            container.parentNode.insertBefore(aviso, container.nextSibling);
        }

        function aplicarFiltro(filtro, termoBusca) {
            const cards = container.querySelectorAll('.card-ocorrencia');
            const buscaNorm = normalizar(termoBusca || '');
            const filtroNorm = normalizar(filtro || 'todas');
            let visiveis = 0;

            cards.forEach(function (card) {
                const cat = (card.getAttribute('data-categoria') || '').toLowerCase();
                const textoCard = normalizar(card.textContent);

                const passaCategoria = (filtroNorm === 'todas') || (cat === filtroNorm);
                const passaBusca = buscaNorm === '' || textoCard.includes(buscaNorm);

                if (passaCategoria && passaBusca) {
                    visiveis++;
                    card.style.display = 'flex';
                    card.classList.remove('anim-visivel');
                    void card.offsetWidth;
                    requestAnimationFrame(function () {
                        card.classList.add('anim-visivel');
                    });
                } else {
                    card.style.display = 'none';
                }
            });

            if (aviso) aviso.style.display = visiveis === 0 ? 'block' : 'none';
        }

        filtros.forEach(function (filtroEl) {
            filtroEl.addEventListener('click', function () {
                filtros.forEach(f => f.classList.remove('active'));
                filtroEl.classList.add('active');
                const filtro = filtroEl.getAttribute('data-filtro');
                aplicarFiltro(filtro, inputBusca ? inputBusca.value : '');
            });
        });

        if (inputBusca) {
            inputBusca.addEventListener('input', function (e) {
                const ativo = document.querySelector('.filter-item.active');
                const filtroAtivo = ativo ? ativo.getAttribute('data-filtro') : 'todas';
                aplicarFiltro(filtroAtivo, e.target.value);
            });
        }
    }

    // ============================================================
    // INIT
    // ============================================================
    function init() {
        observarAnimacoes();
        configurarScrollProgresso();
        configurarLogo();
        renderizarDestaques();
        renderizarCards();
    }

    init();
});