document.addEventListener('DOMContentLoaded', () => {
    const formProduto = document.getElementById('form-produto');
    const btnNovoProduto = document.getElementById('btn-novo-produto');
    const modalProduto = document.getElementById('modal-produto');

    if (btnNovoProduto) {
        btnNovoProduto.addEventListener('click', () => {
            formProduto.reset();
            document.getElementById('produto-id').value = '';
            document.getElementById('modal-produto-titulo').innerText = 'Novo Produto';
            modalProduto.classList.add('active');
            modalProduto.style.display = 'flex';
        });
    }

    if (formProduto) {
        formProduto.addEventListener('submit', async (e) => {
            e.preventDefault();

            try {
                const produtoData = {
                    id: document.getElementById('produto-id').value || null,
                    nome: document.getElementById('produto-nome').value,
                    categoria: document.getElementById('produto-categoria-input').value,
                    preco: parseFloat(document.getElementById('produto-preco').value),
                    estoque: parseInt(document.getElementById('produto-estoque').value),
                    estoqueMinimo: parseInt(document.getElementById('produto-estoque-minimo').value) || 5
                };

                await API.salvarProduto(produtoData);
                
                Utils.showToast('Produto gravado com sucesso!');
                
                modalProduto.classList.remove('active');
                modalProduto.style.display = 'none';
                formProduto.reset();
                
                window.renderProdutosTable();
                window.dispatchEvent(new CustomEvent('produtosUpdated'));
                
            } catch (error) {
                Utils.log('PRODUTOS_SALVAR', error);
                Utils.showToast('Erro ao salvar produto. Verifique os logs.', 'error');
            }
        });
    }

    window.renderProdutosTable = async () => {
        const tbody = document.getElementById('produtos-tbody');
        if (!tbody) return;

        try {
            const produtos = await API.getProdutos();
            tbody.innerHTML = '';

            if (produtos.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum produto cadastrado.</td></tr>';
                return;
            }

            produtos.forEach(produto => {
                const tr = document.createElement('tr');
                const critico = produto.estoque <= (produto.estoqueMinimo || 5) ? 'estoque-critico' : '';
                
                tr.innerHTML = `
                    <td>${produto.nome}</td>
                    <td><span class="categoria-badge">${produto.categoria}</span></td>
                    <td>${Utils.formatCurrency(produto.preco)}</td>
                    <td class="${critico}">${produto.estoque}</td>
                    <td>${produto.estoque > 0 ? 'Ativo' : 'Esgotado'}</td>
                    <td>
                        <button class="btn-edit" onclick="editarProduto('${produto.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="excluirProduto('${produto.id}')" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            Utils.log('PRODUTOS_RENDER', error);
        }
    };

    window.editarProduto = async (id) => {
        try {
            const produtos = await API.getProdutos();
            const produto = produtos.find(p => String(p.id) === String(id));

            if (produto) {
                document.getElementById('produto-id').value = produto.id;
                document.getElementById('produto-nome').value = produto.nome;
                document.getElementById('produto-categoria-input').value = produto.categoria;
                document.getElementById('produto-preco').value = produto.preco;
                document.getElementById('produto-estoque').value = produto.estoque;
                document.getElementById('produto-estoque-minimo').value = produto.estoqueMinimo;

                document.getElementById('modal-produto-titulo').innerText = 'Editar Produto';
                modalProduto.classList.add('active');
                modalProduto.style.display = 'flex';
            }
        } catch (error) {
            Utils.log('PRODUTOS_EDITAR', error);
        }
    };

    window.excluirProduto = async (id) => {
        if (confirm('Deseja realmente excluir este produto?')) {
            try {
                await API.excluirProduto(id);
                Utils.showToast('Produto removido com sucesso.');
                window.renderProdutosTable();
                window.dispatchEvent(new CustomEvent('produtosUpdated'));
            } catch (error) {
                Utils.log('PRODUTOS_EXCLUIR', error);
                Utils.showToast('Erro ao excluir produto.', 'error');
            }
        }
    };

    window.renderProdutosTable();
});