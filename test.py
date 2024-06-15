import serial

try:
    ser = serial.Serial('COM6', 115200, timeout=1)
    print("Serial port opened successfully.")
except serial.SerialException as e:
    print(f"Error: {e}")
