from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
from datetime import datetime

app = Flask(__name__)
CORS(app)

DATABASE = 'database.db'

def init_db():
    with sqlite3.connect(DATABASE) as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS produtos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                categoria TEXT,
                preco REAL,
                quantidade INTEGER,
                unidade TEXT
            )
        ''')
        conn.execute('''
            CREATE TABLE IF NOT EXISTS vendas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                produto_id INTEGER,
                quantidade INTEGER,
                preco_unitario REAL,
                data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (produto_id) REFERENCES produtos (id)
            )
        ''')
    print("Banco de dados pronto!")

@app.route('/tables/produtos', methods=['GET', 'POST'])
def gerenciar_produtos():
    if request.method == 'GET':
        with sqlite3.connect(DATABASE) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM produtos')
            return jsonify([dict(row) for row in cursor.fetchall()])
    
    data = request.json
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('INSERT INTO produtos (nome, categoria, preco, quantidade, unidade) VALUES (?, ?, ?, ?, ?)',
                       (data['nome'], data['categoria'], data['preco'], data['quantidade'], data['unidade']))
        conn.commit()
    return jsonify({"message": "Sucesso"}), 201

@app.route('/vendas', methods=['POST'])
def registrar_venda():
    data = request.json
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        # Busca o preço atual para registrar na venda
        cursor.execute('SELECT preco FROM produtos WHERE id = ?', (data['produto_id'],))
        produto = cursor.fetchone()
        
        cursor.execute('INSERT INTO vendas (produto_id, quantidade, preco_unitario) VALUES (?, ?, ?)',
                       (data['produto_id'], data['quantidade'], produto[0]))
        cursor.execute('UPDATE produtos SET quantidade = quantidade - ? WHERE id = ?',
                       (data['quantidade'], data['produto_id']))
        conn.commit()
    return jsonify({"message": "Venda registrada"})

@app.route('/relatorios', methods=['GET'])
def relatorios():
    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Busca histórico detalhado
        cursor.execute('''
            SELECT v.data, p.nome, v.quantidade, (v.quantidade * v.preco_unitario) as total
            FROM vendas v
            JOIN produtos p ON v.produto_id = p.id
            ORDER BY v.data DESC
        ''')
        vendas_detalhadas = [dict(row) for row in cursor.fetchall()]
        
        # Calcula totais para os cards
        cursor.execute('SELECT SUM(quantidade * preco_unitario) FROM vendas')
        total_geral = cursor.fetchone()[0] or 0
        
        cursor.execute('SELECT COUNT(*) FROM vendas')
        total_vendas_count = cursor.fetchone()[0] or 0

        return jsonify({
            "historico": vendas_detalhadas,
            "total_valor": total_geral,
            "total_vendas": total_vendas_count,
            "ticket_medio": total_geral / total_vendas_count if total_vendas_count > 0 else 0
        })

if __name__ == '__main__':
    init_db()
    app.run(port=8000, debug=True)