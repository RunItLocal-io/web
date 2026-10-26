---
title: "Structured output with Ollama: get reliable JSON from a local model"
description: Use Ollama's format parameter to make a local model return valid JSON, or JSON that matches your own schema. Working curl and Python examples, plus tips.
track: use
order: 13
date: 2026-10-26
models: qwen3-4b, qwen3-8b, qwen3-14b
---
**Pass a JSON schema in Ollama's `format` parameter and the model's reply is forced to match it.** You get the fields you asked for, with the types you asked for, every time. You can also pass `"json"` for any valid JSON without a fixed shape, but a schema is almost always better.

This is what turns a chat model into something a script can rely on: extracting fields from invoices, tagging support emails, or classifying thousands of documents.

## The two modes

| `format` value | What you get | Use it when |
|---|---|---|
| `"json"` | Valid JSON, any shape | Quick tests, or the shape varies |
| A JSON schema | JSON matching your fields and types | Anything a program will read |

Ollama doesn't just ask the model nicely. It constrains which tokens the model can produce, so the output parses. The content still depends on the model; a schema guarantees an `age` field that's a number, not that it's the right number.

## Example: curl with a schema

```
curl http://localhost:11434/api/chat -d '{
  "model": "qwen3:8b",
  "stream": false,
  "messages": [{"role": "user", "content": "Maria is 34 and lives in Lisbon. Return her name, city and age as JSON."}],
  "format": {
    "type": "object",
    "properties": {
      "name": {"type": "string"},
      "city": {"type": "string"},
      "age": {"type": "integer"}
    },
    "required": ["name", "city", "age"]
  }
}'
```

The JSON comes back as a string in `message.content`, so parse it once more on your side. With `/api/generate` instead of `/api/chat`, it's in `response`.

## Example: Python with Pydantic

Ollama's Python library works neatly with Pydantic: define the shape as a class, pass its schema, and validate the reply back into the class.

```sh
pip install ollama pydantic
```

```python
from ollama import chat
from pydantic import BaseModel

class Person(BaseModel):
    name: str
    city: str
    age: int

r = chat(
    model="qwen3:8b",
    messages=[{"role": "user", "content": "Maria is 34 and lives in Lisbon. Return her name, city and age as JSON."}],
    format=Person.model_json_schema(),
    options={"temperature": 0},
)
person = Person.model_validate_json(r.message.content)
print(person.name, person.city, person.age)
```

Lists work the same way. For a classifier, give a field a fixed set of choices with an `enum` in the schema, like `"category": {"type": "string", "enum": ["invoice", "receipt", "other"]}`, and the model can only pick one of them.

## Tips that make it reliable

1. **Say "JSON" in the prompt too.** Describe what you want, even with a schema. The model fills fields better when it knows what they're for. With plain `"json"` mode this matters even more.
2. **Set temperature to 0.** Extraction should be consistent, not creative.
3. **Allow "unknown".** If a value might be missing, make the field optional or allow `null`. Otherwise the model will invent something to fill the required slot.
4. **Keep schemas flat and small.** Five clear fields beat a deeply nested object, especially on small models.
5. **Use clear field names.** `invoice_total_usd` gets better answers than `amt`.
6. **Turn off thinking for simple extraction.** With Qwen3 models, set `"think": false` in the request. It's faster, and extraction rarely needs reasoning.
7. **Validate anyway.** Check values make sense, like dates in the past and totals above zero, before trusting them.

## Which model to use

Extraction and classification are some of the easiest jobs for a model, so start small.

- **[Qwen3 4B](/model/qwen3-4b):** classifying, tagging, pulling obvious fields. Very fast.
- **[Qwen3 8B](/model/qwen3-8b):** messier input like emails and scanned-then-OCR'd text.
- **[Qwen3 14B](/model/qwen3-14b):** long documents, or fields that need judgement.

For a batch job, speed is multiplied by the number of items. Here's an 8 GB RTX 4060 from our calculator:

{{lineup rtx-4060}}

Qwen3 4B at about 60 tok/s finishes a short JSON reply almost instantly; most of the time goes on reading the input. Test on 20 real examples with 4B and 8B, compare, and pick the smaller one if it gets them right. More on choosing in [the best small model for scripts](/learn/best-small-model-for-scripts).

## Where to go next

To run this over a folder of files, see [batch jobs with a local model](/learn/batch-jobs-with-a-local-model). For tool calling, which uses the same idea for arguments, see [local AI agents](/learn/local-ai-agents). For the rest of the API, see [the Ollama API guide](/learn/ollama-api-guide).
