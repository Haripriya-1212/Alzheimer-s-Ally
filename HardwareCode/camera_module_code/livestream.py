import camera
import esp32
import time
import network, usys
import ujson as json
import socket

# Load WiFi credentials
with open("/wifi_settings.json") as credentials_json:
    settings = json.loads(credentials_json.read())

SSID = settings["wifi_name"]
PASSWORD = settings["password"]

try:
    # Connect to WiFi
    wifi = network.WLAN(network.STA_IF)
    wifi.active(True)
    wifi.connect(SSID, PASSWORD)

    while not wifi.isconnected():
        pass

    print("WiFi connected:", wifi.ifconfig())

    # Initialize the camera
    camera.init(0)  # Use 0 for PSRAM, 1 for no PSRAM
    camera.framesize(camera.FRAME_VGA)  # Resolution: 640x480
    camera.quality(10)  # Lower number means better quality

    # Start the HTTP server
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('', 80))
    # can handle up to 5 simultaneous connections in queue
    s.listen(5)

    print("Server running at http://%s/" % wifi.ifconfig()[0])

    while True:
        # Accepts a connection (e.g., browser visiting the ESP32's IP)
        conn, addr = s.accept()
        print("Connection from:", addr)
        
        # Send HTTP headers for a multipart response
        conn.send(b"HTTP/1.1 200 OK\r\n")
        conn.send(b"Content-Type: multipart/x-mixed-replace; boundary=frame\r\n\r\n")
        
        try:
            while True:
                frame = camera.capture()
                conn.send(b"--frame\r\n")
                conn.send(b"Content-Type: image/jpeg\r\n\r\n")
                conn.send(frame)
                conn.send(b"\r\n")
                print("Frame sent")
                time.sleep(0.1)  # Adjust for desired frame rate (10 FPS here)
        except Exception as e:
            print("Error sending frame:", e)
        finally:
            conn.close()

except Exception as e:
    print("An issue occurred: ", e)

finally:
    camera.deinit()
