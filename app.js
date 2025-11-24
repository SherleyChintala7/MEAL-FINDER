// ---------------------------------------
// SIDEBAR TOGGLE
// ---------------------------------------
const toggleBtn = document.getElementById("toggleBtn");
const closeBtn = document.getElementById("closeBtn");
const sidebar = document.getElementById("sidebar");

if (toggleBtn) toggleBtn.onclick = () => (sidebar.style.right = "0");
if (closeBtn) closeBtn.onclick = () => (sidebar.style.right = "-300px");


// ---------------------------------------
// API LINKS
// ---------------------------------------
const CATEGORIES_API = "https://www.themealdb.com/api/json/v1/1/categories.php";
const SEARCH_API = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
const FILTER_API = "https://www.themealdb.com/api/json/v1/1/filter.php?c=";
const DETAILS_API = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";


// ---------------------------------------
// LOAD HOMEPAGE CATEGORIES
// ---------------------------------------
function loadCategories() {
    const box = document.getElementById("categoryList");
    const sideList = document.getElementById("sideList");

    if (!box) return;

    fetch(CATEGORIES_API)
        .then(r => r.json())
        .then(data => {
            data.categories.forEach(cat => {
                box.innerHTML += `
                    <div class="card" onclick="openCategory('${cat.strCategory}')">
                        <img src="${cat.strCategoryThumb}">
                        <p>${cat.strCategory}</p>
                    </div>
                `;

                if (sideList) {
                    sideList.innerHTML += `
                        <li onclick="openCategory('${cat.strCategory}')">${cat.strCategory}</li>
                    `;
                }
            });
        });
}
loadCategories();


// ---------------------------------------
// OPEN CATEGORY PAGE
// ---------------------------------------
function openCategory(name) {
    window.location.href = `category.html?c=${name}`;
}


// ---------------------------------------
// LOAD MEALS IN CATEGORY PAGE
// ---------------------------------------
function loadMealsByCategory() {
    const title = document.getElementById("catTitle");
    const list = document.getElementById("mealList");

    if (!title || !list) return;

    const searchData = sessionStorage.getItem("searchMeals");
    if (searchData) {
        const meals = JSON.parse(searchData);
        title.innerText = "Results";

        meals.forEach(meal => {
            list.innerHTML += `
                <div class="card" onclick="openMeal('${meal.idMeal}')">
                    <img src="${meal.strMealThumb}">
                    <p>${meal.strMeal}</p>
                </div>
            `;
        });

        sessionStorage.removeItem("searchMeals");
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const category = params.get("c");

    title.innerText = category;

    fetch(FILTER_API + category)
        .then(r => r.json())
        .then(data => {
            data.meals.forEach(meal => {
                list.innerHTML += `
                    <div class="card" onclick="openMeal('${meal.idMeal}')">
                        <img src="${meal.strMealThumb}">
                        <p>${meal.strMeal}</p>
                    </div>
                `;
            });
        });
}
loadMealsByCategory();


// ---------------------------------------
// OPEN MEAL DETAILS PAGE
// ---------------------------------------
function openMeal(id) {
    window.location.href = `meal.html?id=${id}`;
}


// ---------------------------------------
// LOAD MEAL DETAILS PAGE
// ---------------------------------------
function loadMealDetails() {
    const bread = document.getElementById("mealNameBread");
    const mealImageBox = document.getElementById("mealImageBox");
    const mealMainInfo = document.getElementById("mealMainInfo");
    const ingredientsGrid = document.getElementById("ingredientsGrid");
    const measureSection = document.getElementById("measureSection");
    const instructionSection = document.getElementById("instructionSection");

    if (!bread) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    fetch(DETAILS_API + id)
        .then(r => r.json())
        .then(data => {
            const meal = data.meals[0];

            bread.innerText = meal.strMeal;

            if (mealImageBox) {
                mealImageBox.innerHTML = `<img src="${meal.strMealThumb}">`;
            }

            if (mealMainInfo) {
                mealMainInfo.innerHTML = `
                    <p><b>CATEGORY:</b> ${meal.strCategory || "-"}</p>
                    <p><b>Source:</b> ${
                        meal.strSource
                            ? `<a href="${meal.strSource}" target="_blank">${meal.strSource}</a>`
                            : "None"
                    }</p>
                    <p><b>Tags:</b> ${meal.strTags || "None"}</p>
                `;
            }

            if (ingredientsGrid) {
                ingredientsGrid.innerHTML = "";
                for (let i = 1; i <= 20; i++) {
                    let ing = meal["strIngredient" + i];
                    if (ing) {
                        ingredientsGrid.innerHTML += `
                            <div class="ing-item">
                                <span class="number-circle">${i}</span>
                                <span>${ing}</span>
                            </div>
                        `;
                    }
                }
            }

            if (measureSection) {
                measureSection.innerHTML = "";
                for (let i = 1; i <= 20; i++) {
                    let mea = meal["strMeasure" + i];
                    let ing = meal["strIngredient" + i];
                    if (ing && ing.trim() !== "") {
                        measureSection.innerHTML += `
                            <p><i class="fa-solid fa-spoon spoon-orange"></i> ${mea || "-"}</p>
                        `;
                    }
                }
            }

            if (instructionSection) {
                instructionSection.innerHTML = "";
                let steps = meal.strInstructions.split(/\.\s+/);
                steps.forEach(step => {
                    if (step.trim() !== "") {
                        instructionSection.innerHTML += `
                            <p><i class="fa-regular fa-square-check check-icon"></i>${step}.</p>
                        `;
                    }
                });
            }
        });
}
loadMealDetails();

const searchResults = document.getElementById("searchResults");
const mealsSection = document.getElementById("mealsSection");

if (searchBtn && searchInput) {
    searchBtn.onclick = () => {
        const value = searchInput.value.trim();
        if (value === "") return;

        fetch(SEARCH_API + value)
            .then(r => r.json())
            .then(data => {
                mealsSection.style.display = "block";
                searchResults.innerHTML = "";

                if (!data.meals) {
                    searchResults.innerHTML = "<p>No meals found.</p>";
                    return;
                }

                data.meals.forEach(meal => {
                    searchResults.innerHTML += `
                        <div class="card" onclick="openMeal('${meal.idMeal}')">
                            <img src="${meal.strMealThumb}">
                            <p>${meal.strMeal}</p>
                        </div>
                    `;
                });

                mealsSection.scrollIntoView({ behavior: "smooth" });
            });
    };
}
