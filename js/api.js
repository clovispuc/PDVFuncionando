// js/api.js

const API = {
    /**
     * Inicializa o banco de dados apenas se estiver vazio.
     */
    dbInit() {
        if (!localStorage.getItem('pdv_produtos')) {
            localStorage.setItem('pdv_produtos', JSON.stringify([]));
        }
        if (!localStorage.getItem('pdv_vendas')) {
            localStorage.setItem('pdv_vendas', JSON.stringify([]));
        }
    },

    /**
     * LIMPA TODO O BANCO DE DADOS
     * Remove produtos e vendas e reinicializa os arrays.
     */
    async clearDatabase() {
        try {
            localStorage.removeItem('pdv_produtos');
            localStorage.removeItem('pdv_vendas');
            
            this.dbInit(); // Recria as estruturas vazias imediatamente
            console.log('✔ Banco de dados limpo com sucesso.');
            return true;
        } catch (error) {
            if (window.Utils && window.Utils.log) {
                window.Utils.log('API_CLEAR_DB', error);
            }
            return false;
        }
    },

    // Retorna a lista de produtos
    async getProdutos() {
        this.dbInit();
        const data = localStorage.getItem('pdv_produtos');
        return data ? JSON.parse(data) : [];
    },

    // Salva a lista completa de produtos
    async saveProdutos(produtos) {
        this.dbInit();
        localStorage.setItem('pdv_produtos', JSON.stringify(produtos));
        return true;
    },

    // Salva ou atualiza um único produto
    async salvarProduto(produto) {
        this.dbInit();
        const produtos = await this.getProdutos();
        
        if (produto.id) {
            const index = produtos.findIndex(p => String(p.id) === String(produto.id));
            if (index !== -1) {
                produtos[index] = produto;
            } else {
                produtos.push(produto);
            }
        } else {
            produto.id = Date.now().toString();
            produtos.push(produto);
        }
        
        return await this.saveProdutos(produtos);
    },

    // Remove um produto pelo ID
    async excluirProduto(id) {
        let produtos = await this.getProdutos();
        produtos = produtos.filter(p => String(p.id) !== String(id));
        return await this.saveProdutos(produtos);
    },

    // Retorna o histórico de todas as vendas
    async getVendas() {
        this.dbInit();
        const data = localStorage.getItem('pdv_vendas');
        return data ? JSON.parse(data) : [];
    },

    // Registra uma nova venda e baixa o estoque
    async salvarVenda(venda) {
        this.dbInit();
        const vendas = await this.getVendas();
        const produtos = await this.getProdutos();

        venda.itens.forEach(item => {
            const pIndex = produtos.findIndex(p => String(p.id) === String(item.id));
            if (pIndex !== -1) {
                produtos[pIndex].estoque -= item.quantidade;
            }
        });

        vendas.push({ 
            ...venda, 
            id: Date.now().toString(),
            data: venda.data || new Date().toISOString()
        });

        await this.saveProdutos(produtos);
        localStorage.setItem('pdv_vendas', JSON.stringify(vendas));
        return true;
    },

    // Retorna dados formatados para os relatórios
    async getRelatorios() {
        const vendas = await this.getVendas();
        const hoje = new Date().toLocaleDateString('pt-BR');
        
        const vendasHoje = vendas.filter(v => 
            new Date(v.data).toLocaleDateString('pt-BR') === hoje
        );

        return {
            total_hoje: vendasHoje.reduce((acc, v) => acc + v.total, 0),
            vendas_hoje: vendasHoje.length,
            vendas: [...vendasHoje].reverse()
        };
    }
};

window.API = API;