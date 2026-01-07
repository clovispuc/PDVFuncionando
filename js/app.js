/**
 * App - Orquestrador do Sistema PDV
 * Responsável por gerenciar o ciclo de vida das páginas e eventos globais.
 */
const App = {
    currentPage: 'pdv',

    async init() {
        console.log('🚀 Sistema Inicializado');
        
        // 1. Configura componentes globais
        this.setupNavigation();
        this.setupModals();
        this.updateDateTime();
        
        // 2. Inicia o relógio
        setInterval(() => this.updateDateTime(), 1000);
        
        // 3. Carrega a página inicial definida
        await this.loadCurrentPage();
    },

    // Gerencia a troca de abas da sidebar
    setupNavigation() {
        const menuItems = document.querySelectorAll('.sidebar-menu li');
        
        menuItems.forEach(item => {
            item.addEventListener('click', async () => {
                const page = item.dataset.page;
                
                // Evita recarregar a mesma página
                if (page === this.currentPage) return;
                
                // Atualiza visual do menu
                menuItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                // Troca o estado e carrega o módulo
                this.currentPage = page;
                await this.loadCurrentPage();
            });
        });
    },

    // Carrega o conteúdo e dispara a inicialização do módulo específico
    async loadCurrentPage() {
        // Mostra o loading se existir no Utils
        if (window.Utils && window.Utils.showLoading) window.Utils.showLoading(true);

        // Esconde todas as páginas e mostra a selecionada
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const targetPage = document.getElementById(`${this.currentPage}-page`);
        
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Tenta inicializar o módulo específico
        try {
            switch (this.currentPage) {
                case 'pdv':
                    if (window.renderProdutosPDV) await window.renderProdutosPDV();
                    break;
                case 'produtos':
                    if (window.renderProdutosTable) await window.renderProdutosTable();
                    break;
                case 'estoque':
                    // Dispara evento para o estoque.js se atualizar
                    window.dispatchEvent(new CustomEvent('produtosUpdated'));
                    break;
                case 'vendas':
                    // Dispara evento para o vendas.js se atualizar
                    window.dispatchEvent(new CustomEvent('vendaFinalizada'));
                    break;
            }
        } catch (error) {
            if (window.Utils && window.Utils.log) {
                window.Utils.log('APP_LOAD_PAGE', error);
            } else {
                console.error(`Falha ao iniciar módulo: ${this.currentPage}`, error);
            }
        } finally {
            if (window.Utils && window.Utils.showLoading) window.Utils.showLoading(false);
        }
    },

    // Mantém a data e hora atualizadas no cabeçalho
    updateDateTime() {
        const now = new Date();
        const dateEl = document.getElementById('current-date');
        const timeEl = document.getElementById('current-time');
        
        if (dateEl) dateEl.innerText = now.toLocaleDateString('pt-BR');
        if (timeEl) timeEl.innerText = now.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
    },

    // Lógica universal para fechar modais (clicando fora ou no X)
    setupModals() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-modal') || e.target.classList.contains('modal')) {
                const openModal = document.querySelector('.modal.active');
                if (openModal) {
                    openModal.classList.remove('active');
                    openModal.style.display = 'none';
                }
            }
        });

        // Previne que cliques dentro do modal o fechem
        document.querySelectorAll('.modal-content').forEach(content => {
            content.addEventListener('click', (e) => e.stopPropagation());
        });
    }
};

// Inicialização segura após o carregamento do DOM
document.addEventListener('DOMContentLoaded', () => App.init());

// Expõe o App globalmente para facilitar depuração
window.App = App;