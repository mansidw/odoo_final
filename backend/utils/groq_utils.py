import os
from groq import Groq
import requests
from dotenv import load_dotenv
load_dotenv()
import ast
from utils.helper import process_recommendation_prompt

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def get_recommendations(history,age,gender,location,authors,genres,inventory):
    prompt = process_recommendation_prompt(history,age,gender,location,authors,genres,inventory)
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        model="llama3-8b-8192",
    )
    data = chat_completion.choices[0].message.content
    isbn_list = ast.literal_eval(data)
    return(isbn_list)