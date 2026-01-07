# 🚀 Guia Rápido de Início

## ✅ Sistema Pronto para Uso!

Seu Sistema PDV está completo e funcional. Siga os passos abaixo para começar a usar:

## 📋 Como Acessar o Sistema

### Opção 1: Publicar Online (RECOMENDADO) ⭐
1. Clique na aba **"Publish"** (Publicar)
2. Clique em **"Publish Project"**
3. Aguarde a publicação
4. Acesse o link fornecido de qualquer computador/navegador

### Opção 2: Rodar Localmente no Windows

#### A) Usando Python (se instalado):
```cmd
# Abra o terminal (CMD) na pasta do projeto
python -m http.server 8000

# Abra no navegador:
http://localhost:8000
```

#### B) Usando Node.js (se instalado):
```cmd
# Instale o servidor (apenas uma vez)
npm install -g http-server

# Execute na pasta do projeto
http-server -p 8000

# Abra no navegador:
http://localhost:8000
```

#### C) Usando Visual Studio Code:
1. Instale a extensão "Live Server"
2. Abra a pasta do projeto no VS Code
3. Clique com botão direito em `index.html`
4. Escolha "Open with Live Server"

---

## 🎯 Primeiros Passos

### 1️⃣ Ao abrir o sistema
- Você verá a tela de **PDV (Vendas)**
- Já existem **9 produtos de exemplo** cadastrados
- Use o menu lateral para navegar

### 2️⃣ Fazer sua primeira venda
1. Na tela **PDV**, clique nos produtos para adicionar ao carrinho
2. Ajuste as quantidades usando os botões **+** e **-**
3. Escolha a forma de pagamento
4. Clique em **"Finalizar Venda"**
5. ✅ Pronto! O estoque é atualizado automaticamente

### 3️⃣ Cadastrar seus produtos
1. Clique em **"Produtos"** no menu lateral
2. Clique em **"+ Novo Produto"**
3. Preencha as informações:
   - Nome do produto
   - Categoria (Bebida ou Refeição)
   - Preço
   - Estoque inicial
   - Estoque mínimo (para alertas)
4. Clique em **"Salvar"**

### 4️⃣ Gerenciar estoque
1. Acesse **"Estoque"** no menu
2. Veja os alertas de produtos em falta
3. Use **"Entrada"** para adicionar produtos (compras)
4. Use **"Saída"** para registrar perdas/devoluções
5. Consulte o histórico de movimentações

### 5️⃣ Ver relatórios
1. Acesse **"Relatórios"** no menu
2. Veja as estatísticas:
   - Total vendido hoje
   - Quantidade de vendas
   - Total da semana
   - Ticket médio
3. Consulte o histórico completo de vendas
4. Clique no ícone 👁️ para ver detalhes de cada venda

---

## 💡 Dicas Importantes

### ✅ Boas Práticas
- Configure o **estoque mínimo** de cada produto para receber alertas
- Revise os **relatórios** diariamente
- Mantenha produtos inativos marcados como "Inativo"
- Use **observações** nas vendas para anotações importantes

### ⚠️ Atenções
- O sistema **não permite** vendas de produtos sem estoque
- O estoque é **atualizado automaticamente** após cada venda
- **Não é possível** fazer saída de estoque maior que o disponível
- Os dados são salvos **automaticamente** na nuvem

### 🔍 Recursos Úteis
- **Busca de produtos**: Digite no campo de busca do PDV
- **Filtros**: Use os botões "Todos", "Bebidas", "Refeições"
- **Carrinho**: Pode ser limpo clicando em "Limpar"
- **Edição**: Clique no ícone ✏️ para editar produtos

---

## 🎨 Interface do Sistema

O sistema possui **4 telas principais**:

1. **🛒 PDV - Vendas** (Tela inicial)
   - Seleção rápida de produtos
   - Carrinho de compras
   - Finalização de vendas

2. **📦 Produtos**
   - Listar todos os produtos
   - Adicionar novos produtos
   - Editar ou excluir produtos

3. **🏭 Estoque**
   - Alertas de estoque baixo
   - Registrar entradas
   - Registrar saídas
   - Histórico de movimentações

4. **📊 Relatórios**
   - Estatísticas de vendas
   - Histórico completo
   - Detalhes de cada venda

---

## 🆘 Problemas Comuns

### Produtos não aparecem no PDV?
- Verifique se o produto está marcado como **"Ativo"**
- Verifique se há estoque disponível

### Não consigo finalizar a venda?
- Verifique se há produtos no carrinho
- Confirme que a forma de pagamento foi selecionada

### Sistema não carrega?
- Verifique sua conexão com a internet (necessária para bibliotecas CDN)
- Limpe o cache do navegador (Ctrl + F5)

### Como apagar todos os dados?
- Os dados estão salvos na nuvem
- Entre em contato com o suporte se precisar resetar

---

## 📞 Próximos Passos

### Para Produção:
1. **Publique o sistema** usando a aba "Publish"
2. Configure seu **domínio personalizado** (se disponível)
3. Treine sua equipe no uso do sistema
4. Comece a usar no dia a dia!

### Para Personalização:
- Edite `css/style.css` para mudar cores/aparência
- Adicione mais categorias de produtos
- Customize os relatórios conforme sua necessidade

---

## 📚 Documentação Completa

Para informações técnicas detalhadas, consulte o arquivo **README.md**

---

**🎉 Seu Sistema PDV está pronto para uso! Boa sorte com suas vendas! 🚀**
