from machine import Pin, ADC
import time

sound = ADC(4)
#sound.atten(ADC.ATTN_11DB)

threshold = 2000

while True:
    analog_value = sound.read_u16()
    print(analog_value)
    
    digital_sig = 1 if analog_value>threshold else 0
    
    if digital_sig:
        print("Sound Detected")
        
    time.sleep_ms(1000)

