from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import sqlite3
import webbrowser
from threading import Timer
import os

# Tenta importar win32print apenas se estiver no Windows
try:
    import win32print
    import win32ui
    import win32con
    WINDOWS_PRINTING_AVAILABLE = True
except ImportError:
    WINDOWS_PRINTING_AVAILABLE = False

app = Flask(__name__, static_folder='.')
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

def imprimir_cupom(venda_data):
    if not WINDOWS_PRINTING_AVAILABLE:
        print("Impressão não disponível neste sistema operacional.")
        return False

    try:
        # Pega a impressora padrão do Windows
        printer_name = win32print.GetDefaultPrinter()
        hPrinter = win32print.OpenPrinter(printer_name)
        
        # Inicia o documento de impressão
        hJob = win32print.StartDocPrinter(hPrinter, 1, ("Cupom de Venda", None, "RAW"))
        win32print.StartPagePrinter(hPrinter)

        # Formatação do Cupom (Texto Simples para Térmica)
        cupom = []
        cupom.append("      SISTEMA PDV CONTROL      ")
        cupom.append("-------------------------------")
        cupom.append(f"Data: {venda_data.get('data', '---')}")
        cupom.append("-------------------------------")
        cupom.append("Item          Qtd    Preco")
        
        total = 0
        for item in venda_data.get('itens', []):
            nome = item['nome'][:12].ljust(12)
            qtd = str(item['quantidade']).rjust(5)
            preco = f"{item['preco']:.2f}".rjust(8)
            cupom.append(f"{nome} {qtd} {preco}")
            total += item['quantidade'] * item['preco']

        cupom.append("-------------------------------")
        cupom.append(f"TOTAL:           R$ {total:.2f}")
        cupom.append("-------------------------------")
        cupom.append("    Obrigado pela preferencia! ")
        cupom.append("\n\n\n\n") # Espaço para corte

        # Envia o texto para a impressora
        texto_final = "\n".join(cupom)
        win32print.WritePrinter(hPrinter, texto_final.encode('cp850')) # Encoding comum em térmicas

        win32print.EndPagePrinter(hPrinter)
        win32print.EndDocPrinter(hPrinter)
        win32print.ClosePrinter(hPrinter)
        return True
    except Exception as e:
        print(f"Erro ao imprimir: {e}")
        return False

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

@app.route('/vendas', methods=['POST'])
def registrar_venda():
    data = request.json
    try:
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            
            # Processa cada item da venda (ajustado para o formato do frontend)
            itens_venda = data.get('itens', [])
            for item in itens_venda:
                cursor.execute('INSERT INTO vendas (produto_id, quantidade, preco_unitario) VALUES (?, ?, ?)',
                               (item['id'], item['quantidade'], item['preco']))
                cursor.execute('UPDATE produtos SET quantidade = quantidade - ? WHERE id = ?',
                               (item['quantidade'], item['id']))
            conn.commit()
        
        # Tenta imprimir o cupom automaticamente
        imprimir_cupom(data)
        
        return jsonify({"message": "Venda registrada e cupom enviado para impressora"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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

@app.route('/relatorios', methods=['GET'])
def relatorios():
    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('''
            SELECT v.data, p.nome, v.quantidade, (v.quantidade * v.preco_unitario) as total
            FROM vendas v
            JOIN produtos p ON v.produto_id = p.id
            ORDER BY v.data DESC
        ''')
        vendas_detalhadas = [dict(row) for row in cursor.fetchall()]
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

def open_browser():
    webbrowser.open_new('http://127.0.0.1:8000/')

if __name__ == '__main__':
    init_db()
    Timer(1.5, open_browser).start()
    app.run(port=8000)