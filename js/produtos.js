/**
 * Módulo de Gestão de Produtos
 */
const Produtos = {
    async init() {
        this.cacheSelectors();
        this.bindEvents();
        await this.listarProdutos();
    },

    cacheSelectors() {
        this.tbody = document.getElementById('produtos-tbody');
        this.form = document.getElementById('form-produto');
        this.modal = document.getElementById('modal-produto');
        this.btnNovo = document.getElementById('btn-novo-produto');
    },

    bindEvents() {
        if (this.btnNovo) {
            this.btnNovo.onclick = () => this.abrirModal();
        }
        if (this.form) {
            this.form.onsubmit = (e) => this.handleSalvar(e);
        }
    },

    async listarProdutos() {
        const produtos = await window.api.getProdutos();
        if (!this.tbody) return;

        if (produtos.length === 0) {
            this.tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum produto cadastrado.</td></tr>';
            return;
        }

        this.tbody.innerHTML = produtos.map(p => `
            <tr>
                <td>${p.nome}</td>
                <td><span class="categoria-badge">${p.categoria}</span></td>
                <td>R$ ${parseFloat(p.preco).toFixed(2)}</td>
                <td>${p.estoque}</td>
                <td>${p.estoque > (p.estoque_minimo || 0) ? '✅ Ativo' : '⚠️ Baixo'}</td>
                <td>
                    <button class="btn-edit" onclick="Produtos.abrirModal(${p.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn-remove" onclick="Produtos.excluir(${p.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    },

    async abrirModal(id = null) {
        this.modal.classList.add('active');
        this.form.reset();
        document.getElementById('produto-id').value = '';

        if (id) {
            const produtos = await window.api.getProdutos();
            const p = produtos.find(item => item.id == id);
            document.getElementById('produto-id').value = p.id;
            document.getElementById('produto-nome').value = p.nome;
            document.getElementById('produto-categoria').value = p.categoria;
            document.getElementById('produto-preco').value = p.preco;
            document.getElementById('produto-estoque').value = p.estoque;
            document.getElementById('produto-estoque-minimo').value = p.estoque_minimo || 5;
        }
    },

    async handleSalvar(e) {
        e.preventDefault();
        const produto = {
            id: document.getElementById('produto-id').value,
            nome: document.getElementById('produto-nome').value,
            categoria: document.getElementById('produto-categoria').value,
            preco: parseFloat(document.getElementById('produto-preco').value),
            estoque: parseInt(document.getElementById('produto-estoque').value),
            estoque_minimo: parseInt(document.getElementById('produto-estoque-minimo').value)
        };

        await window.api.salvarProduto(produto);
        this.modal.classList.remove('active');
        await this.listarProdutos();
        if (window.PDV) window.PDV.carregarProdutos(); // Atualiza PDV se estiver aberto
    },

    async excluir(id) {
        if (confirm("Deseja realmente excluir este produto?")) {
            await window.api.excluirProduto(id);
            await this.listarProdutos();
        }
    }
};

window.Produtos = Produtos;