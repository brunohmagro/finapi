const { response } = require('express');
const express = require('express')
const { v4: uuid } = require('uuid')

const app = express();

app.use(express.json())

const customers = []

// Middleware

function verifyIfExistAccountCpf(req, res, next) {
    const { cpf } = req.headers

    const customer  = customers.find(customer => customer.cpf === cpf)

    if(!customer) {
        return res.status(404).json({ response: 'Customer not found' })
    }

    req.customer = customer

    return next()
}

function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => {
        if(operation.type === 'credit') {
            return acc + operation.amount
        }else {
            return acc - operation.amount
        }
    }, 0)

    return balance
}

/**
 * cpf - string
 * name - string
 * id - uuid
 * statement - []
 */
app.post('/account', (req, res) => {
    const { cpf, name } = req.body

    const findToCpf = customers.some(customer => customer.cpf === cpf)

    if(findToCpf) {        
        return res.status(400).json({
            error: 'Customer already exists'
        })
    }

    const account = {
        cpf,
        name,
        id: uuid(),
        statement: []
    }

    customers.push(account)

    res.status(202).send()

})

//app.use(verifyIfExistAccountCpf)

app.get('/statement', verifyIfExistAccountCpf, (req, res) => {    

    const { customer } = req

    return res.json({
        response: customer.statement
    })

})

app.post('/deposit', verifyIfExistAccountCpf, (req, res) => {
    const { description, amount } = req.body
    const { customer } = req

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: 'credit'
    }

    customer.statement.push(statementOperation)

    return res.status(201).send()

})

app.post('/withdraw', verifyIfExistAccountCpf, (req, res) => {
    const { amount } = req.body
    const { customer } = req

    const balance = getBalance(customer.statement)

    if(amount > balance) {
        return res.status(400).json({ response: 'Amount requested not be available' })
    }

    const withdrawOperation = {
        amount,
        created_at: new Date(),
        type: 'withdraw'
    }

    customer.statement.push(withdrawOperation)

    return res.status(201).send()
})

app.get('/statement/date', verifyIfExistAccountCpf, (req, res) => {    

    const { customer } = req
    const { date } = req.query

    const dateFormatted = new Date(date + ' 00:00' )

    const statement = customer.statement.filter(statement => statement.created_at.toDateString() === dateFormatted.toDateString())

    return res.json({
        response: statement
    })

})

app.put('/account', verifyIfExistAccountCpf, (req, res) => {
    const { name } = req.body
    const { customer } = req

    customer.name = name

    const user = {
        id: customer.id,
        name: customer.name,
    }

    return res.status(202).json(user)

})

app.get('/account', verifyIfExistAccountCpf, (req, res) => {
    const { customer } = req

    const user = {
        id: customer.id,
        name: customer.name,
    }

    return res.status(200).json(user)
})

app.delete('/account', verifyIfExistAccountCpf, (req, res) => {
    const { customer } = req

    customers.splice(customer, 1)

    return res.status(204).send()
})

app.listen(3333, () => {
    console.log('Server is up 🚀')
})