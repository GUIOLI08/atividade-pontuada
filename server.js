import express from 'express';
import path from 'path'
import { fileURLToPath } from 'url';
import { sequelize, DataTypes } from './db.js';


const app = express();
const PORT = 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

async function conectarAoBanco() {
    try {
        await sequelize.authenticate();
        console.log('Conexão com o banco de dados estabelecida com sucesso! ✨');
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error);
    }
}

const Produto = sequelize.define('Produto', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    descricao: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    data_criacao: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'produtos',
    timestamps: false
});

async function conectarATabela() {
    try {
        await Produto.sync();
        console.log('Tabela "produtos" sincronizada.');
    } catch (error) {
        console.error('Erro ao sincronizar com a tabela "produtos":', error);
    }
}

app.get('/', (req, res) => {
    console.log('✈️ Entrando na rota: "/" ✈️');
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
    
})

app.get('/produtos', async (req, res) => {
    try {
        const produtos = await Produto.findAll();
        res.json(produtos);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.post('/produtos', async (req, res) => {
    try {
        const novoProduto = await Produto.create(req.body);
        res.status(201).json(novoProduto);
    } catch (error) {
        console.error('Erro ao cadastrar produto:', error);
        res.status(400).json({ error: error.message });
    }
});

app.put('/produtos/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { descricao, quantidade, valor } = req.body;

        const produto = await Produto.findByPk(id);

        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        await produto.update({
            descricao,
            quantidade,
            valor
        });

        res.json(produto);
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(400).json({ error: error.message });
    }
});

app.delete('/produtos/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Produto.destroy({ where: { id } });

        if (result === 0) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar produto' });
    }
});

app.listen(PORT, () => {
    conectarAoBanco();
    conectarATabela();
    console.log(`Server running in: http://localhost:${PORT}`);
});
