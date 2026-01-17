# PDV Control - Sistema de Gestão de Vendas

Sistema de Ponto de Venda (PDV) completo e autossuficiente, desenvolvido em JavaScript puro. O sistema permite a gestão completa de produtos, controle de estoque crítico, realização de vendas com observações e relatórios financeiros detalhados.

## ✨ Funcionalidades

### 🛒 Vendas (PDV)
- Adição de produtos ao carrinho com um clique.
- **Edição de quantidade** diretamente no carrinho.
- Campo de **Observações** para cada venda.
- Escolha da forma de pagamento (Dinheiro, PIX, Cartão).
- Finalização rápida via tecla de atalho **F8**.

### 📦 Gestão de Produtos e Estoque
- Cadastro completo com categorias e preço.
- **Alertas de estoque crítico**: Notificação visual quando o item está abaixo do mínimo.
- **Ajustes Manuais**: Entrada e saída de mercadorias simplificada.
- Baixa automática de estoque após a conclusão da venda.

### 📊 Relatórios e Estorno
- Dashboard de faturamento diário e ticket médio.
- Histórico completo de vendas realizadas.
- **Sistema de Estorno**: Botão para excluir venda que devolve automaticamente os produtos ao estoque.

### 💾 Portabilidade e Backup
- **Exportação de Dados**: Gere um arquivo `.json` com todo o seu banco de dados.
- **Importação de Dados**: Restaure seu backup em qualquer outra máquina via navegador.
- **Hospedagem**: Compatível com GitHub Pages para uso em tablets e celulares.

## 🚀 Tecnologias Utilizadas

- **HTML5 / CSS3**: Layout moderno e responsivo.
- **JavaScript (ES6+)**: Lógica de banco de dados e interface.
- **LocalStorage**: Persistência de dados local sem necessidade de servidor.
- **FontAwesome**: Ícones do sistema.

## 🛠️ Como Utilizar em Qualquer Máquina

Por utilizar o `localStorage`, os dados ficam salvos no seu navegador. Para migrar ou fazer backup:

1. **Para salvar seus dados:** Utilize a função `API.exportDatabase()` para baixar o arquivo de backup.
2. **Para restaurar em outro PC:** Abra o sistema no novo computador e utilize a função `API.importDatabase(arquivo)` para carregar seus produtos e vendas.

---

## 📂 Estrutura de Arquivos

- `index.html`: Estrutura principal e abas do sistema.
- `css/style.css`: Estilização visual e responsividade.
- `js/api.js`: Lógica de persistência e funções de backup.
- `js/pdv.js`: Gerenciamento do carrinho e finalização de vendas.
- `js/estoque.js`: Monitoramento de níveis e ajustes manuais.
- `js/vendas.js`: Relatórios, estatísticas e estornos.
- `js/utils.js`: Formatadores e sistema de logs.

---
Desenvolvido por Clovis F. Vieira
