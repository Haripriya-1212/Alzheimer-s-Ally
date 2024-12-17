from transformers import pipeline

classifier = pipeline("zero-shot-classification")

res = classifier(
    "Again something something", 
    candidate_labels=["education","politics","business"],
    )

print(res)