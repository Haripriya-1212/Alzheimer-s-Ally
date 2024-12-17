from transformers import pipeline
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F

# classifier = pipeline("sentiment-analysis")

# res = classifier("Something something something")

# print(res)

model_name = "distilbert-base-uncased-finetuned-sst-2-english"
model = AutoModelForSequenceClassification.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)

classifier = pipeline("sentiment-analysis", model = model, tokenizer = tokenizer)

# res = classifier("Something something something")

# print(res)

# sequence = "using a transformer network is simple"
# res = tokenizer(sequence)
# print(res)
# tokens = tokenizer.tokenize(sequence)
# print(tokens)
# ids = tokenizer.convert_tokens_to_ids(tokens)
# print(ids)
# decoded_string = tokenizer.decode(ids)
# print(decoded_string)

X_train = ["Something again goes here for no reason.",
           "Can give more than one sentence so yea another one here!"]

res = classifier(X_train)
print(res)

batch = tokenizer(X_train, padding = True, truncation = True, max_length = 512, return_tensors= "pt")
print(batch)

with torch.no_grad():
    outputs = model(**batch)
    print(outputs)
    predictions = F.softmax(outputs.logits, dim = 1)
    print(predictions)
    labels = torch.argmax(predictions, dim = 1)
    print(labels)

save_directory = "saved"
tokenizer.save_pretrained(save_directory)
model.save_pretrained(save_directory)

tok = AutoTokenizer.from_pretrained(save_directory)
mod = AutoModelForSequenceClassification.from_pretrained(save_directory)