import machine
import time
import uos
from machine import Pin, I2S 


# I2S Configuration
SAMPLE_RATE = 16000
BIT_DEPTH = 16
CHANNELS = 1
BUFFER_SIZE = 2048

# Pins 
I2S_WS = 32
I2S_SCK = 33
I2S_SD = 25

# Initialize I2S  
i2s = I2S(
    0,  # I2S peripheral ID
    sck=Pin(I2S_SCK),
    ws=Pin(I2S_WS),
    sd=(I2S_SD),
    mode=I2S.RX, 
    bits=BIT_DEPTH,
    format=I2S.MONO,
    rate=SAMPLE_RATE,
    ibuf=BUFFER_SIZE,
)
 
# Record Audio
def record_audio(duration, filename):
    with open(filename, "wb") as file:
        start_time = time.time()
        while time.time() - start_time < duration:
            buffer = bytearray(BUFFER_SIZE)
            num_read = i2s.readinto(buffer)
            if num_read > 0:
                file.write(buffer) 



 
# Example Usage
record_audio(5, "test_audio.raw")  # Record 5 seconds
print("Recording saved as 'audio5.raw'")

