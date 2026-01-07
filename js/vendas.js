/**
 * Módulo de Vendas e Relatórios
 * Responsável pelo processamento do histórico financeiro e estatísticas.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Inicialização do módulo de relatórios
    const initVendas = async () => {
        await renderEstatisticas();
        await renderTabelaVendas();
    };

    // Calcula e exibe os cards de resumo (Faturamento, Qtd Vendas, Ticket Médio)
    const renderEstatisticas = async () => {
        try {
            const vendas = await API.getVendas();
            const hoje = new Date().toLocaleDateString('pt-BR');
            
            // Filtra apenas as vendas ocorridas na data de hoje
            const vendasHoje = vendas.filter(v => {
                const dataVenda = new Date(v.data).toLocaleDateString('pt-BR');
                return dataVenda === hoje;
            });

            const faturamentoHoje = vendasHoje.reduce((acc, v) => acc + v.total, 0);
            const totalVendas = vendasHoje.length;
            const ticketMedio = totalVendas > 0 ? faturamentoHoje / totalVendas : 0;

            // Atualiza os elementos de interface
            const elFaturamento = document.getElementById('stat-hoje');
            const elContagem = document.getElementById('stat-vendas-hoje');
            const elTicket = document.getElementById('stat-ticket');

            if (elFaturamento) elFaturamento.innerText = Utils.formatCurrency(faturamentoHoje);
            if (elContagem) elContagem.innerText = totalVendas.toString();
            if (elTicket) elTicket.innerText = Utils.formatCurrency(ticketMedio);

        } catch (error) {
            Utils.log('VENDAS_ESTATISTICAS', error);
        }
    };

    // Renderiza a lista de vendas recentes na tabela
    const renderTabelaVendas = async () => {
        const tbody = document.getElementById('vendas-tbody');
        if (!tbody) return;

        try {
            const vendas = await API.getVendas();
            
            // Ordena para mostrar as vendas mais recentes primeiro
            const vendasOrdenadas = [...vendas].sort((a, b) => new Date(b.data) - new Date(a.data));

            if (vendasOrdenadas.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">Nenhuma venda registrada.</td></tr>';
                return;
            }

            tbody.innerHTML = vendasOrdenadas.map(venda => `
                <tr>
                    <td>#${venda.id.toString().slice(-6)}</td>
                    <td>${new Date(venda.data).toLocaleString('pt-BR')}</td>
                    <td><strong>${Utils.formatCurrency(venda.total)}</strong></td>
                    <td>
                        <span style="background: #f1f5f9; color: #475569; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">
                            ${venda.pagamento || 'Dinheiro'}
                        </span>
                    </td>
                    <td>
                        <button class="btn-edit" onclick="verDetalhesVenda('${venda.id}')" title="Ver Detalhes">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `).join('');

        } catch (error) {
            Utils.log('VENDAS_TABELA', error);
        }
    };

    // Função para exibir detalhes completos da venda, incluindo observações
    window.verDetalhesVenda = async (id) => {
        try {
            const vendas = await API.getVendas();
            const venda = vendas.find(v => String(v.id) === String(id));
            
            if (venda) {
                const listaItens = venda.itens.map(i => `• ${i.nome} (${i.quantidade}x)`).join('\n');
                const obs = venda.observacao && venda.observacao.trim() !== "" 
                            ? venda.observacao 
                            : "Nenhuma observação registrada.";

                const msg = `DETALHES DA VENDA #${id.toString().slice(-6)}\n` +
                            `------------------------------------------\n` +
                            `Data: ${new Date(venda.data).toLocaleString('pt-BR')}\n` +
                            `Pagamento: ${venda.pagamento || 'Dinheiro'}\n\n` +
                            `ITENS:\n${listaItens}\n\n` +
                            `OBSERVAÇÕES:\n${obs}\n\n` +
                            `------------------------------------------\n` +
                            `TOTAL: ${Utils.formatCurrency(venda.total)}`;
                
                alert(msg);
            }
        } catch (error) {
            Utils.log('VENDAS_DETALHES', error);
        }
    };

    // Escuta o evento de venda concluída no PDV para atualizar os relatórios em tempo real
    window.addEventListener('vendaFinalizada', initVendas);

    // Inicialização manual caso a aba de relatórios seja carregada
    initVendas();
});