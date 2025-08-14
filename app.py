from flask import Flask, request, jsonify
from flask_cors import CORS
from db import (
    get_all_recipes,
    get_recipe,
    create_recipe,
    update_recipe,
    delete_recipe
)

app = Flask(__name__)
CORS(app, origins=["https://meal-planner-1-hk0m.onrender.com"])

@app.route('/')
def home():
    return "Welcome to the Flask App!"

@app.route('/recipes', methods=['GET'])
def get_all_recipes_route():
    recipes = get_all_recipes()
    # Convert ObjectId to string for JSON serialization
    for recipe in recipes:
        recipe['_id'] = str(recipe['_id'])
    return jsonify(recipes)

@app.route('/recipes', methods=['POST'])
def create_recipe_route():
    recipe_data = request.json
    recipe_id = create_recipe(recipe_data)
    return jsonify({"message": "Recipe created successfully", "id": recipe_id}), 201

@app.route('/recipes/<recipe_id>', methods=['GET'])
def get_recipe_route(recipe_id):
    recipe = get_recipe(recipe_id)
    if recipe:
        recipe['_id'] = str(recipe['_id'])
        return jsonify(recipe)
    return jsonify({"error": "Recipe not found"}), 404

@app.route('/recipes/<recipe_id>', methods=['PUT'])
def update_recipe_route(recipe_id):
    update_data = request.json
    modified_count = update_recipe(recipe_id, update_data)
    if modified_count:
        return jsonify({"message": f"Recipe {recipe_id} updated successfully"})
    return jsonify({"error": "Recipe not found"}), 404

@app.route('/recipes/<recipe_id>', methods=['DELETE'])
def delete_recipe(recipe_id):
    deleted_count = delete_recipe(recipe_id)
    if deleted_count:
        return jsonify({"message": f"Recipe {recipe_id} deleted successfully"}), 204
    return jsonify({"error": "Recipe not found"}), 404

@app.route('/recipes/<recipe_id>/ingredients', methods=['GET'])
def get_recipe_ingredients(recipe_id):
    return f"Ingredients for recipe {recipe_id}"

@app.route('/recipes/<recipe_id>/instructions', methods=['GET'])
def get_recipe_instructions(recipe_id):
    return f"Instructions for recipe {recipe_id}"

@app.route('/recipes/<recipe_id>/reviews', methods=['GET'])
def get_recipe_reviews(recipe_id):
    return f"Reviews for recipe {recipe_id}"

if __name__ == '__main__':
    app.run(debug=True)
