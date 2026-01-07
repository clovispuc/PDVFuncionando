// js/utils.js

const Utils = {
    // Formata valores para moeda brasileira
    formatCurrency: (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },

    // Sistema de feedback visual (Toast)
    showToast: (message, type = 'success') => {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.style.cssText = `
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            margin-top: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease forwards;
        `;
        toast.innerHTML = message;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Sistema de Logs para Depuração
    log: (context, error) => {
        const timestamp = new Date().toISOString();
        const errorMessage = error.message || error;
        const logEntry = { timestamp, context, message: errorMessage, stack: error.stack || 'N/A' };
        
        console.group(`🚨 LOG DE ERRO PDV: ${context}`);
        console.error(logEntry);
        console.groupEnd();

        // Salva no localStorage para exportação posterior
        const logs = JSON.parse(localStorage.getItem('pdv_logs') || '[]');
        logs.push(logEntry);
        // Mantém apenas os últimos 100 logs para não sobrecarregar o navegador
        localStorage.setItem('pdv_logs', JSON.stringify(logs.slice(-100)));
    },

    /**
     * NOVA FUNÇÃO: Gera e baixa um arquivo .txt com todos os logs salvos
     */
    exportLogs: () => {
        const logs = JSON.parse(localStorage.getItem('pdv_logs') || '[]');
        
        if (logs.length === 0) {
            Utils.showToast('Não há logs registrados para exportar.', 'error');
            return;
        }

        let content = "=== RELATÓRIO DE ERROS DO SISTEMA PDV ===\n";
        content += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n`;
        content += "-------------------------------------------\n\n";

        logs.forEach((l, i) => {
            content += `ERRO #${i + 1}\n`;
            content += `Data: ${l.timestamp}\n`;
            content += `Contexto: ${l.context}\n`;
            content += `Mensagem: ${l.message}\n`;
            content += `Rastro (Stack): ${l.stack}\n`;
            content += "-------------------------------------------\n";
        });

        // Cria o arquivo e dispara o download
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs_pdv_${new Date().getTime()}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        Utils.showToast('Arquivo de log gerado com sucesso!');
    }
};

// CSS básico para animação do toast
if (!document.getElementById('utils-styles')) {
    const style = document.createElement('style');
    style.id = 'utils-styles';
    style.innerHTML = `
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    `;
    document.head.appendChild(style);
}