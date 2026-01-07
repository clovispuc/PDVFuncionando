/**
 * Módulo de Estoque
 * Responsável por monitorar níveis críticos e gerenciar entradas/saídas manuais.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Inicialização do módulo
    const initEstoque = async () => {
        await renderAlertasEstoque();
        await renderMovimentacoes();
    };

    // Renderiza alertas apenas de itens que estão abaixo do mínimo
    const renderAlertasEstoque = async () => {
        const alertaContainer = document.getElementById('estoque-alerts');
        if (!alertaContainer) return;

        try {
            const produtos = await API.getProdutos();
            const criticos = produtos.filter(p => p.estoque <= (p.estoqueMinimo || 5));

            if (criticos.length === 0) {
                alertaContainer.innerHTML = `
                    <div style="background: #ecfdf5; color: #065f46; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #10b981;">
                        <i class="fas fa-check-circle"></i> Níveis de estoque operando normalmente.
                    </div>
                `;
                return;
            }

            alertaContainer.innerHTML = criticos.map(p => `
                <div style="background: #fef2f2; color: #991b1b; padding: 12px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #f87171;">
                    <span>
                        <i class="fas fa-exclamation-triangle"></i> 
                        <strong>${p.nome}</strong> está crítico: ${p.estoque} unidades (Mínimo: ${p.estoqueMinimo})
                    </span>
                    <button onclick="realizarMovimentacaoManual('${p.id}', 'entrada')" 
                            style="background: #991b1b; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: 600;">
                        Repor Estoque
                    </button>
                </div>
            `).join('');
        } catch (error) {
            Utils.log('ESTOQUE_RENDER_ALERTAS', error);
        }
    };

    // Renderiza a tabela principal com todos os produtos e opções de ajuste
    const renderMovimentacoes = async () => {
        const tbody = document.getElementById('movimentacoes-tbody');
        if (!tbody) return;

        try {
            const produtos = await API.getProdutos();
            tbody.innerHTML = '';

            if (produtos.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:30px;">Nenhum produto cadastrado para gerenciar estoque.</td></tr>';
                return;
            }

            produtos.forEach(produto => {
                const isCritico = produto.estoque <= (produto.estoqueMinimo || 5);
                const tr = document.createElement('tr');
                
                tr.innerHTML = `
                    <td>${produto.nome}</td>
                    <td><span class="categoria-badge">${produto.categoria}</span></td>
                    <td style="font-weight: bold; color: ${isCritico ? '#ef4444' : '#1e293b'}">
                        ${produto.estoque} ${isCritico ? '<i class="fas fa-arrow-down"></i>' : ''}
                    </td>
                    <td>
                        <button class="btn-edit" onclick="realizarMovimentacaoManual('${produto.id}', 'entrada')" title="Entrada de Estoque" style="color: #10b981;">
                            <i class="fas fa-plus-circle"></i>
                        </button>
                        <button class="btn-edit" onclick="realizarMovimentacaoManual('${produto.id}', 'saida')" title="Saída Manual" style="color: #ef4444;">
                            <i class="fas fa-minus-circle"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            Utils.log('ESTOQUE_RENDER_TABELA', error);
        }
    };

    // Realiza Entrada ou Saída manual
    window.realizarMovimentacaoManual = async (id, tipo) => {
        try {
            const produtos = await API.getProdutos();
            const index = produtos.findIndex(p => String(p.id) === String(id));
            
            if (index === -1) return;

            const label = tipo === 'entrada' ? 'ENTRADA (Aumento)' : 'SAÍDA (Redução)';
            const qtdStr = prompt(`Informe a quantidade de ${label} para: ${produtos[index].nome}`);
            
            if (qtdStr === null) return; // Cancelou o prompt
            
            const qtd = parseInt(qtdStr);
            if (isNaN(qtd) || qtd <= 0) {
                alert('Por favor, informe um número válido e maior que zero.');
                return;
            }

            if (tipo === 'saida' && produtos[index].estoque < qtd) {
                alert('Operação negada: Estoque insuficiente para esta saída manual.');
                return;
            }

            // Atualiza o valor
            if (tipo === 'entrada') {
                produtos[index].estoque += qtd;
            } else {
                produtos[index].estoque -= qtd;
            }

            // Salva e atualiza interface
            await API.saveProdutos(produtos);
            Utils.showToast(`Estoque de ${produtos[index].nome} atualizado.`);
            
            // Notifica o sistema e atualiza a tela atual
            window.dispatchEvent(new CustomEvent('produtosUpdated'));
            await initEstoque();

        } catch (error) {
            Utils.log('ESTOQUE_AJUSTE_MANUAL', error);
            Utils.showToast('Erro ao processar ajuste.', 'error');
        }
    };

    // Escuta eventos de atualização global (como vendas no PDV)
    window.addEventListener('produtosUpdated', initEstoque);

    // Carga inicial
    initEstoque();
});