import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Likes";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesView";
import { elements, renderLoader, clearLoader } from "./views/base";


// Global state of the app
// Search object
// current recipe object
// shopping list object
// liked recipes

const state = {};

window.s=state;
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
            console.error(err);
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
            recipeView.renderRecipe(
            state.recipe, 
            state.likes.isLiked(id)
            );
        } catch (err) {
            alert("Error processing recipe!");
            clearLoader();
            console.error(err);
        }
    }
};

["hashchange", "load"].forEach(event =>
    window.addEventListener(event, controlRecipe)
);

// 
// LIST CONTROLLER
// 
const controlList= () => {
    // Create a new list if there in none yet
    if(!state.list) state.list = new List();
    
    // Add each ingredient to the list
    state.recipe.ingredients.forEach(el=>{
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
};

// Handle delete and update list item events
elements.shopping.addEventListener('click',e=>{
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete button
    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        // Delete from state
        state.list.deleteItem(id);

        // Delete from UI
        listView.deleteItem(id); 

        // Handle the count update
    } else if(e.target.matches('.shopping__count-value')){
        const val= parseFloat(e.target.value);
        state.list.updateCount(id,val);
    }
});

// 
// Like CONTROLLER
// 
state.likes = new Likes();
likesView.toggleLikeMenu(state.likes.getNumLikes());
const controlLike =()=>{
    if(!state.likes) state.likes = new Likes();
    const currentId = state.recipe.id;

    // User has not yet liked current recipe
    if(!state.likes.isLiked(currentId)){
        // Add like to the state
        const newLike = state.likes.addLike(
        currentId,
        state.recipe.title,
        state.recipe.author,
        state.recipe.img
        );

        // Toggle the like button
        likesView.toggleLikeBtn(true);

        // add like to UI list
        likesView.renderLike(newLike);
    // User has liked current recipe
    } else {
        // Remove like from the state
        state.likes.deleteLike(currentId);
        // Toggle the like button 
        likesView.toggleLikeBtn(false);
        // remove like from UI list
        likesView.deleteLike(currentId);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};


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
    } else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
      // add ingredients to shopping list
        controlList();
    } else if(e.target.matches('.recipe__love   , .recipe__love *')){
        // Like controller
        controlLike();
    }

});
