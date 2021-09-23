const express = require('express')
const { v4: uuid } = require('uuid')

const app = express();

app.use(express.json())

const customers = []

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

app.get('/statement', (req, res) => {

    const { cpf } = req.headers

    const customer  = customers.find(customer => customer.cpf === cpf)

    if(customer) {
        return res.json({
            response: customer.statement
        })
    }

    return res.status(404).json({ response: 'Customer not found' })

})

app.listen(3333, () => {
    console.log('Server is up 🚀')
})