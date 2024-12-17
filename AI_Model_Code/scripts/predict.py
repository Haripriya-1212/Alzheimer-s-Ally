import torch
from torchvision import transforms
from torchvision.models import resnet50
from PIL import Image
import os
import pyttsx3  # For voice assistant

# Initialize the voice assistant
engine = pyttsx3.init()

# Load the saved model
model_path = "models/resnet50_finetuned.pth"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load the ResNet model
model = resnet50(pretrained=False)
num_classes = 31  # Replace with the actual number of classes (people)
model.fc = torch.nn.Linear(model.fc.in_features, num_classes)
model.load_state_dict(torch.load(model_path, map_location=device))
model = model.to(device)
model.eval()

# Define the same transformations used for training
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Function to predict
def predict_image(image_path, model, transform):
    image = Image.open(image_path).convert('RGB')
    image = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(image)
        _, predicted = torch.max(outputs, 1)

    return predicted.item()

# Load class names
class_names = os.listdir("dataset/Original Images")

# Test on a single image
test_image_path = "dataset/Original Images/Claire Holt/Claire Holt_13.jpg"  # Replace with a test image path
prediction = predict_image(test_image_path, model, transform)

# Get predicted class name
predicted_class = class_names[prediction]
result = f"Predicted Person: {predicted_class}, Relation: Family Friend"  # Modify relation fetching logic if dynamic

# Print result
print(result)

# Voice assistant announces the result
engine.say(result)
engine.runAndWait()
