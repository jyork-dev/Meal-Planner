import React, { useEffect, useState } from "react";
import "./App.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const API_URL = process.env.REACT_APP_API_URL || "https://meal-planner-xaci.onrender.com";

function App() {
  const [recipes, setRecipes] = useState([]);
  const [form, setForm] = useState({
    name: "",
    meal_type: "",
    ingredients: [""],
    instructions: [""], // Change from "" to [""]
    tags: [],
    nutrition: { calories: "", protein: "", carbs: "", fat: "" }
  });
  const [allTags, setAllTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [view, setView] = useState("recipes"); // "recipes" or "schedule"
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [search, setSearch] = useState("");
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const mealTypes = ["breakfast", "lunch", "dinner"];
  const [mealPlan, setMealPlan] = useState(
    Object.fromEntries(days.map(day => [day, Object.fromEntries(mealTypes.map(m => [m, null]))]))
  );

  useEffect(() => {
    fetch(`${API_URL}/recipes`)
      .then(res => res.json())
      .then(data => {
        setRecipes(data);
        const tags = Array.from(
          new Set(data.flatMap(r => (r.tags ? r.tags : [])))
        );
        setAllTags(tags);
      });
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleIngredientChange = (idx, value) => {
    const newIngredients = [...form.ingredients];
    newIngredients[idx] = value;
    setForm({ ...form, ingredients: newIngredients });
  };

  const addIngredient = () => {
    setForm({ ...form, ingredients: [...form.ingredients, ""] });
  };

  const removeIngredient = idx => {
    const newIngredients = form.ingredients.filter((_, i) => i !== idx);
    setForm({ ...form, ingredients: newIngredients });
  };

  const addTag = tag => {
    if (
      tag &&
      !form.tags.includes(tag) &&
      tag.trim() !== ""
    ) {
      setForm({ ...form, tags: [...form.tags, tag] });
    }
    setTagInput("");
  };

  const removeTag = idx => {
    setForm({ ...form, tags: form.tags.filter((_, i) => i !== idx) });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const newRecipe = {
      ...form,
      ingredients: form.ingredients.filter(i => i.trim() !== ""),
      instructions: form.instructions.filter(i => i.trim() !== "")
    };
    fetch(`${API_URL}/recipes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRecipe)
    })
      .then(res => res.json())
      .then(data => {
        setRecipes([...recipes, { ...newRecipe, _id: data.id }]);
        setForm({
          name: "",
          meal_type: "",
          ingredients: [""],
          instructions: [""], // Change from "" to [""]
          tags: [],
          nutrition: { calories: "", protein: "", carbs: "", fat: "" }
        });
      });
  };

  const handleInstructionChange = (idx, value) => {
    const newInstructions = [...form.instructions];
    newInstructions[idx] = value;
    setForm({ ...form, instructions: newInstructions });
  };

  const addInstruction = () => {
    setForm({ ...form, instructions: [...form.instructions, ""] });
  };

  const removeInstruction = idx => {
    const newInstructions = form.instructions.filter((_, i) => i !== idx);
    setForm({ ...form, instructions: newInstructions });
  };

  const tagSuggestions = allTags.filter(
    t =>
      t.toLowerCase().includes(tagInput.toLowerCase()) &&
      !form.tags.includes(t)
  );

  const onDragEnd = result => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    // If dragging from recipe list to a slot
    if (source.droppableId === "recipes-list" && destination.droppableId.startsWith("slot-")) {
      const [day, meal] = destination.droppableId.replace("slot-", "").split("-");
      const recipe = recipes.find(r => r._id === draggableId);
      setMealPlan(prev => ({
        ...prev,
        [day]: { ...prev[day], [meal]: recipe }
      }));
    }
    // If dragging from one slot to another
    else if (
      source.droppableId.startsWith("slot-") &&
      destination.droppableId.startsWith("slot-")
    ) {
      const [srcDay, srcMeal] = source.droppableId.replace("slot-", "").split("-");
      const [destDay, destMeal] = destination.droppableId.replace("slot-", "").split("-");
      const recipe = mealPlan[srcDay][srcMeal];
      setMealPlan(prev => ({
        ...prev,
        [srcDay]: { ...prev[srcDay], [srcMeal]: null },
        [destDay]: { ...prev[destDay], [destMeal]: recipe }
      }));
    }
  };

  // Helper function to sum nutrients for a day
  function getDayNutrition(dayMeals) {
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    Object.values(dayMeals).forEach(meal => {
      if (meal && meal.nutrition) {
        totals.calories += Number(meal.nutrition.calories) || 0;
        totals.protein += Number(meal.nutrition.protein) || 0;
        totals.carbs += Number(meal.nutrition.carbs) || 0;
        totals.fat += Number(meal.nutrition.fat) || 0;
      }
    });
    return totals;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={{
        width: 180,
        background: "#f1f5f9",
        padding: "2rem 1rem",
        borderTopLeftRadius: 18,
        borderBottomLeftRadius: 18,
        boxShadow: "2px 0 8px rgba(60,72,100,0.04)"
      }}>
        <button
          onClick={() => setView("recipes")}
          style={{
            display: "block",
            width: "100%",
            marginBottom: 16,
            padding: "0.8rem 0",
            borderRadius: 8,
            border: "none",
            background: view === "recipes" ? "#6366f1" : "#fff",
            color: view === "recipes" ? "#fff" : "#6366f1",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 16
          }}
        >
          Recipes
        </button>
        <button
          onClick={() => setView("schedule")}
          style={{
            display: "block",
            width: "100%",
            padding: "0.8rem 0",
            borderRadius: 8,
            border: "none",
            background: view === "schedule" ? "#6366f1" : "#fff",
            color: view === "schedule" ? "#fff" : "#6366f1",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 16
          }}
        >
          Schedule
        </button>
      </div>
      {/* Main Content */}
      <div style={{ flex: 1, padding: view === "schedule" ? "2rem 0.5rem" : "3rem 2.5rem", minWidth: 0 }}>
        {view === "recipes" && (
          <>
            <div className="app-container">
              <h1>Meal Planner Recipes</h1>
              {selectedRecipe ? (
                <div>
                  <button
                    onClick={() => setSelectedRecipe(null)}
                    style={{
                      marginBottom: 16,
                      background: "#e0e7ff",
                      color: "#4f46e5",
                      border: "none",
                      borderRadius: 6,
                      padding: "0.5rem 1.2rem",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    ← Back to List
                  </button>
                  <h2>{selectedRecipe.name}</h2>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Meal Type:</strong> {selectedRecipe.meal_type}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Ingredients:</strong>
                    <ul>
                      {selectedRecipe.ingredients.map((ing, idx) => (
                        <li key={idx}>{ing}</li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Instructions:</strong>
                    <ol>
                      {(Array.isArray(selectedRecipe.instructions)
                        ? selectedRecipe.instructions
                        : [selectedRecipe.instructions]
                      ).map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <strong>Tags:</strong> {selectedRecipe.tags.join(", ")}
                  </div>
                  {selectedRecipe.nutrition && (
                    <div style={{ margin: "1rem 0" }}>
                      <strong>Nutritional Info:</strong>
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {selectedRecipe.nutrition.calories && <li>Calories: {selectedRecipe.nutrition.calories}</li>}
                        {selectedRecipe.nutrition.protein && <li>Protein: {selectedRecipe.nutrition.protein}g</li>}
                        {selectedRecipe.nutrition.carbs && <li>Carbs: {selectedRecipe.nutrition.carbs}g</li>}
                        {selectedRecipe.nutrition.fat && <li>Fat: {selectedRecipe.nutrition.fat}g</li>}
                      </ul>
                    </div>
                  )}
                </div>
              ) : showCreateForm ? (
                <>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    style={{
                      marginBottom: 16,
                      background: "#e0e7ff",
                      color: "#4f46e5",
                      border: "none",
                      borderRadius: 6,
                      padding: "0.5rem 1.2rem",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    ← Back to Recipes
                  </button>
                  <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
                    <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required /><br />
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontWeight: 600, marginRight: 8 }}>Meal Type:</label>
                      {["breakfast", "lunch", "dinner", "snack"].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setForm({ ...form, meal_type: type })}
                          style={{
                            marginRight: 8,
                            padding: "0.5rem 1.2rem",
                            borderRadius: 6,
                            border: form.meal_type === type ? "2px solid #6366f1" : "1px solid #e0e7ff",
                            background: form.meal_type === type ? "#6366f1" : "#f1f5f9",
                            color: form.meal_type === type ? "#fff" : "#333",
                            fontWeight: 600,
                            cursor: "pointer",
                            outline: "none"
                          }}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                    <div>
                      <label style={{ fontWeight: 600 }}>Ingredients:</label>
                      {form.ingredients.map((ingredient, idx) => (
                        <div key={idx} style={{ display: "flex", marginBottom: 4 }}>
                          <input
                            type="text"
                            value={ingredient}
                            onChange={e => handleIngredientChange(idx, e.target.value)}
                            placeholder={`Ingredient ${idx + 1}`}
                            required
                            style={{ flex: 1 }}
                          />
                          {form.ingredients.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeIngredient(idx)}
                              style={{
                                marginLeft: 6,
                                background: "#f87171",
                                color: "#fff",
                                border: "none",
                                borderRadius: 4,
                                padding: "0 8px",
                                cursor: "pointer"
                              }}
                              aria-label="Remove ingredient"
                            >
                              &times;
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addIngredient}
                        style={{
                          marginTop: 6,
                          background: "#6366f1",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          padding: "2px 12px",
                          cursor: "pointer"
                        }}
                      >
                        + Add Ingredient
                      </button>
                    </div>
                    <br />
                    <div>
                      <label style={{ fontWeight: 600 }}>Instructions:</label>
                      {form.instructions.map((instruction, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
                          <span style={{ marginRight: 8 }}>{idx + 1}.</span>
                          <input
                            type="text"
                            value={instruction}
                            onChange={e => handleInstructionChange(idx, e.target.value)}
                            placeholder={`Step ${idx + 1}`}
                            required
                            style={{ flex: 1 }}
                          />
                          {form.instructions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeInstruction(idx)}
                              style={{
                                marginLeft: 6,
                                background: "#f87171",
                                color: "#fff",
                                border: "none",
                                borderRadius: 4,
                                padding: "0 8px",
                                cursor: "pointer"
                              }}
                              aria-label="Remove instruction"
                            >
                              &times;
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addInstruction}
                        style={{
                          marginTop: 6,
                          background: "#6366f1",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          padding: "2px 12px",
                          cursor: "pointer"
                        }}
                      >
                        + Add Step
                      </button>
                    </div>
                    <br />
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontWeight: 600 }}>Tags:</label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
                        {form.tags.map((tag, idx) => (
                          <span
                            key={tag}
                            style={{
                              background: "#6366f1",
                              color: "#fff",
                              borderRadius: 12,
                              padding: "2px 10px",
                              display: "flex",
                              alignItems: "center"
                            }}
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(idx)}
                              style={{
                                marginLeft: 6,
                                background: "transparent",
                                color: "#fff",
                                border: "none",
                                cursor: "pointer",
                                fontWeight: "bold"
                              }}
                              aria-label="Remove tag"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Search or add tag"
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag(tagInput.trim());
                          }
                        }}
                        style={{ width: "100%", marginBottom: 4 }}
                      />
                      {tagInput && tagSuggestions.length > 0 && (
                        <div
                          style={{
                            background: "#fff",
                            border: "1px solid #e0e7ff",
                            borderRadius: 6,
                            boxShadow: "0 2px 8px rgba(60,72,100,0.04)",
                            position: "absolute",
                            zIndex: 10,
                            width: "calc(100% - 2px)"
                          }}
                        >
                          {tagSuggestions.map(tag => (
                            <div
                              key={tag}
                              onClick={() => addTag(tag)}
                              style={{
                                padding: "6px 12px",
                                cursor: "pointer",
                                borderBottom: "1px solid #e0e7ff"
                              }}
                            >
                              {tag}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label style={{ fontWeight: 600 }}>Nutritional Information:</label>
                      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                        <input
                          type="number"
                          name="calories"
                          placeholder="Calories"
                          value={form.nutrition.calories}
                          onChange={e => setForm({ ...form, nutrition: { ...form.nutrition, calories: e.target.value } })}
                          style={{ flex: 1, padding: "0.5rem", borderRadius: 4, border: "1px solid #e0e7ff" }}
                        />
                        <input
                          type="number"
                          name="protein"
                          placeholder="Protein (g)"
                          value={form.nutrition.protein}
                          onChange={e => setForm({ ...form, nutrition: { ...form.nutrition, protein: e.target.value } })}
                          style={{ flex: 1, padding: "0.5rem", borderRadius: 4, border: "1px solid #e0e7ff" }}
                        />
                        <input
                          type="number"
                          name="carbs"
                          placeholder="Carbs (g)"
                          value={form.nutrition.carbs}
                          onChange={e => setForm({ ...form, nutrition: { ...form.nutrition, carbs: e.target.value } })}
                          style={{ flex: 1, padding: "0.5rem", borderRadius: 4, border: "1px solid #e0e7ff" }}
                        />
                        <input
                          type="number"
                          name="fat"
                          placeholder="Fat (g)"
                          value={form.nutrition.fat}
                          onChange={e => setForm({ ...form, nutrition: { ...form.nutrition, fat: e.target.value } })}
                          style={{ flex: 1, padding: "0.5rem", borderRadius: 4, border: "1px solid #e0e7ff" }}
                        />
                      </div>
                    </div>
                    <button type="submit">Add Recipe</button>
                  </form>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <input
                      type="text"
                      placeholder="Search recipes..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      style={{
                        flex: 1,
                        marginRight: 16,
                        padding: "0.7rem 1rem",
                        border: "1px solid #e0e7ff",
                        borderRadius: 8,
                        fontSize: "1rem",
                        background: "#f1f5f9"
                      }}
                    />
                    <button
                      onClick={() => setShowCreateForm(true)}
                      style={{
                        background: "#6366f1",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "0.8rem 1.5rem",
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      + Create Recipe
                    </button>
                  </div>
                  <ul>
                    {recipes
                      .filter(r =>
                        r.name.toLowerCase().includes(search.toLowerCase()) ||
                        r.ingredients.some(i => i.toLowerCase().includes(search.toLowerCase())) ||
                        r.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
                      )
                      .map(r => (
                        <li
                          key={r._id}
                          style={{ cursor: "pointer" }}
                          onClick={() => setSelectedRecipe(r)}
                          title="Click to view details"
                        >
                          <strong>{r.name}</strong> ({r.meal_type})<br />
                          Ingredients: {r.ingredients.join(", ")}<br />
                          Tags: {r.tags.join(", ")}
                          <hr />
                        </li>
                      ))}
                  </ul>
                </>
              )}
            </div>
          </>
        )}
        {view === "schedule" && (
          <>
            <div className="app-container">
              <h2>Weekly Meal Planner</h2>
              <div
                className="meal-planner-container"
                style={{
                  padding: "0 2.5rem 0 1.5rem" // left and right padding
                }}
              >
                <DragDropContext onDragEnd={onDragEnd}>
                  <div style={{ display: "flex", gap: 32 }}>
                    {/* Draggable Recipe List */}
                    <Droppable droppableId="recipes-list">
                      {provided => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          style={{ minWidth: 200, background: "#f1f5f9", borderRadius: 8, padding: 12 }}
                        >
                          <h3>Recipes</h3>
                          {recipes.map((r, idx) => (
                            <Draggable key={r._id} draggableId={r._id} index={idx}>
                              {provided => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    marginBottom: 8,
                                    padding: 8,
                                    background: "#fff",
                                    borderRadius: 6,
                                    boxShadow: "0 1px 4px rgba(60,72,100,0.06)",
                                    ...provided.draggableProps.style
                                  }}
                                >
                                  <strong>{r.name}</strong>
                                  <div style={{ fontSize: 12, color: "#6366f1" }}>{r.meal_type}</div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                    {/* Calendar Grid */}
                    <div style={{ flex: 1 }}>
                      <table className="meal-planner-table">
                        <thead>
                          <tr>
                            <th></th>
                            {mealTypes.map(meal => (
                              <th key={meal} style={{ textTransform: "capitalize" }}>{meal}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {days.map(day => {
                            const dayTotals = getDayNutrition(mealPlan[day]);
                            return (
                              <React.Fragment key={day}>
                                <tr>
                                  <td style={{ fontWeight: 600 }}>{day}</td>
                                  {mealTypes.map(meal => (
                                    <td key={meal} style={{ minWidth: 120, height: 60, border: "1px solid #e0e7ff", verticalAlign: "top" }}>
                                      <Droppable droppableId={`slot-${day}-${meal}`}>
                                        {provided => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            style={{
                                              minHeight: 48,
                                              height: 48,
                                              minWidth: 160,
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              position: "relative"
                                            }}
                                        >
                                          {mealPlan[day][meal] ? (
                                            <Draggable draggableId={mealPlan[day][meal]._id + "-" + day + "-" + meal} index={0}>
                                              {providedDraggable => (
                                                <div
                                                  ref={providedDraggable.innerRef}
                                                  {...providedDraggable.draggableProps}
                                                  {...providedDraggable.dragHandleProps}
                                                  style={{
                                                    background: "#6366f1",
                                                    color: "#fff",
                                                    borderRadius: 6,
                                                    padding: "4px 8px",
                                                    ...providedDraggable.draggableProps.style
                                                  }}
                                                >
                                                  {mealPlan[day][meal].name}
                                                </div>
                                              )}
                                            </Draggable>
                                          ) : (
                                            <span style={{ color: "#cbd5e1", fontSize: 12 }}>Drop here</span>
                                          )}
                                          {provided.placeholder}
                                        </div>
                                        )}
                                      </Droppable>
                                    </td>
                                  ))}
                                </tr>
                                <tr>
                                  <td style={{ fontSize: 13, color: "#6366f1" }}>Totals:</td>
                                  <td colSpan={mealTypes.length}>
                                    <span style={{ marginRight: 16 }}>Calories: {dayTotals.calories}</span>
                                    <span style={{ marginRight: 16 }}>Protein: {dayTotals.protein}g</span>
                                    <span style={{ marginRight: 16 }}>Carbs: {dayTotals.carbs}g</span>
                                    <span>Fat: {dayTotals.fat}g</span>
                                  </td>
                                </tr>
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </DragDropContext>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;