const Vendas = {
    async init() {
        console.log('📈 Inicializando Relatórios...');
        await this.atualizarRelatorio();
    },

    async atualizarRelatorio() {
        try {
            const dados = await window.api.getRelatorios();
            
            // Preenche os cards de resumo com segurança (usando || 0)
            const statHoje = document.getElementById('stat-hoje');
            const statQtd = document.getElementById('stat-vendas-hoje');
            const statTicket = document.getElementById('stat-ticket');

            if (statHoje) statHoje.innerText = `R$ ${(dados.total_hoje || 0).toFixed(2)}`;
            if (statQtd) statQtd.innerText = dados.vendas_hoje || 0;
            
            const ticket = dados.vendas_hoje > 0 ? (dados.total_hoje / dados.vendas_hoje) : 0;
            if (statTicket) statTicket.innerText = `R$ ${ticket.toFixed(2)}`;

            this.renderizarTabela(dados.vendas);
        } catch (error) {
            console.error("Erro ao carregar relatórios:", error);
        }
    },

    renderizarTabela(vendas) {
        const tbody = document.getElementById('vendas-tbody');
        if (!tbody) return;

        if (!vendas || vendas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhuma venda hoje.</td></tr>';
            return;
        }

        tbody.innerHTML = vendas.map(v => `
            <tr>
                <td>#${v.id.toString().slice(-6)}</td>
                <td>${new Date(v.data).toLocaleTimeString('pt-BR')}</td>
                <td>R$ ${(v.total || 0).toFixed(2)}</td>
                <td style="text-transform: capitalize;">${v.pagamento.replace('_', ' ')}</td>
                <td><button class="btn-view" onclick="alert('Detalhes em breve')"><i class="fas fa-eye"></i></button></td>
            </tr>
        `).join('');
    }
};

window.Vendas = Vendas;