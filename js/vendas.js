/**
 * Módulo de Relatórios e Exportação
 * Responsável por listar sessões e exportar dados para Excel.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Inicialização do módulo
    const initRelatorios = async () => {
        await renderEstatisticasGerais();
        await renderTabelaSessoes();
    };

    // Estatísticas do topo da página
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
            Utils.log('REL_ESTATS', error);
        }
    };

    // Tabela principal de sessões (Resumo)
    const renderTabelaSessoes = async () => {
        const tbody = document.getElementById('vendas-tbody');
        if (!tbody) return;

        try {
            const sessoes = await API.getSessoes();
            const sessoesOrdenadas = [...sessoes].sort((a, b) => new Date(b.dataAbertura) - new Date(a.dataAbertura));

            if (sessoesOrdenadas.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">Nenhum histórico de caixa.</td></tr>';
                return;
            }

            tbody.innerHTML = sessoesOrdenadas.map(sessao => {
                const dataAbt = new Date(sessao.dataAbertura).toLocaleString('pt-BR');
                return `
                    <tr>
                        <td><strong>${sessao.operador || 'Sistema'}</strong></td>
                        <td>${dataAbt}</td>
                        <td>${Utils.formatCurrency(sessao.saldoInicial)}</td>
                        <td><strong style="color: #2563eb;">${Utils.formatCurrency(sessao.totalVendas || 0)}</strong></td>
                        <td>
                            <button class="btn-excel detalhado" style="padding: 4px 8px; font-size: 0.7rem;" onclick="window.exportarTurnoIndividual('${sessao.sessaoId}')">
                                <i class="fas fa-file-download"></i> Planilha Turno
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        } catch (error) {
            Utils.log('REL_TABELA', error);
        }
    };

    /**
     * Exportação Resumida (Todos os Caixas)
     */
    const exportarResumoCaixas = async () => {
        try {
            const sessoes = await API.getSessoes();
            if (sessoes.length === 0) { Utils.showToast("Sem dados para exportar", "error"); return; }

            const dados = sessoes.map(s => ({
                "Operador": s.operador || "---",
                "Abertura": new Date(s.dataAbertura).toLocaleString('pt-BR'),
                "Fechamento": s.dataFechamento ? new Date(s.dataFechamento).toLocaleString('pt-BR') : "Aberto",
                "Fundo Inicial (R$)": s.saldoInicial,
                "Vendas (R$)": s.totalVendas || 0,
                "Saldo Final (R$)": s.saldoInicial + (s.totalVendas || 0)
            }));

            gerarExcel(dados, "Resumo_Geral_Caixas");
        } catch (e) { alert("Erro ao exportar resumo: " + e.message); }
    };

    /**
     * Exportação Detalhada Individual (Por abertura de caixa específica)
     */
    window.exportarTurnoIndividual = async (sessaoId) => {
        try {
            const sessoes = await API.getSessoes();
            const vendas = await API.getVendas();
            const sessao = sessoes.find(s => s.sessaoId === sessaoId);
            const vendasDaSessao = vendas.filter(v => v.sessaoId === sessaoId);

            if (!sessao || vendasDaSessao.length === 0) {
                Utils.showToast("Não há vendas registradas neste turno", "info");
                return;
            }

            const dadosTurno = [];
            vendasDaSessao.forEach(venda => {
                venda.itens.forEach(item => {
                    dadosTurno.push({
                        "Data/Hora": new Date(venda.data).toLocaleString('pt-BR'),
                        "Operador": sessao.operador,
                        "Produto": item.nome,
                        "Qtd": item.quantidade,
                        "Preço Unit (R$)": item.preco,
                        "Total Item (R$)": item.quantidade * item.preco,
                        "Forma Pagamento": venda.pagamento
                    });
                });
            });

            const dataFormatada = new Date(sessao.dataAbertura).toISOString().split('T')[0];
            gerarExcel(dadosTurno, `Vendas_${sessao.operador}_${dataFormatada}`);
        } catch (e) {
            Utils.log('EXPORT_INDIVIDUAL', e);
        }
    };

    /**
     * Exportação Detalhada Geral (Histórico de todos os itens vendidos)
     */
    const exportarRelatorioDetalhado = async () => {
        try {
            const vendas = await API.getVendas();
            if (vendas.length === 0) { Utils.showToast("Sem vendas registradas", "error"); return; }

            const dadosDetalhados = [];
            vendas.forEach(venda => {
                venda.itens.forEach(item => {
                    dadosDetalhados.push({
                        "Data/Hora": new Date(venda.data).toLocaleString('pt-BR'),
                        "Operador": venda.operador || "---",
                        "Produto": item.nome,
                        "Qtd": item.quantidade,
                        "Preço Unit (R$)": item.preco,
                        "Subtotal (R$)": item.quantidade * item.preco,
                        "Pagamento": venda.pagamento
                    });
                });
            });

            gerarExcel(dadosDetalhados, "Relatorio_Geral_Detalhado");
        } catch (e) { alert("Erro ao exportar detalhado: " + e.message); }
    };

    // Função auxiliar para gerar o arquivo
    const gerarExcel = (json, nomeArquivo) => {
        if (typeof XLSX === 'undefined') {
            alert("Erro: Biblioteca Excel não carregada. Verifique o arquivo js/xlsx.full.min.js");
            return;
        }
        const worksheet = XLSX.utils.json_to_sheet(json);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório");
        XLSX.writeFile(workbook, `${nomeArquivo}.xlsx`);
        Utils.showToast("Planilha gerada com sucesso!");
    };

    // Listeners
    document.getElementById('btn-exportar-excel')?.addEventListener('click', exportarResumoCaixas);
    document.getElementById('btn-exportar-detalhado')?.addEventListener('click', exportarRelatorioDetalhado);
    
    window.addEventListener('vendaFinalizada', initRelatorios);
    initRelatorios();
});