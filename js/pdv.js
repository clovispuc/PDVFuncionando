/**
 * Módulo PDV - Ponto de Venda
 * Responsável pela interface de vendas, carrinho e finalização de pedidos.
 */

document.addEventListener('DOMContentLoaded', () => {
    let carrinho = [];

    // Função para renderizar os produtos no grid do PDV (Exposta para o App.js)
    window.renderProdutosPDV = async () => {
        const grid = document.getElementById('produtos-grid');
        if (!grid) return;

        try {
            const produtos = await API.getProdutos();
            grid.innerHTML = '';

            if (produtos.length === 0) {
                grid.innerHTML = '<div class="aviso-vazio" style="padding: 20px; text-align: center; color: #64748b;">Nenhum produto disponível para venda.</div>';
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

    // Adiciona item ao carrinho ou incrementa quantidade
    const adicionarAoCarrinho = (produto) => {
        const itemExistente = carrinho.find(item => String(item.id) === String(produto.id));

        if (itemExistente) {
            if (itemExistente.quantidade < produto.estoque) {
                itemExistente.quantidade++;
            } else {
                Utils.showToast('Limite de stock atingido para este item.', 'error');
                return;
            }
        } else {
            carrinho.push({
                id: produto.id,
                nome: produto.nome,
                preco: produto.preco,
                quantidade: 1
            });
        }

        renderCarrinho();
        
        // Limpa o campo de busca para a próxima venda
        const searchInput = document.getElementById('search-produto');
        if (searchInput) {
            searchInput.value = '';
            // Se houver uma função de filtro global, poderia ser chamada aqui
        }
    };

    // Atualiza a visualização do carrinho e totais
    const renderCarrinho = () => {
        const container = document.getElementById('carrinho-itens');
        const totalEl = document.getElementById('total');
        if (!container) return;

        if (carrinho.length === 0) {
            container.innerHTML = '<div class="carrinho-vazio" style="padding: 20px; text-align: center; color: #94a3b8;"><p>Carrinho vazio</p></div>';
            if (totalEl) totalEl.innerText = 'R$ 0,00';
            return;
        }

        container.innerHTML = carrinho.map((item, index) => `
            <div class="carrinho-item">
                <div class="item-info">
                    <p style="margin:0;"><strong>${item.nome}</strong></p>
                    <span style="font-size: 0.85rem; color: #64748b;">${item.quantidade}x ${Utils.formatCurrency(item.preco)}</span>
                </div>
                <button class="btn-remove" onclick="window.removerDoCarrinho(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        const total = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
        if (totalEl) totalEl.innerText = Utils.formatCurrency(total);
    };

    // Remove item do carrinho (Exposta globalmente)
    window.removerDoCarrinho = (index) => {
        carrinho.splice(index, 1);
        renderCarrinho();
    };

    // Finaliza a venda capturando a forma de pagamento
    const finalizarVenda = async () => {
        if (carrinho.length === 0) {
            Utils.showToast('O carrinho está vazio!', 'error');
            return;
        }

        try {
            // Captura a forma de pagamento selecionada no Select
            const formaPagamentoEl = document.getElementById('forma-pagamento');
            const formaPagamento = formaPagamentoEl ? formaPagamentoEl.value : 'Dinheiro';

            const vendaData = {
                data: new Date().toISOString(),
                itens: [...carrinho],
                total: carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0),
                pagamento: formaPagamento
            };

            // Grava na API
            await API.salvarVenda(vendaData);
            
            Utils.showToast(`Venda finalizada com ${formaPagamento}!`);
            
            // Limpa o estado
            carrinho = [];
            renderCarrinho();
            
            // Volta o select para a primeira opção (Dinheiro)
            if (formaPagamentoEl) formaPagamentoEl.selectedIndex = 0;
            
            // Atualiza o grid de produtos (devido à baixa de stock)
            await renderProdutosPDV();
            
            // Notifica outros módulos (Relatórios/Estoque)
            window.dispatchEvent(new CustomEvent('vendaFinalizada'));
            window.dispatchEvent(new CustomEvent('produtosUpdated'));

        } catch (error) {
            Utils.log('PDV_FINALIZAR_VENDA', error);
            Utils.showToast('Erro ao processar venda.', 'error');
        }
    };

    // Event Listeners
    document.getElementById('btn-finalizar')?.addEventListener('click', finalizarVenda);
    document.getElementById('btn-limpar')?.addEventListener('click', () => {
        if (confirm('Deseja limpar o carrinho?')) {
            carrinho = [];
            renderCarrinho();
        }
    });

    // Atalho F8 para finalizar venda
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F8') {
            e.preventDefault();
            finalizarVenda();
        }
    });

    // Escuta atualizações de produtos feitas em outras abas
    window.addEventListener('produtosUpdated', renderProdutosPDV);

    // Inicialização da página
    renderProdutosPDV();
    renderCarrinho();
});