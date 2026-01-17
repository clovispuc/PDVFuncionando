/**
 * Módulo de Relatórios e Fluxo de Caixa
 * Responsável por listar as sessões de caixa por operador e detalhar os movimentos.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Inicialização do módulo de relatórios
    const initRelatorios = async () => {
        await renderEstatisticasGerais();
        await renderTabelaSessoes();
    };

    // Calcula estatísticas do dia (soma de todas as sessões de hoje)
    const renderEstatisticasGerais = async () => {
        try {
            const vendas = await API.getVendas();
            const hoje = new Date().toLocaleDateString('pt-BR');
            
            const vendasHoje = vendas.filter(v => {
                const dataVenda = new Date(v.data).toLocaleDateString('pt-BR');
                return dataVenda === hoje;
            });

            const faturamentoHoje = vendasHoje.reduce((acc, v) => acc + v.total, 0);
            const totalVendas = vendasHoje.length;
            const ticketMedio = totalVendas > 0 ? faturamentoHoje / totalVendas : 0;

            const elFaturamento = document.getElementById('stat-hoje');
            const elContagem = document.getElementById('stat-vendas-hoje');
            const elTicket = document.getElementById('stat-ticket');

            if (elFaturamento) elFaturamento.innerText = Utils.formatCurrency(faturamentoHoje);
            if (elContagem) elContagem.innerText = totalVendas.toString();
            if (elTicket) elTicket.innerText = Utils.formatCurrency(ticketMedio);

        } catch (error) {
            Utils.log('RELATORIO_ESTATISTICAS', error);
        }
    };

    // Renderiza a tabela de sessões de caixa (Turnos)
    const renderTabelaSessoes = async () => {
        const tbody = document.getElementById('vendas-tbody');
        if (!tbody) return;

        try {
            const sessoes = await API.getSessoes();
            const sessoesOrdenadas = [...sessoes].sort((a, b) => new Date(b.dataAbertura) - new Date(a.dataAbertura));

            if (sessoesOrdenadas.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">Nenhum histórico de caixa encontrado.</td></tr>';
                return;
            }

            tbody.innerHTML = sessoesOrdenadas.map(sessao => {
                const dataAbt = new Date(sessao.dataAbertura).toLocaleString('pt-BR');
                const statusSessao = sessao.dataFechamento ? 'Fechado' : 'Aberto';
                
                return `
                    <tr>
                        <td><strong>${sessao.operador}</strong></td>
                        <td>${dataAbt}</td>
                        <td>${Utils.formatCurrency(sessao.saldoInicial)}</td>
                        <td><strong style="color: #2563eb;">${Utils.formatCurrency(sessao.totalVendas || 0)}</strong></td>
                        <td>
                            <button class="btn-edit" onclick="verDetalhesSessao('${sessao.sessaoId}')" title="Ver Movimentação">
                                <i class="fas fa-list-check"></i> Ver Itens
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');

        } catch (error) {
            Utils.log('RELATORIO_TABELA_SESSOES', error);
        }
    };

    /**
     * Mostra todas as vendas e itens vendidos numa sessão específica
     */
    window.verDetalhesSessao = async (sessaoId) => {
        try {
            const sessoes = await API.getSessoes();
            const vendas = await API.getVendas();
            
            const sessao = sessoes.find(s => s.sessaoId === sessaoId);
            const vendasDaSessao = vendas.filter(v => v.sessaoId === sessaoId);

            if (!sessao) return;

            let relatorioTexto = `FLUXO DE CAIXA - OPERADOR: ${sessao.operador}\n`;
            relatorioTexto += `Abertura: ${new Date(sessao.dataAbertura).toLocaleString('pt-BR')}\n`;
            relatorioTexto += `Fundo Inicial: ${Utils.formatCurrency(sessao.saldoInicial)}\n`;
            relatorioTexto += `------------------------------------------\n\n`;

            if (vendasDaSessao.length === 0) {
                relatorioTexto += "Nenhuma venda realizada neste turno.";
            } else {
                vendasDaSessao.forEach((v, index) => {
                    relatorioTexto += `VENDA #${index + 1} - ${v.pagamento}\n`;
                    v.itens.forEach(item => {
                        relatorioTexto += `  > ${item.quantidade}x ${item.nome} (${Utils.formatCurrency(item.preco)})\n`;
                    });
                    if(v.observacao) relatorioTexto += `  Obs: ${v.observacao}\n`;
                    relatorioTexto += `  Subtotal: ${Utils.formatCurrency(v.total)}\n\n`;
                });
            }

            relatorioTexto += `------------------------------------------\n`;
            relatorioTexto += `TOTAL VENDIDO NO TURNO: ${Utils.formatCurrency(sessao.totalVendas || 0)}`;

            alert(relatorioTexto);

        } catch (error) {
            Utils.log('RELATORIO_DETALHES', error);
        }
    };

    // Listener para quando uma venda é finalizada ou caixa fechado
    window.addEventListener('vendaFinalizada', initRelatorios);
    
    // Inicia a renderização
    initRelatorios();
});