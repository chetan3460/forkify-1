import axios from "axios";

export default class Search {
    constructor(query) {
        this.query = query;
    }

    async getResults() {
        const proxy = "https://cors-anywhere.herokuapp.com/";
        const key = "0a499c7982edde6fe0a96774285087fa";

        try {
            const res = await axios(
                `${proxy}http://food2fork.com/api/search?key=${key}&q=${
                    this.query
                }`
            );
            this.result = res.data.recipes;
        } catch (error) {
            alert(error);
        }
    }
}
