const CATEGORIES_API = "https://www.themealdb.com/api/json/v1/1/categories.php";
const SEARCH_API = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
const FILTER_API = "https://www.themealdb.com/api/json/v1/1/filter.php?c=";
const DETAILS_API = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";

// 1. SIDEBAR TOGGLE 
const toggleBtn = document.getElementById('toggleBtn');
const closeBtn = document.getElementById('closeBtn');
const sidebar = document.getElementById('sidebar');
const sideList = document.getElementById('sideList');

let sidebarOverlay = document.getElementById('sidebarOverlay');
if (!sidebarOverlay) {
    sidebarOverlay = document.createElement('div');
    sidebarOverlay.id = 'sidebarOverlay';
    document.body.appendChild(sidebarOverlay);
}

function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('visible');
    if (closeBtn) closeBtn.classList.remove('black');
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
}

function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('visible');
    if (closeBtn) closeBtn.classList.add('black'); 
    document.body.style.overflow = '';
    if (toggleBtn) toggleBtn.focus();
}

// Toggle open/close with hamburger
if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        
        if (sidebar && sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });
}

// Close button
if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        closeBtn.classList.add('black');
        closeSidebar();
    });
}

// Clicking overlay closes
sidebarOverlay.addEventListener('click', closeSidebar);

// ESC closes
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
});


if (sideList) {
    sideList.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (!li) return;
        const category = li.textContent.trim();
        if (!category) return;


        window.location.href = `category.html?c=${encodeURIComponent(category)}`;
        closeSidebar();
    });
}

// --------------------------------------
// 2. meals rendering
// --------------------------------------
const mealsHeading = document.getElementById("mealsHeading");
const mealsContainer = document.getElementById("mealsList");
const categoryBox = document.getElementById("categoryList");

function renderMeals(meals) {
    if (!mealsContainer) return;
    mealsContainer.innerHTML = "";

    if (!meals || meals.length === 0) {
        mealsContainer.innerHTML = "<p style='grid-column:1/-1;padding:16px;'>No meals found.</p>";
        return;
    }

    meals.forEach(meal => {
        mealsContainer.innerHTML += `
            <div class="card" onclick="window.location.href='meal.html?id=${meal.idMeal}'">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <p class="cat-badge">${meal.strCategory || ''}</p>
                <div class="title">${meal.strMeal}</div>
            </div>
        `;
    });

    if (mealsHeading) mealsHeading.textContent = "MEALS";
    if (mealsContainer) mealsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// --------------------------------------
// 3. LOAD CATEGORIES
// --------------------------------------
const loadCategories = async () => {
    if (!categoryBox) return;

    try {
        const res = await fetch(CATEGORIES_API);
        const data = await res.json();
        const categories = data?.categories || [];

        categoryBox.innerHTML = ""; 
        if (sideList) sideList.innerHTML = ""; 

        categories.forEach(category => {
            categoryBox.innerHTML += `
                <div class="card" onclick="openCategory('${category.strCategory}')">
                    <img src="${category.strCategoryThumb}" alt="${category.strCategory}">
                    <p class="cat-badge">${category.strCategory}</p>
                    <div class="title">${category.strCategory}</div>
                </div>
            `;

            if (sideList) {
                const li = document.createElement('li');
                li.textContent = category.strCategory;
                sideList.appendChild(li);
            }
        });
    } catch (err) {
        console.error("Failed loading categories:", err);
    }
};

loadCategories();

// --------------------------------------
// 4. OPEN CATEGORY
// --------------------------------------
const openCategory = (name) => {
    const pathname = window.location.pathname;
    const onIndex = pathname.endsWith('/') || pathname.endsWith('/index.html') || pathname.endsWith('index.html');

    if (onIndex && mealsContainer && mealsHeading) {
        fetch(FILTER_API + encodeURIComponent(name))
            .then(res => res.json())
            .then(data => renderMeals(data.meals))
            .catch(err => {
                console.error("Failed to load category meals:", err);
                if (mealsContainer) mealsContainer.innerHTML = "<p>Could not load meals. Try again later.</p>";
            });
        return;
    }

    window.location.href = `category.html?c=${encodeURIComponent(name)}`;
};

// --------------------------------------
// 5. OPEN MEAL DETAILS
// --------------------------------------
const openMeal = (id) => {
    window.location.href = `meal.html?id=${encodeURIComponent(id)}`;
};

// --------------------------------------
// 6. LOAD MEALS BY CATEGORY (category.html)
// --------------------------------------
const loadMealsByCategory = async () => {
    const title = document.getElementById("catTitle");
    const list = document.getElementById("mealList");
    if (!title || !list) return;

    const params = new URLSearchParams(window.location.search);
    const categoryName = params.get("c") || "";
    title.innerText = categoryName;

    try {
        const res = await fetch(FILTER_API + encodeURIComponent(categoryName));
        const data = await res.json();
        const meals = data?.meals || [];
        list.innerHTML = "";
        meals.forEach(meal => {
            list.innerHTML += `
                <div class="card" onclick="openMeal('${meal.idMeal}')">
                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                    <p class="title">${meal.strMeal}</p>
                </div>
            `;
        });
    } catch (err) {
        console.error("Failed to load meals by category:", err);
    }
}

if (window.location.pathname.endsWith('category.html')) {
    loadMealsByCategory();
}

// --------------------------------------
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

// --------------------------------------
// 8. SEARCH (index)
// --------------------------------------
const searchBtn = document.getElementById("searchBtn");
if (searchBtn) {
    searchBtn.addEventListener("click", async () => {
        const text = document.getElementById("searchInput").value.trim();
        if (!text) return;

        try {
            const res = await fetch(SEARCH_API + encodeURIComponent(text));
            const data = await res.json();

            if (!data?.meals || data.meals.length === 0) {
                if (mealsContainer) {
                    mealsContainer.innerHTML = `<div class="no-results">NO FOODS FOUND...</div>`;
                    mealsHeading.textContent = "MEALS";
                    mealsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                return;
            }

            renderMeals(data.meals);
        } catch (err) {
            console.error("Search failed:", err);
        }
    });

    document.getElementById("searchInput").addEventListener("keydown", (e) => {
        if (e.key === "Enter") searchBtn.click();
    });
}


function goHome() {
    window.location.href = "index.html";
}