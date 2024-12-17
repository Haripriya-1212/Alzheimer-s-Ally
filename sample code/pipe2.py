from transformers import pipeline

generator = pipeline("text-generation", model = "distilgpt2")

res = generator("something soemthing ", max_length = 30, num_return_sequences = 2,)

print(res)