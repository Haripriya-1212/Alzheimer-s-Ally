from machine import Pin, ADC, SoftI2C #I2C #SoftI2C 
from External_modules import SSD1306
from time import sleep

i2c = SoftI2C(scl=Pin(22), sda=Pin(21), freq=400000)
oled_width = 128
oled_height = 64
oled = SSD1306.SSD1306_I2C(oled_width, oled_height, i2c)

sound = ADC(4)
threshold = 15000

while True:
    analog_value = sound.read_u16()
    print(analog_value)
    
    digital_sig = 1 if analog_value>threshold else 0
    
    if digital_sig:
        print("Sound Detected")
        oled.fill(0)
        oled.text('OLED Display', 0, 0)
        oled.text('Sound Detected', 0, 10)
        oled.text(str(analog_value), 0, 20)
        #oled.text('line 4', 0, 30)        
        oled.show()
    else:
        oled.fill(0)
        oled.text('OLED Display', 0, 0)
        oled.text('Sound Not Detected', 0, 10)
        #oled.text('line 4', 0, 30)        
        oled.show()
        
        
    sleep(1)

oled.poweroff()