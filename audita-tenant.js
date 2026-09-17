const fs = require('node:fs');
const path = require('node:path');

const TABELAS_COM_TENANT = ['produtos', 'pedidos', 'admins', 'configuracoes'];
const IGNORAR = ['migrations', 'seeds', 'node_modules', 'test'];

function varrer(dir, achados = []) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, item.name);
    if (IGNORAR.some(i => p.includes(i))) continue;
    if (item.isDirectory()) { varrer(p, achados); continue; }
    if (!item.name.endsWith('.js')) continue;

    fs.readFileSync(p, 'utf8').split('\n').forEach((linha, i) => {
      const l = linha.toLowerCase();
      const tocaTabela = TABELAS_COM_TENANT.some(t =>
        l.includes(`from ${t}`) || l.includes(`update ${t}`) || l.includes(`delete from ${t}`));
      if (tocaTabela && !l.includes('tenant_id')) {
        achados.push({ arquivo: p, linha: i + 1, texto: linha.trim() });
      }
    });
  }
  return achados;
}

const achados = varrer('./src');
if (achados.length) {
  console.error('\n🔴 QUERIES SEM FILTRO DE TENANT:\n');
  achados.forEach(a => console.error(`  ${a.arquivo}:${a.linha}\n    ${a.texto}\n`));
  process.exit(1);                    // ⭐ reprova o CI
}
console.log('✅ nenhuma query sem tenant_id');
