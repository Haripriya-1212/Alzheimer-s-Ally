from umqtt.simple import MQTTClient

import network, usys
import urequests
import ujson as json

SSID = "<SSID>"
PASSWORD = "<password>"

# Connect to WiFi
wifi = network.WLAN(network.STA_IF)
wifi.active(True)
wifi.connect(SSID, PASSWORD)

while not wifi.isconnected():
    pass

print("Connected to WiFi:", wifi.ifconfig())


# MQTT Configuration
MQTT_BROKER = "<broker_ip>"  # No 'http://'
MQTT_PORT = 1883
MQTT_CLIENT_ID = "esp32_device"
GPS_TOPIC = "sensor/gps"
AUDIO_TOPIC = "sensor/audio"


# Creating MQTT client
client = MQTTClient(MQTT_CLIENT_ID, MQTT_BROKER, port=MQTT_PORT)

def connect_mqtt():
    try:
        client.connect()
        print("Connected to MQTT broker")
    except Exception as e:
        print("Failed to connect to MQTT broker:", e)

connect_mqtt()