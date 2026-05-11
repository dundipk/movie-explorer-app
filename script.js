const API_KEY = 'f9ef398e80e3e1fb87b003647994f38a';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

const main = document.getElementById('main');
const trendingSlider = document.getElementById('trending-slider');
const genresContainer = document.getElementById('genres');
const searchInput = document.getElementById('search');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const currentPage = document.getElementById('current');
const themeToggle = document.getElementById('theme-toggle');
const videoPopup = document.getElementById('video-popup');
const trailersTrack = document.getElementById('trailers-track');
const othersTrack = document.getElementById('others-track');

let currentPageNum = 1;

// ======================= Trending =======================
async function getTrendingMovies() {
  const res = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
  const data = await res.json();
  showTrendingMovies(data.results);
}

function showTrendingMovies(movies) {
  trendingSlider.innerHTML = '';
  movies.forEach(movie => {
    const card = document.createElement('div');
    card.classList.add('trending-card');
    card.dataset.id = movie.id;

    const img = document.createElement('img');
    img.src = IMG_PATH + movie.poster_path;
    img.alt = movie.title;
    card.appendChild(img);

    // Change: Add click event to show trailer
    card.addEventListener('click', async () => {
      const trailerKey = await getTrailer(movie.id);
      if (trailerKey) {
        openTrailerPopup(trailerKey);
      } else {
        alert('No trailer available for this movie.');
      }
    });

    trendingSlider.appendChild(card);
  });
}

// ======================= Get Trailer =======================
async function getTrailer(movieId) {
  const res = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`);
  const data = await res.json();
  const trailer = data.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  return trailer ? trailer.key : null;
}

// ======================= Popup Trailer =======================
function openTrailerPopup(videoKey) {
  closeHoverPopup(); // Close existing if any

  const popup = document.createElement('div');
  popup.classList.add('hover-popup');

  popup.innerHTML = `
    <div class="hover-popup-backdrop"></div>
    <div class="hover-popup-content">
      <iframe 
        src="https://www.youtube.com/embed/${videoKey}?autoplay=1&controls=1" 
        allow="autoplay; encrypted-media"
        allowfullscreen
        frameborder="0"
      ></iframe>
      <span class="close-popup" onclick="closeHoverPopup()">✖</span>
    </div>
  `;

  document.body.appendChild(popup);
  document.body.classList.add('popup-active');

  popup.querySelector('.hover-popup-backdrop').addEventListener('click', closeHoverPopup);
}

function closeHoverPopup() {
  const popup = document.querySelector('.hover-popup');
  if (popup) popup.remove();
  document.body.classList.remove('popup-active');
}

// ======================= Genres =======================
async function getGenres() {
  const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
  const data = await res.json();
  showGenres(data.genres);
}

function showGenres(genres) {
  genresContainer.innerHTML = '';
  genres.forEach(genre => {
    const btn = document.createElement('button');
    btn.innerText = genre.name;
    btn.classList.add('genre-btn');
    btn.addEventListener('click', () => {
      document.querySelectorAll('.genre-btn').forEach(btn => btn.classList.remove('active'));
      btn.classList.add('active');
      getMoviesByGenre(genre.id);
    });
    genresContainer.appendChild(btn);
  });

  const clearBtn = document.createElement('button');
  clearBtn.innerText = 'Clear';
  clearBtn.classList.add('clear-btn');
  clearBtn.addEventListener('click', () => {
    document.querySelectorAll('.genre-btn').forEach(btn => btn.classList.remove('active'));
    getMovies(currentPageNum);
  });
  genresContainer.appendChild(clearBtn);
}

// ======================= Genre Movies =======================
async function getMoviesByGenre(id) {
  const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${id}`);
  const data = await res.json();
  showMovies(data.results);
}

// ======================= All Movies =======================
async function getMovies(page = 1) {
  const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`);
  const data = await res.json();
  showMovies(data.results);
}

function showMovies(movies) {
  main.innerHTML = '';
  movies.forEach(movie => {
    const { title, poster_path, vote_average, overview, id } = movie;
    const movieEl = document.createElement('div');
    movieEl.classList.add('movie');
    movieEl.innerHTML = `
      <img src="${IMG_PATH + poster_path}" alt="${title}">
      <div class="movie-info">
        <h3>${title}</h3>
        <span>${vote_average.toFixed(1)}</span>
      </div>
      <div class="overview">
        ${overview.slice(0, 150)}...
        <br/>
        <a href="#" class="know-more">Know More</a>
        <br/>
        <button class="watch-trailer" onclick="showTrailers(${id})">🎬 Watch Trailer</button>
      </div>
    `;
    main.appendChild(movieEl);
  });
}

// ======================= Categorized Videos =======================
async function showTrailers(movieId) {
  const res = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`);
  const data = await res.json();
  const videos = data.results.filter(video => video.site === "YouTube");

  trailersTrack.innerHTML = '';
  othersTrack.innerHTML = '';

  videos.forEach(video => {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${video.key}?autoplay=0`;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;

    const wrapper = document.createElement('div');
    wrapper.classList.add('video-slide');
    wrapper.appendChild(iframe);

    if (video.type === 'Trailer') {
      trailersTrack.appendChild(wrapper);
    } else {
      othersTrack.appendChild(wrapper);
    }
  });

  videoPopup.style.display = 'flex';
}

function closePopup() {
  videoPopup.style.display = 'none';
  trailersTrack.innerHTML = '';
  othersTrack.innerHTML = '';
}

// ======================= Scroll Carousel Arrows =======================
function scrollCarousel(id, direction) {
  const container = document.getElementById(id);
  if (!container) return;
  const scrollAmount = 320;
  container.scrollBy({
    left: direction * scrollAmount,
    behavior: 'smooth'
  });
}

// ======================= Pagination =======================
prevBtn.addEventListener('click', () => {
  if (currentPageNum > 1) {
    currentPageNum--;
    currentPage.innerText = `Page ${currentPageNum}`;
    getMovies(currentPageNum);
  }
});

nextBtn.addEventListener('click', () => {
  currentPageNum++;
  currentPage.innerText = `Page ${currentPageNum}`;
  getMovies(currentPageNum);
});

// ======================= Search =======================
searchInput.addEventListener('keyup', async (e) => {
  const query = e.target.value.trim();
  if (query) {
    const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`);
    const data = await res.json();
    showMovies(data.results);
  } else {
    getMovies(currentPageNum);
  }
});

// ======================= Theme Toggle =======================
themeToggle.onclick = () => {
  document.body.classList.toggle('dark-mode');
  themeToggle.textContent = document.body.classList.contains('dark-mode') ? '🌙' : '🌞';
};

// ======================= INIT =======================
getTrendingMovies();
getGenres();
getMovies();
