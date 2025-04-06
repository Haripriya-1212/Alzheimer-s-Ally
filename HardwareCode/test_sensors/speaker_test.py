from machine import Pin, I2S
import time

# Define I2S pins
I2S_WS_PIN = 23  # LRC (Word Clock)
I2S_SCK_PIN = 18  # BCLK (Bit Clock)
I2S_SD_PIN = 19  # SD (DIN)

# Initialize I2S
audio = I2S(
    0,
    sck=Pin(I2S_SCK_PIN),
    ws=Pin(I2S_WS_PIN),
    sd=Pin(I2S_SD_PIN),
    mode=I2S.TX,
    bits=16,
    format=I2S.STEREO,
    rate=11000,  # Sample rate
    ibuf=2048  # Input buffer size (adjust as needed)
)

# Function to play WAV file
def play_wav(file_path, volume=1.0):
    try:
        with open(file_path, "rb") as f:
            # Skip the WAV file header (44 bytes for standard PCM)
            f.seek(44)
            buffer = bytearray(1024)  
            
            while True:
                # Read audio data from the file
                bytes_read = f.readinto(buffer)
                if bytes_read == 0:
                    break  # End of file

                # Send audio data to the MAX98357A via I2S
                audio.write(buffer[:bytes_read])

            print("Playback complete!")
    except Exception as e:
        print("Error during playback:", e)
    finally:
        # Deinitialize I2S
        audio.deinit()

# Play the WAV file
try:
    play_wav("/output.wav")  # Replace with the path to your WAV file
except Exception as e:
    print("Playback failed:", e)
