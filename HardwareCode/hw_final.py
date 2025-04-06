import gc
import machine
from machine import Pin, I2S, ADC, SoftI2C, UART
from External_modules import SSD1306
from time import sleep
import uasyncio as asyncio
from umqtt.simple import MQTTClient
import ustruct
import time
import network

# WiFi and MQTT Configuration
SSID = "<SSID>"
PASSWORD = "<password>"
MQTT_BROKER = "<broker_ip>"
MQTT_PORT = 1883
MQTT_CLIENT_ID = "esp32_device"
GPS_TOPIC = b"sensor/gps"
AUDIO_TOPIC = b"sensor/audio"
RESPONSE_TOPIC = b"server/response"
TASKS_TOPIC = b"tasks/data"

# Initialize WiFi
def connect_wifi():
    wifi = network.WLAN(network.STA_IF)
    wifi.active(True)
    wifi.connect(SSID, PASSWORD)
    while not wifi.isconnected():
        sleep(0.5)
    print("Connected to WiFi:", wifi.ifconfig())

# Initialize MQTT
client = MQTTClient(MQTT_CLIENT_ID, MQTT_BROKER, port=MQTT_PORT, keepalive=60)

async def mqtt_connect():
    try:
        client.set_callback(mqtt_callback)
        client.connect()
        client.subscribe(RESPONSE_TOPIC)
        client.subscribe(TASKS_TOPIC)
        print("Connected to MQTT broker and subscribed to topics")
        sleep(0.1)
    except Exception as e:
        print("Failed to connect to MQTT broker:", e)

# MQTT Callback Function
def mqtt_callback(topic, message):
    print(f"Received message on {topic}: {message}")
    if topic == RESPONSE_TOPIC:
        play_on_speaker(message)
    elif topic == TASKS_TOPIC:
        asyncio.create_task(display_task_on_oled(message))


# Initialize I2S for microphone and speaker
mic = I2S(0, sck=Pin(33), ws=Pin(32), sd=Pin(25), mode=I2S.RX, bits=16, format=I2S.MONO, rate=16000, ibuf=2048)
speaker = I2S(1, sck=Pin(18), ws=Pin(23), sd=Pin(19), mode=I2S.TX, bits=16, format=I2S.STEREO, rate=8000, ibuf=2048)

# Initialize OLED
i2c = SoftI2C(scl=Pin(22), sda=Pin(21), freq=400000)
oled = SSD1306.SSD1306_I2C(128, 64, i2c)

# Initialize GPS
gps_serial = UART(2, baudrate=9600, tx=17, rx=16)

# Shared lock for OLED
oled_lock = asyncio.Lock()

# Play Received Audio on Speaker
def play_on_speaker(data):
    # Convert message to raw audio data
    try:
        audio_data = ustruct.unpack(f"{len(data)}B", data)  
        audio_buf = bytearray(audio_data)
        speaker.write(audio_buf)
        print("Playing audio on speaker")
    except Exception as e:
        print("Error playing audio:", e)
        

async def display_oled(line1, line2="", line3=""):
    async with oled_lock:
        oled.fill(0)
        oled.text(line1, 0, 0)
        oled.text(line2, 0, 10)
        oled.text(line3, 0, 20)
        oled.show()

# GPS Task
async def gps_task():
    await publish_data(GPS_TOPIC, b"GPS Test Message from ESP32")
    while True:
        if gps_serial.any():
            line = gps_serial.readline()
            location = line
            if line:
                #location = line.decode("utf-8").strip()
                print(location)
                await publish_data(GPS_TOPIC, location)
        await asyncio.sleep(1)

# Sound Detection Task
async def sound_detection_task():
    sound = ADC(Pin(34))
    threshold = 10600
    mic_buf = bytearray(3200)  # Buffer to hold 10 seconds of audio data
    mic_index = 0  # Index to track where we are in the buffer

    while True:
        analog_value = sound.read_u16()
        if analog_value > threshold:
            print("Sound Detected")
            
            # Start recording when sound exceeds threshold
            start_time = time.time() 
            while time.time() - start_time < 5:  # Record for 5 seconds
                # Read audio data from microphone
                mic_data = mic.readinto(mic_buf[mic_index:])
                mic_index += mic_data  # Update the buffer index
                
                # If the buffer is full, reset the index to start overwriting
                if mic_index >= len(mic_buf):
                    mic_index = 0
                    
                await asyncio.sleep(0.1)  # Sleep for a short time to allow other tasks to run
            
            # Publish the recorded audio data after 10 seconds
            await publish_data(AUDIO_TOPIC, mic_buf[:mic_index])  # Send the recorded audio
            print("Published recorded audio")    
            # Reset buffer for next recording
            mic_index = 0
        else:
            print("No sound detected")
        
        await asyncio.sleep(2)  # Check for sound again after 2 seconds

# Publish Data
async def publish_data(topic, message):
    try:
        client.publish(topic, message)
        print(f"Published to {topic}: {message}")
    except Exception as e:
        print("Failed to publish data:", e)
        
        
# Function to listen for MQTT messages (non-blocking)
async def listen_for_mqtt():
    while True:
        try:
            client.check_msg()  # Non-blocking call to check for incoming messages
        except Exception as e:
            print("MQTT check message error:", e)
        await asyncio.sleep(0.1)
        
mqtt_ready = asyncio.Event()

# Main Task
async def main():
    await mqtt_connect()
    await asyncio.sleep(2)
    await asyncio.gather(gps_task(), sound_detection_task(), listen_for_mqtt())
    

# Run the Main Loop
try:
    connect_wifi()
    asyncio.run(main())
except Exception as e:
    import sys
    sys.print_exception(e)
    gc.collect()

