const api = {
    // Inicializa o banco de dados apenas se estiver vazio
    dbInit() {
        if (!localStorage.getItem('pdv_produtos')) {
            localStorage.setItem('pdv_produtos', JSON.stringify([]));
        }
        if (!localStorage.getItem('pdv_vendas')) {
            localStorage.setItem('pdv_vendas', JSON.stringify([]));
        }
    },

    async getProdutos() {
        this.dbInit();
        return JSON.parse(localStorage.getItem('pdv_produtos'));
    },

    async salvarProduto(produto) {
        this.dbInit();
        const produtos = JSON.parse(localStorage.getItem('pdv_produtos'));
        
        if (produto.id) {
            const index = produtos.findIndex(p => p.id == produto.id);
            if (index !== -1) produtos[index] = produto;
        } else {
            produto.id = Date.now();
            produtos.push(produto);
        }
        
        localStorage.setItem('pdv_produtos', JSON.stringify(produtos));
        return true;
    },

    async excluirProduto(id) {
        let produtos = JSON.parse(localStorage.getItem('pdv_produtos'));
        produtos = produtos.filter(p => p.id != id);
        localStorage.setItem('pdv_produtos', JSON.stringify(produtos));
        return true;
    },

    async salvarVenda(venda) {
        this.dbInit();
        const vendas = JSON.parse(localStorage.getItem('pdv_vendas'));
        const produtos = JSON.parse(localStorage.getItem('pdv_produtos'));

        // Atualiza o estoque no banco
        venda.itens.forEach(item => {
            const pIndex = produtos.findIndex(p => p.id === item.id);
            if (pIndex !== -1) {
                produtos[pIndex].estoque -= item.quantidade;
            }
        });

        vendas.push({ ...venda, id: Date.now() });
        localStorage.setItem('pdv_vendas', JSON.stringify(vendas));
        localStorage.setItem('pdv_produtos', JSON.stringify(produtos));
        return true;
    },

    async getRelatorios() {
        this.dbInit();
        const vendas = JSON.parse(localStorage.getItem('pdv_vendas'));
        const hoje = new Date().toLocaleDateString('pt-BR');
        
        const vendasHoje = vendas.filter(v => 
            new Date(v.data).toLocaleDateString('pt-BR') === hoje
        );

        return {
            total_hoje: vendasHoje.reduce((acc, v) => acc + v.total, 0),
            vendas_hoje: vendasHoje.length,
            vendas: vendasHoje.reverse()
        };
    }
};

window.api = api;