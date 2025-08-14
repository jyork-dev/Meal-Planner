from pymongo import MongoClient
from bson.objectid import ObjectId
import os

client = MongoClient(os.environ.get("MONGO_URI", "mongodb://localhost:27017/"))
db = client["meal_planner"]
recipes_collection = db["recipes"]

def get_all_recipes():
    return list(recipes_collection.find())

def get_recipe(recipe_id):
    return recipes_collection.find_one({"_id": ObjectId(recipe_id)})

def create_recipe(recipe_data):
    result = recipes_collection.insert_one(recipe_data)
    return str(result.inserted_id)

def update_recipe(recipe_id, update_data):
    result = recipes_collection.update_one(
        {"_id": ObjectId(recipe_id)},
        {"$set": update_data}
    )
    return result.modified_count

def delete_recipe(recipe_id):
    result = recipes_collection.delete_one({"_id": ObjectId(recipe_id)})
    return result.deleted_count