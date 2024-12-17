from transformers import AutoModelForImageClassification, AutoFeatureExtractor
import torch
from PIL import Image

# Load model and feature extractor
model_name = "microsoft/resnet-50"
model = AutoModelForImageClassification.from_pretrained(model_name)
feature_extractor = AutoFeatureExtractor.from_pretrained(model_name)

# Load and preprocess image
image_path = r"D:\Photos\From phone\Kerala trip\20231221_011832.jpg"
image = Image.open(image_path).convert("RGB")
inputs = feature_extractor(images=image, return_tensors="pt")

# Get predictions
outputs = model(**inputs)
predicted_class = outputs.logits.argmax(-1).item()

# Decode prediction
labels = model.config.id2label
predicted_label = labels[predicted_class]
print(f"Predicted label: {predicted_label}")
