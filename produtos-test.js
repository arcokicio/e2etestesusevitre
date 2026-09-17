jest.mock('./db');
const db = require('./db');
const { listarProdutos } = require('./produtos');

describe('isolamento de tenant', () => {
  beforeEach(() => jest.clearAllMocks());

  it('toda query de produtos leva o tenant_id', async () => {
    db.query.mockResolvedValue([]);
    await listarProdutos(42);

    const [sql, params] = db.query.mock.calls[0];
    expect(sql.toLowerCase()).toContain('tenant_id');   // o filtro existe
    expect(params).toContain(42);                        // e o valor certo foi passado
  });

  it('não permite listar sem tenant', async () => {
    await expect(listarProdutos(undefined)).rejects.toThrow();
  });

  it('tenant A não recebe query do tenant B', async () => {
    db.query.mockResolvedValue([]);
    await listarProdutos(1);
    const [, params] = db.query.mock.calls[0];
    expect(params).not.toContain(2);
  });
});
