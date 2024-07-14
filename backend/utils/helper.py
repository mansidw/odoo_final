def process_recommendation_prompt(history,age,gender,location,authors,genres,inventory):
    prompt = """Consider you are a great book recommender, now the input information would include three things -
    1. Past reading history of the user
    2. Demographic details like the age, gender, location, preferred genres and authors
    3. The books currently present in the inventory
    Given these information you have to recommend the books to the user which from the list of books in the inventory. \n
    RESPONSE GUIDELINES - \n
    1. Return an array of isbn of the books in the inventory nothing else. \n
    2. Do not return any other information or explaination just the array
    Here is the input \n- """
    prompt = prompt + "Past borrowing history - " + str(history) + "\n" if history else prompt
    prompt = prompt + "Age - " + str(age) + "\n" if age else prompt
    prompt = prompt + "Gender - " + gender + "\n" if gender else prompt
    prompt = prompt + "Location - " + location + "\n" if location else prompt


    prompt = prompt + "Preffered Authors - " + str(authors) + "\n" if authors else prompt
    prompt = prompt + "Preffered Genres - " + str(genres) + "\n" if genres else prompt
    prompt = prompt + "Current books in the inventory - " + str(inventory) + "\n" if inventory else prompt
    return prompt + "Here is the output:\n\n "