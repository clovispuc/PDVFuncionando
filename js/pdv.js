/**
 * PDV - Módulo de Vendas
 * Gerencia o carrinho e a exibição de produtos
 */
const PDV = {
    produtos: [],
    carrinho: [],
    filtroAtual: 'todos',

    async init() {
        console.log('🛒 Inicializando PDV...');
        this.cacheSelectors();
        this.bindEvents();
        await this.carregarProdutos();
    },

    cacheSelectors() {
        this.grid = document.getElementById('produtos-grid');
        this.carrinhoContainer = document.getElementById('carrinho-itens');
        this.searchInput = document.getElementById('search-produto');
        this.subtotalEl = document.getElementById('subtotal');
        this.totalEl = document.getElementById('total');
        this.btnFinalizar = document.getElementById('btn-finalizar');
        this.btnLimpar = document.getElementById('btn-limpar');
    },

    bindEvents() {
        // Busca em tempo real
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => this.filtrarProdutos(e.target.value));
        }

        // Filtros de categoria
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filtroAtual = e.target.dataset.filter;
                this.renderizarProdutos();
            });
        });

        // Finalizar Venda
        if (this.btnFinalizar) {
            this.btnFinalizar.addEventListener('click', () => this.finalizarVenda());
        }

        // Limpar Carrinho
        if (this.btnLimpar) {
            this.btnLimpar.addEventListener('click', () => {
                this.carrinho = [];
                this.renderizarCarrinho();
            });
        }
    },

    async carregarProdutos() {
        try {
            // Tenta buscar da API
            this.produtos = await window.api.getProdutos();
            console.log('Produtos carregados:', this.produtos);
            this.renderizarProdutos();
        } catch (error) {
            console.error('Erro ao carregar produtos no PDV:', error);
            if (this.grid) this.grid.innerHTML = '<p style="padding:20px; color:red;">Erro ao conectar com a base de dados.</p>';
        }
    },

    renderizarProdutos(lista = null) {
        if (!this.grid) return;

        const produtosParaExibir = lista || this.produtos.filter(p => {
            const matchesFiltro = this.filtroAtual === 'todos' || p.categoria === this.filtroAtual;
            return matchesFiltro;
        });

        if (produtosParaExibir.length === 0) {
            this.grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding:20px; color:#64748b;">Nenhum produto encontrado.</p>';
            return;
        }

        this.grid.innerHTML = produtosParaExibir.map(p => {
            const estoque = p.estoque || p.quantidade || 0;
            const isSemEstoque = estoque <= 0;
            
            return `
                <div class="produto-card ${isSemEstoque ? 'sem-estoque' : ''}" 
                     onclick="${isSemEstoque ? '' : `PDV.adicionarAoCarrinho(${p.id})`}">
                    <div class="categoria-badge">${p.categoria}</div>
                    <h4>${p.nome}</h4>
                    <p class="preco">R$ ${parseFloat(p.preco).toFixed(2)}</p>
                    <small class="${estoque < 5 ? 'estoque-critico' : ''}">Estoque: ${estoque}</small>
                </div>
            `;
        }).join('');
    },

    filtrarProdutos(termo) {
        const query = termo.toLowerCase();
        const filtrados = this.produtos.filter(p => 
            p.nome.toLowerCase().includes(query) && 
            (this.filtroAtual === 'todos' || p.categoria === this.filtroAtual)
        );
        this.renderizarProdutos(filtrados);
    },

    adicionarAoCarrinho(id) {
        const produto = this.produtos.find(p => p.id === id);
        if (!produto) return;

        const itemNoCarrinho = this.carrinho.find(item => item.id === id);

        if (itemNoCarrinho) {
            itemNoCarrinho.quantidade++;
        } else {
            this.carrinho.push({
                id: produto.id,
                nome: produto.nome,
                preco: produto.preco,
                quantidade: 1
            });
        }

        this.renderizarCarrinho();
    },

    removerDoCarrinho(id) {
        this.carrinho = this.carrinho.filter(item => item.id !== id);
        this.renderizarCarrinho();
    },

    renderizarCarrinho() {
        if (!this.carrinhoContainer) return;

        if (this.carrinho.length === 0) {
            this.carrinhoContainer.innerHTML = '<div class="carrinho-vazio"><i class="fas fa-cart-plus"></i><p>Selecione produtos para começar</p></div>';
            this.atualizarTotais();
            return;
        }

        this.carrinhoContainer.innerHTML = this.carrinho.map(item => `
            <div class="carrinho-item">
                <div class="item-info">
                    <strong>${item.nome}</strong><br>
                    <small>${item.quantidade}x R$ ${parseFloat(item.preco).toFixed(2)}</small>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <strong>R$ ${(item.quantidade * item.preco).toFixed(2)}</strong>
                    <button class="btn-remove" onclick="PDV.removerDoCarrinho(${item.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');

        this.atualizarTotais();
    },

    atualizarTotais() {
        const total = this.carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
        if (this.subtotalEl) this.subtotalEl.innerText = `R$ ${total.toFixed(2)}`;
        if (this.totalEl) this.totalEl.innerText = `R$ ${total.toFixed(2)}`;
    },

    async finalizarVenda() {
        if (this.carrinho.length === 0) {
            alert("O carrinho está vazio!");
            return;
        }

        const dadosVenda = {
            itens: this.carrinho,
            total: this.carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0),
            pagamento: document.getElementById('forma-pagamento').value,
            observacoes: document.getElementById('observacoes').value,
            data: new Date().toISOString()
        };

        try {
            const sucesso = await window.api.salvarVenda(dadosVenda);
            if (sucesso) {
                alert("Venda realizada com sucesso!");
                this.carrinho = [];
                this.renderizarCarrinho();
                await this.carregarProdutos(); // Atualiza o estoque na tela
            }
        } catch (error) {
            alert("Erro ao finalizar venda.");
        }
    }
};

// Expõe globalmente
window.PDV = PDV;