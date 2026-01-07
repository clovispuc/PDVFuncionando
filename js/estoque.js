/**
 * Módulo de Controle de Estoque
 */
const Estoque = {
    async init() {
        console.log('📦 Inicializando Controle de Estoque...');
        this.cacheSelectors();
        await this.renderizarEstoque();
    },

    cacheSelectors() {
        this.alertsContainer = document.getElementById('estoque-alerts');
        this.tbody = document.getElementById('movimentacoes-tbody');
    },

    async renderizarEstoque() {
        try {
            const produtos = await window.api.getProdutos();
            
            // 1. Renderiza Alertas de Estoque Baixo
            if (this.alertsContainer) {
                const baixos = produtos.filter(p => p.estoque <= (p.estoque_minimo || 5));
                
                if (baixos.length === 0) {
                    this.alertsContainer.innerHTML = '<div style="color: green; padding: 10px;"><i class="fas fa-check-circle"></i> Todos os níveis de estoque estão normais.</div>';
                } else {
                    this.alertsContainer.innerHTML = baixos.map(p => `
                        <div class="alert" style="background: #fff3cd; color: #856404; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 5px solid #ffc107; display: flex; justify-content: space-between; align-items: center;">
                            <span><i class="fas fa-exclamation-triangle"></i> O produto <strong>${p.nome}</strong> está com apenas <strong>${p.estoque}</strong> unidades.</span>
                            <button class="btn-primary" onclick="App.currentPage='produtos'; App.loadCurrentPage();" style="padding: 5px 10px; font-size: 12px;">Repor</button>
                        </div>
                    `).join('');
                }
            }

            // 2. Renderiza Tabela de "Situação Atual" (Como não temos logs ainda, mostra o saldo)
            if (this.tbody) {
                if (produtos.length === 0) {
                    this.tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">Nenhum produto cadastrado para monitorar.</td></tr>';
                    return;
                }

                this.tbody.innerHTML = produtos.map(p => `
                    <tr>
                        <td>${new Date().toLocaleDateString('pt-BR')}</td>
                        <td>${p.nome}</td>
                        <td><span class="categoria-badge">${p.categoria}</span></td>
                        <td style="font-weight: bold; color: ${p.estoque <= (p.estoque_minimo || 5) ? 'red' : 'inherit'}">${p.estoque}</td>
                        <td>Saldo Atual</td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error("Erro ao carregar estoque:", error);
        }
    }
};

window.Estoque = Estoque;