document.addEventListener('DOMContentLoaded', function() {

    // =========================================
    // 1. ANIMAÇÃO DA LOGO (clique)
    // =========================================
    const brasaoTopo = document.querySelector('.brasao');
    if (brasaoTopo) {
        brasaoTopo.addEventListener('click', () => {
            brasaoTopo.animate([
                { transform: 'rotate(0deg) scale(1)' },
                { transform: 'rotate(-15deg) scale(1.22)' },
                { transform: 'rotate(12deg) scale(1.12)' },
                { transform: 'rotate(0deg) scale(1)' }
            ], { duration: 500, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });
        });
    }

    // =========================================
    // 2. CARREGAR OCORRÊNCIAS DO LOCALSTORAGE
    // =========================================
    function carregarOcorrencias() {
        const gradeNoticias = document.getElementById('grade-noticias');
        if (!gradeNoticias) return;

        const ocorrencias = JSON.parse(localStorage.getItem('ocorrenciasVozDoBairro')) || [];
        if (ocorrencias.length === 0) return;

        ocorrencias.forEach((oc) => {
            const nomeCategoria = {
                'alertas': 'Alertas', 'seguranca': 'Segurança', 'animais': 'Animais', 'obras': 'Obras'
            }[oc.categoria] || 'Geral';

            let imgSrc = "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?q=80&w=600&auto=format&fit=crop"; 
            if (oc.categoria === 'animais') imgSrc = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600&auto=format&fit=crop";
            if (oc.categoria === 'obras') imgSrc = "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=600&auto=format&fit=crop";
            if (oc.categoria === 'seguranca') imgSrc = "https://images.unsplash.com/photo-1555636222-cae831e670b3?q=80&w=600&auto=format&fit=crop";

            const cardHTML = `
                <a href="./detalhes-noticia.html?id=reg-${oc.id}" class="card-noticia noticia-item novo-card card-clicavel" data-categoria="${oc.categoria}" data-bairro="${oc.endereco || 'Não informado'}">
                    <div class="foto-placeholder-pequena">
                        <img src="${imgSrc}" alt="${oc.titulo}" loading="lazy">
                    </div>
                    <div class="texto-card">
                        <span class="data">${nomeCategoria} &middot; ${oc.endereco || 'Geral'} &middot; ${oc.data}</span>
                        <h3>${oc.titulo}</h3>
                        <p style="font-size: 13px; color: #64748b; margin-top: 8px; line-height: 1.4;">
                            <strong>Local:</strong> ${oc.endereco}
                        </p>
                    </div>
                </a>
            `;
            gradeNoticias.insertAdjacentHTML('afterbegin', cardHTML);
        });
    }
    carregarOcorrencias();

    // =========================================
    // 3. LÓGICA DE CLIQUES NOS CARDS ESTÁTICOS
    // =========================================
    const cardsEstaticos = document.querySelectorAll('.noticia-item:not(.novo-card)');
    
    cardsEstaticos.forEach(card => {
        card.style.cursor = 'pointer';
        
        card.addEventListener('click', function() {
            const tituloElement = this.querySelector('h3') || this.querySelector('h2');
            const titulo = tituloElement ? tituloElement.innerText : 'Notícia sem título';
            const data = this.querySelector('.data') ? this.querySelector('.data').innerText : 'Data não informada';
            const descricaoElement = this.querySelector('p');
            const descricao = descricaoElement ? descricaoElement.innerText : "Leia mais sobre esta notícia em nosso mural.";
            const categoria = this.getAttribute('data-categoria') || 'geral';
            const bairro = this.getAttribute('data-bairro') || 'Centro';
            
            const imgElement = this.querySelector('img');
            const img = imgElement ? imgElement.src : "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?q=80&w=1000&auto=format&fit=crop";

            // Pega os nomes e contatos aleatórios que estão no HTML
            const autor = this.getAttribute('data-autor') || 'Redação Voz do Bairro';
            const contato = this.getAttribute('data-contato') || '';

            const url = `./detalhes-noticia.html?titulo=${encodeURIComponent(titulo)}&categoria=${encodeURIComponent(categoria)}&data=${encodeURIComponent(data)}&descricao=${encodeURIComponent(descricao)}&img=${encodeURIComponent(img)}&bairro=${encodeURIComponent(bairro)}&autor=${encodeURIComponent(autor)}&contato=${encodeURIComponent(contato)}`;
            window.location.href = url;
        });
    });

    // =========================================
    // 4. ANIMAÇÃO DE ENTRADA DOS CARDS
    // =========================================
    const noticias = Array.from(document.querySelectorAll('.noticia-item'));
    noticias.forEach((item, index) => {
        const delay = index < 10 ? 120 + index * 60 : 120;
        setTimeout(() => { item.classList.add('anim-entrada'); }, delay);
    });

    // =========================================
    // 5. FILTROS (ABAS + BUSCA)
    // =========================================
    const abas = Array.from(document.querySelectorAll('.aba'));
    const buscaInput = document.getElementById('campo-busca');
    const semResultados = document.querySelector('.sem-resultados');

    let filtroAtual = 'todas';
    let termoBusca = '';

    function normalizar(texto) {
        return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    const timeoutsPendentes = new Map();

    function aplicarFiltros() {
        const todosItens = Array.from(document.querySelectorAll('.noticia-item'));
        let visiveis = 0;

        todosItens.forEach(noticia => {
            const categoria = (noticia.getAttribute('data-categoria') || '').toLowerCase();
            const bairro = (noticia.getAttribute('data-bairro') || '').toLowerCase();
            const texto = normalizar(noticia.textContent);
            
            const textoBusca = texto + ' ' + normalizar(bairro);

            const passaCategoria = filtroAtual === 'todas' || filtroAtual === categoria;
            const passaBusca = termoBusca === '' || textoBusca.includes(termoBusca);
            const deveMostrar = passaCategoria && passaBusca;

            if (timeoutsPendentes.has(noticia)) {
                clearTimeout(timeoutsPendentes.get(noticia));
                timeoutsPendentes.delete(noticia);
            }

            if (deveMostrar) {
                visiveis++;
                noticia.style.display = 'flex';
                void noticia.offsetWidth;
                noticia.style.opacity = '1';
                noticia.style.transform = 'translateY(0) scale(1)';
            } else {
                noticia.style.opacity = '0';
                noticia.style.transform = 'translateY(10px) scale(0.98)';
                const t = setTimeout(() => {
                    noticia.style.display = 'none';
                    timeoutsPendentes.delete(noticia);
                }, 300);
                timeoutsPendentes.set(noticia, t);
            }
        });

        if (semResultados) {
            semResultados.hidden = visiveis > 0;
        }
    }

    abas.forEach(aba => {
        aba.addEventListener('click', () => {
            abas.forEach(a => a.classList.remove('ativa'));
            aba.classList.add('ativa');
            filtroAtual = (aba.getAttribute('data-filtro') || 'todas').toLowerCase();
            aplicarFiltros();
        });
    });

    if (buscaInput) {
        buscaInput.addEventListener('input', (e) => {
            termoBusca = normalizar(e.target.value.trim());
            aplicarFiltros();
        });
    }

    // =========================================
    // 6. EFEITO 3D E BRILHO NOS CARDS
    // =========================================
    const cardsParaTilt = document.querySelectorAll('.card-noticia, .caixa-vermelha');
    cardsParaTilt.forEach(el => {
        el.setAttribute('data-tilt', '');

        el.addEventListener('animationend', function onEntrada(e) {
            if (e.animationName === 'cardEntrada' || e.animationName === 'fadeUp') {
                el.classList.add('tilt-ativo');
                el.removeEventListener('animationend', onEntrada);
            }
        });

        setTimeout(() => el.classList.add('tilt-ativo'), 1200);

        el.addEventListener('mousemove', (e) => {
            if (!el.classList.contains('tilt-ativo')) return;
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return;

            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;

            el.style.setProperty('--tilt-x', (-py * 8).toFixed(2) + 'deg');
            el.style.setProperty('--tilt-y', (px * 8).toFixed(2) + 'deg');
            el.style.setProperty('--shine-x', ((px + 0.5) * 100).toFixed(1) + '%');
            el.style.setProperty('--shine-y', ((py + 0.5) * 100).toFixed(1) + '%');
        });

        el.addEventListener('mouseleave', () => {
            el.style.setProperty('--tilt-x', '0deg');
            el.style.setProperty('--tilt-y', '0deg');
        });
    });

    // =========================================
    // 7. BOTÕES MAGNÉTICOS
    // =========================================
    const botoesMagneticos = document.querySelectorAll('.btn-registrar-topo, .btn-entrar, .btn-branco');
    botoesMagneticos.forEach(el => {
        el.setAttribute('data-magnetic', '');
        el.addEventListener('mousemove', (e) => {
            const r = el.getBoundingClientRect();
            const mx = e.clientX - r.left - r.width / 2;
            const my = e.clientY - r.top - r.height / 2;
            el.style.setProperty('--mag-x', (mx * 0.3).toFixed(1) + 'px');
            el.style.setProperty('--mag-y', (my * 0.3).toFixed(1) + 'px');
        });
        el.addEventListener('mouseleave', () => {
            el.style.setProperty('--mag-x', '0px');
            el.style.setProperty('--mag-y', '0px');
        });
    });
});