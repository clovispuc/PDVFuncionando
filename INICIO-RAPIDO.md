# ⚡ Início Rápido - PDV Control

Guia simplificado para operar o sistema em menos de 2 minutos.

## 1. Configuração Inicial
1. Abra o arquivo `index.html` no seu navegador.
2. Vá na aba **Produtos** e cadastre seus itens (Nome, Preço e Estoque).
3. **Dica:** Defina um "Estoque Mínimo" para receber alertas de reposição.

## 2. Realizando uma Venda
1. Clique na aba **Vendas (PDV)**.
2. Clique no produto para adicionar ao carrinho.
3. No carrinho:
   - Altere a **Quantidade** se necessário.
   - Digite **Observações** (ex: "Sem gelo").
   - Escolha a **Forma de Pagamento**.
4. Pressione **F8** ou clique em **Finalizar Venda**.

## 3. Gestão e Ajustes
- **Estoque:** Na aba de Estoque, use os botões `(+)` e `(-)` para entradas ou saídas manuais sem precisar editar o produto.
- **Estorno:** Se errou uma venda, vá em **Relatórios**, clique no ícone da lixeira `(trash)`. O sistema apagará a venda e devolverá os itens ao estoque automaticamente.

## 4. Levando para outro PC (Backup)
Para usar seus dados em outra máquina:
1. No PC atual, execute `API.exportDatabase()` no console ou use o botão de backup (se disponível).
2. Salve o arquivo `.json`.
3. No novo PC, abra o sistema e importe esse arquivo para restaurar tudo.

---
*Dúvidas? Consulte o arquivo README.md para detalhes técnicos.*
