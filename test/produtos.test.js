const request = require('supertest')
const app = require('../src/app')

describe('API de produtos', () => {
    test('cria e depois busca um produto', async () => {
        const criado = await request(app)
            .post('/produtos')
            .send({ nome: 'Marmita', preco: 2500 })

        expect(criado.status).toBe(201)
        expect(criado.body.nome).toBe('Marmita')

        const buscado = await request(app).get(`/produtos/${criado.body.id}`)
        expect(buscado.status).toBe(200)
        expect(buscado.body).toEqual(criado.body)
    })

    test('recusa nome vazio com 400', async () => {
        const r = await request(app).post('/produtos').send({ nome: '', preco: 10 });
        expect(r.status).toBe(400);
        expect(r.body.erro).toMatch(/nome/);          // /nome/ é uma expressão regular: "contém nome"
    })

    test('recusa preço quebrado com 400', async () => {
        const r = await request(app).post('/produtos').send({ nome: 'X', preco: 10.5 });
        expect(r.status).toBe(400);
    })

    test('404 para produto inexistente', async () => {
        const r = await request(app).get('/produtos/999999');
        expect(r.status).toBe(404);
    })
})
