document.addEventListener('DOMContentLoaded', function() {
    const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ===================== HELPERS DE CONTATO ===================== */
    function obterInfoContato(contato) {
        if (!contato) return { icone: 'fa-solid fa-circle-info', rotulo: 'Contato' };
        if (contato.includes('@')) {
            return { icone: 'fa-solid fa-envelope', rotulo: 'E-mail' };
        }
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

    /* ===================== SCROLL PROGRESS ===================== */
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

    /* ===================== LOGO ===================== */
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

    /* ===================== REVELAÇÃO ===================== */
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

    /* ===================== RENDERIZA O DETALHE ===================== */
    function renderizarDetalhe() {
        const container = document.getElementById('conteudo-detalhe');
        if (!container) return;

        const params = new URLSearchParams(window.location.search);
        const idParam = params.get('id') || '';
        const id = parseInt(idParam.replace('reg-', ''), 10);

        const lista = window.NOTICIAS_VOZ_DO_BAIRRO || [];
        const noticia = lista.find(n => n.id === id);

        if (!noticia) {
            container.innerHTML = `
                <div class="erro-box">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <h2>Ocorrência não encontrada</h2>
                    <p>O link pode estar incorreto ou a ocorrência foi removida do mural.</p>
                    <a href="./acompanhamento.html">Voltar ao Acompanhamento</a>
                </div>
            `;
            return;
        }

        const catFormatada = {
            'alertas': 'Alertas', 'seguranca': 'Segurança',
            'animais': 'Animais', 'obras': 'Obras', 'outros': 'Outros'
        }[(noticia.categoria || 'outros').toLowerCase()] || 'Outros';

        const statusClass = noticia.status === 'concluido' ? 'concluido'
                          : noticia.status === 'andamento' ? 'andamento'
                          : 'aberto';
        const statusLabel = noticia.status === 'concluido' ? 'Concluída'
                          : noticia.status === 'andamento' ? 'Em andamento'
                          : 'Em aberto';

        const imagem = noticia.imagem || 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&w=1200&q=80';

        const urlAtual = encodeURIComponent(window.location.href);
        const textoShare = encodeURIComponent('Confira no Voz do Bairro: ' + noticia.titulo);

        const infoContato = obterInfoContato(noticia.contato);

        container.innerHTML = `
            <article class="detalhe-wrapper">
                <div class="detalhe-foto">
                    <img src="${imagem}" alt="${noticia.titulo}" loading="lazy"
                         onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&w=1200&q=80';">
                    <span class="detalhe-badge-status status-${statusClass}">${statusLabel}</span>
                </div>

                <div class="detalhe-corpo">
                    <div class="detalhe-meta">
                        <span class="badge-categoria">${catFormatada}</span>
                        <span class="meta-item"><i class="fa-solid fa-location-dot"></i> ${noticia.bairro}</span>
                        <span class="meta-item"><i class="fa-regular fa-calendar"></i> ${noticia.data}</span>
                    </div>

                    <h1 class="detalhe-titulo">${noticia.titulo}</h1>

                    <p class="detalhe-descricao">${noticia.descricao}</p>

                    <div class="detalhe-info-grid">
                        <div class="info-bloco">
                            <div class="info-label"><i class="fa-solid fa-user"></i> Registrado por</div>
                            <div class="info-valor">${noticia.autor || 'Anônimo'}</div>
                        </div>
                        <div class="info-bloco info-bloco-contato">
                            <div class="info-label">
                                <i class="${infoContato.icone}"></i> ${infoContato.rotulo}
                            </div>
                            <div class="info-valor">${formatarContato(noticia.contato)}</div>
                        </div>
                        <div class="info-bloco">
                            <div class="info-label"><i class="fa-solid fa-location-dot"></i> Bairro</div>
                            <div class="info-valor">${noticia.bairro}</div>
                        </div>
                        <div class="info-bloco">
                            <div class="info-label"><i class="fa-solid fa-circle-info"></i> Status</div>
                            <div class="info-valor">${statusLabel}</div>
                        </div>
                    </div>

                    <div class="detalhe-acoes">
                        <a class="btn-compartilhar whatsapp"
                           href="https://wa.me/?text=${textoShare}%20${urlAtual}"
                           target="_blank" rel="noopener">
                            <i class="fa-brands fa-whatsapp"></i> WhatsApp
                        </a>
                        <a class="btn-compartilhar facebook"
                           href="https://www.facebook.com/sharer/sharer.php?u=${urlAtual}"
                           target="_blank" rel="noopener">
                            <i class="fa-brands fa-facebook-f"></i> Facebook
                        </a>
                        <button class="btn-compartilhar copiar" id="btn-copiar" type="button">
                            <i class="fa-solid fa-link"></i> Copiar link
                        </button>
                    </div>
                </div>
            </article>
        `;

        // Copiar link
        const btnCopiar = document.getElementById('btn-copiar');
        if (btnCopiar) {
            btnCopiar.addEventListener('click', function () {
                const textoOriginal = btnCopiar.innerHTML;
                const url = window.location.href;
                const sucesso = () => {
                    btnCopiar.innerHTML = '<i class="fa-solid fa-check"></i> Link copiado!';
                    setTimeout(() => { btnCopiar.innerHTML = textoOriginal; }, 2000);
                };
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(url).then(sucesso).catch(() => {
                        alert('Não foi possível copiar. Copie manualmente: ' + url);
                    });
                } else {
                    const input = document.createElement('input');
                    input.value = url;
                    document.body.appendChild(input);
                    input.select();
                    try { document.execCommand('copy'); sucesso(); } catch (e) {}
                    document.body.removeChild(input);
                }
            });
        }

        observarAnimacoes();
    }

    /* ===================== INICIALIZAÇÃO ===================== */
    function init() {
        configurarScrollProgresso();
        configurarLogo();
        renderizarDetalhe();
    }

    init();
});