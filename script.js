document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const foodForm = document.getElementById('food-form');
    const foodNameInput = document.getElementById('food-name');
    const foodList = document.getElementById('food-list');
    const totalCaloriesEl = document.getElementById('total-calories');
    const resetBtn = document.getElementById('reset-btn');
    const submitBtn = document.getElementById('submit-btn');
    const loadingEl = document.getElementById('loading');

    // API Configuration
    const API_KEY = 'srnIKOfjbQfczxIA1OM6mw==YmbasOuGNrKa3WPs';
    const API_URL = 'https://api.calorieninjas.com/v1/nutrition?query=';

    // Initialize food items from localStorage
    let foodItems = JSON.parse(localStorage.getItem('foodItems')) || [];
    
    // Render initial food items
    renderFoodItems();
    updateTotalCalories();

    // Event Listeners
    foodForm.addEventListener('submit', fetchCalorieData);
    resetBtn.addEventListener('click', resetFoodItems);

    // Fetch calorie data from API
    async function fetchCalorieData(e) {
        e.preventDefault();
        
        const foodName = foodNameInput.value.trim();
        
        if (!foodName) {
            showError('Please enter a food name');
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        loadingEl.classList.remove('hidden');
        clearError();

        try {
            const response = await fetch(`${API_URL}${encodeURIComponent(foodName)}`, {
                headers: { 'X-Api-Key': API_KEY }
            });
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                const foodItem = data.items[0];
                addFoodItem({
                    name: foodItem.name,
                    calories: Math.round(foodItem.calories)
                });
            } else {
                throw new Error('No nutrition data found for this item');
            }
        } catch (error) {
            console.error('Error fetching calorie data:', error);
            showError(`Could not find nutrition data for "${foodName}". Please try a different item.`);
        } finally {
            submitBtn.disabled = false;
            loadingEl.classList.add('hidden');
        }
    }

    function addFoodItem(foodData) {
        const newFoodItem = {
            id: Date.now(),
            name: foodData.name,
            calories: foodData.calories
        };
        
        foodItems.push(newFoodItem);
        saveToLocalStorage();
        renderFoodItems();
        updateTotalCalories();
        
        // Reset form
        foodForm.reset();
        foodNameInput.focus();
    }

    function renderFoodItems() {
        foodList.innerHTML = '';
        
        if (foodItems.length === 0) {
            foodList.innerHTML = '<p class="empty-message">No food items added yet.</p>';
            return;
        }
        
        foodItems.forEach(item => {
            const foodItemEl = document.createElement('div');
            foodItemEl.className = 'food-item';
            foodItemEl.innerHTML = `
                <div>
                    <span class="food-item-name">${item.name}</span>
                    <span class="food-item-calories">${item.calories} cal</span>
                </div>
                <button class="delete-btn" data-id="${item.id}">
                    ×
                </button>
            `;
            foodList.appendChild(foodItemEl);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deleteFoodItem);
        });
    }

    function deleteFoodItem(e) {
        const id = parseInt(e.target.getAttribute('data-id'));
        foodItems = foodItems.filter(item => item.id !== id);
        saveToLocalStorage();
        renderFoodItems();
        updateTotalCalories();
    }

    function updateTotalCalories() {
        const total = foodItems.reduce((sum, item) => sum + item.calories, 0);
        totalCaloriesEl.textContent = total;
    }

    function resetFoodItems() {
        if (foodItems.length > 0 && confirm('Are you sure you want to reset all food items?')) {
            foodItems = [];
            saveToLocalStorage();
            renderFoodItems();
            updateTotalCalories();
        }
    }

    function saveToLocalStorage() {
        localStorage.setItem('foodItems', JSON.stringify(foodItems));
    }

    function showError(message) {
        clearError();
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.textContent = message;
        foodForm.appendChild(errorEl);
    }

    function clearError() {
        const existingError = foodForm.querySelector('.error-message');
        if (existingError) {
            foodForm.removeChild(existingError);
        }
    }
});