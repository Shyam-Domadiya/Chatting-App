import google.generativeai as genai


genai.configure(api_key="AIzaSyAwOWBIOiwFsTqrU_4zyctRQuwFeOJmDQA")

model = genai.GenerativeModel(model_name="models/gemini-2.5-flash")


user_input = input("You: ")
response = model.generate_content(user_input).text.strip()
print("Gemini: ", response)