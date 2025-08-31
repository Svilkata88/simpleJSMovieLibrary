( ()=> {
        const API_KEY = config.API_KEY;
        const API_BASE_URL = `http://www.omdbapi.com/`;
        const API_URL = `${API_BASE_URL}?apikey=${API_KEY}`;
        console.log(API_KEY)

        const searchValue = document.getElementById('search-input');
        const searchBtn  = document.getElementById('search-btn');
        
        searchBtn.addEventListener('click', (e)=> searchMovie(e));
        window.addEventListener('load', () => showFavorites());

        // search movies based on user movie title ( or part of it ) input.
        function searchMovie(e) {
            e.preventDefault();

            const title = searchValue.value;
            const current_api_url = API_URL + '&s=' + title;
            const moviesList = document.getElementById('movies-list');
            const notFoundMessage = document.getElementById('not-found');
            
            const response = fetch(current_api_url);
            response
                .then(res => res.json())
                .then(data => {
                    const searchResults = data.Search;

                    moviesList.innerHTML = '';
                    notFoundMessage.style.display = 'none';

                    if (!searchResults) {
                        throw new Error()
                    }
                    
                    searchResults.forEach( movie => {
    
                        const li = document.createElement('li');
                        const movieDivContainer = document.createElement('div');
                        const movieTitle = document.createElement('h5');
                        const img = document.createElement('img');
                        li.addEventListener('click', () => showMovieDetails(movie.imdbID));
                        li.setAttribute("tabindex", "0");
                        img.src = movie.Poster;
                        movieTitle.innerText = movie.Title;
                        movieDivContainer.append(movieTitle, img)
                        movieDivContainer.className = 'list-movie-element-container';
                        li.appendChild(movieDivContainer);
                        moviesList.appendChild(li);
                    });
                })
                .catch((e) => 
                    {
                        const details = document.getElementById("movie-details");  
                        details.innerHTML = '';
                        notFoundMessage.style.display = 'block';   
                    });

            searchValue.value = '';
        }

        // get movie from the API based on its ID!
        async function getMovie(imdbID) {
            const url = API_URL + '&i=' + imdbID; 
            const response = await fetch(url);   
            const data = await response.json();  
            return data; 
        }

        // html card builder
        class MovieCardBuilder {
            constructor(movie) {
                this.movie = movie;
                this.showHeart = true;
                this.showCloseBtn = true;
            }

            hideHeart() {
                this.showHeart = false;
                return this;
            }

            hideCloseBtn() {
                this.showCloseBtn = false;
                return this;
            }

            build() {
                const movie = this.movie;
                const heartHTML = this.showHeart ? `<i class="fa-solid fa-heart" id="fav"></i>` : '';
                const closeHTML = this.showCloseBtn ? `<i class="fa-regular fa-circle-xmark" id="details-close-btn"></i>` : '';

                return `
                <div class='details-container'>
                    <div class='details-img'>
                    <img src="${movie.Poster}" alt="${movie.Title}">
                    </div>
                    <div class='details-text'>
                    <div class="card-heading">
                        <h2>${movie.Title} (${movie.Year})</h2>
                        <p><span>Director/s:</span> ${movie.Director}</p>
                        <div id="rating-container">
                        <i class="fa-solid fa-star"></i>
                        <p>${movie.imdbRating}</p>
                        </div>
                    </div>
                    <p><span>Genre:</span> ${movie.Genre}</p>
                    <p><span>Actors:</span> ${movie.Actors}</p>
                    <p><span>Country:</span> ${movie.Country}</p>
                    <p><span>Movie overview:</span> ${movie.Plot}</p>
                    ${heartHTML}
                    ${closeHTML}
                    </div>
                </div>
                `;
            }
        }


        // renders details card from given movie object!
        function createCard(movie) {
            const moviedDetails = document.getElementById("movie-details");

            moviedDetails.style.display = 'block';

            const cardHTML = new MovieCardBuilder(movie).build();
            moviedDetails.innerHTML = cardHTML;

            // moviedDetails.innerHTML = `               
            //     <div class='details-container'>     
            //         <div class='details-img'>
            //             <img src="${movie.Poster}" alt="${movie.Title}">
            //         </div>
            //         <div class='details-text'>
            //             <div class="card-heading">
            //                 <h2>${movie.Title} (${movie.Year})</h2>
            //                 <p><span>Director/s:</span> ${movie.Director}</p>
            //                 <div id="rating-container">
            //                     <i class="fa-solid fa-star"></i>
            //                     <p>${movie.imdbRating}</p>
            //                 </div>
            //             </div>
                        
            //             <p><span>Genre:</span> ${movie.Genre}</p>
            //             <p><span>Actors:</span> ${movie.Actors}</p>
            //             <p><span>Country:</span> ${movie.Country}</p>
            //             <p><span>Movie overview:</span> ${movie.Plot}</p>
            //             <i class="fa-solid fa-heart" id="fav"></i>
            //             <i class="fa-regular fa-circle-xmark" id="details-close-btn"></i>
            //         </div>
            //     </div>
            // `;
            
            const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            const favElement = document.getElementById('fav');
            const closeBtn = document.getElementById('details-close-btn');

            favElement.addEventListener('click', () => addRemoveToFavorites(movie, favElement));
            closeBtn.addEventListener('click', () => closeButton(moviedDetails))

            const movieExist = favorites.filter(curMovie => curMovie.imdbID === movie.imdbID).length;

            if (movieExist) {
                favElement.style.color = 'red';
            }
        }

        // renders details for the selected movie.
        async function showMovieDetails(imdbID) {
            const movie = await getMovie(imdbID);
            console.log(movie)
            createCard(movie);
        };

        // add or rmoves selected movie from localStorage db.
        function addRemoveToFavorites(movie, favEl) {
            favEl.style.color = favEl.style.color === '' ? 'red' : '';
            let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            const hasMovie = () => favorites.some(curMovie => curMovie.imdbID === movie.imdbID);

            if (!hasMovie()) {
                favorites.push(movie)
                console.log('Movie saved to favorites! Got ya ;)')
            } else {
                favorites = favorites.filter(curMovie => curMovie.imdbID !== movie.imdbID);
                console.log('Movie removed to favorites! :(')
            }

            localStorage.setItem('favorites', JSON.stringify(favorites));
            showFavorites()
        }

        // renders favorite movies saved to localStorage db.
        function showFavorites() {
            const favoritesList = document.getElementById('favorites-list');
            const detailsFavEl = document.getElementsByClassName("details-container")[0]?.children[1].children[4];
            
            favoritesList.innerHTML = '';
            let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
            favorites = favorites.map( movie => {
                const li = document.createElement('li');
                const h5 = document.createElement('h5');
                const i = document.createElement('i');

                h5.innerHTML = movie.Title;
                h5.addEventListener ('click', () => showMovieDetails(movie.imdbID))
                i.className = "fa-regular fa-circle-xmark";
                i.addEventListener('click', (e)=> {
                    const removeBtn = e.target;
                    const parentLi = removeBtn.closest('li');
                    addRemoveToFavorites(movie, detailsFavEl) 
                })
                li.append(h5, i);

                return li;
            });
            
            favoritesList.append(...favorites);
        }

        // close the details card
        function closeButton(targetElement) {
            targetElement.style.display = targetElement.style.display === 'block' ? 'none' : 'block';
        }   
} )(); 
// encapsulated with IIFE






