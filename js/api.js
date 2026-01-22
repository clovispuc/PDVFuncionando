// js/api.js

const API = {
    /**
     * Inicializa o banco de dados.
     */
    dbInit() {
        if (!localStorage.getItem('pdv_produtos')) {
            localStorage.setItem('pdv_produtos', JSON.stringify([]));
        }
        if (!localStorage.getItem('pdv_vendas')) {
            localStorage.setItem('pdv_vendas', JSON.stringify([]));
        }
        if (!localStorage.getItem('pdv_caixa')) {
            localStorage.setItem('pdv_caixa', JSON.stringify({ aberto: false, sessaoId: null }));
        }
        if (!localStorage.getItem('pdv_sessoes')) {
            localStorage.setItem('pdv_sessoes', JSON.stringify([]));
        }
    },

    // --- PRODUTOS ---
    async getProdutos() {
        this.dbInit();
        const data = localStorage.getItem('pdv_produtos');
        return data ? JSON.parse(data) : [];
    },

    async saveProdutos(produtos) {
        this.dbInit();
        localStorage.setItem('pdv_produtos', JSON.stringify(produtos));
        return true;
    },

    async salvarProduto(produto) {
        this.dbInit();
        const produtos = await this.getProdutos();
        if (produto.id) {
            const index = produtos.findIndex(p => String(p.id) === String(produto.id));
            if (index !== -1) produtos[index] = produto;
            else produtos.push(produto);
        } else {
            produto.id = Date.now().toString();
            produtos.push(produto);
        }
        return await this.saveProdutos(produtos);
    },

    // --- VENDAS ---
    async getVendas() {
        this.dbInit();
        const data = localStorage.getItem('pdv_vendas');
        return data ? JSON.parse(data) : [];
    },

    async salvarVenda(venda) {
        this.dbInit();
        const caixa = await this.getCaixaStatus();
        if (!caixa.aberto) throw new Error("O caixa precisa estar aberto.");

        const vendas = await this.getVendas();
        const produtos = await this.getProdutos();

        // Baixa estoque local (mantendo compatibilidade)
        venda.itens.forEach(item => {
            const pIndex = produtos.findIndex(p => String(p.id) === String(item.id));
            if (pIndex !== -1) produtos[pIndex].estoque -= item.quantidade;
        });

        const novaVenda = { 
            ...venda, 
            id: Date.now().toString(),
            sessaoId: caixa.sessaoId,
            data: new Date().toISOString()
        };

        // Envia para o backend Flask para salvar no SQLite e imprimir
        try {
            await fetch('/vendas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novaVenda)
            });
        } catch (err) {
            console.error("Erro ao sincronizar com backend/impressora:", err);
        }

        vendas.push(novaVenda);
        await this.saveProdutos(produtos);
        localStorage.setItem('pdv_vendas', JSON.stringify(vendas));
        return novaVenda;
    },

    // --- GESTÃO DE CAIXA E SESSÕES (MELHORADO) ---
    async getCaixaStatus() {
        this.dbInit();
        return JSON.parse(localStorage.getItem('pdv_caixa'));
    },

    async getSessoes() {
        this.dbInit();
        return JSON.parse(localStorage.getItem('pdv_sessoes'));
    },

    async abrirCaixa(operador, valorInicial) {
        const sessaoId = Date.now().toString();
        const status = {
            aberto: true,
            sessaoId: sessaoId,
            operador: operador,
            saldoInicial: parseFloat(valorInicial) || 0,
            dataAbertura: new Date().toISOString()
        };
        localStorage.setItem('pdv_caixa', JSON.stringify(status));
        return status;
    },

    async fecharCaixa() {
        const caixaAtual = await this.getCaixaStatus();
        if (!caixaAtual.aberto) return;

        const vendas = await this.getVendas();
        const vendasDaSessao = vendas.filter(v => v.sessaoId === caixaAtual.sessaoId);
        const totalVendido = vendasDaSessao.reduce((acc, v) => acc + v.total, 0);

        // Arquiva a sessão para o relatório histórico
        const sessoes = await this.getSessoes();
        sessoes.push({
            ...caixaAtual,
            dataFechamento: new Date().toISOString(),
            totalVendas: totalVendido,
            qtdVendas: vendasDaSessao.length
        });

        localStorage.setItem('pdv_sessoes', JSON.stringify(sessoes));
        localStorage.setItem('pdv_caixa', JSON.stringify({ aberto: false, sessaoId: null }));
        return true;
    },

    // --- UTILITÁRIOS ---
    exportDatabase() {
        const data = {
            produtos: JSON.parse(localStorage.getItem('pdv_produtos')),
            vendas: JSON.parse(localStorage.getItem('pdv_vendas')),
            sessoes: JSON.parse(localStorage.getItem('pdv_sessoes')),
            caixa: JSON.parse(localStorage.getItem('pdv_caixa')),
            versao: "1.2"
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_pdv_${Date.now()}.json`;
        a.click();
    },

    async importDatabase(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = JSON.parse(e.target.result);
            localStorage.setItem('pdv_produtos', JSON.stringify(data.produtos || []));
            localStorage.setItem('pdv_vendas', JSON.stringify(data.vendas || []));
            localStorage.setItem('pdv_sessoes', JSON.stringify(data.sessoes || []));
            localStorage.setItem('pdv_caixa', JSON.stringify(data.caixa || { aberto: false }));
            location.reload();
        };
        reader.readAsText(file);
    }
};

window.API = API;