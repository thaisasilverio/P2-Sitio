# Mercado Gourmet


## Objetivo

Interface web para visualização e gerenciamento de um catálogo gourmet, consumindo a API REST publicada em [base-back-dwpz.onrender.com](https://base-back-dwpz.onrender.com). Permite ao cliente navegar e buscar produtos, e ao administrador cadastrar, editar e excluir itens em tempo real.


## Tecnologias utilizadas

- **HTML5** — estrutura semântica
- **CSS** — variáveis, grid, flexbox, animações
- **JavaScript puro — fetch API, manipulação do DOM, autenticação JWT

Nenhum framework ou biblioteca de terceiros.

---

## Funcionalidades

### Catálogo (`index.html`)
- Listagem de produtos em grid responsivo com cards
- Exibição de imagem, nome, descrição, preço e disponibilidade em estoque
- Busca em tempo real por nome e descrição
- Atualização automática a cada 30 segundos
- Tratamento de erros de conexão com mensagem amigável

### Admin (`admin.html`)
- **Autenticação JWT** — tela de login integrada; token salvo no `localStorage`
- Logout com limpeza de sessão e retorno à tela de login
- Redirecionamento automático para login se o token estiver ausente ou expirado
- Cadastro de novos produtos (nome, descrição, preço, estoque, categoria, imagem)
- Edição inline de qualquer produto existente
- Exclusão com modal de confirmação
- Upload de imagem com preview (conversão para base64)
- Busca/filtro na tabela de produtos
- Validação de formulário com feedback via toast

---

## Estrutura do projeto

```
mercado-gourmet/
├── index.html          # Catálogo público
├── admin.html          # Painel administrativo
├── css/
│   ├── base.css        # Variáveis, reset, header, toast, footer
│   ├── index.css       # Estilos do catálogo (hero, grid, cards)
│   └── admin.css       # Estilos do admin (layout, tabela, formulário, modal)
├── js/
│   ├── index.js        # Lógica do catálogo (fetch, render, filtro)
│   ├── admin.js        # Lógica do admin (autenticação, CRUD, formulário, modal)
│   └── image-upload.js # Módulo de upload de imagem (base64, preview, drag-and-drop)
└── README.md
```

## Autenticação

O painel admin é protegido por **JWT (JSON Web Token)**:

1. Ao acessar `admin.html`, o sistema verifica se há um token válido no `localStorage`
2. Se não houver, exibe a tela de login
3. As credenciais são enviadas via `POST /entrar` com `{ email, senha }`
4. O servidor retorna `{ accessToken, user }` — o token é salvo com a chave `accessToken`
5. Todas as requisições subsequentes incluem o cabeçalho `Authorization: Bearer <token>`
6. Se qualquer requisição retornar 401, o sistema desloga automaticamente

---

## API utilizada

**Base URL:** `https://base-back-dwpz.onrender.com`

Método:  
`GET`  `/produtos` = Lista todos os produtos = Sim 
`POST` `/produtos` = Cadastra novo produto = Sim 
`PUT` `/produtos/:id` = Atualiza produto existente = Sim 
`DELETE` `/produtos/:id` = Remove produto =  Sim 
`GET` `/categorias` = Lista categorias = Sim 


## Decisões técnicas

- cada arquivo JS é um módulo isolado, sem poluição de escopo global. O `image-upload.js` é importado pelo `admin.js`, que é o único ponto de entrada.
- **Autenticação centralizada**: as funções `getToken()` e `authHeaders()` ficam no topo do `admin.js` e são usadas por todos os `fetch`, garantindo consistência.
- **Tela de login inline**: em vez de uma página separada, o login é renderizado dinamicamente sobre o layout existente, simplificando a navegação e evitando redirecionamentos.
- **Token salvo como `accessToken`**: segue exatamente o campo retornado pela API (`data.accessToken`).
- **Payload alinhado com a API**: os campos enviados ao servidor usam os nomes exatos definidos pela API (`nome`, `descricao`, `preco`, `estoque`, `categoriaId`, `imagemUrl`).
- **CSS separado por contexto**: `base.css` contém o que é compartilhado (variáveis, header, toast). Cada página tem seu próprio arquivo CSS.

---

## Links

- 🌐 GitHub Pages: 
- 🎥 Vídeo pitch: 
- 🔗 Backend: https://base-back-dwpz.onrender.com

---

## Autor
Thaísa Vitória Fernandes Silvério# P2-Sitio
