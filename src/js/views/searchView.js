import { elements } from "./base";

export const getInput = () => elements.searchInput.value;

export const clearInput = () =>{
    elements.searchInput.value = '';
};

export const clearResult = ()=>{
    elements.searchResList.innerHTML = '';
};

const limitRecipeTitle = (title, limit=19) => title.length > limit ? title.substring(0, title.substring(0, limit).lastIndexOf(' ')) + '...': title;


const renderRecipe = recipe => {
    const markup = `
        <li>
            <a class="results__link" href="#${recipe.recipe_id}" title="${recipe.title}">
                <figure class="results__fig">
                    <img src="${recipe.image_url}" alt="${recipe.title}">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                    <p class="results__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>
    `;
    elements.searchResList.insertAdjacentHTML("beforeend", markup);
};

export const renderResults = (recipes, page=1,resPerPage=10) => {
    const start = 0;
    const end = 10;

    recipes.slice(start,end).forEach(renderRecipe);
};
