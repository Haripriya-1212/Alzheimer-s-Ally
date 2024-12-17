import torch
from torchvision import datasets, transforms
from torch.utils.data import DataLoader
import torch.nn as nn
from torchvision.models import resnet50
import torch.optim as optim
import os
from torchvision.models import resnet50, ResNet50_Weights

# Set the dataset path
dataset_path = os.path.join("dataset", "Original Images")  # path to the original images folder

# Define image transformations
transform = transforms.Compose([
    transforms.Resize((224, 224)),  # Resizing images to 224x224 for ResNet
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Load the dataset
train_data = datasets.ImageFolder(root=dataset_path, transform=transform)
train_loader = DataLoader(train_data, batch_size=32, shuffle=True)

# Print classes (folders of people)
print("Classes:", train_data.classes)

# Load ResNet50 with pretrained weights
weights = ResNet50_Weights.DEFAULT  # Or use IMAGENET1K_V1 for older weights
model = resnet50(weights=weights)

# Update the final classification layer
num_classes = len(train_data.classes)  # Number of unique people in the dataset
model.fc = nn.Linear(model.fc.in_features, num_classes)

# Move the model to GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)

# Define the loss function and optimizer
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.0001)

# Training loop
epochs = 10
for epoch in range(epochs):
    model.train()
    running_loss = 0.0

    for images, labels in train_loader:
        images, labels = images.to(device), labels.to(device)

        # Zero the gradient
        optimizer.zero_grad()

        # Forward pass
        outputs = model(images)
        loss = criterion(outputs, labels)

        # Backward pass
        loss.backward()
        optimizer.step()

        running_loss += loss.item()

    print(f"Epoch [{epoch+1}/{epochs}], Loss: {running_loss/len(train_loader):.4f}")

# Save the trained model
torch.save(model.state_dict(), "models/resnet50_finetuned.pth")
print("Model saved to models/resnet50_finetuned.pth")
