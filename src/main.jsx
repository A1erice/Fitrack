import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { version as appVersion } from '../package.json';
import { House, Compass, ScrollText, LibraryBig, CircleEllipsis, Search, Bell, Plus, Heart, Star, ChevronRight, SlidersHorizontal, Sparkles, Check, X, Film, WandSparkles, Map, Crown, Trash2, CheckCheck, Filter, ArrowLeft, Bookmark, Clock3, Pencil, Clapperboard, LogOut, LoaderCircle, RefreshCw } from 'lucide-react';
import { supabase, supabaseConfigured } from './lib/supabase';
import './styles.css';

const streamingServices = ['Netflix','Prime Video','Disney+','Apple TV+','Max','Hulu','Paramount+','Peacock','Crunchyroll'];
const knownProviderIds = { Peacock: 386, 'Paramount+': 2303 };

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
const genreEmblems = { Adventure:'⚔️', Fantasy:'🐉', Animation:'🎨', Drama:'🎭', Horror:'👻', Action:'💥', Comedy:'😂', History:'🏛️', Western:'🤠', Thriller:'🗡️', Crime:'🕵️', Documentary:'🎥', 'Science Fiction':'🚀', Mystery:'🔍', Music:'🎵', Romance:'💗', Family:'🏠', War:'🛡️', 'TV Movie':'📺', Movie:'🎬' };
const mapTmdbMovie = (movie) => {
  const imageBase = 'https://image.tmdb.org/t/p/w780';
  const poster = movie.poster_path ? `${imageBase}${movie.poster_path}` : '';
  const backdrop = movie.backdrop_path ? `${imageBase}${movie.backdrop_path}` : poster;
  const year = movie.release_date ? Number(movie.release_date.slice(0, 4)) : '';
  const genres = (movie.genre_ids || []).map((id) => genreNames[id]).filter(Boolean);
  return { id: `tmdb-${movie.id}`, tmdbId: movie.id, title: movie.title || movie.original_title || 'Untitled movie', year, genre: genres.slice(0, 2).join(' · ') || 'Movie', runtime: 'See details', rating: Number(movie.vote_average || 0).toFixed(1), ratingLabel: 'TMDB', image: poster || backdrop, shots: [backdrop || poster].filter(Boolean), tone: 'lavender', tags: genres.slice(0, 3), overview: movie.overview || '' };
};
const mapExpiringMovie = (movie) => ({ ...movie, id: `expiring-${movie.id}`, rating: '', ratingLabel: '', hideRating: true, isExpiring: true });
function App() {
  const [page, setPage] = useState('home');
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [savingOnboarding, setSavingOnboarding] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [liked, setLiked] = useState([]);
  const [watchlist, setWatchlist] = useState(films.map(f=>f.id));
  const [watched, setWatched] = useState([3]);
  const [cursor, setCursor] = useState(0);
  const [discoverOffset, setDiscoverOffset] = useState(0);
  const [discoverExit, setDiscoverExit] = useState('');
  const [questOffsets, setQuestOffsets] = useState({});
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState('');
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
  const [collectionFilter, setCollectionFilter] = useState('All');

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [trailerPlaying, setTrailerPlaying] = useState(false);
  const [activeCollection, setActiveCollection] = useState('');
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [customCollections, setCustomCollections] = useState(sampleCollections);
  const [collectionRows, setCollectionRows] = useState([]);
  const [collectionMovieRows, setCollectionMovieRows] = useState([]);
  const [collectionRefreshing, setCollectionRefreshing] = useState(false);
  const [collectionPullDistance, setCollectionPullDistance] = useState(0);
  const [collectionAssignments, setCollectionAssignments] = useState(Object.fromEntries(sampleCollections.map(c=>[c.name,films.map(f=>f.id)])));
  const [collectionPickerMovie, setCollectionPickerMovie] = useState(null);
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
  const collectionPullStart = useRef(null);
  const collectionPullDistanceRef = useRef(0);
  const homePullStart = useRef(null);
  const homePullDistanceRef = useRef(0);
  const blockedEdgeSwipe = useRef(false);
  const blockedEdgeOrigin = useRef(null);
  const movieDetailRequest = useRef(0);
  const discoverSwipeStart = useRef(null);
  const discoverWasSwiped = useRef(false);
  const questSwipeStart = useRef(null);
  const discoverLocked = useRef(false);
  const suppressMovieClick = useRef(false);
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
      setAuthError('');
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  useEffect(() => {
    if (!supabase || !authUser) { setProfile(null); setProfileLoading(false); return; }
    let active = true;
    setProfileLoading(true);
    supabase.from('profiles').select('display_name, streaming_services, onboarding_completed').eq('id', authUser.id).maybeSingle().then(({ data, error }) => {
      if (!active) return;
      if (error) setAuthError(`Could not load your profile. Apply the database setup from README. ${error.message}`);
      setProfile(data || null);
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
      const modalOpen = selectedMovie || collectionPickerMovie || showCollectionForm || showAbout || showTmdbCredits || showAccountActions || showProviderSettings || confirmAction;
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
  }, [page, exploreCategory, activeProvider, activeCollection, selectedMovie, collectionPickerMovie, showCollectionForm, showAbout, showTmdbCredits, showAccountActions, showProviderSettings, confirmAction]);
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
  useEffect(() => {
    if (!homeApiConfigured) return;
    let active = true;
    setHomeLoading(true); setHomeError('');
    callHomeMovies({ action: 'home' }).then((data) => {
      if (active) setHomeShelves((data.shelves || []).map((shelf) => ({ ...shelf, movies: shelf.movies.map(mapTmdbMovie) })));
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
  const loadCollectionData = async (userId = authUser?.id) => {
    if (!supabase || !userId) throw new Error('Sign in to save collections.');
    const [collectionsResult, moviesResult] = await Promise.all([
      supabase.from('collections').select('id,name,description,icon,is_default,created_at').eq('user_id', userId).order('is_default', { ascending: false }).order('created_at', { ascending: true }),
      supabase.from('collection_movies').select('collection_id,movie_id,movie').eq('user_id', userId),
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
    try {
      if (searchSubmitted) {
        const data = await callHomeMovies({ action: 'search', query: searchSubmitted });
        setHomeSearchResults((data.results || []).map(mapTmdbMovie));
      } else {
        const data = await callHomeMovies({ action: 'home' });
        setHomeShelves((data.shelves || []).map(shelf => ({ ...shelf, movies: shelf.movies.map(mapTmdbMovie) })));
      }
      notify('Movie list refreshed');
    } catch (error) { notify(`Could not refresh movies: ${error.message}`); }
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
    } else if (page === nextPage && nextPage === 'lists') {
      setActiveCollection(''); setCollectionFilter('All'); setShowAdvancedFilters(false);
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
  const startEdgeBack = (event) => { const allowed=(page==='home'&&(exploreCategory||activeProvider))||(page==='lists'&&activeCollection); if(!allowed||selectedMovie||collectionPickerMovie||showCollectionForm||showAbout||showTmdbCredits||showAccountActions||showProviderSettings||confirmAction)return; const touch=event.touches[0]; if(touch.clientX<=28)edgeBackStart.current={x:touch.clientX,y:touch.clientY}; };
  const finishEdgeBack = (event) => { const start=edgeBackStart.current; edgeBackStart.current=null; if(!start)return; const touch=event.changedTouches[0],dx=touch.clientX-start.x,dy=touch.clientY-start.y; if(dx>=85&&Math.abs(dx)>Math.abs(dy)*1.25){if(page==='home'){setExploreCategory('');setActiveProvider(null);setProviderMovies(null);setProviderNextCursor(null);setProviderHasMore(false);document.querySelector('.page-home .home-shelves')?.scrollTo({top:0});}else returnToCollections();} };
  const toggle = (setter, id) => setter((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const toggleFavorite = async (film) => {
    if (!supabase || !authUser || !film) { notify('Sign in to save Favorites'); return; }
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
    } catch (error) { notify(`Could not update Favorites: ${error.message}`); }
  };
  const isFavoriteMovie = (film) => {
    if (!film) return false;
    const aliases = [String(film.id), film.tmdbId ? `tmdb-${film.tmdbId}` : null, ...films.filter(item => item.title === film.title).map(item => String(item.id))].filter(Boolean);
    if (aliases.some(id => liked.some(savedId => String(savedId) === id))) return true;
    const favoriteId = collectionRows.find(row => row.name === 'Favorites')?.id;
    return collectionMovieRows.some(row => row.collection_id === favoriteId && (row.movie_id === String(film.id) || row.movie?.title === film.title));
  };
  const current = films[cursor % films.length];
  const accountName = profile?.display_name || authUser?.user_metadata?.given_name || authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || authUser?.email?.split('@')[0] || 'Account';
  const accountFirstName = accountName.trim().split(/\s+/)[0] || 'Account';
  const accountInitial = Array.from(accountFirstName)[0]?.toLocaleUpperCase() || 'A';
  const accountPhoto = authUser?.user_metadata?.avatar_url || authUser?.user_metadata?.picture || authUser?.identities?.find((identity) => identity.provider === 'google')?.identity_data?.avatar_url || authUser?.identities?.find((identity) => identity.provider === 'google')?.identity_data?.picture;
  const accountAvatarContent = () => accountPhoto ? <img className="account-avatar-image" src={accountPhoto} alt="" referrerPolicy="no-referrer"/> : accountInitial;
  const homeMovies = homeSearchResults || films.filter((film) => film.title.toLowerCase().includes(searchSubmitted.toLowerCase()));
  const recommendationRows = homeShelves || [
    { title: 'Trending this week', movies: films },
    { title: 'Popular movies', movies: [...films].sort((a,b)=>Number(b.rating)-Number(a.rating)) },
  ];
  const homeRecommendationRows = recommendationRows.filter((shelf) => shelf.title !== 'Fantasy favorites');
  const movieShelf = (shelf) => <section className="shelf" key={shelf.title}><div className="shelf-heading"><h3>{shelf.title}</h3><button className="text-button" onClick={()=>{setExploreCategory(shelf.title);setActiveProvider(null);window.scrollTo({top:0,behavior:'instant'});}}>Explore <ChevronRight size={14}/></button></div><div className="shelf-row">{shelf.movies.map(f=><button className="shelf-card" key={f.id} onClick={()=>openMovie(f)}>{renderPoster(f,'shelf-poster')}<strong>{f.title}</strong><small>{f.year} · {f.ratingLabel||'IMDb'} {f.rating}</small></button>)}</div></section>;
  const providerShelf = () => <section className="provider-shelf" aria-label="Streaming services with movies leaving soon"><div className="provider-shelf-heading"><div><h3>Leaving soon</h3><small>Movies leaving your services · refreshed daily</small></div></div>{selectedServices.length===0?<p className="provider-empty">Choose services in your profile to track movies leaving soon.</p>:providerError?<p className="provider-empty">{providerError}</p>:providerOptionsLoading?<p className="provider-empty">Loading your services…</p>:providerOptions.length===0?<p className="provider-empty">No streaming providers matched your selections in the United States.</p>:<div className="provider-grid">{providerOptions.map(provider=><button className="provider-card" key={provider.id} onClick={()=>openProvider(provider)}><span className="provider-logo">{provider.logoPath?<img src={`https://image.tmdb.org/t/p/w92${provider.logoPath}`} alt=""/>:provider.name.slice(0,1)}</span><strong>{provider.service}</strong><ChevronRight size={14}/></button>)}</div>}</section>;
  const addToWatchlist = (id) => { setWatchlist((items) => items.includes(id) ? items : [...items, id]); notify('Added to your quest log'); };
  const assignToCollection = async (collection, id) => {
    if (!supabase || !authUser) { notify('Sign in to save movies to collections'); return; }
    const film = (collectionPickerMovie && String(collectionPickerMovie.id) === String(id) ? collectionPickerMovie : null) || films.find(item => String(item.id) === String(id));
    if (!film) { notify('Could not find this movie. Close the picker and try again.'); return; }
    try {
      let row = collectionRows.find(item => item.name === collection) || customCollections.find(item => item.name === collection);
      if (!row?.id) {
        const result = await supabase.from('collections').select('id,name').eq('user_id', authUser.id).eq('name', collection).maybeSingle();
        if (result.error) throw result.error;
        row = result.data;
      }
      if (!row?.id) throw new Error(`“${collection}” is not saved to your account yet.`);
      const alreadySaved = collectionMovieRows.some(item => item.collection_id === row.id && (item.movie_id === String(id) || item.movie?.title === film.title));
      if (alreadySaved) { notify(`Already in ${collection}`); return; }
      const result = await supabase.from('collection_movies').upsert({ collection_id: row.id, user_id: authUser.id, movie_id: String(id), movie: film }, { onConflict: 'collection_id,movie_id' });
      if (result.error) throw result.error;
      await loadCollectionData(authUser.id);
      notify(`Added to ${collection}`);
    } catch (error) { notify(`Could not add to ${collection}: ${error.message}`); }
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
      }
      await loadCollectionData(authUser.id);
      setShowCollectionForm(false);
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
    setSelectedMovie(film); setGalleryIndex(0); setTrailerPlaying(false); setDetailError('');
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
  const openProvider = async (provider) => {
    setActiveProvider(provider); setExploreCategory(''); setProviderMovies(null); setProviderNextCursor(null); setProviderHasMore(false); setProviderLoading(true); setProviderError('');
    try {
      const data = await callHomeMovies({ action: 'expiring', services: selectedServices, service: provider.service, region: 'US' });
      setProviderMovies((data.results || []).map(mapExpiringMovie));
      setProviderNextCursor(data.nextCursor || null); setProviderHasMore(Boolean(data.hasMore));
    } catch (error) { setProviderError(error.message); setProviderMovies([]); }
    finally { setProviderLoading(false); }
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
  const finishDiscoverSwipe = (direction) => { if(discoverLocked.current)return;discoverLocked.current=true;setDiscoverExit(direction);setDiscoverOffset(direction==='left'?-440:440);window.setTimeout(()=>{if(direction==='right')toggle(setLiked,current.id);setCursor(n=>n+1);setDiscoverOffset(0);setDiscoverExit('');discoverLocked.current=false;},250); };
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
  const signOut = async () => { const { error } = await supabase.auth.signOut(); if (error) notify(error.message); else { setProfile(null); setPage('home'); } };
  const renderPoster = (film, className='poster', showGenreIcon=true) => { const genre=film.genre.split(' · ')[0]; return <div className={`${className} ${film.tone} ${showGenreIcon?'':'without-genre-icon'}`} style={{ backgroundImage: `linear-gradient(180deg,rgba(20,18,27,.02),rgba(20,18,27,.15)),url(${film.image})` }}>{showGenreIcon&&<span className="poster-genre" role="img" aria-label={genre}>{genreEmblems[genre]||'🎬'}</span>}</div>; };
  const movieRow = (film, extraActions=null, showGenreIcon=true) => <div className={`movie-row-wrap ${extraActions ? "has-actions" : ""}`} key={film.id}><button className="movie-row" onClick={() => {if(suppressMovieClick.current){suppressMovieClick.current=false;return;}openMovie(film);}}>{renderPoster(film,'row-poster',showGenreIcon)}<span className="row-copy"><strong>{film.title}</strong><small>{film.year} <i/> {film.genre.split(' · ')[0]}</small>{film.isExpiring&&<span className="row-expiry">{expiryLabel(film.expiryAt)}</span>}{!film.hideRating&&<span className="row-rating"><Star size={12} fill="currentColor"/> {film.ratingLabel||'IMDb'} {film.rating}</span>}</span><ChevronRight className="row-chevron" size={17}/></button>{extraActions}</div>;
  const filterPills = (currentValue, setValue, options) => <div className="filter-pills" role="group">{options.map((item)=><button key={item} className={currentValue===item?'selected':''} onClick={()=>setValue(item)}>{item}</button>)}</div>;
  const content = () => {
    if (page === 'home') {
      const homeListOpen = Boolean(searchSubmitted || activeProvider || exploreCategory);
      return <>
      {!homeListOpen&&<><div className="welcome-row"><div><span className="eyebrow">YOUR LITTLE MOVIE LIBRARY</span><h1>Fitrack</h1><p className="home-subtitle">A cozy shelf of stories you love.</p></div><button className="avatar home-avatar" onClick={()=>setShowAccountActions(true)} aria-label={`Account options for ${accountFirstName}`} title={accountFirstName}>{accountAvatarContent()}</button></div>
      <form className="home-search" onSubmit={async e=>{e.preventDefault();const query=search.trim();setSearchSubmitted(query);setHomeSearchResults(null);if(!query||!homeApiConfigured)return;setHomeLoading(true);setHomeError('');try{const data=await callHomeMovies({action:'search',query});setHomeSearchResults((data.results||[]).map(mapTmdbMovie));}catch(error){setHomeError(error.message);setHomeSearchResults([]);}finally{setHomeLoading(false);}}}><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search movies..." aria-label="Search movie database"/><button type="submit">Search</button></form></>}
      <section className="section home-movie-section">{homeError&&<p className="no-results">{homeError}</p>}{searchSubmitted?<><div className="section-head"><div><span className="eyebrow">MOVIE DATABASE</span><h2>Results for “{searchSubmitted}”</h2></div><button className="text-button" onClick={()=>{setSearchSubmitted('');setSearch('');setHomeSearchResults(null);setHomeError('');}}>Clear</button></div><div className="search-results" {...homePullHandlers}>{homePullIndicator()}{homeLoading?<p className="no-results">Searching the movie library…</p>:homeMovies.length?homeMovies.map(f=>movieRow(f)):<p className="no-results">No matching movies found.</p>}</div></>:activeProvider?<>
        <div className="section-head provider-results-head"><div><button className="back-link" onClick={()=>{setActiveProvider(null);setProviderMovies(null);setProviderNextCursor(null);setProviderHasMore(false);setProviderError('');}}><ArrowLeft size={15}/> Home</button><h2>{activeProvider.service}</h2><small className="provider-region-note">Titles due to leave this service in the next 31 days · refreshed daily</small></div><span className="provider-result-count">{providerMovies?.length ?? 0} movies</span></div><div className="search-results" {...homePullHandlers}>{homePullIndicator()}{providerLoading?<div className="movie-loading-list" role="status" aria-label={`Loading movies on ${activeProvider.service}`}>{Array.from({length:4},(_,index)=><div className="movie-loading-row" key={index}><span className="loading-poster"/><span className="loading-copy"><i/><i/><i/></span></div>)}</div>:providerError?<p className="no-results">{providerError}</p>:providerMovies?.length?providerMovies.map(f=>movieRow(f,null,false)):<p className="no-results">No announced departures for this service in the next 31 days.</p>}{providerHasMore&&<button className="load-more-expiring" onClick={loadMoreProviderMovies} disabled={providerLoadingMore}>{providerLoadingMore?<><LoaderCircle size={15} className="loading-spinner"/>Finding more movies…</>:<>Show more movies<span>Up to 75 per batch</span></>}</button>}</div>
      </>:exploreCategory?<><div className="section-head"><div><button className="back-link" onClick={()=>setExploreCategory('')}><ArrowLeft size={15}/> Home</button><h2>{exploreCategory}</h2></div></div><div className="search-results" {...homePullHandlers}>{homePullIndicator()}{(recommendationRows.find(s=>s.title===exploreCategory)?.movies||[]).map(f=>movieRow(f,null,false))}</div></>:<div className="home-shelves" {...homePullHandlers}>{homePullIndicator()}{homeLoading&&!homeShelves&&<p className="no-results">Gathering movies…</p>}{homeRecommendationRows.slice(0,1).map(movieShelf)}{providerShelf()}{homeRecommendationRows.slice(1).map(movieShelf)}</div>}</section>
    </>;
    }
    if (page === 'discover') return <>
      <div className="screen-title discover-title"><div><h1>Discover</h1><p>Find your next favorite.</p></div><button className="icon-button discover-filter" onClick={()=>notify('Genre filters coming soon')} aria-label="Filter movies"><SlidersHorizontal size={18}/></button></div>
      <div className={`discover-card ${discoverExit?`exit-${discoverExit}`:''}`} key={current.id} style={{transform:`translateX(${discoverOffset}px) rotate(${discoverOffset*.012}deg)`}} onPointerDown={e=>{discoverSwipeStart.current={x:e.clientX,y:e.clientY};discoverWasSwiped.current=false;e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{if(discoverSwipeStart.current){const dx=e.clientX-discoverSwipeStart.current.x;setDiscoverOffset(dx);}}} onPointerUp={e=>{if(!discoverSwipeStart.current)return;const dx=e.clientX-discoverSwipeStart.current.x,dy=e.clientY-discoverSwipeStart.current.y;discoverSwipeStart.current=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.2){e.preventDefault();discoverWasSwiped.current=true;finishDiscoverSwipe(dx<0?'left':'right');}else setDiscoverOffset(0);}} onClick={()=>{if(discoverWasSwiped.current){discoverWasSwiped.current=false;return;}openMovie(current);}} role="button" tabIndex="0" onKeyDown={e=>e.key==='Enter'&&openMovie(current)}>{renderPoster(current,'discover-poster')}<div className="card-overlay"><h2>{current.title}</h2><div className="movie-meta"><span>{current.year}</span><i/><span>{current.genre}</span><i/><span>IMDb {current.rating}</span></div><p>{current.tags.map(tag=><span key={tag}>{tag}</span>)}</p></div>{discoverOffset>75&&<span className="swipe-stamp stamp-like">LIKE</span>}{discoverOffset< -75&&<span className="swipe-stamp stamp-pass">PASS</span>}</div>
      <div className="swipe-hint"><span>← Pass</span><span>Like →</span></div><div className="choice-row"><button className="choice pass" aria-label="Pass on movie" onClick={()=>finishDiscoverSwipe('left')}><X size={25}/></button><button className="choice like" aria-label="Like movie" onClick={()=>finishDiscoverSwipe('right')}><Heart size={24} fill={liked.includes(current.id)?'currentColor':'none'}/></button></div>
    </>;
    if (page === 'watchlist') {
      const visibleMovies = watchlist.map(id=>films.find(m=>m.id===id)).filter(Boolean);
      const removeMovie = (id) => { setConfirmAction({title:'Remove from Quest Log?',body:'This movie will be removed from your watchlist.',confirm:()=>setWatchlist(items=>items.filter(item=>item!==id)),done:'Removed from quest log',danger:true}); };
      const markWatched = (film) => { setConfirmAction({title:'Mark as watched?',body:`“${film.title}” will be marked watched and removed from your Quest Log.`,confirm:()=>{setWatched(items=>items.includes(film.id)?items:[...items,film.id]);setWatchlist(items=>items.filter(item=>item!==film.id));},done:'Marked as watched'}); };
      return <><div className="screen-title quest-screen-title"><div className="quest-heading-copy"><span className="quest-header-icon"><ScrollText size={22}/><Sparkles size={11}/></span><div><h1>Quest log <span className="count-badge">{watchlist.length}</span></h1><p>Movies you plan to watch.</p></div></div><button className="bulk-action" onClick={()=>setConfirmAction({title:'Mark all as watched?',body:'Every movie in your Quest Log will be marked watched and removed from the list.',confirm:()=>{setWatched(items=>Array.from(new Set([...items,...watchlist])));setWatchlist([]);},done:'All marked as watched'})}><CheckCheck size={15}/> Watched all</button></div><div className="quest-scroll-hint"><span>Swipe left to remove · right when watched</span></div><div className="list-stack quest-stack">{visibleMovies.map(f=><div className="quest-swipe-row" key={f.id}><button className="swipe-under remove-under" aria-label={`Remove ${f.title}`} onClick={()=>removeMovie(f.id)}><Trash2 size={17}/><small>Remove</small></button><button className="swipe-under watched-under" aria-label={`Mark ${f.title} watched`} onClick={()=>markWatched(f)}><Check size={17}/><small>Watched</small></button><div className="quest-row-main" style={{transform:`translateX(${questOffsets[f.id]||0}px)`}} onPointerDown={e=>{questSwipeStart.current={id:f.id,x:e.clientX,y:e.clientY,axis:null,width:e.currentTarget.clientWidth};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{const start=questSwipeStart.current;if(start?.id!==f.id)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(!start.axis&&Math.max(Math.abs(dx),Math.abs(dy))>12)start.axis=Math.abs(dx)>Math.abs(dy)*1.25?'horizontal':'vertical';if(start.axis==='horizontal')setQuestOffsets(o=>({...o,[f.id]:Math.max(-start.width,Math.min(start.width,dx))}));else if(start.axis==='vertical')setQuestOffsets(o=>({...o,[f.id]:0}));}} onPointerUp={e=>{const start=questSwipeStart.current;if(!start||start.id!==f.id)return;questSwipeStart.current=null;const dx=e.clientX-start.x,threshold=start.width*.7;if(start.axis==='horizontal'&&Math.abs(dx)>=threshold){e.preventDefault();e.stopPropagation();suppressMovieClick.current=true;setQuestOffsets(o=>({...o,[f.id]:dx<0?-start.width:start.width}));window.setTimeout(()=>{setQuestOffsets(o=>({...o,[f.id]:0}));if(dx>0)removeMovie(f.id);else markWatched(f);window.setTimeout(()=>{suppressMovieClick.current=false;},350);},180);}else setQuestOffsets(o=>({...o,[f.id]:0}));}} onPointerCancel={()=>{const start=questSwipeStart.current;if(start?.id===f.id){questSwipeStart.current=null;setQuestOffsets(o=>({...o,[f.id]:0}));}}}>{movieRow(f,null,false)}<div className="row-quick-actions"><button onClick={()=>markWatched(f)} aria-label="Mark watched"><Check size={16}/></button><button onClick={()=>removeMovie(f.id)} aria-label="Remove movie"><Trash2 size={16}/></button></div></div></div>)}{visibleMovies.length===0&&<div className="empty-state"><ScrollText size={28}/><strong>Your quest log is empty</strong><p>Add movies you want to watch.</p><button className="primary-button" onClick={()=>setPage('discover')}>Explore movies</button></div>}</div></>;
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
      const collectionMovies = collectionCandidates.filter(f=>{const savedIds=collectionAssignments[activeCollection]||[];const savedMovieId=f.tmdbId?`tmdb-${f.tmdbId}`:({1:'tmdb-120'}[f.id]);const saved=activeSavedRows.some(row=>row.movie_id===String(f.collectionMovieId||f.id)||row.movie?.title===f.title);const belongs=(activeCollection==='Favorites'?(liked.includes(f.id)||savedIds.includes(f.id)||savedIds.includes(savedMovieId)||saved):savedIds.includes(f.id)||savedIds.includes(savedMovieId)||saved)&&(collectionFilter==='Liked'?liked.includes(f.id)||savedIds.includes(f.id):collectionFilter==='In quest log'?watchlist.includes(f.id):collectionFilter==='Not in quest log'?!watchlist.includes(f.id):collectionFilter==='Watched'?watched.includes(f.id):collectionFilter==='Unwatched'?!watched.includes(f.id):true);const genreOk=advancedFilter.genre==='Any genre'||(f.genre||'').toLowerCase().includes(advancedFilter.genre.toLowerCase());const ratingOk=advancedFilter.minRating==='Any rating'||Number(f.rating)>=Number(advancedFilter.minRating.replace('+',''));return belongs&&genreOk&&ratingOk;}).sort((a,b)=>advancedFilter.sort==='Rating'?Number(b.rating)-Number(a.rating):advancedFilter.sort==='Release year'?b.year-a.year:advancedFilter.sort==='Title'?a.title.localeCompare(b.title):0);
      const addAll = () => { const ids=collectionMovies.map(f=>f.id); setWatchlist(items=>Array.from(new Set([...items,...ids]))); notify(`${ids.length} movies added to quest log`); };
      const quickActions = (film) => <div className="collection-quick-actions"><button aria-label="Add to quest log" onClick={()=>addToWatchlist(film.id)}><Plus size={15}/><span className="sr-only">Quest log</span></button><button aria-label="Add to list" onClick={()=>setCollectionPickerMovie(film)}><Bookmark size={14}/><span className="sr-only">List</span></button><button className="remove-collection-movie" aria-label="Remove from collection" onClick={()=>removeFromCollection(activeCollection,film.id)}><Trash2 size={15}/><span className="sr-only">Remove</span></button></div>;
      if (!activeCollection) return <><div className="screen-title"><div><h1>Collections</h1><p>Your stories, gathered together.</p></div><button className="icon-button" onClick={()=>{setCollectionDraft({name:'',description:'',icon:'✦'});setShowCollectionForm(true);}} aria-label="Add collection"><Plus size={20}/></button></div><div className="collection-grid collection-overview">{[{name:'Favorites',icon:'♥',description:'Stories that stayed with you.',count:(collectionAssignments.Favorites||[]).length||liked.length,tone:'lavender',builtin:true},...customCollections.slice().sort((a,b)=>(a.createdAt||0)-(b.createdAt||0)).map(c=>({...c,count:films.filter(f=>(collectionAssignments[c.name]||[]).includes(f.id)||(collectionAssignments[c.name]||[]).includes(`tmdb-${f.tmdbId||({1:120}[f.id]||'')}`)).length,tone:'peach'}))].map(item=><div className="collection-tile" key={item.name} style={{'--icon-tint':iconTint(item.icon),backgroundColor:`color-mix(in srgb, ${iconTint(item.icon)} 17%, #fffdf9)`}}><button className="collection-open" onClick={()=>{setActiveCollection(item.name);setCollectionFilter('All');window.scrollTo({top:0,behavior:'instant'});}}><span className="collection-tile-icon">{item.icon}</span><strong>{item.name}</strong><small>{item.count} movies</small></button>{!item.builtin&&<div className="collection-manage"><button aria-label={`Edit ${item.name}`} onClick={()=>{setCollectionDraft({...item,editing:true,originalName:item.name});setShowCollectionForm(true);}}><Pencil size={13}/></button><button aria-label={`Remove ${item.name}`} onClick={()=>setConfirmAction({title:`Remove “${item.name}”?`,body:'This collection and its saved organization will be removed.',confirm:()=>setCustomCollections(items=>items.filter(c=>c.name!==item.name)),done:'Collection removed',danger:true})}><Trash2 size={14}/></button></div>}</div>)}</div></>;
      return <><div className="screen-title collection-detail-heading"><div><button className="back-link" onClick={returnToCollections}><ArrowLeft size={15}/> Collections</button><h1>{activeCollection}</h1><p>{activeCollection==='Favorites'?'Stories that stayed with you.':customCollections.find(c=>c.name===activeCollection)?.description}</p></div><div className="collection-header-actions"><span>{collectionMovies.length} movies</span><button className="collection-reload-button" onClick={refreshCollection} disabled={collectionRefreshing} aria-label="Reload collection"><RefreshCw size={15} className={collectionRefreshing?'loading-spinner':''}/></button><button className="add-all-button" onClick={addAll}><Plus size={14}/> Add all to quest log</button></div></div><button className="advanced-filter-toggle" onClick={()=>setShowAdvancedFilters(v=>!v)}><SlidersHorizontal size={15}/>{showAdvancedFilters?'Hide filters':'Advanced filters'}</button>{showAdvancedFilters&&<div className="advanced-filter-panel"><label>Genre<select value={advancedFilter.genre} onChange={e=>setAdvancedFilter({...advancedFilter,genre:e.target.value})}><option>Any genre</option><option>Fantasy</option><option>Horror</option><option>Adventure</option><option>Romance</option></select></label><label>Minimum rating<select value={advancedFilter.minRating} onChange={e=>setAdvancedFilter({...advancedFilter,minRating:e.target.value})}><option>Any rating</option><option>6+</option><option>7+</option><option>8+</option></select></label><label>Sort by<select value={advancedFilter.sort} onChange={e=>setAdvancedFilter({...advancedFilter,sort:e.target.value})}><option>Recommended</option><option>Rating</option><option>Release year</option><option>Title</option></select></label></div>}<div className="collection-toolbar"><div className="filter-label"><Filter size={15}/><span>Filter</span></div>{filterPills(collectionFilter,(filter)=>{setCollectionFilter(filter);requestAnimationFrame(()=>{const list=document.querySelector('.page-lists .list-stack');if(list)list.scrollTop=0;});},["All","Not in quest log","In quest log","Unwatched","Watched"])}</div><div className="list-stack" onTouchStart={beginCollectionPull} onTouchMove={moveCollectionPull} onTouchEnd={finishCollectionPull} onTouchCancel={()=>{collectionPullStart.current=null;collectionPullDistanceRef.current=0;setCollectionPullDistance(0);}}><div className={`collection-pull-indicator ${collectionPullDistance>=55?'ready':''}`} style={{height:collectionPullDistance,opacity:collectionPullDistance?1:0}} aria-live="polite">{collectionRefreshing?<LoaderCircle className="loading-spinner" size={18}/>:<RefreshCw size={18} style={{transform:`rotate(${collectionPullDistance*4}deg) scale(${.7+Math.min(collectionPullDistance/100,.5)})`}}/>}<span>{collectionRefreshing?'Reloading…':collectionPullDistance>=55?'Release to reload':'Pull to reload'}</span></div><div className="collection-pull-hint">Pull down to refresh posters and saved movies</div>{collectionRefreshing&&<div className="collection-refresh-status"><LoaderCircle className="loading-spinner" size={14}/>Refreshing saved movies and posters…</div>}{collectionMovies.map(f=>movieRow(f,quickActions(f),false))}{collectionMovies.length===0&&<p className="no-results">No movies match these filters.</p>}</div></>;
    }
    return <><div className="screen-title"><div><span className="eyebrow">THE CAMPFIRE</span><h1>More</h1></div><div className="avatar">{accountAvatarContent()}</div></div><button className="profile-card account-card" onClick={signOut}><div className="profile-avatar">{accountAvatarContent()}</div><div><strong>{profile?.display_name||'Movie lover'}</strong><small>{authUser?.email}</small></div><span className="signout-label"><LogOut size={15}/> Sign out</span></button><div className="more-menu">{[{icon:WandSparkles,label:'App appearance',sub:'A little magic for your screen'},{icon:Bell,label:'Notifications',sub:'Movie night reminders'},{icon:Film,label:'Movie credits',sub:'Powered by TMDB'},{icon:Crown,label:'About Fitrack',sub:`Version ${appVersion} · Made for movie lovers`}].map(({icon:Icon,label,sub})=><button key={label} className="menu-row" onClick={()=>label==="Movie credits"?setShowTmdbCredits(true):label==="About Fitrack"?setShowAbout(true):notify(`${label} coming soon`)}><span className="menu-icon"><Icon size={18}/></span><span><strong>{label}</strong><small>{sub}</small></span><ChevronRight size={16}/></button>)}</div></>;
  };
  if (authLoading || (authUser && profileLoading)) return <div className="auth-screen"><div className="auth-card auth-loading"><span className="fitrack-mark">✦</span><p>Preparing your movie library…</p></div></div>;
  if (!authUser) return <div className="auth-screen"><section className="auth-card"><span className="fitrack-mark">✦</span><span className="eyebrow">YOUR MOVIE QUEST BEGINS</span><h1>Welcome to Fitrack</h1><p className="auth-intro">Keep every story you love in one cozy place.</p>{!supabaseConfigured&&<p className="auth-message">Add your Supabase URL and publishable key to <code>.env.local</code> to enable sign-in.</p>}{authError&&<p className="auth-error">{authError}</p>}<button className="google-signin" disabled={!supabaseConfigured||signingIn} onClick={signInWithGoogle}><span className="google-g">G</span>{signingIn?'Opening Google…':'Continue with Google'}</button><small className="auth-footnote">Sign in securely with your Google account.</small></section></div>;
  if (!profile?.onboarding_completed) {
    return <div className="auth-screen"><section className="auth-card onboarding-card"><span className="fitrack-mark">✦</span><span className="eyebrow">A LITTLE ABOUT YOUR WATCHLIST</span><h1>Where do you watch?</h1><p className="auth-intro">Which streaming apps do you use right now? We’ll use this later to make movie recommendations more useful.</p><div className="service-options">{streamingServices.map(service=><button key={service} className={`service-option ${selectedServices.includes(service)?'selected':''}`} onClick={()=>setSelectedServices(items=>items.includes(service)?items.filter(item=>item!==service):[...items,service])}><span className="service-check">{selectedServices.includes(service)&&<Check size={14}/>}</span>{service}</button>)}</div>{authError&&<p className="auth-error">{authError}</p>}<button className="primary-button onboarding-continue" disabled={savingOnboarding} onClick={()=>completeOnboarding()}>{savingOnboarding?'Saving…':'Continue'}</button><button className="skip-onboarding" disabled={savingOnboarding} onClick={()=>completeOnboarding([])}>I’ll do this later</button><small className="auth-footnote">You can change this later. We don’t access your streaming accounts.</small></section></div>;
  }
  return <div className="app-shell"><div className="ambient a-one"/><div className="ambient a-two"/><main className={`app-main page-${page}`} onTouchStart={startEdgeBack} onTouchEnd={finishEdgeBack} onTouchCancel={()=>{edgeBackStart.current=null;}}><div key={page} className="page-content">{content()}</div><nav className="bottom-nav" aria-label="Main navigation">{navItems.map(({id,label,icon:Icon,center})=><button key={id} className={`nav-item ${center?'nav-center':''} ${page===id?'active':''}`} onClick={()=>navigateTo(id)} aria-current={page===id?'page':undefined}><span className="nav-icon"><Icon size={center?23:20} strokeWidth={page===id?2.5:2}/></span><span>{label}</span></button>)}</nav>{toast&&<div className="toast"><Sparkles size={15}/>{toast}</div>}{showCollectionForm&&<div className="modal-backdrop" onClick={()=>setShowCollectionForm(false)}><div className="form-modal" onClick={e=>e.stopPropagation()}><button className="modal-close form-close" onClick={()=>setShowCollectionForm(false)}><X size={19}/></button><span className="eyebrow">A NEW SHELF</span><h2>{collectionDraft.editing?'Edit collection':'Create collection'}</h2><label>Collection name<input autoFocus value={collectionDraft.name} onChange={e=>setCollectionDraft({...collectionDraft,name:e.target.value})} placeholder="e.g. Cozy fantasy" maxLength={28}/></label><label>Short description<textarea value={collectionDraft.description} onChange={e=>setCollectionDraft({...collectionDraft,description:e.target.value})} placeholder="What belongs in this collection?" rows="2" maxLength={90}/></label><span className="icon-prompt">Choose an icon</span><div className="icon-picker">{['✦','♥','⚔','✿','☾','♜','♛','❋','🎬','🍿','👻','🐉','🧙','🌙','⭐','🌿','🔥','❄️','💎','🗡️','🏰','🦇','🧛','🧟','🪄','🧚','🌸','🌊','🚀','🤠','🎭','🕵️'].map(icon=><button type="button" key={icon} className={collectionDraft.icon===icon?'selected':''} onClick={()=>setCollectionDraft({...collectionDraft,icon})}>{icon}</button>)}</div><button className="primary-button create-collection" disabled={!collectionDraft.name.trim()} onClick={saveCollectionDraft}><Plus size={16}/> {collectionDraft.editing?'Save changes':'Create collection'}</button></div></div>}{confirmAction&&<div className="modal-backdrop confirm-backdrop" onClick={()=>setConfirmAction(null)}><div className="confirm-modal" onClick={e=>e.stopPropagation()}><div className="confirm-icon">{confirmAction.danger?<Trash2 size={21}/>:<CheckCheck size={21}/>}</div><h2>{confirmAction.title}</h2><p>{confirmAction.body}</p><div className="confirm-buttons"><button className="cancel-button" onClick={()=>setConfirmAction(null)}>Cancel</button><button className={`primary-button ${confirmAction.danger?'danger-confirm':''}`} onClick={()=>{confirmAction.confirm();setConfirmAction(null);notify(confirmAction.done);}}>Confirm</button></div></div></div>}{collectionPickerMovie&&<div className="collection-picker-backdrop" onClick={()=>setCollectionPickerMovie(null)}><section className="collection-picker-sheet" onClick={e=>e.stopPropagation()}><div className="picker-handle"/><div className="picker-heading"><div><span className="eyebrow">SAVE MOVIE</span><h2>Add to a collection</h2></div><button className="modal-close" onClick={()=>setCollectionPickerMovie(null)} aria-label="Close"><X size={18}/></button></div>{customCollections.length?customCollections.map(c=><button className="picker-list-item" key={c.name} onClick={()=>{assignToCollection(c.name,collectionPickerMovie.id);setCollectionPickerMovie(null);}}><span className="picker-list-icon">{c.icon}</span><span>{c.name}</span><ChevronRight size={17}/></button>):<p className="picker-empty">You have not created any collections yet.</p>}<button className="picker-cancel" onClick={()=>setCollectionPickerMovie(null)}>Cancel</button></section></div>}{showAccountActions&&<div className="modal-backdrop account-actions-backdrop" onClick={()=>setShowAccountActions(false)}><section className="account-actions-sheet" role="dialog" aria-modal="true" aria-labelledby="account-actions-title" onClick={e=>e.stopPropagation()}><button className="modal-close account-actions-close" onClick={()=>setShowAccountActions(false)} aria-label="Close account options"><X size={19}/></button><span className="eyebrow">YOUR ACCOUNT</span><h2 id="account-actions-title">Hi, {accountFirstName}</h2><button className="account-action-row" onClick={()=>{setShowAccountActions(false);setProviderSettingsError('');setProviderDraft([...selectedServices]);setShowProviderSettings(true);}}><span className="account-action-icon"><SlidersHorizontal size={18}/></span><span><strong>Streaming providers</strong><small>Choose the services you use</small></span><ChevronRight size={17}/></button><p className="account-actions-note">More account options will be added here.</p></section></div>}{showProviderSettings&&<div className="modal-backdrop account-actions-backdrop" onClick={()=>setShowProviderSettings(false)}><section className="account-actions-sheet provider-settings-sheet" role="dialog" aria-modal="true" aria-labelledby="provider-settings-title" onClick={e=>e.stopPropagation()}><button className="modal-close account-actions-close" onClick={()=>setShowProviderSettings(false)} aria-label="Close provider settings"><X size={19}/></button><span className="eyebrow">PERSONALIZE YOUR HOME</span><h2 id="provider-settings-title">Your streaming providers</h2><p className="provider-settings-intro">Pick the services you use. Fitrack will track their upcoming movie departures.</p><div className="service-options">{streamingServices.map(service=><button key={service} className={`service-option ${providerDraft.includes(service)?'selected':''}`} onClick={()=>setProviderDraft(items=>items.includes(service)?items.filter(item=>item!==service):[...items,service])}><span className="service-check">{providerDraft.includes(service)&&<Check size={14}/>}</span>{service}</button>)}</div>{providerSettingsError&&<p className="auth-error">{providerSettingsError}</p>}<div className="provider-settings-actions"><button className="text-button" disabled={savingOnboarding} onClick={()=>setShowProviderSettings(false)}>Cancel</button><button className="primary-button" disabled={savingOnboarding} onClick={saveProviderSettings}>{savingOnboarding?'Saving…':'Save providers'}</button></div></section></div>}{showAbout&&<div className="modal-backdrop about-backdrop" onClick={()=>setShowAbout(false)}><section className="about-sheet" role="dialog" aria-modal="true" aria-labelledby="about-title" onClick={e=>e.stopPropagation()}><button className="modal-close credits-close" onClick={()=>setShowAbout(false)} aria-label="Close About Fitrack"><X size={19}/></button><span className="eyebrow">THE CAMPFIRE CHRONICLE</span><h2 id="about-title">About Fitrack</h2><p className="about-current-version">Current version <strong>{appVersion}</strong></p><div className="release-history">{releaseNotes.map((release)=><article className="release-entry" key={release.version}><div className="release-heading"><div><span className="release-version">Version {release.version}</span><h3>{release.title}</h3></div>{release.version===appVersion&&<span className="release-current-badge">CURRENT</span>}</div><ul>{release.details.map((detail)=><li key={detail}>{detail}</li>)}</ul></article>)}</div><small className="about-footer">Made for movie lovers, one story at a time.</small></section></div>}{showTmdbCredits&&<div className="modal-backdrop tmdb-credits-backdrop" onClick={()=>setShowTmdbCredits(false)}><section className="tmdb-credits-card" role="dialog" aria-modal="true" aria-labelledby="tmdb-credits-title" onClick={e=>e.stopPropagation()}><button className="modal-close credits-close" onClick={()=>setShowTmdbCredits(false)} aria-label="Close credits"><X size={19}/></button><span className="eyebrow">MOVIE DATA &amp; IMAGES</span><h2 id="tmdb-credits-title">Credits</h2><a className="tmdb-logo-link" href="https://www.themoviedb.org" target="_blank" rel="noreferrer" aria-label="The Movie Database"><img className="tmdb-logo" src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_long_2-9665a76b1ae401a510ec1e0ca40ddcb3b0cfe45f1d51b77a308fea0845885648.svg" alt="The Movie Database (TMDB)"/></a><p className="tmdb-credit-notice">This product uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.</p><p className="tmdb-credit-notice">Streaming availability data powered by <a href="https://www.justwatch.com/" target="_blank" rel="noreferrer">JustWatch</a>.</p><p className="tmdb-credit-notice">Expiry dates provided by <a href="https://www.movieofthenight.com/about/api" target="_blank" rel="noreferrer">Streaming Availability API by Movie of the Night</a>.</p><a className="tmdb-credit-link" href="https://www.themoviedb.org" target="_blank" rel="noreferrer">Visit themoviedb.org <ChevronRight size={15}/></a><small className="tmdb-credit-footnote">Fitrack is an independent personal project.</small></section></div>}{selectedMovie&&<div className="modal-backdrop" onClick={()=>{movieDetailRequest.current++;setSelectedMovie(null);setDetailLoading(false);setTrailerPlaying(false);}}><div className="movie-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>{movieDetailRequest.current++;setSelectedMovie(null);setDetailLoading(false);setTrailerPlaying(false);}} aria-label="Close movie details"><X size={19}/></button><div className="gallery-wrap"><div className="movie-gallery" onScroll={e=>{const w=e.currentTarget.clientWidth;setGalleryIndex(Math.round(e.currentTarget.scrollLeft/w));}}>{(selectedMovie.shots||[]).map((src,i)=><div className={`gallery-shot ${selectedMovie.tone||'lavender'}`} key={src} style={{backgroundImage:`linear-gradient(180deg,rgba(20,18,27,.05),rgba(20,18,27,.12)),url(${src})`}}><span>{i+1} / {selectedMovie.shots.length}</span></div>)}</div>{selectedMovie.shots?.length>1&&<div className="gallery-dots">{selectedMovie.shots.map((_,i)=><button key={i} className={galleryIndex===i?'active':''} aria-label={`Show image ${i+1}`} onClick={()=>document.querySelectorAll('.gallery-shot')[i]?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'start'})}/>)}</div>}</div><div className="modal-content"><span className="eyebrow">{selectedMovie.genre.toUpperCase()}</span><h2>{selectedMovie.title}</h2><div className="movie-meta"><span>{selectedMovie.year}</span><i/><span>{selectedMovie.runtime}</span>{selectedMovie.imdbRating?<><i/><span>IMDb {selectedMovie.imdbRating}</span></>:!selectedMovie.hideRating&&<><i/><span>TMDB {selectedMovie.rating}</span></>}</div><p className="modal-description">{selectedMovie.overview||'A sweeping adventure, waiting to be discovered.'}</p>{(selectedMovie.isExpiring||selectedMovie.expiryAt)&&<p className="expiry-detail"><Clock3 size={14}/>{selectedMovie.expiryService&&<strong>{selectedMovie.expiryService} · </strong>}{expiryLabel(selectedMovie.expiryAt)}</p>}<div className="detail-facts"><span><strong>Genre</strong>{selectedMovie.genre}</span><span><strong>Runtime</strong>{selectedMovie.runtime}</span>{selectedMovie.imdbRating?<span><strong>IMDb rating</strong>{selectedMovie.imdbRating} / 10</span>:!selectedMovie.hideRating&&<span><strong>TMDB rating</strong>{selectedMovie.rating} / 10</span>}{selectedMovie.imdbUrl&&<span><strong>IMDb</strong><a href={selectedMovie.imdbUrl} target="_blank" rel="noreferrer">Open IMDb title</a></span>}</div>{detailLoading&&<div className="detail-loading" role="status"><LoaderCircle className="loading-spinner" size={17}/>Loading images, cast, trailer, and availability…</div>}{detailError&&<p className="detail-error">{detailError}</p>}{selectedMovie.trailer&&<section className="detail-section"><div className="detail-section-heading"><h3>Trailer</h3><small>{selectedMovie.trailer.name}</small></div>{trailerPlaying?<div className="trailer-frame"><iframe src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(selectedMovie.trailer.key)}?autoplay=1&playsinline=1`} title={`${selectedMovie.title} trailer`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/></div>:<button className="trailer-preview" onClick={()=>setTrailerPlaying(true)} style={{backgroundImage:`linear-gradient(90deg,#21182cbb,#21182c16),url(${selectedMovie.shots?.[0]||selectedMovie.image})`}}><span className="trailer-play">▶</span><span><strong>Play trailer</strong><small>{selectedMovie.trailer.name}</small></span></button>}</section>}{selectedMovie.cast?.length>0&&<section className="detail-section"><div className="detail-section-heading"><h3>Cast</h3><small>{selectedMovie.cast.length} featured</small></div><div className="cast-slider">{selectedMovie.cast.map(person=><article className="cast-card" key={person.id}><div className="cast-photo">{person.profile?<img src={person.profile} alt="" loading="lazy"/>:<span>{person.name.slice(0,1)}</span>}</div><strong>{person.name}</strong><small>{person.character}</small></article>)}</div></section>}{(selectedMovie.providers||detailLoading)&&<section className="detail-section"><div className="detail-section-heading"><h3>Streaming now</h3><small>{selectedMovie.providerRegion||'US'}</small></div>{selectedMovie.providers?.length?<div className="detail-providers">{selectedMovie.providers.map(provider=><div className="detail-provider" key={provider.id}>{provider.logo?<img src={provider.logo} alt="" loading="lazy"/>:<span>{provider.name.slice(0,1)}</span>}<small>{provider.name}</small></div>)}</div>:!detailLoading&&<p className="detail-muted">No current streaming availability found in {selectedMovie.providerRegion||'the US'}.</p>}</section>}<div className="modal-actions"><button className="primary-button" onClick={()=>addToWatchlist(selectedMovie.id)}><Plus size={17}/> Add to quest log</button><button className="collection-picker-trigger" onClick={()=>setCollectionPickerMovie(selectedMovie)}><Plus size={16}/><span>List</span></button><button className={`heart-button ${isFavoriteMovie(selectedMovie)?'selected':''}`} aria-label="Toggle favorite" onClick={()=>toggleFavorite(selectedMovie)}><Heart size={19} fill={isFavoriteMovie(selectedMovie)?'currentColor':'none'}/></button></div></div></div></div>}</main></div>;
}

createRoot(document.getElementById('root')).render(<App/>);


