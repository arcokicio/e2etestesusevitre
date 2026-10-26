const express = require('express')

const app = express()

// app.use(funcao) registra um MIDDLEWARE: uma função que roda em TODA requisição,
// na ordem em que foi registrada. express.json() lê o corpo da requisição e,
// se for JSON, transforma em objeto JavaScript dentro de req.body.
app.use(express.json())

class errodeNegocio extends Error {
    constructor(mensagem, status = 400) {
        super(mensagem)
        this.status = status
        this.esperado = true
    }
}

// "banco" memoria
const produtos = []
let proximoId = 1
// Listar
app.get('/produtos', (req, res) => {
    res.json(produtos)
})
app.get('/produtos/:id', (req, res, next) => {
    const id = Number(req.params.id)
    const produto = produtos.find(p => p.id === id)
    if (!produto) {
        return next(new errodeNegocio('nao encontrado', 404))
    }
    //por em quanto nao aparece nada no console pq 
    console.log(produto)
    res.json(produto)
})
// Criar
app.post('/produtos', (req, res, next) => {
    const { nome, preco } = req.body
    if (typeof nome !== 'string' || !nome.trim()) {
        return next(new errodeNegocio('nome obrigatório', 400))
    }

    if (!Number.isInteger(preco) || preco < 0) {
        return next(new errodeNegocio('preco em centavos, >= 0', 400));
    }
    const novo = { id: proximoId++, nome: nome.trim(), preco }
    produtos.push(novo)
    res.status(201).json(novo)
});
// Atualizar
app.put('/produtos/:id', (req, res, next) => {
    const produto = produtos.find(p => p.id === Number(req.params.id))
    if (!produto) return next(new errodeNegocio('produto nao encontrado', 404))

    const { nome, preco } = req.body
    if (nome !== undefined) produto.nome = String(nome).trim()
    if (preco !== undefined) {
        if (!Number.isInteger(preco) || preco < 0) {
            return next(new errodeNegocio('produto não encontrado', 404))
        }
        produto.preco = preco
    }
    res.json(produto)
})

// Apagar
app.delete('/produtos/:id', (req, res, next) => {
    const i = produtos.findIndex(p => p.id === Number(req.params.id))
    if (i === -1) return next(new errodeNegocio('não encontrado', 404))
    produtos.splice(i, 1)
    res.status(204).end()
})

// Erro
app.use((err, req, res, next) => {
    if (err.esperado) {
        return res.status(err.status).json({ erro: err.message })
    }
    console.error(err)
    res.status(500).json({ erro: 'erro interno' })
})

module.exports = app 