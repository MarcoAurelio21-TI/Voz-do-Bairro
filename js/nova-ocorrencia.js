(function () {
    'use strict';

    const CLASSE_VISIVEL = 'anim-visivel';
    const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const CHAVE_STORAGE = 'ocorrenciasVozDoBairro';

    function observarAnimacoes() {
        const elementos = document.querySelectorAll('.anim-entrada');
        if (reduzMovimento || !('IntersectionObserver' in window)) {
            elementos.forEach(el => el.classList.add(CLASSE_VISIVEL));
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(CLASSE_VISIVEL);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        elementos.forEach(el => observer.observe(el));
    }

    function configurarScrollProgresso() {
        const barra = document.getElementById('scroll-progresso');
        if (!barra) return;
        const atualizar = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const progresso = max > 0 ? window.scrollY / max : 0;
            barra.style.transform = `scaleX(${Math.min(progresso, 1)})`;
        };
        window.addEventListener('scroll', atualizar, { passive: true });
        window.addEventListener('resize', atualizar);
        atualizar();
    }

    function configurarLogo() {
        const brasao = document.querySelector('.brasao');
        if (!brasao || reduzMovimento) return;
        brasao.addEventListener('click', () => {
            brasao.animate([
                { transform: 'rotate(0deg) scale(1)' },
                { transform: 'rotate(-15deg) scale(1.22)' },
                { transform: 'rotate(12deg) scale(1.12)' },
                { transform: 'rotate(0deg) scale(1)' }
            ], { duration: 700, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });
        });
    }

    function configurarMagneticos() {
        if (reduzMovimento) return;
        const btn = document.querySelector('.btn-enviar');
        if (!btn) return;
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const mx = e.clientX - rect.left - rect.width / 2;
            const my = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${mx * 0.15}px, ${my * 0.15}px)`;
        });
        btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    }

    function configurarBlobsParallax() {
        if (reduzMovimento) return;
        const blobs = document.querySelectorAll('.blob');
        if (!blobs.length) return;
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const y = window.scrollY;
                blobs.forEach((b, i) => {
                    b.style.translate = `0 ${y * (0.05 + i * 0.02)}px`;
                });
                ticking = false;
            });
        }, { passive: true });
    }

    function configurarContador() {
        const desc = document.getElementById('descricao');
        const cont = document.getElementById('contador-desc');
        if (!desc || !cont) return;
        const max = desc.maxLength;
        const atualizar = () => {
            cont.textContent = desc.value.length;
            cont.parentElement.classList.toggle('limite', desc.value.length >= max * 0.9);
        };
        desc.addEventListener('input', atualizar);
        atualizar();
    }

    /* ===================== CHECKBOX ANÔNIMO ===================== */
    function configurarAnonimo() {
        const chk = document.getElementById('anonimo');
        const grupoNome = document.getElementById('grupo-nome');
        const grupoContato = document.getElementById('grupo-contato');
        const campoNome = document.getElementById('nome');
        const campoContato = document.getElementById('contato');
        
        if (!chk || !grupoNome || !grupoContato || !campoNome || !campoContato) return;

        chk.addEventListener('change', () => {
            if (chk.checked) {
                // Limpa os campos e bloqueia
                campoNome.value = '';
                campoContato.value = '';
                
                grupoNome.classList.add('desabilitado');
                grupoContato.classList.add('desabilitado');
                
                campoNome.setAttribute('disabled', 'disabled');
                campoContato.setAttribute('disabled', 'disabled');
            } else {
                // Desbloqueia
                grupoNome.classList.remove('desabilitado');
                grupoContato.classList.remove('desabilitado');
                
                campoNome.removeAttribute('disabled');
                campoContato.removeAttribute('disabled');
            }
        });
    }

    function configurarUpload() {
        const input = document.getElementById('imagem');
        const container = document.getElementById('upload-container');
        const placeholder = document.getElementById('upload-placeholder');
        const previewContainer = document.getElementById('preview-container');
        const previewImg = document.getElementById('preview-imagem');
        const btnRemover = document.getElementById('btn-remover-img');

        if (!input || !container) return;

        let imagemBase64 = '';

        container.addEventListener('click', (e) => {
            if (e.target === btnRemover || btnRemover.contains(e.target)) return;
            input.click();
        });

        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            container.classList.add('drag-over');
        });
        container.addEventListener('dragleave', () => {
            container.classList.remove('drag-over');
        });
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.classList.remove('drag-over');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                input.files = e.dataTransfer.files;
                input.dispatchEvent(new Event('change'));
            }
        });

        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) {
                alert('A imagem deve ter no máximo 5MB.');
                input.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (evento) => {
                imagemBase64 = evento.target.result;
                previewImg.src = imagemBase64;
                placeholder.hidden = true;
                previewContainer.hidden = false;
            };
            reader.readAsDataURL(file);
        });

        btnRemover.addEventListener('click', (e) => {
            e.stopPropagation();
            input.value = '';
            imagemBase64 = '';
            previewImg.src = '';
            placeholder.hidden = false;
            previewContainer.hidden = true;
        });

        return () => imagemBase64;
    }

    /* ===================== VALIDAÇÃO + ENVIO ===================== */
    function configurarFormulario(getImagem) {
        const form = document.getElementById('form-ocorrencia');
        if (!form) return;
        const btn = form.querySelector('.btn-enviar');
        const toast = document.getElementById('toast');

        const mostrarErro = (campo, msg) => {
            campo.classList.add('erro');
            const span = form.querySelector(`[data-erro="${campo.id}"]`);
            if (span) { span.textContent = msg; span.classList.add('visivel'); }
        };
        const limparErro = (campo) => {
            campo.classList.remove('erro');
            const span = form.querySelector(`[data-erro="${campo.id}"]`);
            if (span) { span.textContent = ''; span.classList.remove('visivel'); }
        };

        form.querySelectorAll('input, select, textarea').forEach(campo => {
            campo.addEventListener('input', () => limparErro(campo));
            campo.addEventListener('change', () => limparErro(campo));
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let valido = true;

            const titulo = form.querySelector('#titulo');
            const categoria = form.querySelector('#categoria');
            const endereco = form.querySelector('#endereco');
            const descricao = form.querySelector('#descricao');
            const nome = form.querySelector('#nome');
            const contato = form.querySelector('#contato');
            const isAnonimo = form.querySelector('#anonimo').checked;

            if (!titulo.value.trim()) {
                mostrarErro(titulo, 'Informe o título da ocorrência.'); valido = false;
            }
            if (!categoria.value) {
                mostrarErro(categoria, 'Selecione uma categoria.'); valido = false;
            }
            if (!endereco.value.trim()) {
                mostrarErro(endereco, 'Informe o endereço ou localização.'); valido = false;
            }
            if (descricao.value.trim().length < 10) {
                mostrarErro(descricao, 'Descreva com pelo menos 10 caracteres.'); valido = false;
            }

            if (!valido) {
                const primeiro = form.querySelector('.erro');
                if (primeiro) primeiro.focus();
                return;
            }

            btn.classList.add('carregando');
            setTimeout(() => {
                btn.classList.remove('carregando');

                // Prepara o objeto salvando EXATAMENTE o que o usuário digitou
                const novaOcorrencia = {
                    id: Date.now(),
                    titulo: titulo.value.trim(),
                    categoria: categoria.value,
                    endereco: endereco.value.trim(),
                    descricao: descricao.value.trim(),
                    // Salva os campos. Se for anônimo, salva vazio.
                    nome: isAnonimo ? 'Anônimo' : (nome.value.trim() || 'Morador'),
                    contato: isAnonimo ? '' : contato.value.trim(),
                    data: new Date().toLocaleDateString('pt-BR'),
                    status: 'aberto',
                    imagem: getImagem() || ''
                };

                // Salva no localStorage
                const ocorrencias = JSON.parse(localStorage.getItem(CHAVE_STORAGE)) || [];
                ocorrencias.push(novaOcorrencia);
                localStorage.setItem(CHAVE_STORAGE, JSON.stringify(ocorrencias));

                toast.innerHTML = '<i class="fa-solid fa-circle-check"></i> Ocorrência enviada com sucesso!';
                toast.classList.add('visivel');
                
                setTimeout(() => {
                    toast.classList.remove('visivel');
                    window.location.href = './noticias.html';
                }, 1500);

                form.reset();
                document.getElementById('contador-desc').textContent = '0';
                document.getElementById('preview-container').hidden = true;
                document.getElementById('upload-placeholder').hidden = false;
                
                // Reseta a parte de anonimato
                document.getElementById('grupo-nome').classList.remove('desabilitado');
                document.getElementById('grupo-contato').classList.remove('desabilitado');
                form.querySelector('#nome').removeAttribute('disabled');
                form.querySelector('#contato').removeAttribute('disabled');
                form.querySelector('#anonimo').checked = false;

            }, 1200);
        });
    }

    function init() {
        observarAnimacoes();
        configurarScrollProgresso();
        configurarLogo();
        configurarMagneticos();
        configurarBlobsParallax();
        configurarContador();
        configurarAnonimo();
        
        const getImagem = configurarUpload();
        configurarFormulario(getImagem);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();