import Search from "./models/Search";
import Recipe from "./models/Recipe";
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
            console.log(err);
        }
    }
};

["hashchange", "load"].forEach(event =>
    window.addEventListener(event, controlRecipe)
);
