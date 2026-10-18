import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { version as appVersion } from '../package.json';
import { House, Compass, ScrollText, LibraryBig, CircleEllipsis, Search, Bell, Plus, Heart, Star, ChevronRight, SlidersHorizontal, Sparkles, Check, X, Film, WandSparkles, Map, Crown, Trash2, CheckCheck, Filter, ArrowLeft, ArrowUp, ArrowDown, Bookmark, Clock3, Pencil, Clapperboard, LogOut, LoaderCircle, RefreshCw, RotateCcw, Eye, Volume2, VolumeX, Play } from 'lucide-react';
import { supabase, supabaseConfigured } from './lib/supabase';
import './styles.css';

const streamingServices = ['Netflix','Prime Video','Disney+','Apple TV+','Max','Hulu','Paramount+','Peacock','Crunchyroll'];
const knownProviderIds = { Peacock: 386, 'Paramount+': 2303 };
const monthlyThemes = [
  { label: 'Winter magic', keyword: 'winter', icon: '❄️', pattern: '❄  ✦  ❄  ✧  ❄  ✦  ❄  ✧  ' },
  { label: 'Love stories', keyword: 'romance', icon: '💌', pattern: '♥  ✦  ♥  ✧  ♥  ✦  ♥  ✧  ' },
  { label: 'Myths & legends', keyword: 'mythology', icon: '⚡', pattern: '⚡  ✦  ⚔  ✧  ⚡  ✦  ⚔  ✧  ' },
  { label: 'Spring adventures', keyword: 'spring', icon: '🌷', pattern: '✿  ✦  ❀  ✧  ✿  ✦  ❀  ✧  ' },
  { label: 'Road trip stories', keyword: 'road trip', icon: '🚗', pattern: '✦  ➜  ✧  ➜  ✦  ➜  ✧  ➜  ' },
  { label: 'Summer nights', keyword: 'summer', icon: '☀️', pattern: '☀  ✦  ☼  ✧  ☀  ✦  ☼  ✧  ' },
  { label: 'Ocean adventures', keyword: 'ocean', icon: '🐚', pattern: '≈  ✦  ◇  ✧  ≈  ✦  ◇  ✧  ' },
  { label: 'Back to school', keyword: 'school', icon: '📚', pattern: '▤  ✦  ✎  ✧  ▤  ✦  ✎  ✧  ' },
  { label: 'Mystery season', keyword: 'mystery', icon: '🔎', pattern: '⌕  ✦  ◌  ✧  ⌕  ✦  ◌  ✧  ' },
  { label: 'Halloween', keyword: 'halloween', icon: '🎃', pattern: '🎃  ✦  🕯  ✧  🎃  ✦  🕯  ✧  ' },
  { label: 'Found family', keyword: 'family', icon: '🍂', pattern: '🍂  ✦  ✧  🍂  ✦  ✧  🍂  ✦  ' },
  { label: 'Holiday magic', keyword: 'christmas', icon: '🎄', pattern: '✦  ❄  🎄  ✧  ✦  ❄  🎄  ✧  ' },
];
const browseThemes = [
  { label: 'Action', keyword: 'action', icon: '⚔️' }, { label: 'Adventure', keyword: 'adventure', icon: '🧭' },
  { label: 'Animation', keyword: 'animation', icon: '🎨' }, { label: 'Comedy', keyword: 'comedy', icon: '🎭' },
  { label: 'Crime', keyword: 'crime', icon: '🕵️' }, { label: 'Fantasy', keyword: 'fantasy', icon: '🐉' },
  { label: 'Feel-good', keyword: 'feel good', icon: '☀️' }, { label: 'Horror', keyword: 'horror', icon: '👻' },
  { label: 'Mystery', keyword: 'mystery', icon: '🔎' }, { label: 'Romance', keyword: 'romance', icon: '💌' },
  { label: 'Science fiction', keyword: 'science fiction', icon: '🚀' }, { label: 'Thriller', keyword: 'thriller', icon: '🌒' },
  { label: 'Superheroes', keyword: 'superhero', icon: '🦸' }, { label: 'Space', keyword: 'space', icon: '🪐' },
  { label: 'Heists', keyword: 'heist', icon: '💰' }, { label: 'Time travel', keyword: 'time travel', icon: '⌛' },
  { label: 'Coming of age', keyword: 'coming of age', icon: '🎒' }, { label: 'Based on true stories', keyword: 'based on a true story', icon: '📜' },
  { label: 'Friendship', keyword: 'friendship', icon: '🤝' }, { label: 'Family', keyword: 'family', icon: '🏡' },
  { label: 'Road trips', keyword: 'road trip', icon: '🚗' }, { label: 'Survival', keyword: 'survival', icon: '🏕️' },
  { label: 'War', keyword: 'war', icon: '🛡️' }, { label: 'Western', keyword: 'western', icon: '🤠' },
  { label: 'Music', keyword: 'music', icon: '🎸' }, { label: 'Dance', keyword: 'dance', icon: '💃' },
  { label: 'Sports', keyword: 'sports', icon: '🏆' }, { label: 'Food', keyword: 'food', icon: '🍿' },
  { label: 'Animals', keyword: 'animal', icon: '🐾' }, { label: 'Ocean', keyword: 'ocean', icon: '🌊' },
  { label: 'Pirates', keyword: 'pirate', icon: '🏴‍☠️' }, { label: 'Mythology', keyword: 'mythology', icon: '⚡' },
  { label: 'Magic', keyword: 'magic', icon: '🪄' }, { label: 'Dragons', keyword: 'dragon', icon: '🐲' },
  { label: 'Witches', keyword: 'witch', icon: '🧙' }, { label: 'Vampires', keyword: 'vampire', icon: '🧛' },
  { label: 'Zombies', keyword: 'zombie', icon: '🧟' }, { label: 'Ghosts', keyword: 'ghost', icon: '👻' },
  { label: 'Halloween', keyword: 'halloween', icon: '🎃' }, { label: 'Christmas', keyword: 'christmas', icon: '🎄' },
  { label: 'Dystopian', keyword: 'dystopia', icon: '🏙️' }, { label: 'Post-apocalyptic', keyword: 'post-apocalyptic', icon: '☄️' },
  { label: 'Robots & AI', keyword: 'artificial intelligence', icon: '🤖' }, { label: 'Aliens', keyword: 'alien', icon: '👽' },
  { label: 'Monsters', keyword: 'monster', icon: '🦖' }, { label: 'Detectives', keyword: 'detective', icon: '🗝️' },
  { label: 'Spies', keyword: 'spy', icon: '🕶️' }, { label: 'Revenge', keyword: 'revenge', icon: '🔥' },
  { label: 'Disasters', keyword: 'disaster', icon: '🌪️' }, { label: 'Fairy tales', keyword: 'fairy tale', icon: '🧚' },
  { label: 'Historical', keyword: 'historical', icon: '🏰' }, { label: 'Biographical', keyword: 'biography', icon: '🎞️' },
  { label: 'Martial arts', keyword: 'martial arts', icon: '🥋' }, { label: 'School days', keyword: 'school', icon: '📚' },
];
const themeBrowserPattern = [...browseThemes].sort(() => Math.random() - 0.5).slice(0, 22).map(theme => theme.icon).join('   ✦   ').repeat(2);
const buildMovieListPattern = (icon) => Array.from({ length: 900 }, (_, index) => index % 4 === 0 ? icon : index % 2 === 0 ? '✦' : '✧').join('   ');
const questLogPattern = [...['📜', '⚔️', '🏰', '✨', '🛡️', '🌙', '🗝️', '⭐', '🧭', '🪄']].sort(() => Math.random() - 0.5).join('   ✦   ').repeat(6);

const films = [
  { id: 1, tmdbId: 120, title: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001, genre: 'Fantasy · Adventure', runtime: '2h 58m', rating: '8.9', image: 'https://image.tmdb.org/t/p/w780/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg', shots: ['https://image.tmdb.org/t/p/w780/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg','https://image.tmdb.org/t/p/w780/1PN9ij2S2D5R8P6S8cXdY7h6lR3.jpg','https://image.tmdb.org/t/p/w780/bxVxZb5O9OxCO0oRUNdCnpy9NST.jpg'], tone: 'green', tags: ['Epic quest', 'Found family', 'Magic'] },
  { id: 101, tmdbId: 121, title: 'The Lord of the Rings: The Two Towers', year: 2002, genre: 'Fantasy · Adventure', runtime: '2h 59m', rating: '8.8', image: 'https://image.tmdb.org/t/p/w780/5VTN0pR8gcqV3EPUHHfMGnJYN9L.jpg', shots: ['https://image.tmdb.org/t/p/w780/5VTN0pR8gcqV3EPUHHfMGnJYN9L.jpg'], tone: 'green', tags: ['Epic quest', 'War', 'Middle-earth'] },
  { id: 102, tmdbId: 122, title: 'The Lord of the Rings: The Return of the King', year: 2003, genre: 'Fantasy · Adventure', runtime: '3h 21m', rating: '9.0', image: 'https://image.tmdb.org/t/p/w780/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg', shots: ['https://image.tmdb.org/t/p/w780/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg'], tone: 'gold', tags: ['Epic quest', 'Courage', 'Middle-earth'] },
  { id: 103, tmdbId: 49051, title: 'The Hobbit: An Unexpected Journey', year: 2012, genre: 'Fantasy · Adventure', runtime: '2h 49m', rating: '7.8', image: 'https://image.tmdb.org/t/p/w780/yHA9Fc37VmpUA5UncTxxo3rTGVA.jpg', shots: ['https://image.tmdb.org/t/p/w780/yHA9Fc37VmpUA5UncTxxo3rTGVA.jpg'], tone: 'green', tags: ['Quest', 'Dragons', 'Middle-earth'] },
  { id: 2, title: 'How to Train Your Dragon', year: 2010, genre: 'Animation · Fantasy', runtime: '1h 38m', rating: '8.1', image: 'https://image.tmdb.org/t/p/w780/ygGmAO60t8GyqUo9xYeYxSZAR3b.jpg', shots: ['https://image.tmdb.org/t/p/w780/ygGmAO60t8GyqUo9xYeYxSZAR3b.jpg','https://image.tmdb.org/t/p/w780/abPQVYyNfVuGoFUfGVhlHORpX0R.jpg','https://image.tmdb.org/t/p/w780/4ZrVjfQ4l0g1s7Gf3YwQKk7wZ6q.jpg'], tone: 'blue', tags: ['Dragons', 'Heartwarming', 'Adventure'] },
  { id: 3, title: 'The Princess Bride', year: 1987, genre: 'Fantasy · Romance', runtime: '1h 38m', rating: '8.0', image: 'https://image.tmdb.org/t/p/w780/2t9c8bg6VGBg9G8Z1FqzV4bV4Hg.jpg', shots: ['https://image.tmdb.org/t/p/w780/2t9c8bg6VGBg9G8Z1FqzV4bV4Hg.jpg','https://image.tmdb.org/t/p/w780/e2S5VdSx8JvP5LqV6QdL0p5mM7E.jpg'], tone: 'pink', tags: ['Fairytale', 'Witty', 'Classic'] },
  { id: 4, title: 'Stardust', year: 2007, genre: 'Fantasy · Romance', runtime: '2h 7m', rating: '7.6', image: 'https://image.tmdb.org/t/p/w780/7T0Vb1f6e5V3h6v0Hq3M8X3e5Nd.jpg', shots: ['https://image.tmdb.org/t/p/w780/7T0Vb1f6e5V3h6v0Hq3M8X3e5Nd.jpg','https://image.tmdb.org/t/p/w780/1sF7S1hQqeO0xQJf0Yk3yVd5xkB.jpg'], tone: 'gold', tags: ['Magic', 'Romance', 'Whimsical'] },
];
const sampleCollections = [];
const navItems = [
  { id: 'home', label: 'Home', icon: House }, { id: 'discover', label: 'Discover', icon: Compass }, { id: 'watchlist', label: 'Quest log', icon: ScrollText, center: true }, { id: 'lists', label: 'Collections', icon: LibraryBig }, { id: 'more', label: 'More', icon: CircleEllipsis },
];
const releaseNotes = [
  { version: '1.0.4', title: 'More dependable movie lists', details: ['Kept the AI recommendation button visible beside its expanding prompt.', 'Filled icon patterns across themed movie lists and sorted collections and movie history newest-first.', 'Kept Discover selections stable while leaving the app and removed the redundant collection-save progress message.'] },
  { version: '1.0.3', title: 'Smoother movie lists and smarter saves', details: ['Added a subtle animated icon pattern to themed lists and Quest Log rows, with reduced-motion support.', 'Made collection saves also add movies to Favorites and fixed Quest Log actions and newest-first collection ordering.', 'Unified displayed ratings to TMDB, stabilized the Discover filter panel, and added optional recommendations based on up to 10 recently watched movies.'] },
  { version: '1.0.2', title: 'AI movie recommendations', details: ['Added a Gemini-powered Home recommendation flow that opens matching TMDB movies in a dedicated results list.', 'Use Gemini Flash-Lite for faster responses, cache recommendations daily, and show up to 20 matched movies.'] },
  { version: '1.0.1', title: 'A more comfortable iPhone layout', details: ['Fixed the installed app safe areas so the bottom navigation background reaches the home indicator without leaving a purple strip.', 'Changed the iPhone status bar to its default style to keep it clear of page content.'] },
  { version: '1.0.0', title: 'Fitrack 1.0', details: ['Released the phone-first movie tracker with Google sign-in, personalized discovery, collections, Favorites, and a synced Quest Log.', 'Added the Fitrack RPG-style emblem to the app, browser tab, and iPhone home-screen icon.', 'Fixed TMDB refresh errors remaining after successful reloads and removed the duplicate Favorites choice when saving a movie to lists.'] },
  { version: '0.2.10', title: 'Personalized discovery and a cleaner trailer', details: ['Added randomized Discover filters, multi-genre and year-range selection, theme keywords, pass history, and a personal blacklist.', 'Persisted Quest Log and watched movies per account, and added passed and watched movie lists.', 'Reduced unnecessary Movie of the Night API calls in movie details and simplified trailer controls and YouTube branding.'] },
  { version: '0.2.9', title: 'Reliable collection saves and refresh', details: ['Saved Favorites and custom collections to Supabase and fixed movie detail actions to report save errors.', 'Corrected Hobbit TMDB IDs and added poster refresh for collections.', 'Added animated pull-to-refresh for Home movie lists and collection details while leaving departure lists API-free.'] },
  { version: '0.2.8', title: 'Smoother navigation and richer movie details', details: ['Added TMDB movie details with image galleries, trailers, cast, and current streaming availability, plus optional IMDb ratings and exact departure times.', 'Limited edge-swipe back navigation to screens with an in-app back destination and made Home and Collections return to their root when tapped again.', 'Made returning from a collection detail faster and reset the collections view to the top.'] },
  { version: '0.2.7', title: 'Streaming departures and account options', details: ['Added daily-cached movie departure lists for selected streaming services, with larger batched loading and clearer loading states.', 'Added account initials and a way to update streaming provider selections.', 'Improved provider matching for Peacock and Paramount+.'] },
  { version: '0.2.6', title: 'Google sign-in and onboarding', details: ['Added Google sign-in with Supabase Auth.', 'New users can save their streaming service preferences for future recommendations.'] },
  { version: '0.2.5', title: 'Collection poster icons', details: ['Removed genre icons from collection movie posters while keeping the artwork visible.'] },
  { version: '0.2.4', title: 'Posters back in every movie list', details: ['Restored poster artwork in Home Explore results, Quest Log, and collection movie rows.', 'Kept genre symbols off those compact list posters.', 'Made phone poster cards taller and easier to recognize.'] },
  { version: '0.2.3', title: 'Cleaner movie lists', details: ['Removed genre icons from Quest Log, collection details, and Home Explore results.', 'Kept genre icons on Home shelves and Discover posters.'] },
  { version: '0.2.2', title: 'Posters that tell the story', details: ['Added the Fitrack About panel and version history.', 'Connected Home movie shelves and search to TMDB.', 'Improved posters, collection controls, and mobile navigation.'] },
  { version: '0.1.0', title: 'The first Fitrack adventure', details: ['Introduced the phone-first movie tracker and its five main tabs.', 'Added swipe-to-like discovery, a Quest Log, Favorites, and custom collections.', 'Created the cozy, RPG-inspired visual style.'] },
];
const genreNames = { 12:'Adventure',14:'Fantasy',16:'Animation',18:'Drama',27:'Horror',28:'Action',35:'Comedy',36:'History',37:'Western',53:'Thriller',80:'Crime',99:'Documentary',878:'Science Fiction',9648:'Mystery',10402:'Music',10749:'Romance',10751:'Family',10752:'War',10770:'TV Movie' };
const DISCOVER_MIN_YEAR = 1870;
const DISCOVER_MAX_YEAR = new Date().getFullYear();
const emptyDiscoverFilters = { genres: [], yearFrom: DISCOVER_MIN_YEAR, yearTo: DISCOVER_MAX_YEAR, minimumRating: '', runtime: '', language: '', provider: '', keyword: '', sort: 'random' };
const emptyMovieBlacklist = { excludeYears: false, yearFrom: DISCOVER_MIN_YEAR, yearTo: 2000, genreIds: [], languages: [] };
const discoverLanguages = [{ id: 'en', label: 'English' }, { id: 'es', label: 'Spanish' }, { id: 'fr', label: 'French' }, { id: 'ja', label: 'Japanese' }, { id: 'ko', label: 'Korean' }, { id: 'hi', label: 'Hindi' }];
const allowedReleaseYearSegments = (blacklist) => {
  if (!blacklist?.excludeYears) return [{ from: DISCOVER_MIN_YEAR, to: DISCOVER_MAX_YEAR }];
  const from = Math.max(DISCOVER_MIN_YEAR, Math.min(DISCOVER_MAX_YEAR, Number(blacklist.yearFrom) || DISCOVER_MIN_YEAR));
  const to = Math.max(from, Math.min(DISCOVER_MAX_YEAR, Number(blacklist.yearTo) || DISCOVER_MAX_YEAR));
  return [
    ...(from > DISCOVER_MIN_YEAR ? [{ from: DISCOVER_MIN_YEAR, to: from - 1 }] : []),
    ...(to < DISCOVER_MAX_YEAR ? [{ from: to + 1, to: DISCOVER_MAX_YEAR }] : []),
  ];
};
const normalizeMovieBlacklist = (value) => {
  const yearFrom = Math.max(DISCOVER_MIN_YEAR, Math.min(DISCOVER_MAX_YEAR, Number(value?.yearFrom) || DISCOVER_MIN_YEAR));
  const yearTo = Math.max(yearFrom, Math.min(DISCOVER_MAX_YEAR, Number(value?.yearTo) || 2000));
  return {
    ...emptyMovieBlacklist,
    excludeYears: Boolean(value?.excludeYears),
    yearFrom,
    yearTo,
    genreIds: Array.isArray(value?.genreIds) ? value.genreIds.map(String) : [],
    languages: Array.isArray(value?.languages) ? value.languages.map(String) : [],
  };
};
const genreEmblems = { Adventure:'⚔️', Fantasy:'🐉', Animation:'🎨', Drama:'🎭', Horror:'👻', Action:'💥', Comedy:'😂', History:'🏛️', Western:'🤠', Thriller:'🗡️', Crime:'🕵️', Documentary:'🎥', 'Science Fiction':'🚀', Mystery:'🔍', Music:'🎵', Romance:'💗', Family:'🏠', War:'🛡️', 'TV Movie':'📺', Movie:'🎬' };
const mapTmdbMovie = (movie) => {
  const imageBase = 'https://image.tmdb.org/t/p/w780';
  const poster = movie.poster_path ? `${imageBase}${movie.poster_path}` : '';
  const backdrop = movie.backdrop_path ? `${imageBase}${movie.backdrop_path}` : poster;
  const year = Number(movie.original_year) || (movie.release_date ? Number(movie.release_date.slice(0, 4)) : '');
  const genreIds = movie.genre_ids || movie.genreIds || [];
  const genres = genreIds.map((id) => genreNames[id]).filter(Boolean);
  return { id: `tmdb-${movie.id}`, tmdbId: movie.id, title: movie.title || movie.original_title || 'Untitled movie', year, releaseDate: movie.release_date || '', genre: genres.slice(0, 2).join(' · ') || 'Movie', genreIds, originalLanguage: movie.original_language || movie.originalLanguage || '', runtime: 'See details', rating: Number(movie.vote_average || 0).toFixed(1), ratingLabel: 'TMDB', image: poster || backdrop, shots: [backdrop || poster].filter(Boolean), tone: 'lavender', tags: genres.slice(0, 3), overview: movie.overview || '', recommendationReason: movie.recommendationReason || '' };
};
const mapExpiringMovie = (movie) => ({ ...movie, id: `expiring-${movie.id}`, rating: '', ratingLabel: '', hideRating: true, isExpiring: true });
const readDiscoverSnapshot = () => {
  try {
    const saved = JSON.parse(sessionStorage.getItem('fitrack-discover-snapshot') || 'null');
    return saved && Array.isArray(saved.queue) ? saved : null;
  } catch { return null; }
};
function App() {
  const initialDiscoverSnapshot = useRef(readDiscoverSnapshot()).current;
  const [page, setPage] = useState('home');
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [movieBlacklist, setMovieBlacklist] = useState(emptyMovieBlacklist);
  const [blacklistDraft, setBlacklistDraft] = useState(emptyMovieBlacklist);
  const [showBlacklistSettings, setShowBlacklistSettings] = useState(false);
  const [savingBlacklist, setSavingBlacklist] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [savingOnboarding, setSavingOnboarding] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [liked, setLiked] = useState([]);
  const [watchlistRows, setWatchlistRows] = useState([]);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [watchlistError, setWatchlistError] = useState('');
  const [discoverQueue, setDiscoverQueue] = useState(() => initialDiscoverSnapshot?.queue || []);
  const [discoverPassRows, setDiscoverPassRows] = useState([]);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [discoverError, setDiscoverError] = useState('');
  const [discoverOffsetY, setDiscoverOffsetY] = useState(0);
  const [discoverOffset, setDiscoverOffset] = useState(0);
  const [discoverExit, setDiscoverExit] = useState('');
  const [showDiscoverFilters, setShowDiscoverFilters] = useState(false);
  const [discoverFilters, setDiscoverFilters] = useState({ ...emptyDiscoverFilters });
  const [discoverDraft, setDiscoverDraft] = useState({ ...emptyDiscoverFilters });
  const [discoverYearSegmentIndex, setDiscoverYearSegmentIndex] = useState(0);
  const [collectionPickerOrigin, setCollectionPickerOrigin] = useState('');
  const [collectionPickerSelected, setCollectionPickerSelected] = useState([]);
  const [collectionPickerWatched, setCollectionPickerWatched] = useState(false);
  const [aiUseWatchedContext, setAiUseWatchedContext] = useState(false);
  const [collectionCreateMovie, setCollectionCreateMovie] = useState(null);
  const [collectionCreateOrigin, setCollectionCreateOrigin] = useState('');
  const [moreLibraryView, setMoreLibraryView] = useState('');
  const [moreMovieFilters, setMoreMovieFilters] = useState({ query: '', genre: 'All genres', decade: 'Any decade' });
  const [questOffsets, setQuestOffsets] = useState({});
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState('');
  const [aiMoviePrompt, setAiMoviePrompt] = useState('');
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [aiRecommendationLoading, setAiRecommendationLoading] = useState(false);
  const [aiRecommendationError, setAiRecommendationError] = useState('');
  const [homeShelves, setHomeShelves] = useState(null);
  const [homeSearchResults, setHomeSearchResults] = useState(null);
  const [homeRefreshing, setHomeRefreshing] = useState(false);
  const [homePullDistance, setHomePullDistance] = useState(0);
  const [providerOptions, setProviderOptions] = useState([]);
  const [providerOptionsLoading, setProviderOptionsLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState(null);
  const [providerMovies, setProviderMovies] = useState(null);
  const [providerLoading, setProviderLoading] = useState(false);
  const [providerLoadingMore, setProviderLoadingMore] = useState(false);
  const [providerHasMore, setProviderHasMore] = useState(false);
  const [providerNextCursor, setProviderNextCursor] = useState(null);
  const [providerError, setProviderError] = useState('');
  const [countdownNow, setCountdownNow] = useState(Date.now());
  const [homeLoading, setHomeLoading] = useState(false);
  const [homeError, setHomeError] = useState('');
  const [exploreCategory, setExploreCategory] = useState('');
  const [themeListSelection, setThemeListSelection] = useState(null);
  const [themeListLoading, setThemeListLoading] = useState(false);
  const [themeListMovies, setThemeListMovies] = useState([]);
  const [themeListPage, setThemeListPage] = useState(1);
  const [themeListTotalPages, setThemeListTotalPages] = useState(1);
  const [themeListHasMore, setThemeListHasMore] = useState(true);
  const [themeListLoadingMore, setThemeListLoadingMore] = useState(false);
  const themeListFetchSort = useRef('popularity.desc');
  const themeSeenMovieIds = useRef(new Set());
  const [themeListSort, setThemeListSort] = useState('popularity.desc');
  const [themeListGenre, setThemeListGenre] = useState('');
  const [themeListDecade, setThemeListDecade] = useState('');
  const [collectionFilter, setCollectionFilter] = useState('All');

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [trailerPlaying, setTrailerPlaying] = useState(false);
  const [trailerMuted, setTrailerMuted] = useState(false);
  const [activeCollection, setActiveCollection] = useState('');
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [customCollections, setCustomCollections] = useState(sampleCollections);
  const [collectionRows, setCollectionRows] = useState([]);
  const [collectionMovieRows, setCollectionMovieRows] = useState([]);
  const [collectionRefreshing, setCollectionRefreshing] = useState(false);
  const [collectionPullDistance, setCollectionPullDistance] = useState(0);
  const [collectionAssignments, setCollectionAssignments] = useState(Object.fromEntries(sampleCollections.map(c=>[c.name,films.map(f=>f.id)])));
  const [collectionPickerMovie, setCollectionPickerMovie] = useState(null);
  const [lastDiscoverMovie, setLastDiscoverMovie] = useState(null);
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [showTmdbCredits, setShowTmdbCredits] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showAccountActions, setShowAccountActions] = useState(false);
  const [showProviderSettings, setShowProviderSettings] = useState(false);
  const [providerSettingsError, setProviderSettingsError] = useState('');
  const [providerDraft, setProviderDraft] = useState([]);
  const [collectionDraft, setCollectionDraft] = useState({ name: '', description: '', icon: '✦' });
  const [confirmAction, setConfirmAction] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilter, setAdvancedFilter] = useState({ genre: 'Any genre', decade: 'Any decade', minRating: 'Any rating', sort: 'Recommended' });
  const edgeBackStart = useRef(null);
  const movieDetailPullStart = useRef(null);
  const collectionPullStart = useRef(null);
  const collectionPullDistanceRef = useRef(0);
  const homePullStart = useRef(null);
  const homePullDistanceRef = useRef(0);
  const blockedEdgeSwipe = useRef(false);
  const blockedEdgeOrigin = useRef(null);
  const movieDetailRequest = useRef(0);
  const discoverSwipeStart = useRef(null);
  const discoverWasSwiped = useRef(false);
  const discoverSeenIds = useRef(new Set([...(initialDiscoverSnapshot?.seen || []), ...(initialDiscoverSnapshot?.queue || []).map(movie => String(movie.id))]));
  const discoverNextPage = useRef(0);
  const discoverHasMore = useRef(true);
  const discoverBatchLock = useRef(false);
  const discoverGeneration = useRef(0);
  const discoverPageActive = useRef(false);
  const discoverInputSignature = useRef(initialDiscoverSnapshot?.signature || '');
  const questSwipeStart = useRef(null);
  const discoverLocked = useRef(false);
  const suppressMovieClick = useRef(false);
  useEffect(() => {
    try {
      sessionStorage.setItem('fitrack-discover-snapshot', JSON.stringify({ queue: discoverQueue, seen: [...discoverSeenIds.current], signature: discoverInputSignature.current }));
    } catch { /* Keep the in-memory Discover queue if browser storage is unavailable. */ }
  }, [discoverQueue]);
  useEffect(() => {
    if (!supabase) { setAuthLoading(false); return; }
    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setAuthError(error.message);
      setAuthUser(data.session?.user || null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setAuthUser(session?.user || null);
      setProfile(null);
      setMovieBlacklist(emptyMovieBlacklist);
      setAuthError('');
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  useEffect(() => {
    if (!supabase || !authUser) { setProfile(null); setMovieBlacklist(emptyMovieBlacklist); setProfileLoading(false); return; }
    let active = true;
    setProfileLoading(true);
    supabase.from('profiles').select('display_name, streaming_services, onboarding_completed, movie_blacklist').eq('id', authUser.id).maybeSingle().then(({ data, error }) => {
      if (!active) return;
      if (error) setAuthError(`Could not load your profile. Apply the database setup from README. ${error.message}`);
      setProfile(data || null);
      setMovieBlacklist(normalizeMovieBlacklist(data?.movie_blacklist));
      setSelectedServices(data?.streaming_services || []);
      setProfileLoading(false);
    });
    return () => { active = false; };
  }, [authUser]);
  useEffect(() => {
    if (!supabase || !authUser) return;
    let active = true;
    loadCollectionData(authUser.id).catch(error => { if (active) setAuthError(`Could not load your collections: ${error.message}`); });
    return () => { active = false; };
  }, [authUser?.id]);
  useEffect(() => {
    if (!supabase || !authUser) { setWatchlistRows([]); setWatchlistLoading(false); setWatchlistError(''); return; }
    let active = true;
    setWatchlistRows([]);
    setWatchlistLoading(true);
    setWatchlistError('');
    supabase.from('watchlist_movies').select('movie_id,movie,status,added_at,watched_at').eq('user_id', authUser.id).order('added_at', { ascending: true }).then(({ data, error }) => {
      if (!active) return;
      if (error) setWatchlistError(`Could not load your Quest Log: ${error.message}`);
      else setWatchlistRows(data || []);
      setWatchlistLoading(false);
    });
    return () => { active = false; };
  }, [authUser?.id]);
  useEffect(() => {
    if (!supabase || !authUser) { setDiscoverPassRows([]); return; }
    let active = true;
    supabase.from('discover_passes').select('movie_id,movie,pass_count,first_passed_at,last_passed_at').eq('user_id', authUser.id).then(({ data, error }) => {
      if (!active) return;
      if (error) { notify(`Could not load passed movies: ${error.message}`); return; }
      setDiscoverPassRows(data || []);
    });
    return () => { active = false; };
  }, [authUser?.id]);
  useEffect(() => {
    if (!authUser) return;
    const appUrl = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState({ fitrack: true }, '', appUrl);
    window.history.pushState({ fitrack: true, guard: true }, '', appUrl);
    const keepNavigationInApp = () => {
      window.history.pushState({ fitrack: true, guard: true }, '', appUrl);
    };
    window.addEventListener('popstate', keepNavigationInApp);
    return () => window.removeEventListener('popstate', keepNavigationInApp);
  }, [authUser?.id]);
  useEffect(() => {
    // Mobile Safari can treat a rightward edge drag as browser Back before React's
    // touch handlers finish. Cancel that native gesture everywhere without an
    // in-app back destination; keep vertical scrolling and in-app swipes intact.
    const onTouchStart = (event) => {
      const touch = event.touches[0];
      const hasInAppBack = (page === 'home' && Boolean(exploreCategory || activeProvider)) || (page === 'lists' && Boolean(activeCollection));
      const modalOpen = selectedMovie || collectionPickerMovie || showCollectionForm || showAbout || showTmdbCredits || showAccountActions || showBlacklistSettings || showProviderSettings || confirmAction;
      // Claim the browser edge gesture at touchstart, before iOS Safari hands it
      // to its native back navigation. Our allowed in-app cases are handled by
      // the component touch handlers below.
      blockedEdgeSwipe.current = touch.clientX <= 28;
      blockedEdgeOrigin.current = blockedEdgeSwipe.current ? { x: touch.clientX, y: touch.clientY, hasInAppBack: Boolean(hasInAppBack && !modalOpen) } : null;
      if (blockedEdgeSwipe.current) edgeBackStart.current = null;
      if (blockedEdgeSwipe.current && event.cancelable) event.preventDefault();
    };
    const onTouchMove = (event) => {
      if (!blockedEdgeSwipe.current || event.touches.length !== 1) return;
      const touch = event.touches[0];
      const origin = blockedEdgeOrigin.current;
      if (!origin) return;
      const dx = touch.clientX - origin.x;
      const dy = touch.clientY - origin.y;
      if (dx > 5 && Math.abs(dx) > Math.abs(dy)) {
        if (event.cancelable) event.preventDefault();
        event.stopPropagation();
      }
    };
    const clear = () => { blockedEdgeSwipe.current = false; blockedEdgeOrigin.current = null; };
    document.addEventListener('touchstart', onTouchStart, { passive: false, capture: true });
    document.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
    document.addEventListener('touchend', clear, { passive: true, capture: true });
    document.addEventListener('touchcancel', clear, { passive: true, capture: true });
    return () => {
      document.removeEventListener('touchstart', onTouchStart, true);
      document.removeEventListener('touchmove', onTouchMove, true);
      document.removeEventListener('touchend', clear, true);
      document.removeEventListener('touchcancel', clear, true);
    };
  }, [page, exploreCategory, activeProvider, activeCollection, selectedMovie, collectionPickerMovie, showCollectionForm, showAbout, showTmdbCredits, showAccountActions, showBlacklistSettings, showProviderSettings, confirmAction]);
  const homeApiConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  const callHomeMovies = async (payload) => {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/home-movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: import.meta.env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not load movies.');
    return data;
  };
  const requestAiRecommendation = async (event) => {
    event.preventDefault();
    const prompt = aiMoviePrompt.trim();
    if (!prompt || aiRecommendationLoading) return;
    const watchedTitles = aiUseWatchedContext
      ? watchlistRows.filter(row => row.status === 'watched').sort((a, b) => new Date(b.watched_at || b.added_at) - new Date(a.watched_at || a.added_at)).slice(0, 10).map(row => row.movie?.title).filter(Boolean)
      : [];
    setAiRecommendationLoading(true);
    setAiRecommendationError('');
    try {
      const data = await callHomeMovies({ action: 'recommend', prompt, watchedTitles });
      setAiRecommendation({ summary: data.summary || '', movies: (data.results || []).map(mapTmdbMovie) });
      setExploreCategory('AI recommendations');
    } catch (error) {
      setAiRecommendation(null);
      setAiRecommendationError(error.message || 'Could not get movie recommendations.');
    } finally {
      setAiRecommendationLoading(false);
    }
  };
  const loadHomeShelfData = async () => {
    const now=new Date(),month=now.getMonth()+1,theme=monthlyThemes[month-1];
    const data=await callHomeMovies({action:'home',month});
    const shelves=(data.shelves||[]).filter(shelf=>shelf.title!=='Popular movies'&&!shelf.theatrical&&!/^in theaters\b/i.test(shelf.title||'')).map(shelf=>({...shelf,movies:(shelf.movies||[]).map(mapTmdbMovie)}));
    if(shelves.some(shelf=>shelf.theme))return shelves;
    const title=`${now.toLocaleString('en-US',{month:'long'})} · ${theme.label}`;
    // Bump the cache namespace so older title-search results are discarded.
    const cacheKey=`fitrack:monthly-theme-keyword-v2:${now.getFullYear()}-${String(month).padStart(2,'0')}`;
    try{const cached=JSON.parse(localStorage.getItem(cacheKey)||'null');if(cached?.date===now.toISOString().slice(0,10)&&Array.isArray(cached.movies))return [...shelves,{title,theme:month,movies:cached.movies.map(mapTmdbMovie),totalPages:cached.totalPages||1}];}catch{}
    const themed=await callHomeMovies({action:'discover',page:1,filters:{keyword:theme.keyword,sort:'popularity.desc'}});
    const movies=themed.results||[];
    try{localStorage.setItem(cacheKey,JSON.stringify({date:now.toISOString().slice(0,10),movies,totalPages:themed.totalPages||1}));}catch{}
    return [...shelves,{title,theme:month,movies:movies.map(mapTmdbMovie),totalPages:themed.totalPages||1}];
  };
  useEffect(() => {
    if (!homeApiConfigured) return;
    let active = true;
    setHomeLoading(true); setHomeError('');
    loadHomeShelfData().then((shelves) => {
      if (active) setHomeShelves(shelves);
    }).catch((error) => { if (active) setHomeError(error.message); }).finally(() => { if (active) setHomeLoading(false); });
    return () => { active = false; };
  }, [homeApiConfigured]);
  useEffect(() => {
    if (!homeApiConfigured || !selectedServices.length) { setProviderOptions([]); setProviderOptionsLoading(false); setProviderError(''); return; }
    let active = true;
    setProviderOptionsLoading(true); setProviderError('');
    callHomeMovies({ action: 'providers', services: selectedServices, region: 'US' }).then((data) => {
      if (!active) return;
      const providers = [...(data.providers || [])];
      for (const service of selectedServices) {
        if (knownProviderIds[service] && !providers.some((provider) => provider.service === service)) {
          providers.push({ service, id: knownProviderIds[service], name: service, logoPath: null });
        }
      }
      setProviderOptions(providers);
    }).catch((error) => {
      if (active) setProviderError(error.message);
    }).finally(() => { if (active) setProviderOptionsLoading(false); });
    return () => { active = false; };
  }, [homeApiConfigured, selectedServices]);
  useEffect(() => {
    if (!activeProvider && !selectedMovie?.isExpiring && !selectedMovie?.expiryAt) return;
    const interval = window.setInterval(() => setCountdownNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, [activeProvider, selectedMovie?.isExpiring, selectedMovie?.expiryAt]);
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 1900); };
  const sendTrailerCommand = (func) => document.querySelector('.trailer-frame iframe')?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), 'https://www.youtube-nocookie.com');
  const toggleTrailerMute = () => { sendTrailerCommand(trailerMuted ? 'unMute' : 'mute'); setTrailerMuted(value => !value); };
  const watchlist = watchlistRows.filter(row => row.status === 'to_watch').map(row => row.movie_id);
  const isMovieInWatchlistStatus = (film, status) => watchlistRows.some(row => row.status === status && (row.movie_id === String(film.id) || (film.tmdbId && row.movie_id === `tmdb-${film.tmdbId}`) || (row.movie?.title && row.movie.title === film.title)));
  const loadCollectionData = async (userId = authUser?.id) => {
    if (!supabase || !userId) throw new Error('Sign in to save collections.');
    const [collectionsResult, moviesResult] = await Promise.all([
      supabase.from('collections').select('id,name,description,icon,is_default,created_at').eq('user_id', userId).order('is_default', { ascending: false }).order('created_at', { ascending: true }),
      supabase.from('collection_movies').select('collection_id,movie_id,movie,added_at').eq('user_id', userId),
    ]);
    if (collectionsResult.error) throw collectionsResult.error;
    if (moviesResult.error) throw moviesResult.error;
    const rows = collectionsResult.data || [];
    const movies = moviesResult.data || [];
    setCollectionRows(rows);
    setCollectionMovieRows(movies);
    setCustomCollections(rows.filter(row => !row.is_default).map(row => ({ ...row, createdAt: row.created_at, movieIds: movies.filter(movie => movie.collection_id === row.id).map(movie => movie.movie_id) })));
    setCollectionAssignments(Object.fromEntries(rows.map(row => [row.name, movies.filter(movie => movie.collection_id === row.id).map(movie => { const match=films.find(f=>f.title===movie.movie?.title); return match?.id ?? movie.movie_id; })])));
    const favoriteRow = rows.find(row => row.name === 'Favorites');
    if (favoriteRow) setLiked(movies.filter(movie => movie.collection_id === favoriteRow.id).flatMap(movie => { const match=films.find(f=>f.title===movie.movie?.title); return [movie.movie_id, match?.id].filter(value => value !== undefined && value !== null); }));
    return { rows, movies };
  };
  const refreshCollection = async () => {
    if (collectionRefreshing || !authUser) return;
    setCollectionRefreshing(true);
    try {
      const { movies } = await loadCollectionData(authUser.id);
      const missingPosters = movies.filter(row => !row.movie?.image && !row.movie?.poster)
        .map(row => ({ row, id: row.movie?.title === 'The Hobbit: The Desolation of Smaug' ? 57158 : row.movie?.title === 'The Hobbit: An Unexpected Journey' ? 49051 : Number(String(row.movie?.tmdbId || row.movie_id).replace(/^tmdb-/, '')) }))
        .filter(item => Number.isSafeInteger(item.id) && item.id > 0)
        .slice(0, 20);
      if (missingPosters.length && homeApiConfigured) {
        const posterResults = await Promise.all(missingPosters.map(async item => {
          const details = await callHomeMovies({ action: 'movie-detail', movieId: item.id, title: item.row.movie?.title, year: item.row.movie?.year, services: [], region: 'US' });
          return { ...item, poster: details.poster };
        }));
        for (const { row, poster } of posterResults) {
          if (!poster) continue;
          const movie = { ...row.movie, image: poster, poster };
          const result = await supabase.from('collection_movies').update({ movie }).eq('collection_id', row.collection_id).eq('movie_id', row.movie_id).eq('user_id', authUser.id);
          if (result.error) throw result.error;
        }
        await loadCollectionData(authUser.id);
      }
      notify('Collection refreshed');
    } catch (error) { notify(`Could not refresh collection: ${error.message}`); }
    finally { setCollectionRefreshing(false); }
  };
  const beginCollectionPull = (event) => {
    const container = event.currentTarget;
    collectionPullDistanceRef.current = 0;
    setCollectionPullDistance(0);
    collectionPullStart.current = container.scrollTop <= 1 && event.touches.length === 1 ? event.touches[0].clientY : null;
  };
  const moveCollectionPull = (event) => {
    if (collectionPullStart.current === null || collectionPullStart.current === undefined || collectionRefreshing) return;
    const delta = Math.max(0, event.touches[0].clientY - collectionPullStart.current);
    const distance = Math.min(88, delta * 0.62);
    collectionPullDistanceRef.current = distance;
    setCollectionPullDistance(distance);
  };
  const finishCollectionPull = (event) => {
    const start = collectionPullStart.current;
    collectionPullStart.current = null;
    const delta = start === null || start === undefined ? 0 : Math.max(0, event.changedTouches[0].clientY - start);
    const distance = Math.max(collectionPullDistanceRef.current, Math.min(88, delta * 0.62));
    collectionPullDistanceRef.current = 0;
    setCollectionPullDistance(0);
    if (distance >= 55) refreshCollection();
  };
  const refreshHomeMovies = async () => {
    if (homeRefreshing || activeProvider) return;
    if (!homeApiConfigured) { notify('Movie refresh is not configured'); return; }
    setHomeRefreshing(true);
    setHomeError('');
    try {
      if (searchSubmitted) {
        const data = await callHomeMovies({ action: 'search', query: searchSubmitted });
        setHomeSearchResults((data.results || []).map(mapTmdbMovie));
      } else {
        setHomeShelves(await loadHomeShelfData());
      }
      setHomeError('');
      notify('Movie list refreshed');
    } catch (error) { setHomeError(error.message || 'Could not connect to TMDB.'); notify(`Could not refresh movies: ${error.message}`); }
    finally { setHomeRefreshing(false); }
  };
  const beginHomePull = (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (activeProvider || target?.closest('.provider-shelf')) { homePullStart.current = null; return; }
    const container = event.currentTarget;
    homePullStart.current = container.scrollTop <= 1 && event.touches.length === 1
      ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
      : null;
    homePullDistanceRef.current = 0;
    setHomePullDistance(0);
  };
  const moveHomePull = (event) => {
    const start = homePullStart.current;
    if (!start || homeRefreshing) return;
    const touch = event.touches[0];
    const dy = touch.clientY - start.y;
    const dx = touch.clientX - start.x;
    if (dy <= 0 || Math.abs(dx) > Math.abs(dy)) { homePullDistanceRef.current = 0; setHomePullDistance(0); return; }
    const distance = Math.min(88, dy * 0.62);
    homePullDistanceRef.current = distance;
    setHomePullDistance(distance);
  };
  const finishHomePull = (event) => {
    const start = homePullStart.current;
    homePullStart.current = null;
    if (!start) return;
    const touch = event.changedTouches[0];
    const dy = touch.clientY - start.y;
    const dx = touch.clientX - start.x;
    const distance = Math.max(homePullDistanceRef.current, Math.min(88, Math.max(0, dy) * 0.62));
    homePullDistanceRef.current = 0;
    setHomePullDistance(0);
    if (distance >= 55 && dy > Math.abs(dx) * 1.15) refreshHomeMovies();
  };
  const homePullHandlers = { onTouchStart: beginHomePull, onTouchMove: moveHomePull, onTouchEnd: finishHomePull, onTouchCancel: () => { homePullStart.current = null; homePullDistanceRef.current = 0; setHomePullDistance(0); } };
  const homePullIndicator = () => activeProvider ? null : <div className={`home-pull-indicator ${(homePullDistance >= 55 || homeRefreshing) ? 'ready' : ''}`} style={{ height: homeRefreshing ? 36 : homePullDistance, opacity: homePullDistance || homeRefreshing ? 1 : 0 }} aria-live="polite">{homeRefreshing ? <LoaderCircle className="loading-spinner" size={17}/> : <RefreshCw size={17} style={{ transform: `rotate(${homePullDistance * 4}deg) scale(${.7 + Math.min(homePullDistance / 100, .5)})` }}/>}<span>{homeRefreshing ? 'Refreshing movies…' : homePullDistance >= 55 ? 'Release to reload' : 'Pull to reload'}</span></div>;
  const navigateTo = (nextPage) => {
    if (page === nextPage && nextPage === 'home') {
      setExploreCategory(''); setActiveProvider(null); setProviderMovies(null);
      setProviderNextCursor(null); setProviderHasMore(false); setProviderError('');
      setAiRecommendation(null);
    } else if (page === nextPage && nextPage === 'lists') {
      setActiveCollection(''); setCollectionFilter('All'); setShowAdvancedFilters(false);
    }
    if (nextPage !== 'home' && exploreCategory === 'AI recommendations') {
      setExploreCategory('');
      setAiRecommendation(null);
    }
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const returnToCollections = () => {
    setActiveCollection('');
    setCollectionFilter('All');
    setShowAdvancedFilters(false);
    requestAnimationFrame(() => document.querySelector('.collection-overview')?.scrollTo({ top: 0, behavior: 'instant' }));
  };
  const startEdgeBack = (event) => { const allowed=(page==='home'&&(exploreCategory||activeProvider))||(page==='lists'&&activeCollection)||(page==='more'&&moreLibraryView); if(!allowed||selectedMovie||collectionPickerMovie||showCollectionForm||showAbout||showTmdbCredits||showAccountActions||showBlacklistSettings||showProviderSettings||confirmAction)return; const touch=event.touches[0]; if(touch.clientX<=28)edgeBackStart.current={x:touch.clientX,y:touch.clientY}; };
  const finishEdgeBack = (event) => { const start=edgeBackStart.current; edgeBackStart.current=null; if(!start)return; const touch=event.changedTouches[0],dx=touch.clientX-start.x,dy=touch.clientY-start.y; if(dx>=85&&Math.abs(dx)>Math.abs(dy)*1.25){if(page==='home'){setExploreCategory('');setActiveProvider(null);setProviderMovies(null);setProviderNextCursor(null);setProviderHasMore(false);document.querySelector('.page-home .home-shelves')?.scrollTo({top:0});}else if(page==='lists')returnToCollections();else{setMoreLibraryView('');setMoreMovieFilters({query:'',genre:'All genres',decade:'Any decade'});}} };
  const toggle = (setter, id) => setter((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const toggleFavorite = async (film) => {
    if (!supabase || !authUser || !film) { notify('Sign in to save Favorites'); return false; }
    try {
      let row = collectionRows.find(item => item.name === 'Favorites');
      if (!row) {
        const result = await supabase.from('collections').select('id,name').eq('user_id', authUser.id).eq('name', 'Favorites').maybeSingle();
        if (result.error) throw result.error;
        row = result.data;
      }
      if (!row?.id) throw new Error('Favorites collection was not found for this account.');
      const currentRows = collectionMovieRows.filter(item => item.collection_id === row.id);
      const savedMatch = currentRows.find(item => item.movie_id === String(film.id) || (item.movie?.title && item.movie.title === film.title));
      if (savedMatch) {
        const result = await supabase.from('collection_movies').delete().eq('collection_id', row.id).eq('movie_id', savedMatch.movie_id);
        if (result.error) throw result.error;
        const aliases = new Set([String(film.id), savedMatch.movie_id, ...films.filter(item => item.title === film.title).map(item => String(item.id))]);
        setLiked(items => items.filter(item => !aliases.has(String(item))));
        notify('Removed from Favorites');
      } else {
        const result = await supabase.from('collection_movies').upsert({ collection_id: row.id, user_id: authUser.id, movie_id: String(film.id), movie: film }, { onConflict: 'collection_id,movie_id' });
        if (result.error) throw result.error;
        const aliases = [String(film.id), ...films.filter(item => item.title === film.title).map(item => String(item.id))];
        setLiked(items => Array.from(new Set([...items, ...aliases])));
        notify('Added to Favorites');
      }
      await loadCollectionData(authUser.id);
      return true;
    } catch (error) { notify(`Could not update Favorites: ${error.message}`); return false; }
  };
  const isFavoriteMovie = (film) => {
    if (!film) return false;
    const aliases = [String(film.id), film.tmdbId ? `tmdb-${film.tmdbId}` : null, ...films.filter(item => item.title === film.title).map(item => String(item.id))].filter(Boolean);
    if (aliases.some(id => liked.some(savedId => String(savedId) === id))) return true;
    const favoriteId = collectionRows.find(row => row.name === 'Favorites')?.id;
    return collectionMovieRows.some(row => row.collection_id === favoriteId && (row.movie_id === String(film.id) || row.movie?.title === film.title));
  };
  const current = discoverQueue[0] || null;
  const activeDiscoverFilterCount = Object.entries(discoverFilters).filter(([key, value]) => {
    if (key === 'sort') return value && value !== 'random';
    if (key === 'genres') return Array.isArray(value) && value.length > 0;
    if (key === 'yearFrom') return Number(value) > DISCOVER_MIN_YEAR || Number(discoverFilters.yearTo) < DISCOVER_MAX_YEAR;
    if (key === 'yearTo') return false;
    return typeof value === 'string' && value.trim().length > 0;
  }).length;
  const allDiscoverGenreOptions = Object.entries(genreNames).filter(([id]) => id !== '10770').sort((a, b) => a[1].localeCompare(b[1]));
  const discoverGenreOptions = allDiscoverGenreOptions.filter(([id]) => !movieBlacklist.genreIds.includes(id));
  const allowedDiscoverYearSegments = allowedReleaseYearSegments(movieBlacklist);
  const discoverLanguageOptions = discoverLanguages.filter(language => !movieBlacklist.languages.includes(language.id));
  const accountName = profile?.display_name || authUser?.user_metadata?.given_name || authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || authUser?.email?.split('@')[0] || 'Account';
  const accountFirstName = accountName.trim().split(/\s+/)[0] || 'Account';
  const accountInitial = Array.from(accountFirstName)[0]?.toLocaleUpperCase() || 'A';
  const accountPhoto = authUser?.user_metadata?.avatar_url || authUser?.user_metadata?.picture || authUser?.identities?.find((identity) => identity.provider === 'google')?.identity_data?.avatar_url || authUser?.identities?.find((identity) => identity.provider === 'google')?.identity_data?.picture;
  const accountAvatarContent = () => accountPhoto ? <img className="account-avatar-image" src={accountPhoto} alt="" referrerPolicy="no-referrer"/> : accountInitial;
  const homeMovies = homeSearchResults || films.filter((film) => film.title.toLowerCase().includes(searchSubmitted.toLowerCase()));
  const isMovieBlacklisted = (movie) => {
    if (!movie) return false;
    const year = Number(movie.year || movie.release_date?.slice?.(0, 4));
    if (movieBlacklist.excludeYears && Number.isFinite(year) && year >= Number(movieBlacklist.yearFrom) && year <= Number(movieBlacklist.yearTo)) return true;
    const excludedGenres = new Set(movieBlacklist.genreIds.map(String));
    const movieGenreIds = (movie.genreIds || movie.genre_ids || []).map(String);
    if (movieGenreIds.some(id => excludedGenres.has(id))) return true;
    const genreText = `${movie.genre || ''} ${(movie.tags || []).join(' ')}`.toLocaleLowerCase();
    if ([...excludedGenres].some(id => genreNames[id] && genreText.includes(genreNames[id].toLocaleLowerCase()))) return true;
    const language = String(movie.originalLanguage || movie.original_language || '').toLowerCase();
    return language && movieBlacklist.languages.includes(language);
  };
  const recommendationRows = (homeShelves || [
    { title: 'Trending this week', movies: films },
    { title: 'Monthly theme', theme: new Date().getMonth() + 1, movies: [] },
  ]).map(shelf => ({ ...shelf, movies: shelf.movies.filter(movie => !isMovieBlacklisted(movie)) }));
  const visibleProviderMovies = (providerMovies || []).filter(movie => !isMovieBlacklisted(movie));
  const homeRecommendationRows = recommendationRows.filter((shelf) => shelf.title !== 'Fantasy favorites');
  const movieShelf = (shelf) => { const theme=monthlyThemes[(Number(shelf.theme)||new Date().getMonth()+1)-1]; return <section className={`shelf ${shelf.theme?'theme-shelf':''}`} key={shelf.title}>{shelf.theme&&<span className="shelf-pattern" aria-hidden="true">{theme?.pattern?.repeat(4)}</span>}<div className="shelf-heading"><h3>{shelf.title}</h3><button className="text-button" onClick={()=>{setThemeListSelection(shelf.theme?theme:null);setThemeListLoading(false);setExploreCategory(shelf.title);setThemeListMovies(shelf.movies||[]);setThemeListPage(1);setThemeListTotalPages(shelf.totalPages||1);setThemeListHasMore(Boolean(shelf.theme)&&(shelf.totalPages||1)>1);setThemeListSort('popularity.desc');setThemeListGenre('');setThemeListDecade('');setHomeError('');setActiveProvider(null);document.querySelector('.page-home .home-shelves')?.scrollTo({top:0});}}>Explore <ChevronRight size={14}/></button></div><div className="shelf-row">{shelf.movies.map(f=><button className="shelf-card" key={f.id} onClick={()=>openMovie(f)}>{renderPoster(f,'shelf-poster')}<strong>{f.title}</strong><small>{f.year} · TMDB {f.rating}</small></button>)}</div></section>; };
  const providerShelf = () => <section className="provider-shelf" aria-label="Streaming services with movies leaving soon"><div className="provider-shelf-heading"><div><h3>Leaving soon</h3><small>Movies leaving your services · refreshed daily</small></div></div>{selectedServices.length===0?<p className="provider-empty">Choose services in your profile to track movies leaving soon.</p>:providerError?<p className="provider-empty">{providerError}</p>:providerOptionsLoading?<p className="provider-empty">Loading your services…</p>:providerOptions.length===0?<p className="provider-empty">No streaming providers matched your selections in the United States.</p>:<div className="provider-grid">{providerOptions.map(provider=><button className="provider-card" key={provider.id} onClick={()=>openProvider(provider)}><span className="provider-logo">{provider.logoPath?<img src={`https://image.tmdb.org/t/p/w92${provider.logoPath}`} alt=""/>:provider.name.slice(0,1)}</span><strong>{provider.service}</strong><ChevronRight size={14}/></button>)}</div>}</section>;
  const findMovie = (id) => {
    const candidates = [selectedMovie, collectionPickerMovie, collectionCreateMovie, ...films, ...(homeShelves || []).flatMap(shelf => shelf.movies || []), ...(homeSearchResults || []), ...(providerMovies || []), ...discoverQueue, ...(discoverPassRows || []).map(row => row.movie), ...collectionMovieRows.map(row => row.movie), ...watchlistRows.map(row => row.movie)].filter(Boolean);
    return candidates.find(movie => String(movie.id) === String(id) || String(movie.tmdbId || '') === String(id).replace(/^tmdb-/, '')) || null;
  };
  const normalizeMovieTitle = (value) => String(value || '').toLocaleLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  const isDiscoverExcluded = (movie) => {
    if (!movie) return true;
    const aliases = new Set([String(movie.id), movie.tmdbId ? `tmdb-${movie.tmdbId}` : '', movie.tmdbId ? String(movie.tmdbId) : ''].filter(Boolean));
    const title = normalizeMovieTitle(movie.title);
    const savedToCollection = collectionMovieRows.some(row => aliases.has(String(row.movie_id)) || (title && normalizeMovieTitle(row.movie?.title) === title));
    const inQuestLog = watchlistRows.some(row => aliases.has(String(row.movie_id)) || (title && normalizeMovieTitle(row.movie?.title) === title));
    const passed = discoverPassRows.some(row => aliases.has(String(row.movie_id)) || (title && normalizeMovieTitle(row.movie?.title) === title));
    return savedToCollection || inQuestLog || passed || isMovieBlacklisted(movie);
  };
  const addToWatchlist = async (id) => {
    if (!supabase || !authUser) { notify('Sign in to save your Quest Log'); return false; }
    const film = id && typeof id === 'object' ? id : findMovie(id);
    if (!film) { notify('Could not find this movie. Try opening it again.'); return false; }
    const movieId = String(film.collectionMovieId || film.id || id);
    const existing = watchlistRows.find(row => row.movie_id === movieId);
    if (existing?.status === 'to_watch') { notify('Already in your quest log'); return true; }
    try {
      const { data, error } = await supabase.from('watchlist_movies').upsert({ user_id: authUser.id, movie_id: movieId, movie: film, status: 'to_watch', watched_at: null }, { onConflict: 'user_id,movie_id' }).select('movie_id,movie,status,added_at,watched_at').single();
      if (error) throw error;
      setWatchlistRows(rows => [...rows.filter(row => row.movie_id !== movieId), data].sort((a,b) => new Date(a.added_at) - new Date(b.added_at)));
      notify(existing?.status === 'watched' ? 'Moved back to your quest log' : 'Added to your quest log');
      return true;
    } catch (error) { notify(`Could not add to Quest Log: ${error.message}`); return false; }
  };
  const removeWatchlistMovie = async (id) => {
    if (!supabase || !authUser) { notify('Sign in to update your Quest Log'); return; }
    try {
      const { error } = await supabase.from('watchlist_movies').delete().eq('user_id', authUser.id).eq('movie_id', String(id));
      if (error) throw error;
      setWatchlistRows(rows => rows.filter(row => row.movie_id !== String(id)));
      notify('Removed from quest log');
    } catch (error) { notify(`Could not remove movie: ${error.message}`); }
  };
  const toggleMovieQuestLog = async (film) => {
    const title = String(film?.title || '').toLocaleLowerCase();
    const row = watchlistRows.find(item => item.status === 'to_watch' && (
      item.movie_id === String(film?.id) ||
      (film?.tmdbId && item.movie_id === `tmdb-${film.tmdbId}`) ||
      (title && String(item.movie?.title || '').toLocaleLowerCase() === title)
    ));
    if (row) return removeWatchlistMovie(row.movie_id);
    return addToWatchlist(film);
  };
  const markWatchlistMovieWatched = async (id) => {
    if (!supabase || !authUser) { notify('Sign in to update your Quest Log'); return false; }
    const film = findMovie(id);
    if (!film) { notify('Could not find this movie'); return false; }
    try {
      const { data, error } = await supabase.from('watchlist_movies').upsert({ user_id: authUser.id, movie_id: String(id), movie: film, status: 'watched', watched_at: new Date().toISOString() }, { onConflict: 'user_id,movie_id' }).select('movie_id,movie,status,added_at,watched_at').single();
      if (error) throw error;
      setWatchlistRows(rows => [...rows.filter(row => row.movie_id !== String(id)), data].sort((a,b) => new Date(a.added_at) - new Date(b.added_at)));
      notify('Marked as watched');
      return true;
    } catch (error) { notify(`Could not mark watched: ${error.message}`); return false; }
  };
  const toggleDetailWatched = async (film) => {
    if (!supabase || !authUser) { notify('Sign in to update watched movies'); return; }
    if (!isMovieInWatchlistStatus(film, 'watched')) { await markWatchlistMovieWatched(film.id); return; }
    try {
      const { data, error } = await supabase.from('watchlist_movies').update({ status: 'to_watch', watched_at: null }).eq('user_id', authUser.id).eq('movie_id', String(film.id)).select('movie_id,movie,status,added_at,watched_at').single();
      if (error) throw error;
      setWatchlistRows(rows => [...rows.filter(row => row.movie_id !== String(film.id)), data].sort((a,b) => new Date(a.added_at) - new Date(b.added_at)));
      notify('Moved back to Quest Log');
    } catch (error) { notify(`Could not update watched status: ${error.message}`); }
  };
  const markAllWatchlistWatched = async () => {
    if (!supabase || !authUser || watchlist.length === 0) return;
    try {
      const { error } = await supabase.from('watchlist_movies').update({ status: 'watched', watched_at: new Date().toISOString() }).eq('user_id', authUser.id).eq('status', 'to_watch');
      if (error) throw error;
      setWatchlistRows(rows => rows.map(row => row.status === 'to_watch' ? { ...row, status: 'watched' } : row));
      notify('All marked as watched');
    } catch (error) { notify(`Could not update Quest Log: ${error.message}`); }
  };
  const addMoviesToWatchlist = async (movies) => {
    if (!supabase || !authUser) { notify('Sign in to save your Quest Log'); return; }
    const uniqueMovies = [...new Map(movies.filter(Boolean).map(movie => {
      const movieId = String(movie.collectionMovieId || (movie.tmdbId ? `tmdb-${movie.tmdbId}` : movie.id));
      return [movieId, { ...movie, id: movieId, collectionMovieId: movieId }];
    })).values()];
    const additions = uniqueMovies.filter(movie => !watchlistRows.some(row => row.status === 'to_watch' && (
      row.movie_id === String(movie.id) ||
      (movie.tmdbId && row.movie_id === `tmdb-${movie.tmdbId}`) ||
      (movie.title && String(row.movie?.title || '').toLocaleLowerCase() === String(movie.title).toLocaleLowerCase())
    )));
    if (!additions.length) { notify('These movies are already in your quest log'); return; }
    try {
      const payload = additions.map(movie => ({ user_id: authUser.id, movie_id: String(movie.id), movie, status: 'to_watch', watched_at: null }));
      const { data, error } = await supabase.from('watchlist_movies').upsert(payload, { onConflict: 'user_id,movie_id' }).select('movie_id,movie,status,added_at,watched_at');
      if (error) throw error;
      setWatchlistRows(rows => [...rows.filter(row => !additions.some(movie => String(movie.id) === row.movie_id || (movie.title && row.movie?.title === movie.title))), ...(data || [])].sort((a,b) => new Date(a.added_at) - new Date(b.added_at)));
      notify(`${additions.length} ${additions.length === 1 ? 'movie' : 'movies'} added to quest log`);
    } catch (error) { notify(`Could not add movies to Quest Log: ${error.message}`); }
  };
  const assignToCollection = async (collection, id) => {
    if (!supabase || !authUser) { notify('Sign in to save movies to collections'); return false; }
    const film = (collectionPickerMovie && String(collectionPickerMovie.id) === String(id) ? collectionPickerMovie : null) || findMovie(id);
    if (!film) { notify('Could not find this movie. Close the picker and try again.'); return false; }
    try {
      let row = collectionRows.find(item => item.name === collection) || customCollections.find(item => item.name === collection);
      if (!row?.id) {
        const result = await supabase.from('collections').select('id,name').eq('user_id', authUser.id).eq('name', collection).maybeSingle();
        if (result.error) throw result.error;
        row = result.data;
      }
      if (!row?.id) throw new Error(`“${collection}” is not saved to your account yet.`);
      const alreadySaved = collectionMovieRows.some(item => item.collection_id === row.id && (item.movie_id === String(id) || item.movie?.title === film.title));
      if (alreadySaved) { notify(`Already in ${collection}`); return true; }
      const result = await supabase.from('collection_movies').upsert({ collection_id: row.id, user_id: authUser.id, movie_id: String(id), movie: film }, { onConflict: 'collection_id,movie_id' });
      if (result.error) throw result.error;
      await loadCollectionData(authUser.id);
      notify(`Added to ${collection}`);
      return true;
    } catch (error) { notify(`Could not add to ${collection}: ${error.message}`); return false; }
  };
  const saveCollectionDraft = async () => {
    if (!supabase || !authUser) { notify('Sign in to save collections'); return; }
    const name = collectionDraft.name.trim();
    if (!name) return;
    try {
      if (collectionDraft.editing) {
        const row = collectionRows.find(item => item.name === collectionDraft.originalName);
        if (!row?.id) throw new Error('Could not find this collection in your account.');
        const result = await supabase.from('collections').update({ name, description: collectionDraft.description.trim(), icon: collectionDraft.icon }).eq('id', row.id).eq('user_id', authUser.id);
        if (result.error) throw result.error;
      } else {
        const result = await supabase.from('collections').insert({ user_id: authUser.id, name, description: collectionDraft.description.trim(), icon: collectionDraft.icon }).select('id').single();
        if (result.error) throw result.error;
        if (collectionDraft.addMovieAfterCreate && collectionCreateMovie) {
          const movieResult = await supabase.from('collection_movies').insert({ collection_id: result.data.id, user_id: authUser.id, movie_id: String(collectionCreateMovie.id), movie: collectionCreateMovie });
          if (movieResult.error) throw movieResult.error;
          for (const selectedCollection of collectionPickerSelected) {
            if (!await assignToCollection(selectedCollection, collectionCreateMovie.id)) throw new Error(`Collection created, but the movie could not be added to ${selectedCollection}.`);
          }
          if (!isFavoriteMovie(collectionCreateMovie) && !await toggleFavorite(collectionCreateMovie)) throw new Error('Collection created, but the movie could not be added to Favorites.');
          if (collectionPickerWatched && !await markWatchlistMovieWatched(collectionCreateMovie.id)) throw new Error('Collection created, but the movie could not be marked watched.');
        }
      }
      await loadCollectionData(authUser.id);
      setShowCollectionForm(false);
      if (collectionDraft.addMovieAfterCreate && collectionCreateMovie) {
        if (collectionCreateOrigin === 'discover') { setLastDiscoverMovie({ movie: collectionCreateMovie, direction: 'down' }); advanceDiscover(); }
        setCollectionCreateMovie(null);
        setCollectionCreateOrigin('');
        setCollectionPickerSelected([]);
        setCollectionPickerWatched(false);
      }
      notify(collectionDraft.editing ? 'Collection updated' : 'Collection created');
    } catch (error) { notify(`Could not save collection: ${error.message}`); }
  };
  const removeFromCollection = async (collection, id) => {
    if (!supabase || !authUser) { notify('Sign in to update collections'); return; }
    const row = collectionRows.find(item => item.name === collection);
    if (!row?.id) { notify(`Could not find ${collection} in your account`); return; }
    try {
      const saved = collectionMovieRows.find(item => item.collection_id === row.id && (item.movie_id === String(id) || films.find(film => film.id === id)?.title === item.movie?.title));
      if (!saved) { notify('This movie is no longer in the collection'); await loadCollectionData(authUser.id); return; }
      const result = await supabase.from('collection_movies').delete().eq('collection_id', row.id).eq('movie_id', saved.movie_id);
      if (result.error) throw result.error;
      await loadCollectionData(authUser.id);
      notify(`Removed from ${collection}`);
    } catch (error) { notify(`Could not remove movie: ${error.message}`); }
  };
  const iconTint = (icon) => icon==='♥'?'#9270ce':icon==='⚔'||icon==='🗡️'?'#8591c4':icon==='☾'||icon==='🌙'?'#8898ca':icon==='🔥'?'#e69162':icon==='🍿'||icon==='🎬'?'#dc8b62':icon==='🌿'||icon==='❄️'?'#73a891':icon==='👻'||icon==='🧛'||icon==='🦇'?'#9b83ba':'#a487ce';
  const openMovie = async (film) => {
    setSelectedMovie(film); setGalleryIndex(0); setTrailerPlaying(false); setTrailerMuted(false); setDetailError('');
    const tmdbId = Number(String(film.tmdbId ?? '').replace(/^movie\//, ''));
    if (!homeApiConfigured || ((!Number.isSafeInteger(tmdbId) || tmdbId <= 0) && !film.isExpiring)) { setDetailLoading(false); return; }
    const requestId = ++movieDetailRequest.current;
    setDetailLoading(true);
    try {
      const detail = await callHomeMovies({ action: 'movie-detail', movieId: Number.isSafeInteger(tmdbId) && tmdbId > 0 ? tmdbId : undefined, title: film.title, year: film.year, services: selectedServices, isExpiring: film.isExpiring === true, expiryAt: film.expiryAt, expiryService: film.expiryService, region: 'US' });
      if (requestId !== movieDetailRequest.current) return;
      setSelectedMovie(current => current?.id === film.id ? {
        ...current, ...detail,
        title: detail.title || current.title,
        year: detail.year || current.year,
        genre: detail.genres?.slice(0, 3).join(' · ') || current.genre,
        expiryAt: current.expiryAt || detail.expiryAt || null,
        expiryService: current.expiryService || detail.expiryService || '',
        isExpiring: Boolean(current.isExpiring || detail.expiryAt),
        hideRating: false,
        image: detail.poster || current.image,
        shots: Array.from(new Set([...(detail.backdrops || []), ...(current.shots || [])])).slice(0, 12),
      } : current);
    } catch (error) {
      if (requestId === movieDetailRequest.current) setDetailError(error.message || 'Some movie details could not be loaded.');
    } finally {
      if (requestId === movieDetailRequest.current) setDetailLoading(false);
    }
  };
  const closeMovieDetail = () => { movieDetailRequest.current++; movieDetailPullStart.current=null; setSelectedMovie(null); setDetailLoading(false); setTrailerPlaying(false); };
  const beginMovieDetailPull = (event) => { if(event.currentTarget.scrollTop>0)return; const touch=event.touches[0]; movieDetailPullStart.current={x:touch.clientX,y:touch.clientY,distance:0,pulling:false}; };
  const moveMovieDetailPull = (event) => {
    const start=movieDetailPullStart.current;
    if(!start)return;
    const touch=event.touches[0],dx=touch.clientX-start.x,dy=touch.clientY-start.y;
    if(!start.pulling){if(dy<8||Math.abs(dx)>Math.abs(dy)*.85){if(Math.abs(dx)>12&&Math.abs(dx)>Math.abs(dy))movieDetailPullStart.current=null;return;}if(event.currentTarget.scrollTop>0){movieDetailPullStart.current=null;return;}start.pulling=true;event.currentTarget.classList.add('is-pulling');}
    if(event.currentTarget.scrollTop>0){movieDetailPullStart.current=null;event.currentTarget.style.transform='';event.currentTarget.style.opacity='';event.currentTarget.classList.remove('is-pulling');return;}
    event.preventDefault();start.distance=Math.max(0,dy);
    if(start.distance>=105){closeMovieDetail();return;}
    event.currentTarget.style.transform=`translate3d(0,${start.distance}px,0)`;
    event.currentTarget.style.opacity=String(Math.max(.35,1-start.distance/160));
  };
  const finishMovieDetailPull = (event) => {
    const start=movieDetailPullStart.current;movieDetailPullStart.current=null;
    if(!start?.pulling)return;
    const panel=event.currentTarget;
    if(start.distance>=70){closeMovieDetail();return;}
    panel.style.transform='';panel.style.opacity='';requestAnimationFrame(()=>panel.classList.remove('is-pulling'));
  };
  const cancelMovieDetailPull = (event) => { movieDetailPullStart.current=null;const panel=event.currentTarget;panel.style.transform='';panel.style.opacity='';requestAnimationFrame(()=>panel.classList.remove('is-pulling')); };
  const openProvider = async (provider) => {
    setActiveProvider(provider); setExploreCategory(''); setProviderMovies(null); setProviderNextCursor(null); setProviderHasMore(false); setProviderLoading(true); setProviderError('');
    try {
      const data = await callHomeMovies({ action: 'expiring', services: selectedServices, service: provider.service, region: 'US' });
      setProviderMovies((data.results || []).map(mapExpiringMovie));
      setProviderNextCursor(data.nextCursor || null); setProviderHasMore(Boolean(data.hasMore));
    } catch (error) { setProviderError(error.message); setProviderMovies([]); }
    finally { setProviderLoading(false); }
  };
  const randomizeThemeMovies = async () => {
    if (themeListLoading || !exploreCategory) return;
    const shelf = recommendationRows.find(item => item.title === exploreCategory);
    const theme = themeListSelection || (shelf?.theme ? monthlyThemes[Number(shelf.theme) - 1] : null);
    if (!theme) return;
    setThemeListLoading(true);
    setHomeError('');
    try {
      const sortOptions = ['popularity.desc', 'vote_average.desc', 'primary_release_date.desc', 'primary_release_date.asc', 'revenue.desc', 'vote_count.desc'];
      const filters = { keyword: theme.keyword, blacklistGenres: movieBlacklist.genreIds };
      const previousIds = new Set([...themeSeenMovieIds.current, ...themeListMovies.map(movie => String(movie.id))]);
      const requests = themeListTotalPages > 1
        ? Array.from({ length: themeListTotalPages }, (_, index) => index + 1)
          .filter(pageNumber => pageNumber !== themeListPage)
          .sort(() => Math.random() - 0.5)
          .slice(0, 5)
          .map(page => ({ page, sort: themeListFetchSort.current }))
        : sortOptions
          .filter(sort => sort !== themeListFetchSort.current)
          .sort(() => Math.random() - 0.5)
          .map(sort => ({ page: 1, sort }));
      const movies = [];
      let lastPage = 1;
      for (const request of requests) {
        lastPage = request.page;
        const data = await callHomeMovies({ action: 'discover', page: request.page, filters: { ...filters, sort: request.sort } });
        themeListFetchSort.current = request.sort;
        const batch = (data.results || []).map(mapTmdbMovie).filter(movie => !previousIds.has(String(movie.id)) && !movies.some(existing => String(existing.id) === String(movie.id)) && !isMovieBlacklisted(movie));
        movies.push(...batch);
        if (movies.length >= 20) break;
      }
      if (!movies.length) {
        setHomeError('No fresh movies were found for this theme. Try again to search a different batch.');
        return;
      }
      const nextBatch = [...movies.slice(0, 20)].sort(() => Math.random() - 0.5);
      nextBatch.forEach(movie => themeSeenMovieIds.current.add(String(movie.id)));
      setThemeListMovies(nextBatch);
      setThemeListPage(lastPage);
      setThemeListHasMore(lastPage < themeListTotalPages);
      requestAnimationFrame(() => document.querySelector('.page-home .search-results')?.scrollTo({ top: 0, behavior: 'smooth' }));
      if (!movies.length) setHomeError('No movies on that random page match your blacklist. Try randomizing again.');
    } catch (error) {
      setHomeError(error.message || 'Could not randomize themed movies.');
    } finally {
      setThemeListLoading(false);
    }
  };
  const openThemeList = async (theme) => {

    setExploreCategory(theme.label);
    setThemeListSelection(theme);
    setThemeListMovies([]);
    themeSeenMovieIds.current = new Set();
    setThemeListPage(1);
    setThemeListTotalPages(1);
    setThemeListHasMore(false);
    setThemeListSort('popularity.desc');
    themeListFetchSort.current = 'popularity.desc';
    setThemeListGenre('');
    setThemeListDecade('');
    setHomeError('');
    setActiveProvider(null);
    setThemeListLoading(true);
    try {
      const data = await callHomeMovies({ action: 'discover', page: 1, filters: { keyword: theme.keyword, sort: 'popularity.desc', blacklistGenres: movieBlacklist.genreIds } });
      const movies = (data.results || []).map(mapTmdbMovie).filter(movie => !isMovieBlacklisted(movie));
      movies.forEach(movie => themeSeenMovieIds.current.add(String(movie.id)));
      setThemeListMovies(movies);
      setThemeListPage(Number(data.page) || 1);
      setThemeListTotalPages(Number(data.totalPages) || 1);
      setThemeListHasMore((Number(data.page) || 1) < (Number(data.totalPages) || 1));
      if (!movies.length) setHomeError(data.keywordNotFound ? `No matching TMDB theme keyword was found for ${theme.label}.` : 'No popular movies were found for this theme.');
    } catch (error) {
      setHomeError(error.message || 'Could not load movies for this theme.');
    } finally {
      setThemeListLoading(false);
    }
  };
  const loadMoreProviderMovies = async () => {
    if (!activeProvider || !providerNextCursor || providerLoadingMore) return;
    setProviderLoadingMore(true); setProviderError('');
    try {
      const data = await callHomeMovies({ action: 'expiring', services: selectedServices, service: activeProvider.service, region: 'US', cursor: providerNextCursor, batch: true });
      const movies = (data.results || []).map(mapExpiringMovie);
      setProviderMovies(items => [...(items || []), ...movies.filter(movie => !(items || []).some(item => item.id === movie.id))]);
      setProviderNextCursor(data.nextCursor || null); setProviderHasMore(Boolean(data.hasMore));
    } catch (error) { setProviderError(error.message); }
    finally { setProviderLoadingMore(false); }
  };
  const expiryLabel = (expiryAt) => {
    if (!expiryAt) return 'Leaving soon · date not announced';
    const remaining = new Date(expiryAt).getTime() - countdownNow;
    if (remaining <= 0) return 'Leaving today';
    const days = Math.floor(remaining / 86_400_000);
    const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
    return days > 0 ? `Leaves in ${days}d ${hours}h` : `Leaves in ${Math.max(1, hours)}h`;
  };
  const loadDiscoverBatch = async (reset = false, newSession = false) => {
    if (discoverBatchLock.current && !reset) return;
    const generation = reset ? ++discoverGeneration.current : discoverGeneration.current;
    discoverBatchLock.current = true;
    if (reset) {
      discoverNextPage.current = 0;
      discoverHasMore.current = true;
      if (newSession) discoverSeenIds.current = new Set();
      setDiscoverQueue([]);
    }
    if (!homeApiConfigured) { setDiscoverError('Connect the movie catalog to explore movies.'); setDiscoverLoading(false); discoverBatchLock.current = false; return; }
    if (!discoverHasMore.current && !reset) { discoverBatchLock.current = false; return; }
    setDiscoverLoading(true);
    setDiscoverError('');
    try {
      const yearStart = Math.max(DISCOVER_MIN_YEAR, Math.min(DISCOVER_MAX_YEAR, Number(discoverFilters.yearFrom) || DISCOVER_MIN_YEAR));
      const yearEnd = Math.max(yearStart, Math.min(DISCOVER_MAX_YEAR, Number(discoverFilters.yearTo) || DISCOVER_MAX_YEAR));
      const filterHasYearRange = yearStart > DISCOVER_MIN_YEAR || yearEnd < DISCOVER_MAX_YEAR;
      const permittedSegments = allowedReleaseYearSegments(movieBlacklist);
      const yearQueryRanges = (filterHasYearRange ? permittedSegments.map(segment => ({ from: Math.max(yearStart, segment.from), to: Math.min(yearEnd, segment.to) })) : permittedSegments).filter(range => range.from <= range.to);
      const randomSorts = ['popularity.desc', 'vote_average.desc', 'primary_release_date.desc', 'primary_release_date.asc', 'revenue.desc', 'vote_count.desc'];
      const movies = [];
      const attemptedYears = new Set();
      let keywordNotFound = false;
      if (!yearQueryRanges.length) {
        setDiscoverError('Your movie blacklist excludes every year in this filter. Choose an allowed period or adjust your blacklist.');
        return;
      }
      // Distribute the feed across release years instead of repeatedly querying
      // TMDB's newest/highest-popularity pages. Retry sparse years.
      for (let attempt = 0; attempt < 2 && movies.length < 12; attempt++) {
        const totalAllowedYears = yearQueryRanges.reduce((total, range) => total + range.to - range.from + 1, 0);
        let yearIndex = Math.floor(Math.random() * totalAllowedYears);
        let chosenRange = yearQueryRanges[0];
        for (const range of yearQueryRanges) {
          const count = range.to - range.from + 1;
          if (yearIndex < count) { chosenRange = range; break; }
          yearIndex -= count;
        }
        const span = Math.max(1, chosenRange.to - chosenRange.from + 1);
        let year = chosenRange.from + Math.floor(Math.random() * span);
        while (attemptedYears.has(year) && attemptedYears.size < span) year = chosenRange.from + Math.floor(Math.random() * span);
        attemptedYears.add(year);
        const selectedGenres = discoverFilters.genres.filter(id => !movieBlacklist.genreIds.includes(id));
        const filters = { ...discoverFilters, genres: selectedGenres, blacklistGenres: movieBlacklist.genreIds, sort: discoverFilters.sort === 'random' ? randomSorts[Math.floor(Math.random() * randomSorts.length)] : discoverFilters.sort, yearFrom: filterHasYearRange ? chosenRange.from : year, yearTo: filterHasYearRange ? chosenRange.to : year };
        const pageNumber = 1 + Math.floor(Math.random() * 3);
        const data = await callHomeMovies({ action: 'discover', region: 'US', page: pageNumber, filters });
        if (generation !== discoverGeneration.current) return;
        if (data.keywordNotFound) { keywordNotFound = true; setDiscoverError(`TMDB could not find a theme keyword for “${discoverFilters.keyword}”. Try another phrase.`); break; }
        for (const movie of (data.results || []).map(mapTmdbMovie).sort(() => Math.random() - .5)) {
          if (!movie.image || discoverSeenIds.current.has(String(movie.id)) || isDiscoverExcluded(movie)) continue;
          discoverSeenIds.current.add(String(movie.id));
          movies.push(movie);
        }
        discoverNextPage.current = pageNumber;
        discoverHasMore.current = true;
      }
      if (generation !== discoverGeneration.current) return;
      setDiscoverQueue(queue => reset ? movies : [...queue, ...movies]);
      if (!movies.length && !keywordNotFound) setDiscoverError('No unseen movies match these filters. Try widening your choices.');
    } catch (error) {
      if (generation === discoverGeneration.current) setDiscoverError(error.message || 'Could not load recommendations.');
    } finally {
      if (generation === discoverGeneration.current) {
        discoverBatchLock.current = false;
        setDiscoverLoading(false);
      }
    }
  };
  useEffect(() => {
    if (page === 'discover') {
      const entering = !discoverPageActive.current;
      discoverPageActive.current = true;
      const inputSignature = JSON.stringify([discoverFilters, movieBlacklist, homeApiConfigured, authUser?.id || 'anonymous']);
      const inputsChanged = discoverInputSignature.current !== inputSignature;
      discoverInputSignature.current = inputSignature;
      try {
        sessionStorage.setItem('fitrack-discover-snapshot', JSON.stringify({ queue: discoverQueue, seen: [...discoverSeenIds.current], signature: inputSignature }));
      } catch { /* Keep the in-memory Discover queue if browser storage is unavailable. */ }
      if (inputsChanged) loadDiscoverBatch(true, false);
      else if (entering && !discoverQueue.length) loadDiscoverBatch(true, true);
    } else discoverPageActive.current = false;
  }, [page, discoverFilters, movieBlacklist, homeApiConfigured, authUser?.id]);
  const advanceDiscover = () => {
    setDiscoverQueue(queue => {
      const remaining = queue.slice(1);
      while (remaining.length && isDiscoverExcluded(remaining[0])) remaining.shift();
      return remaining;
    });
    setDiscoverOffset(0); setDiscoverOffsetY(0); setDiscoverExit('');
    discoverLocked.current = false;
    if (discoverQueue.length <= 3 && discoverHasMore.current) loadDiscoverBatch(false);
  };
  const showLastDiscoverMovieAgain = () => {
    if (!lastDiscoverMovie || lastDiscoverMovie.direction !== 'left') return;
    const replay = { ...lastDiscoverMovie.movie, discoverReplay: true };
    const title = normalizeMovieTitle(replay.title);
    const aliases = new Set([replay.id, replay.tmdbId, `tmdb-${replay.tmdbId}`].filter(Boolean).map(String));
    const alreadyCollected = collectionMovieRows.some(row => aliases.has(String(row.movie_id)) || (title && normalizeMovieTitle(row.movie?.title) === title));
    if (alreadyCollected) {
      setLastDiscoverMovie(null);
      notify('This movie is already in a collection');
      return;
    }
    discoverSeenIds.current.delete(String(replay.id));
    setDiscoverQueue(queue => [replay, ...queue.filter(movie => String(movie.id) !== String(replay.id))]);
    setLastDiscoverMovie(null);
    setDiscoverOffset(0); setDiscoverOffsetY(0); setDiscoverExit('');
    notify('Showing that movie again');
  };
  const recordDiscoverPass = async (movie) => {
    if (!supabase || !authUser) { notify('Sign in to save passed movies'); return false; }
    try {
      const { data, error } = await supabase.rpc('record_discover_pass', { p_movie_id: String(movie.id), p_movie: movie });
      if (error) throw error;
      const passCount = Number(data || 1);
      setDiscoverPassRows(rows => {
        const existing = rows.find(row => row.movie_id === String(movie.id));
        return existing
          ? rows.map(row => row.movie_id === String(movie.id) ? { ...row, movie, pass_count: passCount } : row)
          : [...rows, { movie_id: String(movie.id), movie, pass_count: passCount }];
      });
      notify('Passed');
      return passCount;
    } catch (error) { notify(`Could not save pass: ${error.message}`); return false; }
  };
  const finishDiscoverSwipe = (direction) => {
    if (discoverLocked.current || !current) return;
    discoverLocked.current = true;
    setDiscoverExit(direction);
    setDiscoverOffset(direction === 'left' ? -440 : direction === 'right' ? 440 : 0);
    setDiscoverOffsetY(direction === 'up' ? -560 : direction === 'down' ? 560 : 0);
    if (direction === 'down') {
      window.setTimeout(() => {
        setDiscoverOffset(0); setDiscoverOffsetY(0); setDiscoverExit('');
        openCollectionPicker(current, 'discover');
        discoverLocked.current = false;
      }, 220);
      return;
    }
    window.setTimeout(async () => {
      let saved = true;
      if (direction === 'left') saved = await recordDiscoverPass(current);
      if (direction === 'right') saved = isFavoriteMovie(current) || await toggleFavorite(current);
      if (direction === 'up') saved = await addToWatchlist(current.id);
      if (saved) { setLastDiscoverMovie({ movie: current, direction }); advanceDiscover(); }
      else { setDiscoverOffset(0); setDiscoverOffsetY(0); setDiscoverExit(''); discoverLocked.current = false; }
    }, 230);
  };
  const openCollectionPicker = (movie, origin = '') => { setCollectionPickerMovie(movie); setCollectionPickerOrigin(origin); setCollectionPickerSelected([]); setCollectionPickerWatched(isMovieInWatchlistStatus(movie, 'watched')); };
  const closeCollectionPicker = () => { setCollectionPickerMovie(null); setCollectionPickerOrigin(''); setCollectionPickerSelected([]); setCollectionPickerWatched(false); };
  const selectMovieCollection = (collection) => setCollectionPickerSelected(items => items.includes(collection) ? items.filter(item => item !== collection) : [...items, collection]);
  const addPickerMovieToSelections = async () => {
    if (!collectionPickerMovie) return;
    for (const collection of collectionPickerSelected) {
      const saved = await assignToCollection(collection, collectionPickerMovie.id);
      if (!saved) return;
    }
    if (collectionPickerSelected.length && !isFavoriteMovie(collectionPickerMovie) && !await toggleFavorite(collectionPickerMovie)) return;
    if (collectionPickerWatched && !await markWatchlistMovieWatched(collectionPickerMovie.id)) return;
    const fromDiscover = collectionPickerOrigin === 'discover';
    const movie = collectionPickerMovie;
    closeCollectionPicker();
    if (fromDiscover) { setLastDiscoverMovie({ movie, direction: 'down' }); advanceDiscover(); }
  };
  const openCreateCollectionFromPicker = () => {
    setCollectionCreateMovie(collectionPickerMovie);
    setCollectionCreateOrigin(collectionPickerOrigin);
    setCollectionPickerMovie(null);
    setCollectionPickerOrigin('');
    setCollectionDraft({ name: '', description: '', icon: '✦', addMovieAfterCreate: true });
    setShowCollectionForm(true);
  };
  const collectionPickerLists = collectionRows.filter(collection => collection.name !== 'Favorites');
  const signInWithGoogle = async () => {
    if (!supabase) return;
    setSigningIn(true); setAuthError('');
    const appRoot = new URL('/', window.location.origin).toString();
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: appRoot, queryParams: { prompt: 'select_account' } } });
    if (error) { setAuthError(error.message); setSigningIn(false); }
  };
  const completeOnboarding = async (services=selectedServices) => {
    if (!supabase || !authUser) return;
    setSavingOnboarding(true); setAuthError('');
    const displayName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Movie lover';
    const { data, error } = await supabase.from('profiles').upsert({ id: authUser.id, display_name: displayName, streaming_services: services, onboarding_completed: true, updated_at: new Date().toISOString() }).select('display_name, streaming_services, onboarding_completed').single();
    if (error) setAuthError(`Could not save your choices. Apply the database setup from README. ${error.message}`);
    else setProfile(data);
    setSavingOnboarding(false);
  };
  const saveProviderSettings = async () => {
    if (!supabase || !authUser) return;
    setSavingOnboarding(true); setProviderSettingsError('');
    const { data, error } = await supabase.from('profiles').update({ streaming_services: providerDraft, updated_at: new Date().toISOString() }).eq('id', authUser.id).select('display_name, streaming_services, onboarding_completed').single();
    if (error) setProviderSettingsError(`Could not save your providers. ${error.message}`);
    else { setProfile(data); setSelectedServices(data.streaming_services || []); setShowProviderSettings(false); notify('Streaming providers updated'); }
    setSavingOnboarding(false);
  };
  const saveBlacklistSettings = async () => {
    if (!supabase || !authUser) { notify('Sign in to save your movie blacklist'); return; }
    setSavingBlacklist(true);
    const cleaned = normalizeMovieBlacklist({ ...blacklistDraft, genreIds: blacklistDraft.genreIds, languages: blacklistDraft.languages });
    try {
      const { data, error } = await supabase.from('profiles').update({ movie_blacklist: cleaned, updated_at: new Date().toISOString() }).eq('id', authUser.id).select('display_name, streaming_services, onboarding_completed, movie_blacklist').single();
      if (error) throw error;
      const nextBlacklist = normalizeMovieBlacklist(data.movie_blacklist);
      setProfile(data);
      setMovieBlacklist(nextBlacklist);
      setDiscoverFilters(filters => ({ ...filters, genres: filters.genres.filter(id => !nextBlacklist.genreIds.includes(id)) }));
      setShowBlacklistSettings(false);
      notify('Movie blacklist saved');
    } catch (error) { notify(`Could not save blacklist: ${error.message}`); }
    finally { setSavingBlacklist(false); }
  };
  const toggleBlacklistValue = (key, value) => setBlacklistDraft(current => ({ ...current, [key]: current[key].includes(value) ? current[key].filter(item => item !== value) : [...current[key], value] }));
  const openDiscoverFilters = () => {
    const segments = allowedReleaseYearSegments(movieBlacklist);
    const from = Number(discoverFilters.yearFrom) || DISCOVER_MIN_YEAR;
    const to = Number(discoverFilters.yearTo) || DISCOVER_MAX_YEAR;
    let segmentIndex = segments.findIndex(segment => from >= segment.from && to <= segment.to);
    const allAllowed = segments.length > 1 && segmentIndex < 0 && from === DISCOVER_MIN_YEAR && to === DISCOVER_MAX_YEAR;
    if (segmentIndex < 0 && !allAllowed) segmentIndex = Math.max(0, segments.length - 1);
    const segment = segments[segmentIndex];
    if (allAllowed) segmentIndex = -1;
    const validFrom = allAllowed ? DISCOVER_MIN_YEAR : segment ? Math.max(from, segment.from) : DISCOVER_MIN_YEAR;
    const validTo = allAllowed ? DISCOVER_MAX_YEAR : segment ? Math.min(to, segment.to) : DISCOVER_MAX_YEAR;
    setDiscoverYearSegmentIndex(segmentIndex);
    setDiscoverDraft({ ...discoverFilters, genres: discoverFilters.genres.filter(id => !movieBlacklist.genreIds.includes(id)), language: movieBlacklist.languages.includes(discoverFilters.language) ? '' : discoverFilters.language, yearFrom: validFrom <= validTo ? validFrom : segment?.from ?? DISCOVER_MIN_YEAR, yearTo: validFrom <= validTo ? validTo : segment?.to ?? DISCOVER_MAX_YEAR });
    setShowDiscoverFilters(true);
  };
  const openBlacklistSettings = () => {
    setBlacklistDraft(normalizeMovieBlacklist(movieBlacklist));
    setShowAccountActions(false);
    setShowBlacklistSettings(true);
  };
  const toggleBlacklistGenre = (genreId) => setBlacklistDraft(current => ({ ...current, genreIds: current.genreIds.includes(genreId) ? current.genreIds.filter(id => id !== genreId) : [...current.genreIds, genreId] }));
  const renderAccountActions = () => showAccountActions && <div className="modal-backdrop account-actions-backdrop" onClick={() => setShowAccountActions(false)}><section className="account-actions-sheet" role="dialog" aria-modal="true" aria-labelledby="account-actions-title" onClick={event => event.stopPropagation()}><button className="modal-close account-actions-close" onClick={() => setShowAccountActions(false)} aria-label="Close account options"><X size={19}/></button><span className="eyebrow">YOUR ACCOUNT</span><h2 id="account-actions-title">Hi, {accountFirstName}</h2><button className="account-action-row" onClick={() => { setShowAccountActions(false); setProviderSettingsError(''); setProviderDraft([...selectedServices]); setShowProviderSettings(true); }}><span className="account-action-icon"><SlidersHorizontal size={18}/></span><span><strong>Streaming providers</strong><small>Choose the services you use</small></span><ChevronRight size={17}/></button><button className="account-action-row" onClick={openBlacklistSettings}><span className="account-action-icon"><Filter size={18}/></span><span><strong>Movie blacklist</strong><small>Hide years, genres, and languages</small></span><ChevronRight size={17}/></button><p className="account-actions-note">More account options will be added here.</p></section></div>;
  const renderBlacklistSettings = () => showBlacklistSettings && <div className="modal-backdrop blacklist-backdrop" onClick={() => setShowBlacklistSettings(false)}><section className="blacklist-sheet" role="dialog" aria-modal="true" aria-labelledby="blacklist-title" onClick={event => event.stopPropagation()}><button className="modal-close account-actions-close" onClick={() => setShowBlacklistSettings(false)} aria-label="Close movie blacklist"><X size={19}/></button><span className="eyebrow">PERSONAL MOVIE RULES</span><h2 id="blacklist-title">Movie blacklist</h2><p>These exclusions apply to Home recommendations and Discover. Home search results are left untouched.</p>
    <div className="blacklist-section"><label className="blacklist-toggle"><input type="checkbox" checked={blacklistDraft.excludeYears} onChange={event => setBlacklistDraft(current => ({ ...current, excludeYears: event.target.checked }))}/><span><strong>Exclude a release-year period</strong><small>Movies from the selected years won’t appear.</small></span></label>{blacklistDraft.excludeYears&&<div className="blacklist-year-fields"><label>From<input type="number" min={DISCOVER_MIN_YEAR} max={blacklistDraft.yearTo} value={blacklistDraft.yearFrom} onChange={event => setBlacklistDraft(current => ({ ...current, yearFrom: Math.min(DISCOVER_MAX_YEAR, Math.max(DISCOVER_MIN_YEAR, Number(event.target.value) || DISCOVER_MIN_YEAR)), yearTo: Math.max(current.yearTo, Number(event.target.value) || DISCOVER_MIN_YEAR) }))}/></label><label>To<input type="number" min={blacklistDraft.yearFrom} max={DISCOVER_MAX_YEAR} value={blacklistDraft.yearTo} onChange={event => setBlacklistDraft(current => ({ ...current, yearTo: Math.max(current.yearFrom, Math.min(DISCOVER_MAX_YEAR, Number(event.target.value) || current.yearFrom)) }))}/></label></div>}</div>
    <div className="blacklist-section"><strong>Genres to exclude</strong><div className="blacklist-chip-grid">{allDiscoverGenreOptions.map(([id, name]) => <button type="button" key={id} className={blacklistDraft.genreIds.includes(id) ? 'selected' : ''} aria-pressed={blacklistDraft.genreIds.includes(id)} onClick={() => toggleBlacklistGenre(id)}>{name}</button>)}</div></div>
    <div className="blacklist-section"><strong>Languages to exclude</strong><div className="blacklist-chip-grid">{discoverLanguages.map(language => <button type="button" key={language.id} className={blacklistDraft.languages.includes(language.id) ? 'selected' : ''} aria-pressed={blacklistDraft.languages.includes(language.id)} onClick={() => toggleBlacklistValue('languages', language.id)}>{language.label}</button>)}</div></div>
    <div className="blacklist-actions"><button className="text-button" onClick={() => setBlacklistDraft({ ...emptyMovieBlacklist, genreIds: [], languages: [] })}>Clear all</button><button className="primary-button" disabled={savingBlacklist} onClick={saveBlacklistSettings}>{savingBlacklist ? 'Saving…' : 'Save blacklist'}</button></div>
  </section></div>;
  const signOut = async () => { const { error } = await supabase.auth.signOut(); if (error) notify(error.message); else { setProfile(null); setPage('home'); } };
  const toggleDiscoverGenre = (genreId) => setDiscoverDraft(filters => ({ ...filters, genres: filters.genres.includes(genreId) ? filters.genres.filter(id => id !== genreId) : [...filters.genres, genreId] }));
  const renderDiscoverFilters = () => showDiscoverFilters && <div className="discover-filter-backdrop" onClick={() => setShowDiscoverFilters(false)}><section className="discover-filter-sheet" role="dialog" aria-modal="true" aria-labelledby="discover-filter-title" onClick={event => event.stopPropagation()}>
    <div className="discover-filter-heading"><div><span className="eyebrow">TUNE YOUR RECOMMENDATIONS</span><h2 id="discover-filter-title">Movie filters</h2></div><button className="modal-close" onClick={() => setShowDiscoverFilters(false)} aria-label="Close filters"><X size={19}/></button></div>
    <div className="discover-filter-fields">
      <div className="discover-filter-full"><span className="discover-field-title">Genres <small>Choose any</small></span><div className="discover-genre-options">{discoverGenreOptions.map(([id, name]) => <button type="button" key={id} className={discoverDraft.genres.includes(id) ? 'selected' : ''} aria-pressed={discoverDraft.genres.includes(id)} onClick={() => toggleDiscoverGenre(id)}>{name}</button>)}</div></div>
      <div className="discover-filter-full discover-year-filter"><div className="discover-year-heading"><strong>Release years</strong><span>{discoverYearSegmentIndex < 0 && allowedDiscoverYearSegments.length > 1 ? 'All allowed' : `${discoverDraft.yearFrom} – ${discoverDraft.yearTo}`}</span></div>{allowedDiscoverYearSegments.length > 1 && <div className="discover-period-options"><button type="button" className={discoverYearSegmentIndex < 0 ? 'selected' : ''} onClick={() => { setDiscoverYearSegmentIndex(-1); setDiscoverDraft(filters => ({ ...filters, yearFrom: DISCOVER_MIN_YEAR, yearTo: DISCOVER_MAX_YEAR })); }}>All allowed</button>{allowedDiscoverYearSegments.map((segment, index) => <button type="button" key={`${segment.from}-${segment.to}`} className={discoverYearSegmentIndex === index ? 'selected' : ''} onClick={() => { setDiscoverYearSegmentIndex(index); setDiscoverDraft(filters => ({ ...filters, yearFrom: segment.from, yearTo: segment.to })); }}>{segment.from}–{segment.to}</button>)}</div>}{allowedDiscoverYearSegments.length ? discoverYearSegmentIndex < 0 && allowedDiscoverYearSegments.length > 1 ? <small className="discover-field-hint">The blacklisted years are skipped automatically.</small> : <><label>From {discoverDraft.yearFrom}<input type="range" min={allowedDiscoverYearSegments[discoverYearSegmentIndex]?.from ?? DISCOVER_MIN_YEAR} max={Math.max((allowedDiscoverYearSegments[discoverYearSegmentIndex]?.from ?? DISCOVER_MIN_YEAR), Number(discoverDraft.yearTo) - 1)} value={discoverDraft.yearFrom} aria-label="Earliest release year" onChange={event => setDiscoverDraft(filters => ({ ...filters, yearFrom: Math.min(Number(event.target.value), Number(filters.yearTo) - 1) }))}/></label><label>To {discoverDraft.yearTo}<input type="range" min={Math.min((allowedDiscoverYearSegments[discoverYearSegmentIndex]?.to ?? DISCOVER_MAX_YEAR), Number(discoverDraft.yearFrom) + 1)} max={allowedDiscoverYearSegments[discoverYearSegmentIndex]?.to ?? DISCOVER_MAX_YEAR} value={discoverDraft.yearTo} aria-label="Latest release year" onChange={event => setDiscoverDraft(filters => ({ ...filters, yearTo: Math.max(Number(event.target.value), Number(filters.yearFrom) + 1) }))}/></label></> : <small className="discover-field-hint">Your blacklist excludes all release years.</small>}</div>
      <label className="discover-filter-full">Theme keyword<input className="discover-keyword-input" type="search" maxLength={60} value={discoverDraft.keyword} onChange={event => setDiscoverDraft({ ...discoverDraft, keyword: event.target.value })} placeholder="Halloween, time travel…"/><small className="discover-field-hint">Matches TMDB keyword tags. Some themes may not have a match.</small></label>
      <label>Minimum rating<select value={discoverDraft.minimumRating} onChange={event => setDiscoverDraft({ ...discoverDraft, minimumRating: event.target.value })}><option value="">Any rating</option><option value="6">6+</option><option value="7">7+</option><option value="8">8+</option></select></label>
      <label>Runtime<select value={discoverDraft.runtime} onChange={event => setDiscoverDraft({ ...discoverDraft, runtime: event.target.value })}><option value="">Any length</option><option value="short">Under 90 minutes</option><option value="feature">91–150 minutes</option><option value="long">Over 150 minutes</option></select></label>
      <label>Original language<select value={discoverDraft.language} onChange={event => setDiscoverDraft({ ...discoverDraft, language: event.target.value })}><option value="">Any language</option>{discoverLanguageOptions.map(language => <option key={language.id} value={language.id}>{language.label}</option>)}</select></label>
      <label>Streaming service<select value={discoverDraft.provider} onChange={event => setDiscoverDraft({ ...discoverDraft, provider: event.target.value })}><option value="">Any service</option>{providerOptions.map(provider => <option key={provider.id} value={provider.id}>{provider.service}</option>)}</select></label>
      <label className="discover-filter-full">Sort movies by<select value={discoverDraft.sort} onChange={event => setDiscoverDraft({ ...discoverDraft, sort: event.target.value })}><option value="random">Surprise me · random</option><option value="popularity.desc">Popular picks</option><option value="vote_average.desc">Highest rated</option><option value="primary_release_date.desc">Newest releases</option></select></label>
    </div>
    <div className="discover-filter-actions"><button className="text-button" onClick={() => { const segments = allowedReleaseYearSegments(movieBlacklist); const oneSegment = segments.length === 1 ? segments[0] : null; setDiscoverYearSegmentIndex(segments.length > 1 ? -1 : 0); setDiscoverDraft({ ...emptyDiscoverFilters, yearFrom: oneSegment?.from ?? DISCOVER_MIN_YEAR, yearTo: oneSegment?.to ?? DISCOVER_MAX_YEAR }); }}>Reset</button><button className="primary-button" onClick={() => { setDiscoverFilters({ ...discoverDraft }); setShowDiscoverFilters(false); }}>Show movies</button></div>
  </section></div>;
  const renderPoster = (film, className='poster', showGenreIcon=true) => { const genre=film.genre.split(' · ')[0]; return <div className={`${className} ${film.tone} ${showGenreIcon?'':'without-genre-icon'}`} style={{ backgroundImage: `linear-gradient(180deg,rgba(20,18,27,.02),rgba(20,18,27,.15)),url(${film.image})` }}>{showGenreIcon&&<span className="poster-genre" role="img" aria-label={genre}>{genreEmblems[genre]||'🎬'}</span>}</div>; };
  const movieRow = (film, extraActions=null, showGenreIcon=true) => <div className={`movie-row-wrap ${extraActions ? "has-actions" : ""}`} key={film.id}><button className="movie-row" onClick={() => {if(suppressMovieClick.current){suppressMovieClick.current=false;return;}openMovie(film);}}>{renderPoster(film,'row-poster',showGenreIcon)}<span className="row-copy"><strong>{film.title}</strong><small>{film.year} <i/> {film.genre.split(' · ')[0]}</small>{film.isExpiring&&<span className="row-expiry">{expiryLabel(film.expiryAt)}</span>}{film.recommendationReason&&<span className="ai-movie-reason">{film.recommendationReason}</span>}{!film.hideRating&&<span className="row-rating"><Star size={12} fill="currentColor"/> TMDB {film.rating}</span>}</span><ChevronRight className="row-chevron" size={17}/></button>{extraActions}</div>;
  const filterPills = (currentValue, setValue, options) => <div className="filter-pills" role="group">{options.map((item)=><button key={item} className={currentValue===item?'selected':''} onClick={()=>setValue(item)}>{item}</button>)}</div>;
  const content = () => {
    if (page === 'home') {
      const homeListOpen = Boolean(searchSubmitted || activeProvider || exploreCategory);
      return <>
      {!homeListOpen&&<><div className="welcome-row"><div><span className="eyebrow">YOUR LITTLE MOVIE LIBRARY</span><h1 className="home-brand-title"><img className="home-brand-icon" src="/fitrack-icon.svg" alt="" />Fitrack</h1><p className="home-subtitle">A cozy shelf of stories you love.</p></div><button className="avatar home-avatar" onClick={()=>setShowAccountActions(true)} aria-label={`Account options for ${accountFirstName}`} title={accountFirstName}>{accountAvatarContent()}</button></div>
      <form className="home-search" onSubmit={async e=>{e.preventDefault();const query=search.trim();setSearchSubmitted(query);setHomeSearchResults(null);if(!query||!homeApiConfigured)return;setHomeLoading(true);setHomeError('');try{const data=await callHomeMovies({action:'search',query});setHomeSearchResults((data.results||[]).map(mapTmdbMovie));}catch(error){setHomeError(error.message);setHomeSearchResults([]);}finally{setHomeLoading(false);}}}><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search movies..." aria-label="Search movie database"/><button type="submit">Search</button></form></>}
      <section className="section home-movie-section">{homeError&&<p className="no-results">{homeError}</p>}{searchSubmitted?<><div className="section-head"><div><span className="eyebrow">MOVIE DATABASE</span><h2>Results for “{searchSubmitted}”</h2></div><button className="text-button" onClick={()=>{setSearchSubmitted('');setSearch('');setHomeSearchResults(null);setHomeError('');}}>Clear</button></div><div className="search-results" {...homePullHandlers}>{homePullIndicator()}{homeLoading?<p className="no-results">Searching the movie library…</p>:homeMovies.length?homeMovies.map(f=>movieRow(f)):<p className="no-results">No matching movies found.</p>}</div></>:activeProvider?<>
        <div className="section-head provider-results-head"><div><button className="back-link" onClick={()=>{setActiveProvider(null);setProviderMovies(null);setProviderNextCursor(null);setProviderHasMore(false);setProviderError('');}}><ArrowLeft size={15}/> Home</button><h2>{activeProvider.service}</h2><small className="provider-region-note">Titles due to leave this service in the next 31 days · refreshed daily</small></div><span className="provider-result-count">{providerMovies?.length ?? 0} movies</span></div><div className="search-results" {...homePullHandlers}>{homePullIndicator()}{providerLoading?<div className="movie-loading-list" role="status" aria-label={`Loading movies on ${activeProvider.service}`}>{Array.from({length:4},(_,index)=><div className="movie-loading-row" key={index}><span className="loading-poster"/><span className="loading-copy"><i/><i/><i/></span></div>)}</div>:providerError?<p className="no-results">{providerError}</p>:visibleProviderMovies.length?visibleProviderMovies.map(f=>movieRow(f,null,false)):providerMovies?.length?<p className="no-results">No movies match your blacklist for this service.</p>:<p className="no-results">No announced departures for this service in the next 31 days.</p>}{providerHasMore&&<button className="load-more-expiring" onClick={loadMoreProviderMovies} disabled={providerLoadingMore}>{providerLoadingMore?<><LoaderCircle size={15} className="loading-spinner"/>Finding more movies…</>:<>Show more movies<span>Up to 75 per batch</span></>}</button>}</div>
      </>:exploreCategory==='AI recommendations'?<><div className="section-head"><div><button className="back-link" onClick={()=>{setExploreCategory('');setAiRecommendation(null);setHomeError('');requestAnimationFrame(()=>document.querySelector('.page-home .home-shelves')?.scrollTo({top:0,behavior:'smooth'}));}}><ArrowLeft size={15}/> Home</button><h2>Movies for your mood</h2></div><span className="provider-result-count">{aiRecommendation?.movies.length||0} movies</span></div><div className="search-results ai-recommendation-results" {...homePullHandlers}>{homePullIndicator()}{aiRecommendation?<><p className="ai-recommendation-summary">{aiRecommendation.summary}</p>{aiRecommendation.movies.length?aiRecommendation.movies.map(movie=>movieRow(movie,null,false)):<p className="no-results">I couldn’t match those suggestions to movie records. Try another prompt.</p>}</>:<p className="no-results">No recommendations to show yet.</p>}</div></>:exploreCategory?(()=>{const shelf=recommendationRows.find(item=>item.title===exploreCategory);const selectedTheme=themeListSelection||(shelf?.theme?monthlyThemes[Number(shelf.theme)-1]:null);const isTheme=Boolean(selectedTheme);const pattern=buildMovieListPattern(selectedTheme?.icon||'✦');const source=isTheme?themeListMovies:(shelf?.movies||[]);const genres=['All genres',...new Set(source.flatMap(movie=>(movie.genre||'').split(' · ').filter(Boolean)))].sort((a,b)=>a==='All genres'?-1:b==='All genres'?1:a.localeCompare(b));const decades=['Any decade',...new Set(source.map(movie=>Number.isFinite(Number(movie.year))?`${Math.floor(Number(movie.year)/10)*10}`:'').filter(Boolean))].sort((a,b)=>a==='Any decade'?-1:b==='Any decade'?1:Number(a)-Number(b));const visible=source.filter(movie=>(!themeListGenre||(movie.genre||'').split(' · ').includes(themeListGenre))&&(!themeListDecade||(themeListDecade==='older'?Number(movie.year)<2000:Math.floor(Number(movie.year)/10)*10===Number(themeListDecade)) )).sort((a,b)=>themeListSort==='vote_average.desc'?Number(b.rating)-Number(a.rating):themeListSort==='primary_release_date.desc'?Number(b.year)-Number(a.year):themeListSort==='primary_release_date.asc'?Number(a.year)-Number(b.year):0);return <><div className="section-head"><div><button className="back-link" onClick={()=>{setExploreCategory('');setThemeListSelection(null);setHomeError('');}}><ArrowLeft size={15}/> Home</button><h2>{exploreCategory}</h2></div>{isTheme&&<span className="provider-result-count">{visible.length} movies</span>}</div>{isTheme&&<div className="history-filters theme-list-filters"><select value={themeListGenre||'All genres'} onChange={event=>setThemeListGenre(event.target.value==='All genres'?'':event.target.value)} aria-label="Filter movies by genre">{genres.map(genre=><option key={genre}>{genre}</option>)}</select>{isTheme&&<select value={themeListDecade||'Any decade'} onChange={event=>setThemeListDecade(event.target.value==='Any decade'?'':event.target.value)} aria-label="Filter themed movies by decade"><option value="Any decade">Any decade</option>{decades.filter(decade=>decade!=='Any decade').map(decade=><option key={decade} value={decade}>{decade}s</option>)}</select>}{isTheme&&<select value={themeListSort} onChange={event=>setThemeListSort(event.target.value)} aria-label="Sort themed movies"><option value="primary_release_date.desc">Newest</option><option value="primary_release_date.asc">Oldest</option><option value="popularity.desc">Popular</option><option value="vote_average.desc">Top rated</option></select>}</div>}<div className={`search-results themed-movie-list ${isTheme?'with-icon-pattern':''}`} data-pattern={pattern} {...homePullHandlers}>{homePullIndicator()}{themeListLoading?<div className="movie-loading-list" role="status" aria-label={`Loading ${exploreCategory} movies`}>{Array.from({length:5},(_,index)=><div className="movie-loading-row" key={index}><span className="loading-poster"/><span className="loading-copy"><i/><i/><i/></span></div>)}</div>:visible.map(f=>movieRow(f,null,false))}{isTheme&&visible.length>0&&<button className="load-more-expiring theme-randomize-button" onClick={randomizeThemeMovies} disabled={themeListLoading}><RefreshCw size={15}/>{themeListLoading?'Finding a fresh batch…':'Randomize movies'}<span>Show a different popular batch for {selectedTheme.label.toLowerCase()}</span></button>}{isTheme&&!visible.length&&!themeListLoading&&!homeError&&<p className="no-results">No movies match this genre filter.</p>}{homeError&&<p className="no-results">{homeError}</p>}</div></>})():<div className="home-shelves" {...homePullHandlers}>{homePullIndicator()}{homeLoading&&!homeShelves&&<p className="no-results">Gathering movies…</p>}{homeRecommendationRows.slice(0,1).map(movieShelf)}{providerShelf()}{homeRecommendationRows.slice(1).map(movieShelf)}<section className="ai-recommendation"><div className="ai-recommendation-heading"><span className="ai-recommendation-icon"><Sparkles size={17}/></span><div><span className="eyebrow">A LITTLE MOVIE MAGIC</span><h3>Ask for a recommendation</h3></div></div><p className="ai-recommendation-description">Tell Gemini what you’re in the mood for, and it’ll find movies to match.</p><form className="ai-recommendation-form" onSubmit={requestAiRecommendation}><textarea value={aiMoviePrompt} onChange={event=>{setAiMoviePrompt(event.target.value);event.currentTarget.style.height="auto";event.currentTarget.style.height=Math.min(event.currentTarget.scrollHeight,180)+"px";}} placeholder="Describe what you want to watch..." aria-label="Describe a movie you want recommended" maxLength={300} rows={2}/><label className="ai-watched-toggle"><input type="checkbox" checked={aiUseWatchedContext} onChange={event=>setAiUseWatchedContext(event.target.checked)}/><span>Use my watched movies <small>Last 10 watched titles (optional)</small></span></label><button type="submit" disabled={!aiMoviePrompt.trim()||aiRecommendationLoading}>{aiRecommendationLoading?<LoaderCircle size={16} className="loading-spinner"/>:<Sparkles size={16}/>}<span>{aiRecommendationLoading?'Thinking…':'Recommend'}</span></button></form>{aiRecommendationError&&<p className="ai-recommendation-error" role="alert">{aiRecommendationError}</p>}{aiRecommendation&&<div className="ai-recommendation-result"><p className="ai-recommendation-summary">{aiRecommendation.summary}</p>{aiRecommendation.movies.length?<div className="ai-recommendation-movies">{aiRecommendation.movies.map(movie=>movieRow(movie,null,false))}</div>:<p className="no-results">I couldn’t match those suggestions to movie records. Try another prompt.</p>}</div>}</section><section className="theme-browser"><span className="theme-browser-pattern" aria-hidden="true">{themeBrowserPattern}</span><div className="theme-browser-heading"><div><span className="eyebrow">FIND YOUR MOOD</span><h3>Browse by theme</h3></div><span>{browseThemes.length} themes</span></div><div className="theme-browser-grid">{browseThemes.map(theme=><button className="theme-browser-card" key={theme.label} onClick={()=>openThemeList(theme)}><span aria-hidden="true">{theme.icon}</span><strong>{theme.label}</strong><ChevronRight size={15}/></button>)}</div></section></div>}</section>
    </>;
    }
    if (page === 'discover') return <>
      <div className="screen-title discover-title"><div><h1>Discover</h1><p>Find your next favorite.</p></div><div className="discover-title-actions">{lastDiscoverMovie?.direction==='left'&&<button className="icon-button discover-undo-icon" onClick={showLastDiscoverMovieAgain} aria-label="Show passed movie again" title="Show passed movie again"><RotateCcw size={17}/></button>}<button className="icon-button discover-filter" onClick={openDiscoverFilters} aria-label="Filter movies"><SlidersHorizontal size={18}/>{activeDiscoverFilterCount>0&&<span className="discover-filter-count">{activeDiscoverFilterCount}</span>}</button></div></div>
      {current?<><div className={`discover-card ${discoverExit?`exit-${discoverExit}`:''}`} key={current.id} style={{transform:`translate(${discoverOffset}px,${discoverOffsetY}px) rotate(${discoverOffset*.012}deg)`}} onPointerDown={e=>{discoverSwipeStart.current={x:e.clientX,y:e.clientY};discoverWasSwiped.current=false;e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{if(discoverSwipeStart.current){const dx=e.clientX-discoverSwipeStart.current.x,dy=e.clientY-discoverSwipeStart.current.y;setDiscoverOffset(dx);setDiscoverOffsetY(dy);}}} onPointerUp={e=>{if(!discoverSwipeStart.current)return;const dx=e.clientX-discoverSwipeStart.current.x,dy=e.clientY-discoverSwipeStart.current.y;discoverSwipeStart.current=null;if(Math.max(Math.abs(dx),Math.abs(dy))>55){e.preventDefault();discoverWasSwiped.current=true;if(Math.abs(dx)>Math.abs(dy)*1.15)finishDiscoverSwipe(dx<0?'left':'right');else finishDiscoverSwipe(dy<0?'up':'down');}else{setDiscoverOffset(0);setDiscoverOffsetY(0);}}} onPointerCancel={()=>{discoverSwipeStart.current=null;setDiscoverOffset(0);setDiscoverOffsetY(0);}} onClick={()=>{if(discoverWasSwiped.current){discoverWasSwiped.current=false;return;}openMovie(current);}} role="button" tabIndex="0" onKeyDown={e=>e.key==='Enter'&&openMovie(current)}>{renderPoster(current,'discover-poster')}<div className="card-overlay"><h2>{current.title}</h2><div className="movie-meta"><span>{current.year||'Year unknown'}</span><i/><span>{current.genre}</span>{current.rating&&<><i/><span>TMDB {current.rating}</span></>}</div><p>{(current.tags||[]).map(tag=><span key={tag}>{tag}</span>)}</p></div>{discoverOffset>75&&Math.abs(discoverOffset)>Math.abs(discoverOffsetY)&&<span className="swipe-stamp stamp-like">LIKE</span>}{discoverOffset< -75&&Math.abs(discoverOffset)>Math.abs(discoverOffsetY)&&<span className="swipe-stamp stamp-pass">PASS</span>}{discoverOffsetY< -75&&Math.abs(discoverOffsetY)>Math.abs(discoverOffset)&&<span className="swipe-stamp stamp-quest">QUEST LOG</span>}{discoverOffsetY>75&&Math.abs(discoverOffsetY)>Math.abs(discoverOffset)&&<span className="swipe-stamp stamp-collection">ADD TO LIST</span>}</div><div className="swipe-hint"><span>← Pass</span><span>Like →</span></div><div className="discover-vertical-hint"><span><ArrowUp size={13}/> Quest log</span><span><ArrowDown size={13}/> Add to list</span></div><div className="choice-row"><button className="choice pass" aria-label="Pass on movie" onClick={()=>finishDiscoverSwipe('left')}><X size={25}/></button><button className="choice like" aria-label="Like movie" onClick={()=>finishDiscoverSwipe('right')}><Heart size={24} fill={isFavoriteMovie(current)?'currentColor':'none'}/></button></div></>:<div className="discover-empty" role="status">{discoverLoading?<><LoaderCircle size={27} className="loading-spinner"/><strong>Finding a movie for you…</strong></>:<><Film size={27}/><strong>{discoverError||'You have seen every movie in this batch.'}</strong><button className="primary-button" onClick={()=>loadDiscoverBatch(true)}>Try again</button></>}</div>}
      {renderDiscoverFilters()}
    </>;
    if (page === 'watchlist') {
      const visibleMovies = watchlistRows.filter(row=>row.status==='to_watch').map(row=>row.movie || findMovie(row.movie_id)).filter(Boolean);
      const removeMovie = (id) => { setConfirmAction({title:'Remove from Quest Log?',body:'This movie will be removed from your watchlist.',confirm:()=>removeWatchlistMovie(id),danger:true}); };
      const markWatched = (film) => { setConfirmAction({title:'Mark as watched?',body:`“${film.title}” will be marked watched and removed from your Quest Log.`,confirm:()=>markWatchlistMovieWatched(film.id)}); };
      return <><div className="screen-title quest-screen-title"><div className="quest-heading-copy"><span className="quest-header-icon"><ScrollText size={22}/><Sparkles size={11}/></span><div><h1>Quest log <span className="count-badge">{watchlist.length}</span></h1><p>Movies you plan to watch.</p></div></div><button className="bulk-action" onClick={()=>setConfirmAction({title:'Mark all as watched?',body:'Every movie in your Quest Log will be marked watched and removed from the list.',confirm:markAllWatchlistWatched})}><CheckCheck size={15}/> Watched all</button></div><div className="quest-scroll-hint"><span>Swipe left to remove · right when watched</span></div><div className="list-stack quest-stack with-icon-pattern" data-pattern={questLogPattern}>{watchlistLoading?<div className="empty-state" role="status"><LoaderCircle className="loading-spinner" size={24}/><strong>Loading your quest log…</strong></div>:visibleMovies.map(f=><div className="quest-swipe-row" key={f.id}><button className="swipe-under remove-under" aria-label={`Remove ${f.title}`} onClick={()=>removeMovie(f.id)}><Trash2 size={17}/><small>Remove</small></button><button className="swipe-under watched-under" aria-label={`Mark ${f.title} watched`} onClick={()=>markWatched(f)}><Check size={17}/><small>Watched</small></button><div className="quest-row-main" style={{transform:`translateX(${questOffsets[f.id]||0}px)`}} onPointerDown={e=>{questSwipeStart.current={id:f.id,x:e.clientX,y:e.clientY,axis:null,width:e.currentTarget.clientWidth};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{const start=questSwipeStart.current;if(start?.id!==f.id)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(!start.axis&&Math.max(Math.abs(dx),Math.abs(dy))>12)start.axis=Math.abs(dx)>Math.abs(dy)*1.25?'horizontal':'vertical';if(start.axis==='horizontal')setQuestOffsets(o=>({...o,[f.id]:Math.max(-start.width,Math.min(start.width,dx))}));else if(start.axis==='vertical')setQuestOffsets(o=>({...o,[f.id]:0}));}} onPointerUp={e=>{const start=questSwipeStart.current;if(!start||start.id!==f.id)return;questSwipeStart.current=null;const dx=e.clientX-start.x,threshold=start.width*.7;if(start.axis==='horizontal'&&Math.abs(dx)>=threshold){e.preventDefault();e.stopPropagation();suppressMovieClick.current=true;setQuestOffsets(o=>({...o,[f.id]:dx<0?-start.width:start.width}));window.setTimeout(()=>{setQuestOffsets(o=>({...o,[f.id]:0}));if(dx>0)removeMovie(f.id);else markWatched(f);window.setTimeout(()=>{suppressMovieClick.current=false;},350);},180);}else setQuestOffsets(o=>({...o,[f.id]:0}));}} onPointerCancel={()=>{const start=questSwipeStart.current;if(start?.id===f.id){questSwipeStart.current=null;setQuestOffsets(o=>({...o,[f.id]:0}));}}}>{movieRow(f,null,false)}<div className="row-quick-actions"><button onClick={()=>markWatched(f)} aria-label="Mark watched"><Check size={16}/></button><button onClick={()=>removeMovie(f.id)} aria-label="Remove movie"><Trash2 size={16}/></button></div></div></div>)}{!watchlistLoading&&visibleMovies.length===0&&<div className="empty-state"><ScrollText size={28}/><strong>{watchlistError?'Could not load your quest log':'Your quest log is empty'}</strong><p>{watchlistError||'Add movies you want to watch.'}</p>{!watchlistError&&<button className="primary-button" onClick={()=>setPage('discover')}>Explore movies</button>}</div>}</div></>;
    }
    if (page === 'lists') {
      const activeCollectionRow = collectionRows.find(row => row.name === activeCollection);
      const activeSavedRows = collectionMovieRows.filter(row => row.collection_id === activeCollectionRow?.id);
      const collectionCandidates = [...films];
      for (const saved of activeSavedRows) {
        const movie = saved.movie || {};
        if (!movie.title || collectionCandidates.some(item => item.title === movie.title)) continue;
        const knownTmdbIds = { 'The Hobbit: An Unexpected Journey': 49051, 'The Hobbit: The Desolation of Smaug': 57158 };
        const tmdbId = knownTmdbIds[movie.title] || movie.tmdbId || Number(String(saved.movie_id).replace(/^tmdb-/, '')) || undefined;
        collectionCandidates.push({ ...movie, id: saved.movie_id, tmdbId, collectionMovieId: saved.movie_id, title: movie.title, genre: movie.genre || 'Movie', runtime: movie.runtime || 'See details', rating: movie.rating || '', image: movie.image || '', shots: movie.shots || [], overview: movie.overview || '' });
      }
      const collectionMovies = collectionCandidates.filter(f=>{const savedIds=collectionAssignments[activeCollection]||[];const savedMovieId=f.tmdbId?`tmdb-${f.tmdbId}`:({1:'tmdb-120'}[f.id]);const saved=activeSavedRows.some(row=>row.movie_id===String(f.collectionMovieId||f.id)||row.movie?.title===f.title);const belongs=(activeCollection==='Favorites'?(liked.includes(f.id)||savedIds.includes(f.id)||savedIds.includes(savedMovieId)||saved):savedIds.includes(f.id)||savedIds.includes(savedMovieId)||saved)&&(collectionFilter==='Liked'?liked.includes(f.id)||savedIds.includes(f.id):collectionFilter==='In quest log'?isMovieInWatchlistStatus(f,'to_watch'):collectionFilter==='Not in quest log'?!isMovieInWatchlistStatus(f,'to_watch'):collectionFilter==='Watched'?isMovieInWatchlistStatus(f,'watched'):collectionFilter==='Unwatched'?!isMovieInWatchlistStatus(f,'watched'):true);const genreOk=advancedFilter.genre==='Any genre'||(f.genre||'').toLowerCase().includes(advancedFilter.genre.toLowerCase());const ratingOk=advancedFilter.minRating==='Any rating'||Number(f.rating)>=Number(advancedFilter.minRating.replace('+',''));return belongs&&genreOk&&ratingOk;}).sort((a,b)=>{if(advancedFilter.sort==='Rating')return Number(b.rating)-Number(a.rating);if(advancedFilter.sort==='Release year')return Number(b.year)-Number(a.year);if(advancedFilter.sort==='Title')return a.title.localeCompare(b.title);const addedAt=film=>activeSavedRows.find(row=>row.movie_id===String(film.collectionMovieId||film.id)||row.movie?.title===film.title)?.added_at||0;return new Date(addedAt(b))-new Date(addedAt(a));});
      const addAll = () => { const savedMovies = activeSavedRows.map(saved => { const savedId=String(saved.movie_id); const film=collectionMovies.find(movie => String(movie.collectionMovieId||movie.id)===savedId || String(movie.title||"").toLocaleLowerCase()===String(saved.movie?.title||"").toLocaleLowerCase()); const movie=saved.movie||film; return movie?{...movie,id:savedId,collectionMovieId:savedId}:null; }).filter(Boolean); return addMoviesToWatchlist(savedMovies.length?savedMovies:collectionMovies); };
      const quickActions = (film) => <div className="collection-quick-actions"><button aria-label={isMovieInWatchlistStatus(film,"to_watch")?"Remove from quest log":"Add to quest log"} title={isMovieInWatchlistStatus(film,"to_watch")?"Remove from quest log":"Add to quest log"} className={isMovieInWatchlistStatus(film,"to_watch")?"in-quest-log":""} onClick={()=>toggleMovieQuestLog(film)}>{isMovieInWatchlistStatus(film,"to_watch")?<Check size={15}/>:<Plus size={15}/>}<span className="sr-only">{isMovieInWatchlistStatus(film,"to_watch")?"Remove from quest log":"Add to quest log"}</span></button><button aria-label="Add to list" onClick={()=>setCollectionPickerMovie(film)}><Bookmark size={14}/><span className="sr-only">List</span></button><button className="remove-collection-movie" aria-label="Remove from collection" onClick={()=>removeFromCollection(activeCollection,film.id)}><Trash2 size={15}/><span className="sr-only">Remove</span></button></div>;
      if (!activeCollection) return <><div className="screen-title"><div><h1>Collections</h1><p>Your stories, gathered together.</p></div><button className="icon-button" onClick={()=>{setCollectionDraft({name:'',description:'',icon:'✦'});setShowCollectionForm(true);}} aria-label="Add collection"><Plus size={20}/></button></div><div className="collection-grid collection-overview">{[{name:'Favorites',icon:'♥',description:'Stories that stayed with you.',count:(collectionAssignments.Favorites||[]).length||liked.length,tone:'lavender',builtin:true},...customCollections.slice().sort((a,b)=>(a.createdAt||0)-(b.createdAt||0)).map(c=>({...c,count:films.filter(f=>(collectionAssignments[c.name]||[]).includes(f.id)||(collectionAssignments[c.name]||[]).includes(`tmdb-${f.tmdbId||({1:120}[f.id]||'')}`)).length,tone:'peach'}))].map(item=><div className="collection-tile" key={item.name} style={{'--icon-tint':iconTint(item.icon),backgroundColor:`color-mix(in srgb, ${iconTint(item.icon)} 17%, #fffdf9)`}}><button className="collection-open" onClick={()=>{setActiveCollection(item.name);setCollectionFilter('All');window.scrollTo({top:0,behavior:'instant'});}}><span className="collection-tile-icon">{item.icon}</span><strong>{item.name}</strong><small>{item.count} movies</small></button>{!item.builtin&&<div className="collection-manage"><button aria-label={`Edit ${item.name}`} onClick={()=>{setCollectionDraft({...item,editing:true,originalName:item.name});setShowCollectionForm(true);}}><Pencil size={13}/></button><button aria-label={`Remove ${item.name}`} onClick={()=>setConfirmAction({title:`Remove “${item.name}”?`,body:'This collection and its saved organization will be removed.',confirm:()=>setCustomCollections(items=>items.filter(c=>c.name!==item.name)),done:'Collection removed',danger:true})}><Trash2 size={14}/></button></div>}</div>)}</div></>;
      return <><div className="screen-title collection-detail-heading"><div><button className="back-link" onClick={returnToCollections}><ArrowLeft size={15}/> Collections</button><h1>{activeCollection}</h1><p>{activeCollection==='Favorites'?'Stories that stayed with you.':customCollections.find(c=>c.name===activeCollection)?.description}</p></div><div className="collection-header-actions"><span>{collectionMovies.length} movies</span><button className="collection-reload-button" onClick={refreshCollection} disabled={collectionRefreshing} aria-label="Reload collection"><RefreshCw size={15} className={collectionRefreshing?'loading-spinner':''}/></button><button className="add-all-button" onClick={addAll}><Plus size={14}/> Add all to quest log</button></div></div><button className="advanced-filter-toggle" onClick={()=>setShowAdvancedFilters(v=>!v)}><SlidersHorizontal size={15}/>{showAdvancedFilters?'Hide filters':'Advanced filters'}</button>{showAdvancedFilters&&<div className="advanced-filter-panel"><label>Genre<select value={advancedFilter.genre} onChange={e=>setAdvancedFilter({...advancedFilter,genre:e.target.value})}><option>Any genre</option><option>Fantasy</option><option>Horror</option><option>Adventure</option><option>Romance</option></select></label><label>Minimum rating<select value={advancedFilter.minRating} onChange={e=>setAdvancedFilter({...advancedFilter,minRating:e.target.value})}><option>Any rating</option><option>6+</option><option>7+</option><option>8+</option></select></label><label>Sort by<select value={advancedFilter.sort} onChange={e=>setAdvancedFilter({...advancedFilter,sort:e.target.value})}><option>Recommended</option><option>Rating</option><option>Release year</option><option>Title</option></select></label></div>}<div className="collection-toolbar"><div className="filter-label"><Filter size={15}/><span>Filter</span></div>{filterPills(collectionFilter,(filter)=>{setCollectionFilter(filter);requestAnimationFrame(()=>{const list=document.querySelector('.page-lists .list-stack');if(list)list.scrollTop=0;});},["All","Not in quest log","In quest log","Unwatched","Watched"])}</div><div className="list-stack with-icon-pattern" data-pattern={buildMovieListPattern(activeCollectionRow?.icon||(activeCollection==='Favorites'?'♥':'✦'))} onTouchStart={beginCollectionPull} onTouchMove={moveCollectionPull} onTouchEnd={finishCollectionPull} onTouchCancel={()=>{collectionPullStart.current=null;collectionPullDistanceRef.current=0;setCollectionPullDistance(0);}}><div className={`collection-pull-indicator ${collectionPullDistance>=55?'ready':''}`} style={{height:collectionPullDistance,opacity:collectionPullDistance?1:0}} aria-live="polite">{collectionRefreshing?<LoaderCircle className="loading-spinner" size={18}/>:<RefreshCw size={18} style={{transform:`rotate(${collectionPullDistance*4}deg) scale(${.7+Math.min(collectionPullDistance/100,.5)})`}}/>}<span>{collectionRefreshing?'Reloading…':collectionPullDistance>=55?'Release to reload':'Pull to reload'}</span></div><div className="collection-pull-hint">Pull down to refresh posters and saved movies</div>{collectionRefreshing&&<div className="collection-refresh-status"><LoaderCircle className="loading-spinner" size={14}/>Refreshing saved movies and posters…</div>}{collectionMovies.map(f=>movieRow(f,quickActions(f),false))}{collectionMovies.length===0&&<p className="no-results">No movies match these filters.</p>}</div></>;
    }
    if (moreLibraryView) {
      const title = moreLibraryView === 'passed' ? 'Passed movies' : 'Watched movies';
      const allRows = (moreLibraryView === 'passed' ? discoverPassRows.slice().sort((a, b) => new Date(b.last_passed_at || b.first_passed_at || 0) - new Date(a.last_passed_at || a.first_passed_at || 0)) : watchlistRows.filter(row => row.status === 'watched').slice().sort((a, b) => new Date(b.watched_at || b.added_at || 0) - new Date(a.watched_at || a.added_at || 0))).map(row => row.movie || findMovie(row.movie_id)).filter(Boolean);
      const genres = ['All genres', ...new Set(allRows.flatMap(film => (film.genre || '').split(' · ').filter(Boolean)))];
      const decades = ['Any decade', ...new Set(allRows.map(film => Number.isFinite(Number(film.year)) ? `${Math.floor(Number(film.year) / 10) * 10}s` : '').filter(Boolean))].sort((a,b) => a === 'Any decade' ? -1 : b === 'Any decade' ? 1 : Number(a.slice(0,4)) - Number(b.slice(0,4)));
      const rows = allRows.filter(film => film.title.toLowerCase().includes(moreMovieFilters.query.trim().toLowerCase()) && (moreMovieFilters.genre === 'All genres' || (film.genre || '').split(' · ').includes(moreMovieFilters.genre)) && (moreMovieFilters.decade === 'Any decade' || `${Math.floor(Number(film.year) / 10) * 10}s` === moreMovieFilters.decade));
      return <><div className="screen-title more-library-heading"><div><span className="eyebrow">YOUR MOVIE HISTORY</span><h1>{title}</h1></div><button className="icon-button" onClick={() => { setMoreLibraryView(''); setMoreMovieFilters({ query: '', genre: 'All genres', decade: 'Any decade' }); }} aria-label="Back to More"><ArrowLeft size={18}/></button></div><div className="history-filters"><label className="history-search"><Search size={16}/><input value={moreMovieFilters.query} onChange={event=>setMoreMovieFilters(filters=>({...filters,query:event.target.value}))} placeholder="Find a movie" aria-label="Search this list"/></label><select value={moreMovieFilters.genre} onChange={event=>setMoreMovieFilters(filters=>({...filters,genre:event.target.value}))} aria-label="Filter by genre">{genres.map(genre=><option key={genre}>{genre}</option>)}</select><select value={moreMovieFilters.decade} onChange={event=>setMoreMovieFilters(filters=>({...filters,decade:event.target.value}))} aria-label="Filter by decade">{decades.map(decade=><option key={decade}>{decade}</option>)}</select></div><div className="list-stack more-movie-list">{rows.length ? rows.map(film => movieRow(film, null, false)) : <div className="empty-state"><Film size={28}/><strong>{allRows.length ? 'No movies match these filters' : `No ${moreLibraryView === 'passed' ? 'passed' : 'watched'} movies yet`}</strong><p>{allRows.length ? 'Try a different search or filter.' : moreLibraryView === 'passed' ? 'Movies you pass in Discover will appear here.' : 'Movies you mark as watched will appear here.'}</p></div>}</div></>;
    }
    return <><div className="screen-title"><div><span className="eyebrow">THE CAMPFIRE</span><h1>More</h1></div><div className="avatar">{accountAvatarContent()}</div></div><button className="profile-card account-card" onClick={signOut}><div className="profile-avatar">{accountAvatarContent()}</div><div><strong>{profile?.display_name||'Movie lover'}</strong><small>{authUser?.email}</small></div><span className="signout-label"><LogOut size={15}/> Sign out</span></button><div className="more-library-options"><button className="more-library-card passed-card" onClick={()=>setMoreLibraryView('passed')}><span className="more-library-icon"><X size={18}/></span><span><strong>Passed</strong><small>{discoverPassRows.length} movies</small></span><ChevronRight size={16}/></button><button className="more-library-card" onClick={()=>setMoreLibraryView('watched')}><span className="more-library-icon watched-icon"><Eye size={18}/></span><span><strong>Watched</strong><small>{watchlistRows.filter(row=>row.status==='watched').length} movies</small></span><ChevronRight size={16}/></button></div><div className="more-menu">{[{icon:WandSparkles,label:'App appearance',sub:'A little magic for your screen'},{icon:Bell,label:'Notifications',sub:'Movie night reminders'},{icon:Film,label:'Movie credits',sub:'Powered by TMDB'},{icon:Crown,label:'About Fitrack',sub:`Version ${appVersion} · Made for the movie lover - Alyssa`}].map(({icon:Icon,label,sub})=><button key={label} className="menu-row" onClick={()=>label==="Movie credits"?setShowTmdbCredits(true):label==="About Fitrack"?setShowAbout(true):notify(`${label} coming soon`)}><span className="menu-icon"><Icon size={18}/></span><span><strong>{label}</strong><small>{sub}</small></span><ChevronRight size={16}/></button>)}</div></>;
  };
  if (authLoading || (authUser && profileLoading)) return <div className="auth-screen"><div className="auth-card auth-loading"><img className="fitrack-mark" src="/fitrack-icon.svg" alt="" /><p>Preparing your movie library…</p></div></div>;
  if (!authUser) return <div className="auth-screen"><section className="auth-card"><img className="fitrack-mark" src="/fitrack-icon.svg" alt="" /><span className="eyebrow">YOUR PERSONAL MOVIE LIBRARY</span><h1>Welcome to Fitrack</h1><p className="auth-intro">Keep every story you love in one cozy place.</p>{!supabaseConfigured&&<p className="auth-message">Add your Supabase URL and publishable key to <code>.env.local</code> to enable sign-in.</p>}{authError&&<p className="auth-error">{authError}</p>}<button className="google-signin" disabled={!supabaseConfigured||signingIn} onClick={signInWithGoogle}><span className="google-g">G</span>{signingIn?'Opening Google…':'Continue with Google'}</button><small className="auth-footnote">Sign in securely with your Google account.</small></section></div>;
  if (!profile?.onboarding_completed) {
    return <div className="auth-screen"><section className="auth-card onboarding-card"><img className="fitrack-mark" src="/fitrack-icon.svg" alt="" /><span className="eyebrow">A LITTLE ABOUT YOUR WATCHLIST</span><h1>Where do you watch?</h1><p className="auth-intro">Which streaming apps do you use right now? We’ll use this later to make movie recommendations more useful.</p><div className="service-options">{streamingServices.map(service=><button key={service} className={`service-option ${selectedServices.includes(service)?'selected':''}`} onClick={()=>setSelectedServices(items=>items.includes(service)?items.filter(item=>item!==service):[...items,service])}><span className="service-check">{selectedServices.includes(service)&&<Check size={14}/>}</span>{service}</button>)}</div>{authError&&<p className="auth-error">{authError}</p>}<button className="primary-button onboarding-continue" disabled={savingOnboarding} onClick={()=>completeOnboarding()}>{savingOnboarding?'Saving…':'Continue'}</button><button className="skip-onboarding" disabled={savingOnboarding} onClick={()=>completeOnboarding([])}>I’ll do this later</button><small className="auth-footnote">You can change this later. We don’t access your streaming accounts.</small></section></div>;
  }
  return <div className="app-shell"><div className="ambient a-one"/><div className="ambient a-two"/><main className={`app-main page-${page}`} onTouchStart={startEdgeBack} onTouchEnd={finishEdgeBack} onTouchCancel={()=>{edgeBackStart.current=null;}}><div key={page} className="page-content">{content()}</div><nav className="bottom-nav" aria-label="Main navigation">{navItems.map(({id,label,icon:Icon,center})=><button key={id} className={`nav-item ${center?'nav-center':''} ${page===id?'active':''}`} onClick={()=>navigateTo(id)} aria-current={page===id?'page':undefined}><span className="nav-icon"><Icon size={center?23:20} strokeWidth={page===id?2.5:2}/></span><span>{label}</span></button>)}</nav>{toast&&<div className="toast"><Sparkles size={15}/>{toast}</div>}{showCollectionForm&&<div className={`modal-backdrop ${collectionDraft.addMovieAfterCreate?"collection-create-backdrop":""}`} onClick={()=>setShowCollectionForm(false)}><div className="form-modal" onClick={e=>e.stopPropagation()}><button className="modal-close form-close" onClick={()=>setShowCollectionForm(false)}><X size={19}/></button><span className="eyebrow">A NEW SHELF</span><h2>{collectionDraft.editing?'Edit collection':'Create collection'}</h2><label>Collection name<input autoFocus value={collectionDraft.name} onChange={e=>setCollectionDraft({...collectionDraft,name:e.target.value})} placeholder="e.g. Cozy fantasy" maxLength={28}/></label><label>Short description<textarea value={collectionDraft.description} onChange={e=>setCollectionDraft({...collectionDraft,description:e.target.value})} placeholder="What belongs in this collection?" rows="2" maxLength={90}/></label><span className="icon-prompt">Choose an icon</span><div className="icon-picker">{['✦','♥','⚔','✿','☾','♜','♛','❋','🎬','🍿','👻','🐉','🧙','🌙','⭐','🌿','🔥','❄️','💎','🗡️','🏰','🦇','🧛','🧟','🪄','🧚','🌸','🌊','🚀','🤠','🎭','🕵️'].map(icon=><button type="button" key={icon} className={collectionDraft.icon===icon?'selected':''} onClick={()=>setCollectionDraft({...collectionDraft,icon})}>{icon}</button>)}</div><button className="primary-button create-collection" disabled={!collectionDraft.name.trim()} onClick={saveCollectionDraft}><Plus size={16}/> {collectionDraft.editing?'Save changes':'Create collection'}</button></div></div>}{confirmAction&&<div className="modal-backdrop confirm-backdrop" onClick={()=>setConfirmAction(null)}><div className="confirm-modal" onClick={e=>e.stopPropagation()}><div className="confirm-icon">{confirmAction.danger?<Trash2 size={21}/>:<CheckCheck size={21}/>}</div><h2>{confirmAction.title}</h2><p>{confirmAction.body}</p><div className="confirm-buttons"><button className="cancel-button" onClick={()=>setConfirmAction(null)}>Cancel</button><button className={`primary-button ${confirmAction.danger?'danger-confirm':''}`} onClick={()=>{confirmAction.confirm();setConfirmAction(null);if(confirmAction.done)notify(confirmAction.done);}}>Confirm</button></div></div></div>}{collectionPickerMovie&&<div className="collection-picker-backdrop" onClick={closeCollectionPicker}><section className="collection-picker-sheet" onClick={e=>e.stopPropagation()}><div className="picker-handle"/><div className="picker-heading"><div><span className="eyebrow">SAVE MOVIE</span><h2>Add to collections</h2><small>Select one or more lists</small></div><button className="modal-close" onClick={closeCollectionPicker} aria-label="Close"><X size={18}/></button></div><button className="picker-create-list" onClick={openCreateCollectionFromPicker}><span className="picker-create-icon"><Plus size={19}/></span><span><strong>Create a collection</strong><small>Add this movie to it right away</small></span><ChevronRight size={17}/></button><div className="picker-multi-list">{collectionPickerLists.map(c=><button className={`picker-list-item ${collectionPickerSelected.includes(c.name)?'selected':''}`} key={c.name} onClick={()=>selectMovieCollection(c.name)}><span className="picker-list-icon">{c.icon}</span><span>{c.name}</span>{collectionPickerSelected.includes(c.name)?<Check size={18}/>:<span className="picker-select-mark"/>}</button>)}</div><div className="picker-special-options"><button className={`picker-watched-option ${collectionPickerWatched?'selected':''}`} onClick={()=>setCollectionPickerWatched(value=>!value)}><span className="picker-watched-icon"><Eye size={18}/></span><span><strong>Watched</strong><small>Mark as seen</small></span>{collectionPickerWatched?<Check size={18}/>:<span className="picker-select-mark"/>}</button></div><div className="picker-footer"><button className="picker-cancel" onClick={closeCollectionPicker}>Cancel</button><button className="primary-button" disabled={!collectionPickerSelected.length&&!collectionPickerWatched} onClick={addPickerMovieToSelections}>Add{collectionPickerSelected.length?` to ${collectionPickerSelected.length} ${collectionPickerSelected.length===1?'list':'lists'}`:''}{collectionPickerWatched?' + watched':''}</button></div></section></div>}{renderAccountActions()}{renderBlacklistSettings()}{showProviderSettings&&<div className="modal-backdrop account-actions-backdrop" onClick={()=>setShowProviderSettings(false)}><section className="account-actions-sheet provider-settings-sheet" role="dialog" aria-modal="true" aria-labelledby="provider-settings-title" onClick={e=>e.stopPropagation()}><button className="modal-close account-actions-close" onClick={()=>setShowProviderSettings(false)} aria-label="Close provider settings"><X size={19}/></button><span className="eyebrow">PERSONALIZE YOUR HOME</span><h2 id="provider-settings-title">Your streaming providers</h2><p className="provider-settings-intro">Pick the services you use. Fitrack will track their upcoming movie departures.</p><div className="service-options">{streamingServices.map(service=><button key={service} className={`service-option ${providerDraft.includes(service)?'selected':''}`} onClick={()=>setProviderDraft(items=>items.includes(service)?items.filter(item=>item!==service):[...items,service])}><span className="service-check">{providerDraft.includes(service)&&<Check size={14}/>}</span>{service}</button>)}</div>{providerSettingsError&&<p className="auth-error">{providerSettingsError}</p>}<div className="provider-settings-actions"><button className="text-button" disabled={savingOnboarding} onClick={()=>setShowProviderSettings(false)}>Cancel</button><button className="primary-button" disabled={savingOnboarding} onClick={saveProviderSettings}>{savingOnboarding?'Saving…':'Save providers'}</button></div></section></div>}{showAbout&&<div className="modal-backdrop about-backdrop" onClick={()=>setShowAbout(false)}><section className="about-sheet" role="dialog" aria-modal="true" aria-labelledby="about-title" onClick={e=>e.stopPropagation()}><button className="modal-close credits-close" onClick={()=>setShowAbout(false)} aria-label="Close About Fitrack"><X size={19}/></button><span className="eyebrow">THE CAMPFIRE CHRONICLE</span><h2 id="about-title">About Fitrack</h2><p className="about-current-version">Version {appVersion} · Made for the movie lover - Alyssa</p><div className="release-history">{releaseNotes.map((release)=><article className="release-entry" key={release.version}><div className="release-heading"><div><span className="release-version">Version {release.version}</span><h3>{release.title}</h3></div>{release.version===appVersion&&<span className="release-current-badge">CURRENT</span>}</div><ul>{release.details.map((detail)=><li key={detail}>{detail}</li>)}</ul></article>)}</div><small className="about-footer">Made for movie lovers, one story at a time.</small></section></div>}{showTmdbCredits&&<div className="modal-backdrop tmdb-credits-backdrop" onClick={()=>setShowTmdbCredits(false)}><section className="tmdb-credits-card" role="dialog" aria-modal="true" aria-labelledby="tmdb-credits-title" onClick={e=>e.stopPropagation()}><button className="modal-close credits-close" onClick={()=>setShowTmdbCredits(false)} aria-label="Close credits"><X size={19}/></button><span className="eyebrow">MOVIE DATA &amp; IMAGES</span><h2 id="tmdb-credits-title">Credits</h2><a className="tmdb-logo-link" href="https://www.themoviedb.org" target="_blank" rel="noreferrer" aria-label="The Movie Database"><img className="tmdb-logo" src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_long_2-9665a76b1ae401a510ec1e0ca40ddcb3b0cfe45f1d51b77a308fea0845885648.svg" alt="The Movie Database (TMDB)"/></a><p className="tmdb-credit-notice">This product uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.</p><p className="tmdb-credit-notice">Streaming availability data powered by <a href="https://www.justwatch.com/" target="_blank" rel="noreferrer">JustWatch</a>.</p><p className="tmdb-credit-notice">Expiry dates provided by <a href="https://www.movieofthenight.com/about/api" target="_blank" rel="noreferrer">Streaming Availability API by Movie of the Night</a>.</p><a className="tmdb-credit-link" href="https://www.themoviedb.org" target="_blank" rel="noreferrer">Visit themoviedb.org <ChevronRight size={15}/></a><small className="tmdb-credit-footnote">Fitrack is an independent personal project.</small></section></div>}{selectedMovie&&<div className="modal-backdrop" onClick={closeMovieDetail}><div className="movie-modal" onClick={e=>e.stopPropagation()} onTouchStart={beginMovieDetailPull} onTouchMove={moveMovieDetailPull} onTouchEnd={finishMovieDetailPull} onTouchCancel={cancelMovieDetailPull}><button className="modal-close" onClick={closeMovieDetail} aria-label="Close movie details"><X size={19}/></button><div className="gallery-wrap"><div className="movie-gallery" onScroll={e=>{const w=e.currentTarget.clientWidth;setGalleryIndex(Math.round(e.currentTarget.scrollLeft/w));}}>{(selectedMovie.shots||[]).map((src,i)=><div className={`gallery-shot ${selectedMovie.tone||'lavender'}`} key={src} style={{backgroundImage:`linear-gradient(180deg,rgba(20,18,27,.05),rgba(20,18,27,.12)),url(${src})`}}><span>{i+1} / {selectedMovie.shots.length}</span></div>)}</div>{selectedMovie.shots?.length>1&&<div className="gallery-dots">{selectedMovie.shots.map((_,i)=><button key={i} className={galleryIndex===i?'active':''} aria-label={`Show image ${i+1}`} onClick={()=>document.querySelectorAll('.gallery-shot')[i]?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'start'})}/>)}</div>}</div><div className="modal-content"><span className="eyebrow">{selectedMovie.genre.toUpperCase()}</span><h2>{selectedMovie.title}</h2><div className="movie-meta"><span>{selectedMovie.year}</span><i/><span>{selectedMovie.runtime}</span>{!selectedMovie.hideRating&&selectedMovie.rating&&<><i/><span>TMDB {selectedMovie.rating}</span></>}</div><p className="modal-description">{selectedMovie.overview||'A sweeping adventure, waiting to be discovered.'}</p>{(selectedMovie.isExpiring||selectedMovie.expiryAt)&&<p className="expiry-detail"><Clock3 size={14}/>{selectedMovie.expiryService&&<strong>{selectedMovie.expiryService} · </strong>}{expiryLabel(selectedMovie.expiryAt)}</p>}<div className="detail-facts"><span><strong>Genre</strong>{selectedMovie.genre}</span><span><strong>Runtime</strong>{selectedMovie.runtime}</span>{!selectedMovie.hideRating&&selectedMovie.rating&&<span><strong>TMDB rating</strong>{selectedMovie.rating} / 10</span>}{selectedMovie.imdbUrl&&<span><strong>IMDb</strong><a href={selectedMovie.imdbUrl} target="_blank" rel="noreferrer">Open IMDb title</a></span>}</div>{detailLoading&&<div className="detail-loading" role="status"><LoaderCircle className="loading-spinner" size={17}/>Loading images, cast, trailer, and availability…</div>}{detailError&&<p className="detail-error">{detailError}</p>}{selectedMovie.trailer&&<section className="detail-section">{trailerPlaying?<><div className="trailer-frame"><iframe src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(selectedMovie.trailer.key)}?autoplay=1&controls=0&disablekb=1&fs=0&playsinline=1&enablejsapi=1&rel=0&modestbranding=1&iv_load_policy=3&origin=${encodeURIComponent(window.location.origin)}`} title={`${selectedMovie.title} trailer`} allow="autoplay; encrypted-media; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin"/></div><div className="trailer-controls"><button onClick={toggleTrailerMute} aria-label={trailerMuted?'Unmute trailer':'Mute trailer'} title={trailerMuted?'Unmute':'Mute'}>{trailerMuted?<VolumeX size={16}/>:<Volume2 size={16}/>}</button></div></>:<button className="trailer-preview" onClick={()=>{setTrailerMuted(false);setTrailerPlaying(true);}} style={{backgroundImage:`linear-gradient(90deg,#21182cbb,#21182c16),url(${selectedMovie.shots?.[0]||selectedMovie.image})`}}><span className="trailer-play"><Play size={19} fill="currentColor" strokeWidth={1.5}/></span><span><strong>Play trailer</strong><small>{selectedMovie.trailer.name}</small></span></button>}</section>}{selectedMovie.cast?.length>0&&<section className="detail-section"><div className="detail-section-heading"><h3>Cast</h3><small>{selectedMovie.cast.length} featured</small></div><div className="cast-slider">{selectedMovie.cast.map(person=><article className="cast-card" key={person.id}><div className="cast-photo">{person.profile?<img src={person.profile} alt="" loading="lazy"/>:<span>{person.name.slice(0,1)}</span>}</div><strong>{person.name}</strong><small>{person.character}</small></article>)}</div></section>}{(selectedMovie.providers||detailLoading)&&<section className="detail-section"><div className="detail-section-heading"><h3>Streaming now</h3><small>{selectedMovie.providerRegion||'US'}</small></div>{selectedMovie.providers?.length?<div className="detail-providers">{selectedMovie.providers.map(provider=><div className="detail-provider" key={provider.id}>{provider.logo?<img src={provider.logo} alt="" loading="lazy"/>:<span>{provider.name.slice(0,1)}</span>}<small>{provider.name}</small></div>)}</div>:!detailLoading&&<p className="detail-muted">No current streaming availability found in {selectedMovie.providerRegion||'the US'}.</p>}</section>}<div className="modal-actions"><button className={`primary-button ${isMovieInWatchlistStatus(selectedMovie,"to_watch")?"remove-from-quest":""}`} onClick={()=>toggleMovieQuestLog(selectedMovie)}>{isMovieInWatchlistStatus(selectedMovie,"to_watch")?<Trash2 size={16}/>:<Plus size={17}/>} {isMovieInWatchlistStatus(selectedMovie,"to_watch")?"Remove from quest log":"Add to quest log"}</button><button className={`detail-watched-button ${isMovieInWatchlistStatus(selectedMovie,"watched")?"selected":""}`} onClick={()=>toggleDetailWatched(selectedMovie)} aria-label={isMovieInWatchlistStatus(selectedMovie,"watched")?"Move back to Quest Log":"Mark as watched"} aria-pressed={isMovieInWatchlistStatus(selectedMovie,"watched")} title={isMovieInWatchlistStatus(selectedMovie,"watched")?"Move back to Quest Log":"Mark as watched"}><Eye size={19} strokeWidth={1.9}/></button><button className="collection-picker-trigger" onClick={()=>openCollectionPicker(selectedMovie)}><Plus size={16}/><span>List</span></button><button className={`heart-button ${isFavoriteMovie(selectedMovie)?'selected':''}`} aria-label="Toggle favorite" onClick={()=>toggleFavorite(selectedMovie)}><Heart size={19} fill={isFavoriteMovie(selectedMovie)?'currentColor':'none'}/></button></div></div></div></div>}</main></div>;
}

createRoot(document.getElementById('root')).render(<App/>);
