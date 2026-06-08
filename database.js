/**
 * database.js — DataShop SQL
 * 26 exercícios · 7 níveis · narrativa gamificada
 * Banco: databasetc.db
 */
 
const SCHEMA = {
  tables: [
    { name: 'clientes',     cor: '#2563eb', fields: [
      { name: 'id', type: 'INTEGER', pk: true },
      { name: 'nome', type: 'VARCHAR' },
      { name: 'email', type: 'VARCHAR' },
      { name: 'pais', type: 'VARCHAR' },
      { name: 'data_cadastro', type: 'DATETIME' },
    ]},
    { name: 'categorias',   cor: '#7c3aed', fields: [
      { name: 'id', type: 'INTEGER', pk: true },
      { name: 'nome', type: 'VARCHAR' },
    ]},
    { name: 'produtos',     cor: '#059669', fields: [
      { name: 'id', type: 'INTEGER', pk: true },
      { name: 'nome', type: 'VARCHAR' },
      { name: 'preco', type: 'REAL' },
      { name: 'estoque', type: 'INTEGER' },
      { name: 'id_categoria', type: 'INTEGER', fk: 'categorias' },
    ]},
    { name: 'pedidos',      cor: '#d97706', fields: [
      { name: 'id', type: 'INTEGER', pk: true },
      { name: 'id_cliente', type: 'INTEGER', fk: 'clientes' },
      { name: 'data', type: 'DATETIME' },
      { name: 'status', type: 'VARCHAR' },
    ]},
    { name: 'itens_pedido', cor: '#dc2626', fields: [
      { name: 'id_pedido', type: 'INTEGER', pk: true, fk: 'pedidos' },
      { name: 'id_produto', type: 'INTEGER', pk: true, fk: 'produtos' },
      { name: 'quantidade', type: 'INTEGER' },
      { name: 'preco_unitario', type: 'REAL' },
    ]},
    { name: 'pagamentos',   cor: '#0891b2', fields: [
      { name: 'id', type: 'INTEGER', pk: true },
      { name: 'id_pedido', type: 'INTEGER', fk: 'pedidos', uq: true },
      { name: 'tipo', type: 'VARCHAR' },
      { name: 'status', type: 'VARCHAR' },
      { name: 'valor', type: 'REAL' },
    ]},
    { name: 'avaliacoes',   cor: '#be185d', fields: [
      { name: 'id', type: 'INTEGER', pk: true },
      { name: 'id_cliente', type: 'INTEGER', fk: 'clientes' },
      { name: 'id_produto', type: 'INTEGER', fk: 'produtos' },
      { name: 'id_pedido', type: 'INTEGER', fk: 'pedidos' },
      { name: 'nota', type: 'INTEGER' },
    ]},
  ],
};
 
const LEVELS = [
  {
    id: 1, titulo: 'Nível 1 — Exploração', cargo: 'Estagiário de Dados', icone: '', cor: '#6b7280',
    mensagem_ceo: `"Olá! Que bom que você chegou.<br><br>Antes de qualquer análise, você precisa conhecer o nosso sistema. Nós temos um banco de dados com informações de clientes, produtos, pedidos e pagamentos. Honestamente, eu mesmo não sei tudo que tem lá.<br><br>Sua primeira missão é simples: <strong>explore</strong>. Veja o que existe em cada tabela.<br><br>Não precisa analisar nada ainda. Só me mostre o que temos."`,
    conceito: { titulo: 'SELECT * — Explorando tabelas',
      texto: `O comando mais básico do SQL é o <code>SELECT</code>. O asterisco <code>*</code> significa "trazer todas as colunas":<pre>SELECT * FROM nome_da_tabela</pre>Substitua pelo nome da tabela que quer explorar:<pre>SELECT * FROM clientes\nSELECT * FROM produtos\nSELECT * FROM pedidos</pre>` },
            conclusao: `"Bom começo. Você explorou o banco com precisão e já sabe acessar qualquer tabela. O próximo passo é aprender a selecionar apenas o que importa. Chega de informação desnecessária."`,
    exercicios: [
      { id:'e01', missao:'Missão 1.1', titulo:'Listar todos os clientes',
        narrativa:'Ricardo quer conhecer todos os clientes cadastrados no sistema.',
        enunciado:'Selecione <strong>todos os dados</strong> da tabela <code>clientes</code>.',
        dica1:'Use <code>SELECT *</code> para trazer todas as colunas de uma tabela.',
        dica2:'Solução: <code>SELECT * FROM clientes</code>',
        solucao:'SELECT * FROM clientes',
        validar:(rows,cols)=>{ if(rows.length!==100)return false; const c=cols.map(x=>x.toLowerCase()); return c.includes('id')&&c.includes('nome')&&c.includes('email'); },
        erro:'Verifique se o nome da tabela está correto. A tabela de clientes se chama <code>clientes</code>, letras minúsculas, sem acentos.' },
      { id:'e02', missao:'Missão 1.2', titulo:'Listar todos os produtos',
        narrativa:'Ricardo precisa ver o catálogo completo antes de qualquer análise de vendas.',
        enunciado:'Selecione <strong>todos os dados</strong> da tabela <code>produtos</code>.',
        dica1:'Mesmo padrão do exercício anterior. Qual é o nome exato da tabela de produtos? Consulte a aba Tabelas na barra lateral.',
        dica2:'Solução: <code>SELECT * FROM produtos</code>',
        solucao:'SELECT * FROM produtos',
        validar:(rows,cols)=>{ if(rows.length!==100)return false; const c=cols.map(x=>x.toLowerCase()); return c.includes('id')&&c.includes('nome')&&c.includes('preco'); },
        erro:'Verifique o nome da tabela. Ela se chama <code>produtos</code>. Use exatamente esse nome após o FROM.' },
      { id:'e03', missao:'Missão 1.3', titulo:'Ver todas as categorias',
        narrativa:'Em quais categorias os produtos da DataShop estão organizados?',
        enunciado:'Selecione <strong>todos os dados</strong> da tabela <code>categorias</code>.',
        dica1:'O padrão é o mesmo para qualquer tabela: <code>SELECT * FROM nome_da_tabela</code>. Qual é o nome da tabela de categorias?',
        dica2:'Solução: <code>SELECT * FROM categorias</code>',
        solucao:'SELECT * FROM categorias',
        validar:(rows,cols)=>{ if(rows.length!==6)return false; const c=cols.map(x=>x.toLowerCase()); return c.includes('id')&&c.includes('nome'); },
        erro:'O nome da tabela está incorreto ou a query não está completa. A tabela se chama <code>categorias</code>.' },
      { id:'e04', missao:'Missão 1.4', titulo:'Listar todos os pedidos',
        narrativa:'Quantos pedidos passaram pelo sistema? Ricardo precisa de uma visão geral.',
        enunciado:'Selecione <strong>todos os dados</strong> da tabela <code>pedidos</code>.',
        dica1:'Mesmo padrão das missões anteriores. A tabela de pedidos tem um nome no plural. Consulte a aba Tabelas na barra lateral.',
        dica2:'Solução: <code>SELECT * FROM pedidos</code>',
        solucao:'SELECT * FROM pedidos',
        validar:(rows,cols)=>{ if(rows.length!==78)return false; const c=cols.map(x=>x.toLowerCase()); return c.includes('id_cliente')&&c.includes('data')&&c.includes('status')&&!c.includes('tipo')&&!c.includes('valor'); },
        erro:'Verifique se o nome da tabela está correto. Ela se chama <code>pedidos</code>.' },
      { id:'e05', missao:'Missão 1.5', titulo:'Listar todos os pagamentos',
        narrativa:'O time financeiro quer ver todos os pagamentos que passaram pelo sistema.',
        enunciado:'Selecione <strong>todos os dados</strong> da tabela <code>pagamentos</code>.',
        dica1:'Mesmo padrão. Qual tabela guarda os dados de pagamento? Consulte a aba Tabelas na barra lateral para confirmar o nome.',
        dica2:'Solução: <code>SELECT * FROM pagamentos</code>',
        solucao:'SELECT * FROM pagamentos',
        validar:(rows,cols)=>{ if(rows.length!==78)return false; const c=cols.map(x=>x.toLowerCase()); return c.includes('tipo')&&c.includes('valor')&&c.includes('id_pedido')&&!c.includes('id_cliente'); },
        erro:'Verifique o nome da tabela. Ela se chama <code>pagamentos</code>. Certifique-se de usar SELECT * para trazer todas as colunas.' },
    ],
  },
  {
    id: 2, titulo: 'Nível 2 — Seleção de Colunas', cargo: 'Trainee de Análise', icone: '', cor: '#2563eb',
    mensagem_ceo:`"Bom dia!<br><br>Você explorou bem o banco ontem. Mas os relatórios que me mandou têm informação demais. Eu não preciso ver todos os campos de uma vez.<br><br>Quando eu quero saber os preços dos produtos, não preciso ver o estoque, o id e todos os outros campos. <strong>Só o nome e o preço já bastam.</strong><br><br>Aprenda a selecionar apenas o que importa para cada situação."`,
    conceito:{ titulo:'SELECT colunas — Escolhendo o que mostrar',
      texto:`Em vez de <code>SELECT *</code>, liste exatamente quais colunas você quer:<pre>SELECT coluna1, coluna2 FROM tabela</pre>Exemplos:<pre>SELECT nome, preco FROM produtos\nSELECT nome, pais FROM clientes\nSELECT id, status FROM pedidos</pre>Isso deixa o relatório mais limpo e direto.` },
    conclusao:`"Relatórios mais objetivos. Saber escolher as colunas certas é o que diferencia um bom relatório de uma planilha bagunçada. Agora vamos aprender a filtrar os dados, buscar apenas o que é relevante."`,
    exercicios:[
      { id:'e06', missao:'Missão 2.1', titulo:'Nome e preço dos produtos',
        narrativa:'"Me mostre só o nome e o preço de cada produto", pediu Ricardo.',
        enunciado:'Selecione apenas <strong>nome</strong> e <strong>preco</strong> da tabela <code>produtos</code>.',
        dica1:'Em vez do asterisco <code>*</code>, liste os nomes das colunas separados por vírgula após o SELECT.',
        dica2:'Solução: <code>SELECT nome, preco FROM produtos</code>',
        solucao:'SELECT nome, preco FROM produtos',
        validar:(rows,cols)=>{ if(rows.length!==100)return false; const c=cols.map(x=>x.toLowerCase()); return c.includes('nome')&&c.includes('preco')&&c.length===2; },
        erro:'Selecione <strong>apenas</strong> as colunas <code>nome</code> e <code>preco</code>. Sem outras colunas adicionais.' },
      { id:'e07', missao:'Missão 2.2', titulo:'Nome e país dos clientes',
        narrativa:'"Quero ver o nome e o país de origem dos nossos clientes."',
        enunciado:'Selecione apenas <strong>nome</strong> e <strong>pais</strong> da tabela <code>clientes</code>.',
        dica1:'Selecione exatamente as duas colunas pedidas. Atenção: a coluna de país tem um nome sem acento. Consulte a aba Tabelas para ver o nome exato.',
        dica2:'Solução: <code>SELECT nome, pais FROM clientes</code>',
        solucao:'SELECT nome, pais FROM clientes',
        validar:(rows,cols)=>{ if(rows.length!==100)return false; const c=cols.map(x=>x.toLowerCase()); return c.includes('nome')&&c.includes('pais')&&c.length===2; },
        erro:'Selecione exatamente <code>nome</code> e <code>pais</code> (sem acento) da tabela clientes.' },
      { id:'e08', missao:'Missão 2.3', titulo:'Número e status dos pedidos',
        narrativa:'"Me mande uma lista com o número de cada pedido e seu status."',
        enunciado:'Selecione apenas <strong>id</strong> e <strong>status</strong> da tabela <code>pedidos</code>.',
        dica1:'Liste apenas as duas colunas pedidas. Consulte a aba Tabelas para ver os nomes exatos das colunas de <code>pedidos</code>.',
        dica2:'Solução: <code>SELECT id, status FROM pedidos</code>',
        solucao:'SELECT id, status FROM pedidos',
        validar:(rows,cols)=>{ if(rows.length!==78)return false; const c=cols.map(x=>x.toLowerCase()); return c.includes('id')&&c.includes('status')&&c.length===2&&!c.includes('tipo')&&!c.includes('valor'); },
        erro:'Selecione exatamente <code>id</code> e <code>status</code> da tabela <code>pedidos</code>.' },
    ],
  },
  {
    id: 3, titulo: 'Nível 3 — Filtros (WHERE)', cargo: 'Analista Júnior', icone: '', cor: '#7c3aed',
    mensagem_ceo:`"Preciso da sua ajuda com alguns problemas específicos.<br><br>Não quero mais listas de tudo. Quero <strong>respostas para perguntas concretas</strong>. Quais produtos são caros? Quais clientes são do Brasil? Quais pedidos já foram entregues?<br><br>Você vai precisar filtrar os dados. É assim que a análise começa a virar informação útil."`,
    conceito:{ titulo:'WHERE — Filtrando dados',
      texto:`O <code>WHERE</code> filtra quais linhas aparecem:<pre>SELECT colunas FROM tabela WHERE condição</pre>Exemplos de condições:<pre>WHERE preco > 100          -- maior que\nWHERE estoque > 0          -- maior que zero\nWHERE pais = 'Brazil'      -- igual (texto)\nWHERE status = 'Entregue'  -- igual (texto)</pre><strong>Atenção:</strong> textos sempre entre aspas simples <code>'assim'</code>.` },
    conclusao:`"Ótimo trabalho. Você já consegue responder perguntas específicas sobre os dados usando filtros. O próximo passo é organizar os resultados: ordenar, limitar e rankear."`,
    exercicios:[
      { id:'e09', missao:'Missão 3.1', titulo:'Produtos acima de R$ 100',
        narrativa:'"Quais produtos custam mais de R$ 100?" Ricardo quer identificar os produtos premium.',
        enunciado:'Selecione <strong>nome</strong>, <strong>preco</strong> e <strong>estoque</strong> dos produtos com <code>preco</code> maior que <code>100</code>.',
        dica1:'O WHERE filtra quais linhas aparecem. Para comparar números use operadores como <code>></code>, <code><</code>, <code>>=</code>. Qual condição seleciona produtos com preço acima de 100?',
        dica2:'Solução: <code>SELECT nome, preco, estoque FROM produtos WHERE preco > 100</code>',
        solucao:'SELECT nome, preco, estoque FROM produtos WHERE preco > 100',
        validar:(rows,cols)=>{ if(rows.length!==90)return false; const c=cols.map(x=>x.toLowerCase()); const i=c.indexOf('preco'); if(i===-1)return false; return rows.every(r=>parseFloat(r[i])>100); },
        erro:'O filtro não está correto. Use <code>WHERE preco > 100</code>. São 90 produtos acima de R$ 100.' },
      { id:'e10', missao:'Missão 3.2', titulo:'Produtos com estoque disponível',
        narrativa:'"Quais produtos ainda têm estoque disponível?" O time de logística precisa dessa lista.',
        enunciado:'Selecione <strong>nome</strong>, <strong>preco</strong> e <strong>estoque</strong> dos produtos com <code>estoque</code> maior que <code>0</code>.',
        dica1:'Use WHERE para filtrar. Um produto com estoque disponível tem qual valor na coluna estoque?',
        dica2:'Solução: <code>SELECT nome, preco, estoque FROM produtos WHERE estoque > 0</code>',
        solucao:'SELECT nome, preco, estoque FROM produtos WHERE estoque > 0',
        validar:(rows,cols)=>{ if(rows.length!==99)return false; const c=cols.map(x=>x.toLowerCase()); const i=c.indexOf('estoque'); if(i===-1)return false; return rows.every(r=>parseInt(r[i])>0); },
        erro:'Use <code>WHERE estoque > 0</code>. São 99 produtos com estoque disponível.' },
      { id:'e11', missao:'Missão 3.3', titulo:'Clientes do Brasil',
        narrativa:'"Quero ver apenas os clientes que são do Brasil." Campanha de marketing nacional.',
        enunciado:'Selecione <strong>nome</strong> e <strong>email</strong> dos clientes cujo <code>pais</code> seja <code>\'Brazil\'</code>.',
        dica1:'No WHERE, textos precisam de aspas simples: <code>WHERE coluna = \'valor\'</code>. Verifique como o país está escrito no banco. O valor está em inglês.',
        dica2:'Solução: <code>SELECT nome, email FROM clientes WHERE pais = \'Brazil\'</code>',
        solucao:"SELECT nome, email FROM clientes WHERE pais = 'Brazil'",
        validar:(rows,cols)=>{ if(rows.length!==6)return false; const c=cols.map(x=>x.toLowerCase()); const i=c.indexOf('nome'); if(i===-1)return false; return rows.every(r=>typeof r[i]==='string'&&r[i].length>0); },
        erro:"O filtro não está funcionando. Use <code>WHERE pais = 'Brazil'</code> (com aspas simples). São apenas 6 clientes com esse país." },
      { id:'e12', missao:'Missão 3.4', titulo:'Pedidos entregues',
        narrativa:'"Quais pedidos já foram entregues?" O time de pós-venda precisa contatar esses clientes.',
        enunciado:'Selecione <strong>id</strong>, <strong>id_cliente</strong> e <strong>data</strong> dos pedidos com <code>status</code> igual a <code>\'Entregue\'</code>.',
        dica1:'O valor de status é um texto. No WHERE, textos ficam entre aspas simples. Verifique a grafia exata: maiúsculas e minúsculas fazem diferença.',
        dica2:'Solução: <code>SELECT id, id_cliente, data FROM pedidos WHERE status = \'Entregue\'</code>',
        solucao:"SELECT id, id_cliente, data FROM pedidos WHERE status = 'Entregue'",
        validar:(rows,cols)=>{ if(rows.length!==35)return false; const c=cols.map(x=>x.toLowerCase()); return c.includes('id')&&c.includes('data'); },
        erro:"Use <code>WHERE status = 'Entregue'</code> com letra maiúscula. São 35 pedidos com esse status." },
      { id:'e13', missao:'Missão 3.5', titulo:'Pagamentos aprovados',
        narrativa:'"Quais pagamentos já foram aprovados?" O financeiro precisa confirmar a receita.',
        enunciado:'Selecione <strong>id</strong>, <strong>tipo</strong> e <strong>valor</strong> dos pagamentos com <code>status</code> igual a <code>\'Aprovado\'</code>.',
        dica1:'O status de pagamento é um texto. No WHERE, textos ficam entre aspas simples. Qual valor representa um pagamento aprovado nessa tabela?',
        dica2:'Solução: <code>SELECT id, tipo, valor FROM pagamentos WHERE status = \'Aprovado\'</code>',
        solucao:"SELECT id, tipo, valor FROM pagamentos WHERE status = 'Aprovado'",
        validar:(rows,cols)=>{ if(rows.length!==60)return false; const c=cols.map(x=>x.toLowerCase()); return c.includes('tipo')&&c.includes('valor'); },
        erro:"Use <code>WHERE status = 'Aprovado'</code>. São 60 pagamentos com esse status." },
    ],
  },
  {
    id: 4, titulo: 'Nível 4 — Ordenação e Limite', cargo: 'Analista de Dados', icone: '', cor: '#059669',
    mensagem_ceo:`"Temos uma reunião com os investidores na semana que vem.<br><br>Eles vão querer ver <strong>rankings</strong>: os produtos mais caros, os mais baratos, os pedidos mais recentes. Dados ordenados e com um tamanho razoável. Não mil linhas numa planilha.<br><br>Me ajude a preparar esses rankings."`,
    conceito:{ titulo:'ORDER BY e LIMIT — Ordenando e limitando',
      texto:`O <code>ORDER BY</code> ordena os resultados:<pre>ORDER BY preco DESC  -- decrescente (maior primeiro)\nORDER BY preco ASC   -- crescente (menor primeiro)</pre>O <code>LIMIT</code> limita quantas linhas aparecem:<pre>SELECT nome, preco FROM produtos ORDER BY preco ASC LIMIT 5</pre>Sempre combine: primeiro ordene, depois limite.` },
    conclusao:`"Ordenação e limite dominados. Esses recursos parecem simples, mas são a base de qualquer ranking. Agora chegou o conceito central do SQL: relacionar dados de tabelas diferentes."`,
    exercicios:[
      { id:'e14', missao:'Missão 4.1', titulo:'Produtos do mais caro ao mais barato',
        narrativa:'"Me mande a lista de produtos ordenada do mais caro para o mais barato."',
        enunciado:'Selecione <strong>nome</strong> e <strong>preco</strong> de todos os produtos, ordenados por preço de forma <strong>decrescente</strong>.',
        dica1:'O ORDER BY ordena os resultados. DESC coloca o maior valor primeiro, ASC o menor. Em qual coluna você quer aplicar a ordenação?',
        dica2:'Solução: <code>SELECT nome, preco FROM produtos ORDER BY preco DESC</code>',
        solucao:'SELECT nome, preco FROM produtos ORDER BY preco DESC',
        validar:(rows,cols)=>{ if(rows.length!==100)return false; const c=cols.map(x=>x.toLowerCase()); const i=c.indexOf('preco'); if(i===-1)return false; const first=parseFloat(rows[0][i]); return first>990&&first<=994; },
        erro:'Use <code>ORDER BY preco DESC</code>. O produto mais caro (R$ 993,61) deve aparecer primeiro.' },
      { id:'e15', missao:'Missão 4.2', titulo:'5 produtos mais baratos',
        narrativa:'"Quais são os 5 produtos mais baratos que temos?" Para a campanha de entrada.',
        enunciado:'Selecione <strong>nome</strong> e <strong>preco</strong> dos <strong>5 produtos mais baratos</strong>.',
        dica1:'Para pegar os N primeiros resultados de uma lista ordenada, use ORDER BY junto com LIMIT. Crescente ou decrescente para pegar os mais baratos?',
        dica2:'Solução: <code>SELECT nome, preco FROM produtos ORDER BY preco ASC LIMIT 5</code>',
        solucao:'SELECT nome, preco FROM produtos ORDER BY preco ASC LIMIT 5',
        validar:(rows,cols)=>{ if(rows.length!==5)return false; const c=cols.map(x=>x.toLowerCase()); const i=c.indexOf('preco'); if(i===-1)return false; return parseFloat(rows[0][i])<25; },
        erro:'Use <code>ORDER BY preco ASC LIMIT 5</code>. Deve retornar 5 linhas com o produto mais barato (R$ 20,33) em primeiro.' },
      { id:'e16', missao:'Missão 4.3', titulo:'3 pedidos mais recentes',
        narrativa:'"Mostre os 3 pedidos feitos mais recentemente." Para acompanhar as últimas movimentações.',
        enunciado:'Selecione <strong>id</strong>, <strong>id_cliente</strong>, <strong>data</strong> e <strong>status</strong> dos <strong>3 pedidos mais recentes</strong>.',
        dica1:'Datas também podem ser ordenadas com ORDER BY. O pedido mais recente tem a data mais alta. Use LIMIT para limitar a quantidade de linhas.',
        dica2:'Solução: <code>SELECT id, id_cliente, data, status FROM pedidos ORDER BY data DESC LIMIT 3</code>',
        solucao:'SELECT id, id_cliente, data, status FROM pedidos ORDER BY data DESC LIMIT 3',
        validar:(rows,cols)=>{ if(rows.length!==3)return false; const c=cols.map(x=>x.toLowerCase()); const i=c.indexOf('data'); if(i===-1)return false; return rows[0][i]>='2026-04-16'; },
        erro:'Use <code>ORDER BY data DESC LIMIT 3</code>. O resultado deve ter 3 linhas com os pedidos mais recentes (a partir de 2026-04-16).' },
    ],
  },
  {
    id: 5, titulo: 'Nível 5 — JOIN (Relacionamentos)', cargo: 'Analista Sênior', icone: '', cor: '#d97706',
    mensagem_ceo:`"Os relatórios anteriores eram bons, mas estavam incompletos.<br><br>Você me mostrava o ID do cliente no pedido. Mas eu não sei de cabeça quem é o cliente 47. <strong>Preciso ver o nome.</strong><br><br>Os dados da DataShop estão em tabelas separadas, mas eles se conectam. Você vai precisar aprender a juntar essas tabelas para criar relatórios que façam sentido de verdade."`,
    conceito:{ titulo:'JOIN — Conectando tabelas',
      texto:`O <code>JOIN</code> une duas tabelas pelo campo em comum:<pre>SELECT cl.nome, p.id, p.status\nFROM pedidos p\nJOIN clientes cl ON p.id_cliente = cl.id</pre>Os aliases (<code>p</code>, <code>cl</code>) são apelidos para as tabelas. O <code>ON</code> define quais colunas se conectam.<br><br>Para três tabelas encadeadas:<pre>SELECT ip.id_pedido, pr.nome, ip.quantidade\nFROM itens_pedido ip\nJOIN produtos pr ON ip.id_produto = pr.id</pre>` },
    conclusao:`"JOINs dominados. Você já consegue cruzar informações de múltiplas tabelas em uma única consulta. Isso resolve a maioria dos problemas reais. Agora vamos além, somar, contar, calcular médias por grupo."`,
    exercicios:[
      { id:'e16b', missao:'Missão 5.0', titulo:'Primeiro JOIN — sem aliases',
        narrativa:'"Antes de usar apelidos de tabela, vamos ver como o JOIN funciona na sua forma mais básica."',
        enunciado:'Mostre o <strong>nome do cliente</strong> e o <strong>status do pedido</strong> unindo as tabelas <code>clientes</code> e <code>pedidos</code> pelo campo em comum. Use os nomes completos das tabelas.',
        dica1:'O JOIN pode usar o nome completo da tabela: <code>FROM clientes JOIN pedidos ON clientes.id = pedidos.id_cliente</code>. Qual o campo em comum?',
        dica2:'Solução: <code>SELECT clientes.nome, pedidos.status FROM clientes JOIN pedidos ON clientes.id = pedidos.id_cliente</code>',
        solucao:'SELECT clientes.nome, pedidos.status FROM clientes JOIN pedidos ON clientes.id = pedidos.id_cliente',
        validar:(rows,cols)=>{ if(rows.length!==78)return false; const c=cols.map(x=>x.toLowerCase()); return c.some(x=>x==='nome')&&c.some(x=>x==='status'); },
        erro:'Verifique o JOIN. Use <code>FROM clientes JOIN pedidos ON clientes.id = pedidos.id_cliente</code>. Deve retornar 78 linhas.' },
            { id:'e17', missao:'Missão 5.1', titulo:'Nome dos clientes com seus pedidos',
        narrativa:'"Mostre o nome dos clientes junto com seus pedidos e status."',
        enunciado:'Usando JOIN, mostre <strong>nome do cliente</strong>, <strong>id do pedido</strong> (como <code>pedido</code>) e <strong>status</strong>.',
        dica1:'O JOIN conecta duas tabelas pelo campo em comum. Qual campo na tabela pedidos faz referência ao cliente?',
        dica2:'Solução: <code>SELECT cl.nome, p.id AS pedido, p.status FROM pedidos p JOIN clientes cl ON p.id_cliente = cl.id</code>',
        solucao:'SELECT cl.nome, p.id AS pedido, p.status FROM pedidos p JOIN clientes cl ON p.id_cliente = cl.id',
        validar:(rows,cols)=>{
  if(rows.length!==78)return false;
 
  const c=cols.map(x=>x.toLowerCase());
  const nomeIdx=c.indexOf('nome');
  const pedidoIdx=c.indexOf('pedido');
  const statusIdx=c.indexOf('status');
 
  if(nomeIdx===-1 || pedidoIdx===-1 || statusIdx===-1)return false;
 
  return rows.some(r =>
    String(r[nomeIdx]) === 'Maurita Smedmore' &&
    parseInt(r[pedidoIdx]) === 268 &&
    String(r[statusIdx]) === 'Entregue'
  );
},
        erro:'O JOIN não conectou as tabelas corretamente. Verifique a condição ON: <code>p.id_cliente = cl.id</code>. Deve retornar 78 linhas.' },
      { id:'e18', missao:'Missão 5.2', titulo:'Produtos dentro dos pedidos',
        narrativa:'"Quero ver quais produtos estão dentro de cada pedido: nome, quantidade e preço."',
        enunciado:'Usando JOIN entre <code>itens_pedido</code> e <code>produtos</code>, mostre <strong>id_pedido</strong>, <strong>nome do produto</strong>, <strong>quantidade</strong> e <strong>preco_unitario</strong>.',
        dica1:'O JOIN liga duas tabelas por um campo compartilhado. A tabela itens_pedido tem um campo que referencia a tabela produtos. Qual é ele?',
        dica2:'Solução: <code>SELECT ip.id_pedido, pr.nome, ip.quantidade, ip.preco_unitario FROM itens_pedido ip JOIN produtos pr ON ip.id_produto = pr.id</code>',
        solucao:'SELECT ip.id_pedido, pr.nome, ip.quantidade, ip.preco_unitario FROM itens_pedido ip JOIN produtos pr ON ip.id_produto = pr.id',
        validar:(rows,cols)=>{
  if(rows.length!==122)return false;
 
  const c=cols.map(x=>x.toLowerCase());
  const pedidoIdx=c.indexOf('id_pedido');
  const nomeIdx=c.indexOf('nome');
  const qtdIdx=c.indexOf('quantidade');
  const precoIdx=c.indexOf('preco_unitario');
 
  if(pedidoIdx===-1 || nomeIdx===-1 || qtdIdx===-1 || precoIdx===-1)return false;
 
  return rows.some(r =>
    parseInt(r[pedidoIdx]) === 268 &&
    String(r[nomeIdx]) === 'Tablet Samsung Galaxy Tab A8'
  );
},
        erro:'Una <code>itens_pedido</code> com <code>produtos</code> via <code>ON ip.id_produto = pr.id</code>. Deve retornar 122 linhas.' },
      { id:'e19', missao:'Missão 5.3', titulo:'Cliente e status do pedido',
        narrativa:'"Me mande o nome do cliente e o status do pedido dele, para a lista de acompanhamento."',
        enunciado:'Mostre <strong>nome do cliente</strong>, <strong>status</strong> e <strong>data</strong> do pedido.',
        dica1:'A diferença aqui é que a tabela principal é <code>pedidos</code>. Conecte com <code>clientes</code> usando <code>ON pedidos.id_cliente = clientes.id</code>. Selecione nome do cliente, status e data do pedido.',
        dica2:'Solução: <code>SELECT cl.nome, p.status, p.data FROM pedidos p JOIN clientes cl ON p.id_cliente = cl.id</code>',
        solucao:'SELECT cl.nome, p.status, p.data FROM pedidos p JOIN clientes cl ON p.id_cliente = cl.id',
        validar:(rows,cols)=>{
  if(rows.length!==78)return false;
 
  const c=cols.map(x=>x.toLowerCase());
  const nomeIdx=c.indexOf('nome');
  const statusIdx=c.indexOf('status');
  const dataIdx=c.indexOf('data');
 
  if(nomeIdx===-1 || statusIdx===-1 || dataIdx===-1)return false;
 
  return rows.some(r =>
    String(r[nomeIdx]) === 'Maurita Smedmore' &&
    String(r[statusIdx]) === 'Entregue'
  );
},
        erro:'O resultado deve ter nome, status e data, em 78 linhas. Conecte pedidos com clientes pelo id_cliente.' },
      { id:'e20', missao:'Missão 5.4', titulo:'Produtos e suas categorias',
        narrativa:'"Liste os produtos mostrando o nome da categoria de cada um, não o id."',
        enunciado:'Usando JOIN entre <code>produtos</code> e <code>categorias</code>, mostre o <strong>nome do produto</strong> (como <code>produto</code>) e o <strong>nome da categoria</strong> (como <code>categoria</code>).',
        dica1:'A tabela produtos tem um campo que referencia a tabela categorias. Use esse campo no ON do JOIN.',
        dica2:'Solução: <code>SELECT pr.nome AS produto, c.nome AS categoria FROM produtos pr JOIN categorias c ON pr.id_categoria = c.id</code>',
        solucao:'SELECT pr.nome AS produto, c.nome AS categoria FROM produtos pr JOIN categorias c ON pr.id_categoria = c.id',
        validar:(rows,cols)=>{ if(rows.length!==100)return false; const c=cols.map(x=>x.toLowerCase()); const catIdx=c.findIndex(x=>x==='categoria'); if(catIdx!==-1){ const valid=['Eletrônicos','Roupas','Casa','Esportes','Livros','Beleza']; return rows.every(r=>valid.includes(r[catIdx])); } return c.length===2; },
        erro:'Una <code>produtos</code> com <code>categorias</code> via <code>ON pr.id_categoria = c.id</code>. Deve retornar 100 linhas com nome do produto e nome da categoria.' },
    ],
  },
  {
    id: 6, titulo: 'Nível 6 — Agregação (GROUP BY)', cargo: 'Especialista em Dados', icone: '', cor: '#dc2626',
    mensagem_ceo:`"Precisamos entender os <strong>padrões</strong> do nosso negócio.<br><br>Não basta ver os pedidos um por um. Quero saber quem compra mais, qual categoria é mais cara, qual produto vende mais. Isso é o tipo de análise que vai guiar as nossas decisões estratégicas.<br><br>Esse é o nível que separa quem consulta dados de quem realmente os analisa."`,
    conceito:{ titulo:'GROUP BY — Agrupando e calculando',
      texto:`O <code>GROUP BY</code> agrupa linhas com o mesmo valor e permite calcular estatísticas:<pre>SELECT id_cliente, COUNT(*) AS total\nFROM pedidos\nGROUP BY id_cliente</pre>Funções de agregação:<pre>COUNT(*) — conta linhas\nSUM(col) — soma valores\nAVG(col) — média\nROUND(AVG(col), 2) — média arredondada</pre>Toda coluna no SELECT que não seja função de agregação deve estar no GROUP BY.` },
    conclusao:`"Com GROUP BY você já transforma dados em indicadores de negócio. O último desafio é diferente: vamos encontrar o que está ausente nos dados. O que os registros não mostram diretamente."`,
    exercicios:[
      { id:'e21', missao:'Missão 6.1', titulo:'Ranking de clientes por pedidos',
        narrativa:'"Quais clientes fizeram mais pedidos? Me mostre o ranking com nome."',
        enunciado:'Usando JOIN + GROUP BY, mostre o <strong>nome do cliente</strong> e a contagem de pedidos como <code>total_pedidos</code>. Ordene do maior para o menor.',
        dica1:'Faça o JOIN entre pedidos e clientes, depois use GROUP BY para agrupar por cliente e COUNT() para contar os pedidos de cada um.',
        dica2:'Solução: <code>SELECT cl.nome, COUNT(p.id) AS total_pedidos FROM pedidos p JOIN clientes cl ON p.id_cliente = cl.id GROUP BY cl.nome ORDER BY total_pedidos DESC</code>',
        solucao:'SELECT cl.nome, COUNT(p.id) AS total_pedidos FROM pedidos p JOIN clientes cl ON p.id_cliente = cl.id GROUP BY cl.nome ORDER BY total_pedidos DESC',
        validar:(rows,cols)=>{
  if(rows.length!==49)return false;
 
  const c=cols.map(x=>x.toLowerCase());
  const nomeIdx=c.indexOf('nome');
  const totalIdx=c.findIndex(x =>
    x.includes('pedido') ||
    x.includes('total') ||
    x.includes('count')
  );
 
  if(nomeIdx===-1 || totalIdx===-1)return false;
 
  const totais=rows.map(r=>parseInt(r[totalIdx]));
  const ordenado=totais.every((v,i,a)=>i===0 || a[i-1]>=v);
 
  return ordenado && Math.max(...totais)===6;
},
        erro:'O agrupamento está incorreto. Toda coluna no SELECT que não seja agregação precisa estar no GROUP BY. Deve retornar 49 clientes, o maior tem 6 pedidos.' },
      { id:'e22', missao:'Missão 6.2', titulo:'Preço médio por categoria',
        narrativa:'"Qual é o preço médio dos produtos por categoria?" Para análise de posicionamento.',
        enunciado:'Mostre o <strong>nome da categoria</strong> (como <code>categoria</code>) e a média de preço como <code>preco_medio</code>. Use <code>ROUND(AVG(...), 2)</code>. Ordene do maior para o menor.',
        dica1:'Faça o JOIN entre produtos e categorias, depois agrupe por categoria com GROUP BY. Use AVG() para calcular a média de preço.',
        dica2:'Solução: <code>SELECT c.nome AS categoria, ROUND(AVG(pr.preco), 2) AS preco_medio FROM produtos pr JOIN categorias c ON pr.id_categoria = c.id GROUP BY c.nome ORDER BY preco_medio DESC</code>',
        solucao:'SELECT c.nome AS categoria, ROUND(AVG(pr.preco), 2) AS preco_medio FROM produtos pr JOIN categorias c ON pr.id_categoria = c.id GROUP BY c.nome ORDER BY preco_medio DESC',
        validar:(rows,cols)=>{ if(rows.length!==6)return false; const c=cols.map(x=>x.toLowerCase()); const i=c.findIndex(x=>x.includes('medio')||x.includes('avg')||x.includes('preco')); if(i===-1)return false; const first=parseFloat(rows[0][i]); return first>500&&first<530; },
        erro:'Deve retornar 6 categorias com preço médio. A categoria com maior média é Casa (R$ 521,46).' },
      { id:'e23', missao:'Missão 6.3', titulo:'Quantidade total vendida por produto',
        narrativa:'"Qual é a quantidade total vendida de cada produto?" Para entender os campeões de vendas.',
        enunciado:'Mostre o <strong>nome do produto</strong> e a soma das quantidades como <code>total_vendido</code>. Ordene do mais vendido ao menos vendido.',
        dica1:'Faça o JOIN entre itens_pedido e produtos, depois agrupe por produto com GROUP BY. Use SUM() para somar as quantidades.',
        dica2:'Solução: <code>SELECT pr.nome, SUM(ip.quantidade) AS total_vendido FROM itens_pedido ip JOIN produtos pr ON ip.id_produto = pr.id GROUP BY pr.nome ORDER BY total_vendido DESC</code>',
        solucao:'SELECT pr.nome, SUM(ip.quantidade) AS total_vendido FROM itens_pedido ip JOIN produtos pr ON ip.id_produto = pr.id GROUP BY pr.nome ORDER BY total_vendido DESC',
        validar:(rows,cols)=>{ if(rows.length!==68)return false; const c=cols.map(x=>x.toLowerCase()); const i=c.findIndex(x=>x.includes('vendido')||x.includes('sum')||x.includes('total')); if(i===-1)return false; return Math.max(...rows.map(r=>parseInt(r[i])))===17; },
        erro:'Deve retornar 68 produtos. O mais vendido é "Porta-Trecos Organizador de Mesa" com 17 unidades.' },
    ],
  },
  {
    id: 7, titulo: 'Nível 7 — Problemas Reais', cargo: 'Head de Dados', icone: '', cor: '#7c3aed',
    mensagem_ceo:`"Temos dois problemas urgentes que preciso resolver <strong>ainda hoje</strong>.<br><br>O nosso sistema de CRM está mostrando clientes que nunca compraram nada. Precisamos confirmar quem são eles para a campanha de reativação.<br><br>E o time de logística está reclamando de produtos que aparecem no catálogo mas estão com estoque zerado. Os clientes tentam comprar e recebem erro.<br><br>Esses são problemas reais, com impacto direto no negócio. Me ajude."`,
    conceito:{ titulo:'LEFT JOIN e WHERE IS NULL — Encontrando ausências',
      texto:`O <code>LEFT JOIN</code> traz <em>todos</em> os registros da tabela da esquerda, mesmo que não haja correspondência na direita:<pre>SELECT cl.nome\nFROM clientes cl\nLEFT JOIN pedidos p ON cl.id = p.id_cliente\nWHERE p.id IS NULL</pre>O <code>WHERE p.id IS NULL</code> filtra apenas os clientes que não têm pedidos, ou seja, nunca compraram.<br><br>Para estoque zerado use simplesmente:<pre>SELECT nome FROM produtos WHERE estoque = 0</pre>` },
    conclusao:`<div class="final-msg"><h2>PARABÉNS! VOCÊ É O NOVO HEAD DE DADOS DA DATASHOP!</h2><p>"Você chegou lá. Em poucas sessões, você transformou dados brutos em informações que vão mudar o rumo da DataShop.</p><p>Você aprendeu a explorar, filtrar, ordenar, relacionar e agregar dados. São as habilidades essenciais de qualquer analista de dados.</p><p><strong>Agora você sabe SQL. Use esse poder com sabedoria."</strong></p><p class="sign">— Ricardo Matos, CEO da DataShop</p></div>`,
    exercicios:[
      { id:'e24', missao:'Missão 7.1', titulo:'Clientes que nunca compraram',
        narrativa:'"Quais clientes estão cadastrados mas nunca fizeram nenhum pedido? Preciso dessa lista para a campanha de reativação."',
        enunciado:'Usando <strong>LEFT JOIN</strong>, encontre os clientes que <strong>não possuem pedidos</strong>. Mostre <strong>nome</strong> e <strong>email</strong>.',
        dica1:'O LEFT JOIN mantém todos os registros da tabela da esquerda mesmo sem correspondência na direita. Clientes sem pedidos terão NULL no campo de id do pedido. Use isso no WHERE para filtrá-los.',
        dica2:'Solução: <code>SELECT cl.nome, cl.email FROM clientes cl LEFT JOIN pedidos p ON cl.id = p.id_cliente WHERE p.id IS NULL</code>',
        solucao:'SELECT cl.nome, cl.email FROM clientes cl LEFT JOIN pedidos p ON cl.id = p.id_cliente WHERE p.id IS NULL',
        validar:(rows,cols)=>{ if(rows.length!==51)return false; const c=cols.map(x=>x.toLowerCase()); const i=c.indexOf('nome'); if(i===-1)return false; return rows.every(r=>typeof r[i]==='string'&&r[i].length>0); },
        erro:'Use <code>LEFT JOIN ... WHERE p.id IS NULL</code>. Deve retornar 51 clientes que nunca compraram.' },
      { id:'e25', missao:'Missão 7.2', titulo:'Produtos com estoque zerado',
        narrativa:'"Quais produtos estão no catálogo com estoque zerado? Preciso retirar do ar imediatamente."',
        enunciado:'Encontre os produtos com <code>estoque</code> igual a <code>0</code>. Mostre <strong>nome</strong> e <strong>preco</strong>.',
        dica1:'É um filtro simples com WHERE. Qual coluna guarda a quantidade em estoque? Qual valor indica que não há nada disponível?',
        dica2:'Solução: <code>SELECT nome, preco FROM produtos WHERE estoque = 0</code>',
        solucao:'SELECT nome, preco FROM produtos WHERE estoque = 0',
        validar:(rows,cols)=>{ if(rows.length!==1)return false; const c=cols.map(x=>x.toLowerCase()); const i=c.indexOf('nome'); if(i===-1)return false; return rows[0][i]==='Carregador Rápido USB-C 65W'; },
        erro:'Use <code>WHERE estoque = 0</code>. Deve retornar exatamente 1 produto: "Carregador Rápido USB-C 65W".' },
    ],
  },
];
 
const ALL_EX = LEVELS.flatMap((lv,li) =>
  lv.exercicios.map((ex,ei)=>({...ex, level:lv, numGlobal: LEVELS.slice(0,li).reduce((s,l)=>s+l.exercicios.length,0)+ei+1 }))
);
const TOTAL_EX = ALL_EX.length;