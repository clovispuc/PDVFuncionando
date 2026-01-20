from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import sqlite3
import webbrowser
from threading import Timer
import os

try:
    import win32print
    WINDOWS_PRINTING_AVAILABLE = True
except ImportError:
    WINDOWS_PRINTING_AVAILABLE = False

app = Flask(__name__, static_folder='.')
CORS(app)

DATABASE = 'database.db'

# Comandos ESC/POS
ESC = b'\x1b'
GS = b'\x1d'
RESET = ESC + b'@'
BOLD_ON = ESC + b'E\x01'
BOLD_OFF = ESC + b'E\x00'
ALIGN_CENTER = ESC + b'a\x01'
FONT_SIZE_NORMAL = GS + b'!\x00'
FONT_SIZE_LARGE = GS + b'!\x11' # Dobro de altura e largura
FONT_SIZE_HUGE = GS + b'!\x22'  # Triplo de altura e largura

def init_db():
    with sqlite3.connect(DATABASE) as conn:
        conn.execute('CREATE TABLE IF NOT EXISTS produtos (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, categoria TEXT, preco REAL, quantidade INTEGER, unidade TEXT)')
        conn.execute('CREATE TABLE IF NOT EXISTS vendas (id INTEGER PRIMARY KEY AUTOINCREMENT, produto_id INTEGER, quantidade INTEGER, preco_unitario REAL, data TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (produto_id) REFERENCES produtos (id))')

def imprimir_volante_individual(item_nome, config, venda_id):
    if not WINDOWS_PRINTING_AVAILABLE:
        return False

    try:
        printer_name = win32print.GetDefaultPrinter()
        hPrinter = win32print.OpenPrinter(printer_name)
        hJob = win32print.StartDocPrinter(hPrinter, 1, (f"Ficha {item_nome}", None, "RAW"))
        win32print.StartPagePrinter(hPrinter)

        buffer = b""
        buffer += RESET
        buffer += ALIGN_CENTER
        
        # Título do Evento
        buffer += FONT_SIZE_LARGE + BOLD_ON
        buffer += config.get('titulo', 'EVENTO').encode('cp850') + b"\n"
        buffer += b"--------------------------------\n"
        
        # Nome do Item (Em destaque)
        buffer += FONT_SIZE_HUGE
        buffer += item_nome.upper().encode('cp850') + b"\n"
        
        # Rodapé da Ficha
        buffer += FONT_SIZE_NORMAL + BOLD_OFF
        buffer += b"--------------------------------\n"
        buffer += f"ID Venda: {venda_id}\n".encode('cp850')
        buffer += b"VALE 01 UNIDADE\n"
        buffer += b"Nao possui valor fiscal\n"
        
        buffer += b"\n\n\n\n\n"
        buffer += GS + b"V\x00" # Corte

        win32print.WritePrinter(hPrinter, buffer)
        win32print.EndPagePrinter(hPrinter)
        win32print.EndDocPrinter(hPrinter)
        win32print.ClosePrinter(hPrinter)
        return True
    except Exception as e:
        print(f"Erro na impressao do volante: {e}")
        return False

@app.route('/')
def index(): return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path): return send_from_directory('.', path)

@app.route('/vendas', methods=['POST'])
def registrar_venda():
    data = request.json
    config = data.get('config_impressao', {'titulo': 'MEU EVENTO'})
    
    try:
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            venda_id = os.urandom(4).hex().upper() # ID simples para a ficha
            
            for item in data.get('itens', []):
                # Salva no banco
                cursor.execute('INSERT INTO vendas (produto_id, quantidade, preco_unitario) VALUES (?, ?, ?)',
                               (item['id'], item['quantidade'], item['preco']))
                cursor.execute('UPDATE produtos SET quantidade = quantidade - ? WHERE id = ?',
                               (item['quantidade'], item['id']))
                
                # IMPRESSÃO INDIVIDUAL: Se vendeu 3, imprime 3 vezes
                for _ in range(int(item['quantidade'])):
                    imprimir_volante_individual(item['nome'], config, venda_id)
                    
            conn.commit()
        return jsonify({"message": "Vendas registradas e fichas impressas"})
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
        cursor.execute('INSERT INTO produtos (nome, categoria, preco, quantidade, unidade) VALUES (?, ?, ?, ?, ?)', (data['nome'], data['categoria'], data['preco'], data['quantidade'], data['unidade']))
        conn.commit()
    return jsonify({"message": "Sucesso"}), 201

@app.route('/relatorios', methods=['GET'])
def relatorios():
    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('SELECT v.data, p.nome, v.quantidade, (v.quantidade * v.preco_unitario) as total FROM vendas v JOIN produtos p ON v.produto_id = p.id ORDER BY v.data DESC')
        vendas_detalhadas = [dict(row) for row in cursor.fetchall()]
        cursor.execute('SELECT SUM(quantidade * preco_unitario) FROM vendas')
        total_geral = cursor.fetchone()[0] or 0
        cursor.execute('SELECT COUNT(*) FROM vendas')
        total_vendas_count = cursor.fetchone()[0] or 0
        return jsonify({"historico": vendas_detalhadas, "total_valor": total_geral, "total_vendas": total_vendas_count, "ticket_medio": total_geral / total_vendas_count if total_vendas_count > 0 else 0})

def open_browser(): webbrowser.open_new('http://127.0.0.1:8000/')

if __name__ == '__main__':
    init_db()
    Timer(1.5, open_browser).start()
    app.run(port=8000)