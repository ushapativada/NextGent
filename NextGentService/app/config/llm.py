import os
from crewai import LLM
from dotenv import load_dotenv

load_dotenv(override=True)

llm = LLM(
    model="groq/llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.2,
)
