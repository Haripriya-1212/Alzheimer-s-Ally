# Alzheimer's Ally
Enhancing Alzheimer patients’ Quality of Life through AI powered assistant

This project has 3 parts
1. The hardware part (the device) - ESP32, Camera module, GPS module, OLED display, microphone and speaker modules, sound sensor
2. The AI models - face recognition(resnet-50) & scream detection(Wav2Vec2)
3. Website - MERN stack

## Setting up MQTT broker
```
#install mqtt
brew install mosquitto
```
Starting the MQTT broker
```
brew services start mosquitto

# to list active connections
netstat -an | grep 1883
```

To allow other devices to connect
```
cd /opt/homebrew/opt/mosquitto/etc/mosquitto
nano mosquitto.conf

#add these lines at the end of config file and restart mqtt broker
bind_address 0.0.0.0
allow_anonymous true
```

Restart mqtt broker
```
brew services restart mosquitto
```
