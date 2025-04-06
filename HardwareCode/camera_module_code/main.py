import camera
import esp32
import time
import network
import ujson as json
from umqtt.simple import MQTTClient

# Load WiFi and MQTT broker credentials
with open("/wifi_settings.json") as credentials_json:
    settings = json.loads(credentials_json.read())

SSID = settings["wifi_name"]
PASSWORD = settings["password"]
BROKER = "192.168.242.75"
TOPIC = b"camera/frames"

try:
    # Connect to WiFi
    wifi = network.WLAN(network.STA_IF)
    wifi.active(True)
    wifi.connect(SSID, PASSWORD)

    while not wifi.isconnected():
        pass

    print("WiFi connected:", wifi.ifconfig())

    # Initialize MQTT client
    client_id = "esp32-camera"
    mqtt_client = MQTTClient(client_id, BROKER)
    mqtt_client.connect()
    print(f"Connected to MQTT broker at {BROKER}")

    # Initialize the camera
    camera.init(0)  # Use 0 for PSRAM, 1 for no PSRAM
    camera.framesize(camera.FRAME_VGA)  # Options: FRAME_QVGA, FRAME_VGA, etc.
    camera.quality(10)  # Lower number means better quality

    while True:
        try:
            # Capture a frame
            frame = camera.capture()
            print("Frame captured")

            # Publish the frame to the MQTT broker
            mqtt_client.publish(TOPIC, frame)
            print("Frame published")

            time.sleep(0.1)  # Adjust for desired frame rate (10 FPS here)

        except Exception as e:
            print("Error capturing or publishing frame:", e)

except Exception as e:
    print("An issue occurred: ", e)

finally:
    #import upip
    #upip.install('micropython-umqtt.simple')
    camera.deinit()
    mqtt_client.disconnect()
