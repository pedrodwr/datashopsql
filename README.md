markdown# DataShop SQL

Plataforma educacional interativa para aprender SQL com exercícios práticos, banco de dados SQLite real e progressão gamificada.

🌐 **[datashopsql.com.br](https://datashopsql.com.br)**

---

## Sobre o projeto

O DataShop SQL é uma plataforma desenvolvida com foco educacional para auxiliar estudantes e iniciantes no aprendizado de SQL de forma prática.

Diferente de abordagens puramente teóricas, o sistema permite executar consultas SQL reais diretamente no navegador, validar respostas automaticamente e acompanhar a evolução do usuário através de níveis progressivos.

A aplicação utiliza uma narrativa gamificada onde o usuário assume o papel de **Analista de Dados** da empresa fictícia DataShop, resolvendo desafios baseados em cenários reais de análise de dados — clientes, produtos, pedidos, pagamentos e avaliações.

---

## Funcionalidades

- 26 exercícios práticos organizados em 7 níveis progressivos
- Narrativa gamificada com missões e contexto empresarial
- Banco de dados SQLite real rodando 100% no navegador
- Editor SQL com destaque de sintaxe em tempo real
- Validação automática comparando colunas, linhas e valores
- Sistema de pontuação — 15, 10 ou 5 pts conforme o uso de dicas
- Duas dicas por exercício — orientação conceitual e solução completa
- Progresso salvo automaticamente via localStorage
- Dashboard final com relatório de desempenho por nível e conceito
- Modo livre para explorar o banco sem contexto de exercício
- Diagrama de relacionamentos entre tabelas
- Bloqueio de comandos DML (INSERT, UPDATE, DELETE, DROP)
- Responsivo para desktop e tablet

---

## Níveis e conteúdo

| Nível | Conceito | Exercícios |
|-------|----------|-----------|
| 1 | SELECT * — Exploração | 5 |
| 2 | Seleção de Colunas | 3 |
| 3 | WHERE — Filtros | 5 |
| 4 | ORDER BY e LIMIT | 3 |
| 5 | JOIN — Relacionamentos | 5 |
| 6 | GROUP BY — Agregação | 3 |
| 7 | LEFT JOIN e IS NULL | 2 |
| **Total** | | **26** |

---

## Banco de dados

7 tabelas · ~500 registros · dados fictícios gerados para fins educacionais

| Tabela | Descrição |
|--------|-----------|
| `clientes` | 100 clientes de países variados |
| `categorias` | 6 categorias de produtos |
| `produtos` | 100 produtos com preço e estoque |
| `pedidos` | 78 pedidos com status |
| `itens_pedido` | 122 itens vinculados a pedidos |
| `pagamentos` | 78 pagamentos com tipo e valor |
| `avaliacoes` | 55 avaliações de produtos |

---

## Tecnologias

- **HTML5 / CSS3 / JavaScript** — Vanilla JS, sem frameworks
- **SQL.js 1.10.3** — SQLite compilado em WebAssembly, roda no navegador
- **localStorage** — persistência de progresso entre sessões
- **GitHub Pages** — hospedagem estática gratuita
