import machine
from time import sleep

gps_serial = machine.UART(2, baudrate=9600, tx=17, rx=16)

while True:
    if gps_serial.any():
        line = gps_serial.readline()
        if line:
            #line = decode('utf-8')
            print(line.strip())
    else:
        print("No gps signal")
    sleep(0.5)