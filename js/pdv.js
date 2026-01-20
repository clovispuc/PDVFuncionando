document.addEventListener('DOMContentLoaded', () => {
    let carrinho = [];

    const atualizarInterfaceCaixa = async () => {
        const statusContainer = document.getElementById('caixa-status-container');
        const badge = document.getElementById('caixa-badge');
        const labelOperador = document.getElementById('caixa-operador-label');
        const labelValor = document.getElementById('caixa-valor-label');
        const acoesContainer = document.getElementById('caixa-acoes');

        if (!statusContainer || !acoesContainer) return;

        const caixa = await API.getCaixaStatus();
        const vendas = await API.getVendas();
        
        const totalVendasSessao = vendas
            .filter(v => v.sessaoId === caixa.sessaoId)
            .reduce((acc, v) => acc + v.total, 0);

        if (caixa.aberto) {
            badge.innerText = "Caixa Aberto";
            badge.className = "status-badge status-aberto";
            labelOperador.innerText = `Operador: ${caixa.operador}`;
            labelValor.innerText = `Saldo: ${Utils.formatCurrency(caixa.saldoInicial + totalVendasSessao)}`;
            
            acoesContainer.innerHTML = `
                <button class="btn-caixa-acao btn-fechar" onclick="confirmarFecharCaixa()">
                    <i class="fas fa-lock"></i> Fechar
                </button>
            `;
        } else {
            badge.innerText = "Caixa Fechado";
            badge.className = "status-badge status-fechado";
            labelOperador.innerText = "Operador: ---";
            labelValor.innerText = "Saldo: R$ 0,00";
            
            acoesContainer.innerHTML = `
                <button class="btn-caixa-acao btn-abrir" onclick="window.abrirModalCaixa()">
                    <i class="fas fa-unlock"></i> Abrir Caixa
                </button>
            `;
        }
    };

    document.getElementById('form-abrir-caixa')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const evento = document.getElementById('caixa-evento-input').value;
        const operador = document.getElementById('caixa-operador-input').value;
        const fundo = document.getElementById('caixa-fundo-input').value;

        if (operador.trim() === "") return;

        await API.abrirCaixa(operador, fundo, evento);
        window.fecharModalCaixa();
        Utils.showToast(`Caixa aberto por ${operador}`);
        
        atualizarInterfaceCaixa();
        renderProdutosPDV();
    });

    window.renderProdutosPDV = async () => {
        const grid = document.getElementById('produtos-grid');
        if (!grid) return;

        try {
            const produtos = await API.getProdutos();
            grid.innerHTML = '';

            produtos.forEach(produto => {
                const card = document.createElement('div');
                card.className = `produto-card ${produto.estoque <= 0 ? 'sem-estoque' : ''}`;
                card.innerHTML = `
                    <div class="produto-info">
                        <h4>${produto.nome}</h4>
                        <span class="categoria-badge">${produto.categoria}</span>
                        <p class="preco">${Utils.formatCurrency(produto.preco)}</p>
                        <p class="estoque-qtd">Estoque: ${produto.estoque}</p>
                    </div>
                `;

                card.addEventListener('click', async () => {
                    const caixa = await API.getCaixaStatus();
                    if (!caixa.aberto) {
                        Utils.showToast("Abra o caixa para iniciar as vendas", "error");
                        window.abrirModalCaixa();
                        return;
                    }
                    if (produto.estoque > 0) adicionarAoCarrinho(produto);
                });

                grid.appendChild(card);
            });
        } catch (error) {
            Utils.log('PDV_RENDER', error);
        }
    };

    const adicionarAoCarrinho = (produto) => {
        const itemExistente = carrinho.find(item => String(item.id) === String(produto.id));
        if (itemExistente) {
            if (itemExistente.quantidade < produto.estoque) itemExistente.quantidade++;
            else { Utils.showToast('Estoque insuficiente', 'error'); return; }
        } else {
            carrinho.push({ id: produto.id, nome: produto.nome, preco: produto.preco, quantidade: 1, estoqueMax: produto.estoque });
        }
        renderCarrinho();
    };

    const renderCarrinho = () => {
        const container = document.getElementById('carrinho-itens');
        const totalEl = document.getElementById('total');
        const formaPagamento = document.getElementById('forma-pagamento')?.value || 'Dinheiro';
        
        if (!container) return;

        if (carrinho.length === 0) {
            container.innerHTML = '<div style="padding: 30px; text-align: center; color: #94a3b8;"><p>Carrinho vazio</p></div>';
            if (totalEl) totalEl.innerText = 'R$ 0,00';
            return;
        }

        const total = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
        
        let html = carrinho.map((item, index) => `
            <div class="carrinho-item">
                <div style="flex: 1;">
                    <p style="margin:0; font-weight: 600;">${item.nome}</p>
                    <span style="font-size: 0.8rem;">${Utils.formatCurrency(item.preco)}</span>
                </div>
                <input type="number" value="${item.quantidade}" min="1" onchange="window.atualizarQtdCarrinho(${index}, this.value)" style="width: 45px; text-align: center;">
                <button class="btn-remove" onclick="window.removerDoCarrinho(${index})"><i class="fas fa-trash"></i></button>
            </div>
        `).join('');

        if (formaPagamento === 'Dinheiro') {
            html += `
                <div style="margin-top: 10px; padding: 10px; background: #f0fdf4; border-radius: 8px;">
                    <label style="font-size: 0.7rem; font-weight: 700; color: #166534;">DINHEIRO RECEBIDO</label>
                    <input type="number" id="valor-recebido" step="0.01" style="width: 100%; padding: 8px; margin: 5px 0;" oninput="window.calcularTroco(${total})">
                    <div style="text-align: right;"><span style="font-size: 0.7rem;">TROCO:</span> <strong id="valor-troco">R$ 0,00</strong></div>
                </div>
            `;
        }

        container.innerHTML = html + `<textarea id="venda-obs" placeholder="Obs..." style="width:100%; margin-top:10px; height: 50px;"></textarea>`;
        if (totalEl) totalEl.innerText = Utils.formatCurrency(total);
    };

    window.atualizarQtdCarrinho = (index, novaQtd) => {
        const item = carrinho[index];
        const qtd = parseInt(novaQtd);
        if (qtd > item.estoqueMax) { Utils.showToast('Estoque insuficiente', 'error'); item.quantidade = item.estoqueMax; }
        else if (qtd <= 0) carrinho.splice(index, 1);
        else item.quantidade = qtd;
        renderCarrinho();
    };

    window.removerDoCarrinho = (index) => { carrinho.splice(index, 1); renderCarrinho(); };

    window.calcularTroco = (total) => {
        const recebido = parseFloat(document.getElementById('valor-recebido')?.value) || 0;
        const el = document.getElementById('valor-troco');
        if (el) el.innerText = recebido >= total ? Utils.formatCurrency(recebido - total) : "Incompleto";
    };

    document.getElementById('forma-pagamento')?.addEventListener('change', renderCarrinho);

    const finalizarVenda = async () => {
        const caixa = await API.getCaixaStatus();
        if (!caixa.aberto) { Utils.showToast("Abra o caixa primeiro!", "error"); return; }
        if (carrinho.length === 0) return;

        const total = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
        const forma = document.getElementById('forma-pagamento').value;
        const recebido = parseFloat(document.getElementById('valor-recebido')?.value) || 0;

        if (forma === "Dinheiro" && recebido < total) { Utils.showToast("Valor insuficiente", "error"); return; }

        try {
            await API.salvarVenda({
                itens: [...carrinho],
                total: total,
                pagamento: forma,
                operador: caixa.operador
            });
            
            Utils.showToast('Venda realizada!');
            carrinho = [];
            renderCarrinho();
            atualizarInterfaceCaixa();
            await renderProdutosPDV();
            window.dispatchEvent(new CustomEvent('vendaFinalizada'));
        } catch (e) { alert(e.message); }
    };

    document.getElementById('btn-finalizar')?.addEventListener('click', finalizarVenda);
    
    atualizarInterfaceCaixa();
    renderProdutosPDV();
    renderCarrinho();
});