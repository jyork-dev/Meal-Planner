from db import create_recipe

sample_recipes = [
    {
        "name": "Vegan Chili",
        "meal_type": "dinner",
        "ingredients": ["beans", "tomatoes", "onion", "bell pepper"],
        "instructions": "Cook all ingredients together.",
        "tags": ["vegan", "gluten-free"],
        "nutrition": {"calories": 350, "protein": 12, "carbs": 45, "fat": 10},
    },
    {
        "name": "Pancakes",
        "meal_type": "breakfast",
        "ingredients": ["flour", "milk", "egg", "baking powder"],
        "instructions": "Mix and fry.",
        "tags": ["vegetarian"],
    },
    {
        "name": "Chicken Salad",
        "meal_type": "lunch",
        "ingredients": ["chicken", "lettuce", "tomato", "cucumber"],
        "instructions": "Mix all ingredients.",
        "tags": ["gluten-free"],
        "nutrition": {"calories": 350, "protein": 12, "carbs": 45, "fat": 10},
    },
]

for recipe in sample_recipes:
    recipe_id = create_recipe(recipe)
    print(f"Inserted recipe with id: {recipe_id}")
