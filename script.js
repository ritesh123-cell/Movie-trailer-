const API_URL =
  "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=3fd2be6f0c70a2a598f084ddfb75487c&page=";
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
const SEARCH_API =
  'https://api.themoviedb.org/3/search/movie?api_key=3fd2be6f0c70a2a598f084ddfb75487c&query="';
const VIDEO_API = (movieId) =>
  `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=3fd2be6f0c70a2a598f084ddfb75487c&language=en-US`;

const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");
const videoPlayer = document.getElementById("video-player");
const videoIframe = document.getElementById("video-iframe");
const closeVideo = document.getElementById("close-video");
const prevPageButton = document.getElementById("prev-page");
const nextPageButton = document.getElementById("next-page");
const themeToggle = document.getElementById("theme-toggle");
const welcomeSection = document.getElementById("welcome-section");

let currentPage = 1;

// Hide welcome section after 6 seconds
setTimeout(() => {
  welcomeSection.classList.add("hidden");
}, 6000); // 6000 milliseconds = 6 seconds

// Fetch movies
async function getMovies(url) {
  showLoading();
  try {
    const allMovies = [];
    // Fetch 50 pages (20 movies per page = 1000 movies)
    for (let page = 1; page <= 50; page++) {
      const res = await fetch(url + page);
      const data = await res.json();
      allMovies.push(...data.results);
    }
    showRecommended(allMovies);
  } catch (error) {
    console.error("Error fetching movies:", error);
  } finally {
    hideLoading();
  }
}

// Show recommended movies
function showRecommended(movies) {
  main.innerHTML = "";
  const mostPopularMovies = document.createElement("div");
  const recommendedMovies = document.createElement("div");
  recommendedMovies.innerHTML = "<h2>Recommended for you</h2>";
  const horizontalList = document.createElement("div");

  mostPopularMovies.classList.add("most-popular");
  recommendedMovies.classList.add("recommended");
  horizontalList.classList.add("horizontal-list");

  mostPopularMovies.appendChild(horizontalList);
  main.appendChild(mostPopularMovies);
  main.appendChild(recommendedMovies);

  movies.forEach((movie, index) => {
    const { title, backdrop_path, vote_average, overview, id } = movie;
    const movieElement = document.createElement("div");
    movieElement.dataset.movieId = id;

    if (index < 5) {
      movieElement.classList.add("movie-l");
      movieElement.innerHTML = ` 
        <img src="${IMG_PATH + backdrop_path}" alt="${title}">
        <div class="movie-info">
             <h3>${title}</h3>
         </div>
         <div class="overview ${index >= 5 ? "hidden" : "visible"}">
             <p>${overview}</p>
             <div class="buttons">
                 <button class="watch-now">Watch now</button>
                 <button class="watch-later">+</button>
             </div>
         </div>
      `;
    } else {
      movieElement.classList.add("movie-s");
      movieElement.innerHTML = ` 
        <img src="${IMG_PATH + backdrop_path}" alt="${title}">
        <div class="movie-info">
             <h3>${title}</h3>
             <span class="vote">★ ${vote_average}</span>
         </div>
         <div class="overview ${index >= 5 ? "hidden" : "visible"}">
         <h3>${title}</h3> 
             <p>${overview}</p>
             <div class="buttons">
                 <button class="watch-now">Watch now</button>
                 <button class="watch-later">+</button>
             </div>
         </div>
      `;
    }

    if (index < 5) {
      horizontalList.appendChild(movieElement);
    } else {
      recommendedMovies.appendChild(movieElement);
    }
  });
}

// Search movies
function searchMovies(movies) {
  main.innerHTML = "";
  const searchedMovies = document.createElement("div");
  searchedMovies.classList.add("searched");
  main.appendChild(searchedMovies);

  movies.forEach((movie) => {
    const { title, poster_path, vote_average, overview, id } = movie;
    const movieElement = document.createElement("div");
    movieElement.classList.add("movie-s");
    movieElement.dataset.movieId = id;
    movieElement.innerHTML = ` 
        <img src="${IMG_PATH + poster_path}" alt="${title}">
        <div class="movie-info">
             <h3>${title}</h3>
             <span class="vote">★ ${vote_average}</span>
         </div>
         <div class="overview hidden">
         <h3>${title}</h3> 
             <p>${overview}</p>
             <div class="buttons">
                 <button class="watch-now">Watch now</button>
                 <button class="watch-later">+</button>
             </div>
         </div>
      `;

    searchedMovies.appendChild(movieElement);
  });
}

// Fetch movie trailer
async function getMovieTrailer(movieId) {
  try {
    const res = await fetch(VIDEO_API(movieId)); // Use the dynamic VIDEO_API function
    const data = await res.json();
    const trailer = data.results.find((video) => video.type === "Trailer");
    return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
  } catch (error) {
    console.error("Error fetching trailer:", error);
    return null;
  }
}

// Play trailer
function playTrailer(trailerUrl) {
  if (trailerUrl) {
    videoIframe.src = trailerUrl;
    videoPlayer.classList.remove("hidden");
    videoPlayer.classList.add("visible");
  } else {
    alert("Trailer not available for this movie.");
  }
}

// Close video player
closeVideo.addEventListener("click", () => {
  videoPlayer.classList.remove("visible");
  videoPlayer.classList.add("hidden");
  videoIframe.src = "";
});

// Pagination
prevPageButton.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    getMovies(API_URL + currentPage);
  }
});

nextPageButton.addEventListener("click", () => {
  currentPage++;
  getMovies(API_URL + currentPage);
});

// Theme toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-theme");
});

// Loading spinner
function showLoading() {
  document.getElementById("loading").classList.remove("hidden");
}

function hideLoading() {
  document.getElementById("loading").classList.add("hidden");
}

// Event listeners
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchTerm = search.value;
  if (searchTerm && searchTerm !== "") {
    getMovies(SEARCH_API + searchTerm);
  } else {
    window.location.reload();
  }
});

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("watch-now")) {
    const movieId = e.target.closest(".movie-l, .movie-s").dataset.movieId;
    const trailerUrl = await getMovieTrailer(movieId); // Fetch trailer URL
    playTrailer(trailerUrl); // Play the trailer
  }
});

// Initial load
getMovies(API_URL);