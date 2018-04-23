import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import { elements, renderLoader, clearLoader } from "./views/base";

// Global state of the app
// Search object
// current recipe object
// shopping list object
// liked recipes

const state = {};

//
// Search controller
//

const controlSearch = async () => {
    // 1) Get query from view

    const query = searchView.getInput();

    //TODO

    if (query) {
        // 2) New search object and add to state
        state.search = new Search(query);

        // 3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResult();
        renderLoader(elements.searchRes);

        try {
            // 4) Search for recipes
            await state.search.getResults();

            clearLoader();
            // 5) render results on UI
            searchView.renderResults(state.search.result);
        } catch (err) {
            alert("Something wrong with the search...");
            console.log(err);
            clearLoader();
        }
    }
};

elements.searchForm.addEventListener("submit", e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener("click", e => {
    const btn = e.target.closest(".btn-inline");
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResult();
        searchView.renderResults(state.search.result, goToPage);
    }
});

//
// Recipe controller
//
const controlRecipe = async () => {
    // Get ID from url
    const id = window.location.hash.replace("#", "");

    if (id) {
        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Hightlight selected
        if (state.search) searchView.highlightSelected(id);

        // Create new recipe object
        state.recipe = new Recipe(id);

        try {
            // Get recipe data and parse Ingredients
            await state.recipe.getRecipe();

            state.recipe.parseIngredients();

            // Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            // REnder recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);
        } catch (err) {
            alert("Error processing recipe!");
            clearLoader();
            console.log(err);
        }
    }
};

["hashchange", "load"].forEach(event =>
    window.addEventListener(event, controlRecipe)
);

// Handling recipe button clicks
elements.recipe.addEventListener("click", e => {
    if (e.target.matches(".btn-decrease,.btn-decrease *")) {
        // Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings("dec");
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches(".btn-increase,.btn-increase *")) {
        // increase button is clicked
        state.recipe.updateServings("inc");
        recipeView.updateServingsIngredients(state.recipe);
    }
});
