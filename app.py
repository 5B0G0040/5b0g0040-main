import os
from flask import Flask, render_template, jsonify
import serial
import threading

app = Flask(__name__)

def init_serial():
    try:
        ser = serial.Serial('COM3', 9600, timeout=1)
        print("串口連接成功")
        return ser
    except serial.SerialException as e:
        print(f"串口連接失敗: {e}")
        return None

ser = init_serial()
weight = "No data yet"
lock = threading.Lock()

def read_from_port(ser):
    global weight
    while ser and ser.is_open:
        try:
            line = ser.readline().decode('utf-8').rstrip()
            if line:
                with lock:
                    weight = line
                    temp_weight = float(line)
                    weight = 0 if temp_weight == 0 else temp_weight
                print(f"讀取到數據: {weight}")
        except Exception as e:
            print(f"讀取串口數據時發生錯誤: {e}")
            break

if ser:
    thread = threading.Thread(target=read_from_port, args=(ser,))
    thread.daemon = True  # 設置線程為守護線程
    thread.start()

@app.route('/')
def index():
    # 列出 templates 目錄的內容
    templates_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')
    print(f"Templates directory: {templates_dir}")
    print(f"Templates content: {os.listdir(templates_dir)}")
    return render_template('index.html')

@app.route('/weight')
def get_weight():
    with lock:
        return jsonify({'weight': weight})

if __name__ == '__main__':
    if ser:
        app.run(debug=True, use_reloader=False)
    else:
        print("無法初始化串口，程序退出。")