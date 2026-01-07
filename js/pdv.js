/**
 * Módulo PDV - Ponto de Venda
 * Responsável pela interface de vendas, carrinho e finalização de pedidos.
 */

document.addEventListener('DOMContentLoaded', () => {
    let carrinho = [];

    // Função para renderizar os produtos no grid do PDV
    window.renderProdutosPDV = async () => {
        const grid = document.getElementById('produtos-grid');
        if (!grid) return;

        try {
            const produtos = await API.getProdutos();
            grid.innerHTML = '';

            if (produtos.length === 0) {
                grid.innerHTML = '<div class="aviso-vazio" style="padding: 20px; text-align: center; color: #64748b;">Nenhum produto cadastrado.</div>';
                return;
            }

            produtos.forEach(produto => {
                const card = document.createElement('div');
                card.className = `produto-card ${produto.estoque <= 0 ? 'sem-estoque' : ''}`;
                card.innerHTML = `
                    <div class="produto-info">
                        <h4>${produto.nome}</h4>
                        <span class="categoria-badge">${produto.categoria}</span>
                        <p class="preco">${Utils.formatCurrency(produto.preco)}</p>
                        <p class="estoque-qtd">Stock: ${produto.estoque}</p>
                    </div>
                `;

                if (produto.estoque > 0) {
                    card.addEventListener('click', () => adicionarAoCarrinho(produto));
                }

                grid.appendChild(card);
            });
        } catch (error) {
            Utils.log('PDV_RENDER_PRODUTOS', error);
        }
    };

    // Adiciona item ou incrementa
    const adicionarAoCarrinho = (produto) => {
        const itemExistente = carrinho.find(item => String(item.id) === String(produto.id));

        if (itemExistente) {
            if (itemExistente.quantidade < produto.estoque) {
                itemExistente.quantidade++;
            } else {
                Utils.showToast('Limite de stock atingido.', 'error');
                return;
            }
        } else {
            carrinho.push({
                id: produto.id,
                nome: produto.nome,
                preco: produto.preco,
                quantidade: 1,
                estoqueMax: produto.estoque // Guardamos para validar edição manual
            });
        }

        renderCarrinho();
    };

    // Atualiza a quantidade manualmente via input no carrinho
    window.atualizarQtdCarrinho = (index, novaQtd) => {
        const qtd = parseInt(novaQtd);
        const item = carrinho[index];

        if (isNaN(qtd) || qtd <= 0) {
            carrinho.splice(index, 1);
        } else if (qtd > item.estoqueMax) {
            Utils.showToast(`Apenas ${item.estoqueMax} unidades em estoque.`, 'error');
            item.quantidade = item.estoqueMax;
        } else {
            item.quantidade = qtd;
        }
        renderCarrinho();
    };

    // Renderiza o carrinho com input de quantidade e área de observação
    const renderCarrinho = () => {
        const container = document.getElementById('carrinho-itens');
        const totalEl = document.getElementById('total');
        if (!container) return;

        if (carrinho.length === 0) {
            container.innerHTML = '<div class="carrinho-vazio" style="padding: 20px; text-align: center; color: #94a3b8;"><p>Carrinho vazio</p></div>';
            if (totalEl) totalEl.innerText = 'R$ 0,00';
            return;
        }

        let html = carrinho.map((item, index) => `
            <div class="carrinho-item" style="display: flex; align-items: center; gap: 10px;">
                <div style="flex: 1;">
                    <p style="margin:0; font-weight: 600;">${item.nome}</p>
                    <span style="font-size: 0.8rem; color: #64748b;">${Utils.formatCurrency(item.preco)} un.</span>
                </div>
                <input type="number" 
                       value="${item.quantidade}" 
                       min="1" 
                       onchange="window.atualizarQtdCarrinho(${index}, this.value)"
                       style="width: 50px; padding: 4px; border: 1px solid #cbd5e1; border-radius: 4px; text-align: center;">
                <button class="btn-remove" onclick="window.removerDoCarrinho(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        // Adiciona o campo de Observações ao final da lista de itens
        html += `
            <div style="margin-top: 15px; padding: 10px; border-top: 1px solid #f1f5f9;">
                <label style="font-size: 0.75rem; font-weight: 700; color: #64748b; display: block; margin-bottom: 5px;">OBSERVAÇÕES DA VENDA</label>
                <textarea id="venda-obs" placeholder="Ex: Sem gelo, embrulhar para presente..." 
                    style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; font-size: 0.85rem; resize: none; font-family: inherit;"></textarea>
            </div>
        `;

        container.innerHTML = html;

        const total = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
        if (totalEl) totalEl.innerText = Utils.formatCurrency(total);
    };

    window.removerDoCarrinho = (index) => {
        carrinho.splice(index, 1);
        renderCarrinho();
    };

    const finalizarVenda = async () => {
        if (carrinho.length === 0) {
            Utils.showToast('O carrinho está vazio!', 'error');
            return;
        }

        try {
            const formaPagamentoEl = document.getElementById('forma-pagamento');
            const obsEl = document.getElementById('venda-obs');

            const vendaData = {
                data: new Date().toISOString(),
                itens: [...carrinho],
                total: carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0),
                pagamento: formaPagamentoEl ? formaPagamentoEl.value : 'Dinheiro',
                observacao: obsEl ? obsEl.value : '' // Captura a observação
            };

            await API.salvarVenda(vendaData);
            
            Utils.showToast('Venda finalizada!');
            carrinho = [];
            renderCarrinho();
            
            if (formaPagamentoEl) formaPagamentoEl.selectedIndex = 0;
            
            await renderProdutosPDV();
            window.dispatchEvent(new CustomEvent('vendaFinalizada'));
            window.dispatchEvent(new CustomEvent('produtosUpdated'));

        } catch (error) {
            Utils.log('PDV_FINALIZAR_VENDA', error);
            Utils.showToast('Erro ao processar venda.', 'error');
        }
    };

    document.getElementById('btn-finalizar')?.addEventListener('click', finalizarVenda);
    document.getElementById('btn-limpar')?.addEventListener('click', () => {
        if (confirm('Limpar carrinho?')) {
            carrinho = [];
            renderCarrinho();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'F8') { e.preventDefault(); finalizarVenda(); }
    });

    window.addEventListener('produtosUpdated', renderProdutosPDV);
    renderProdutosPDV();
    renderCarrinho();
});