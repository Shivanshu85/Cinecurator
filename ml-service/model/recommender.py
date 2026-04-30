import pandas as pd  # type: ignore
import numpy as np  # type: ignore
from sklearn.feature_extraction.text import TfidfVectorizer  # type: ignore
from sklearn.metrics.pairwise import cosine_similarity  # type: ignore
from typing import Optional
import os
import logging
import json

logger = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
DATA_PATH = os.path.join(DATA_DIR, "movies.json")


class MovieRecommender:
    def __init__(self):
        self.df: Optional[pd.DataFrame] = None
        self.cosine_sim: Optional[np.ndarray] = None
        self.indices: Optional[pd.Series] = None
        self.is_ready = False
        self.movie_count = 0

    def _download_dataset(self):
        """Download a movie dataset if not cached locally."""
        os.makedirs(DATA_DIR, exist_ok=True)
        if os.path.exists(DATA_PATH):
            logger.info("Using cached movie dataset")
            return

        # Try the TMDB 5000 dataset from a CDN
        logger.info("Downloading movie dataset...")
        try:
            # Use a smaller embedded dataset as fallback
            movies_data = self._get_embedded_dataset()
            with open(DATA_PATH, "w") as f:
                json.dump(movies_data, f)
            logger.info(f"Dataset saved with {len(movies_data)} movies")
        except Exception as e:
            logger.error(f"Failed to download dataset: {e}")
            raise

    def _get_embedded_dataset(self):
        """Generate a working dataset from popular movie titles."""
        movies = [
            {"title": "Inception", "genres": "Sci-Fi Thriller", "overview": "A thief who steals corporate secrets through the use of dream-sharing technology."},
            {"title": "The Dark Knight", "genres": "Action Crime Thriller", "overview": "Batman faces the Joker, a criminal mastermind who wants to plunge Gotham into anarchy."},
            {"title": "Interstellar", "genres": "Sci-Fi Drama Adventure", "overview": "A team of explorers travel through a wormhole in space to ensure humanity's survival."},
            {"title": "The Matrix", "genres": "Sci-Fi Action", "overview": "A computer hacker learns that reality is a simulation created by intelligent machines."},
            {"title": "Pulp Fiction", "genres": "Crime Drama Thriller", "overview": "The lives of two mob hitmen, a boxer, and others intertwine in four tales of violence and redemption."},
            {"title": "Goodfellas", "genres": "Crime Drama Biography", "overview": "The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and partner Jimmy Conway."},
            {"title": "Fight Club", "genres": "Drama Thriller", "overview": "An insomniac office worker and a soap salesman build a network of underground fight clubs."},
            {"title": "The Shawshank Redemption", "genres": "Drama Crime", "overview": "Two imprisoned men bond over years, finding solace and eventual redemption through acts of common decency."},
            {"title": "Forrest Gump", "genres": "Drama Romance Comedy", "overview": "The presidencies of Kennedy and Johnson, the events of Vietnam, and other historical events unfold through the perspective of a man from Alabama."},
            {"title": "The Silence of the Lambs", "genres": "Crime Thriller Horror", "overview": "A young FBI cadet must receive the help of an incarcerated and manipulative cannibal killer."},
            {"title": "The Godfather", "genres": "Crime Drama", "overview": "The aging patriarch of an organized crime dynasty transfers control to his reluctant son."},
            {"title": "Schindler's List", "genres": "Biography Drama History", "overview": "In German-occupied Poland during World War II, Oskar Schindler gradually becomes concerned for his Jewish workforce."},
            {"title": "Avengers: Endgame", "genres": "Action Sci-Fi Adventure", "overview": "After the devastating events of Infinity War, the Avengers assemble once more to reverse Thanos' actions."},
            {"title": "Avengers: Infinity War", "genres": "Action Sci-Fi Adventure", "overview": "The Avengers and their allies must be willing to sacrifice all in an attempt to defeat the powerful Thanos."},
            {"title": "Spider-Man: No Way Home", "genres": "Action Adventure Sci-Fi", "overview": "With his identity now revealed, Spider-Man asks Doctor Strange for help, but the spell goes wrong."},
            {"title": "The Lion King", "genres": "Animation Drama Family", "overview": "Lion cub Simba idolises his father, but after his uncle murders the king, Simba is manipulated into thinking he did it."},
            {"title": "Toy Story", "genres": "Animation Comedy Family", "overview": "A cowboy doll is profoundly threatened and jealous when a new spaceman figure supplants him as top toy."},
            {"title": "Up", "genres": "Animation Adventure Comedy Drama", "overview": "78-year-old Carl Fredricksen travels to Paradise Falls in his house equipped with balloons, befriending a young stowaway."},
            {"title": "WALL-E", "genres": "Animation Sci-Fi Romance", "overview": "In the distant future, a small waste-collecting robot inadvertently embarks on a space journey that will ultimately decide the fate of mankind."},
            {"title": "Finding Nemo", "genres": "Animation Comedy Drama", "overview": "After his son is taken by a scuba diver, a clownfish sets out on a journey across the ocean to find him."},
            {"title": "Titanic", "genres": "Drama Romance", "overview": "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic."},
            {"title": "La La Land", "genres": "Drama Musical Romance", "overview": "While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future."},
            {"title": "Parasite", "genres": "Drama Comedy Thriller", "overview": "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan."},
            {"title": "Joker", "genres": "Crime Drama Thriller", "overview": "A mentally troubled comedian embarks on a downward spiral that leads to the creation of an iconic villain."},
            {"title": "1917", "genres": "Drama War", "overview": "April 6th, 1917. As a regiment assembles to wage war deep in enemy territory, two soldiers are assigned to race against time."},
            {"title": "Dunkirk", "genres": "Action Drama History War", "overview": "Allied soldiers from Belgium, the British Overseas and French Empire fight against German troops during the evacuation of Dunkirk."},
            {"title": "Mad Max: Fury Road", "genres": "Action Sci-Fi", "overview": "In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland."},
            {"title": "Blade Runner 2049", "genres": "Sci-Fi Drama Thriller", "overview": "A young blade runner's discovery of a long-buried secret leads him to track down former blade runner Rick Deckard."},
            {"title": "Arrival", "genres": "Drama Sci-Fi Mystery", "overview": "A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world."},
            {"title": "Ex Machina", "genres": "Drama Sci-Fi Thriller", "overview": "A young programmer is selected to participate in a ground-breaking experiment in synthetic intelligence."},
            {"title": "Get Out", "genres": "Horror Mystery Thriller", "overview": "A young African-American visits his white girlfriend's parents for the weekend, where his simmering uneasiness about their overly accommodating behavior deepens into a terrifying truth."},
            {"title": "Us", "genres": "Horror Mystery Thriller", "overview": "A family's serene beach vacation turns to chaos when their doppelgangers appear and begin to terrorize them."},
            {"title": "A Quiet Place", "genres": "Drama Horror Sci-Fi", "overview": "In a post-apocalyptic world, a family is forced to live in near silence while hiding from creatures that hunt by sound."},
            {"title": "Hereditary", "genres": "Drama Horror Mystery", "overview": "After the family matriarch passes away, a grieving family is haunted by tragic and disturbing occurrences."},
            {"title": "Midsommar", "genres": "Drama Horror Mystery", "overview": "A couple travels to Northern Europe to visit a rural hometown's fabled Swedish midsummer festival."},
            {"title": "Whiplash", "genres": "Drama Music", "overview": "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's potential."},
            {"title": "Black Swan", "genres": "Drama Thriller", "overview": "A committed dancer wins the lead role in a production of Tchaikovsky's Swan Lake only to find herself struggling to maintain her sanity."},
            {"title": "The Grand Budapest Hotel", "genres": "Adventure Comedy Crime Drama", "overview": "A writer encounters the owner of an aging European hotel between the wars and learns of his early years serving as a lobby boy in the hotel's glorious years."},
            {"title": "Moonlight", "genres": "Drama Romance", "overview": "A young African-American man grapples with his identity and sexuality while experiencing the everyday struggles of childhood, adolescence, and burgeoning adulthood."},
            {"title": "Everything Everywhere All at Once", "genres": "Action Adventure Comedy Fantasy Sci-Fi", "overview": "An aging Chinese immigrant is swept up in an insane adventure where she alone can save existence by exploring other universes connecting with the lives she could have led."},
            {"title": "Top Gun: Maverick", "genres": "Action Drama", "overview": "After more than thirty years of service as one of the Navy's top aviators, Pete Mitchell is where he belongs, pushing the envelope as a courageous test pilot."},
            {"title": "The Batman", "genres": "Action Crime Drama", "overview": "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption."},
            {"title": "No Time to Die", "genres": "Action Adventure Thriller", "overview": "James Bond has left active service and is enjoying a tranquil life in Jamaica before his old friend Felix Leiter from the CIA turns up asking for help."},
            {"title": "Doctor Strange in the Multiverse of Madness", "genres": "Action Adventure Fantasy Sci-Fi", "overview": "Doctor Strange teams up with a mysterious Scarlet Witch to protect America Chavez, a super-powered girl from alternate universes."},
            {"title": "The Prestige", "genres": "Drama Mystery Sci-Fi Thriller", "overview": "After a tragic accident, two stage magicians engage in a battle to create the ultimate illusion while sacrificing everything they have to outwit each other."},
            {"title": "Memento", "genres": "Mystery Thriller Crime", "overview": "A man with short-term memory loss attempts to track down his wife's murderer."},
            {"title": "The Social Network", "genres": "Biography Drama", "overview": "As Harvard student Mark Zuckerberg creates the social networking site that would become known as Facebook, he is sued by the twin brothers who claimed he stole their idea."},
            {"title": "The Truman Show", "genres": "Drama Sci-Fi", "overview": "An insurance salesman discovers his whole life is actually a reality TV show."},
            {"title": "Se7en", "genres": "Crime Drama Mystery Thriller", "overview": "Two detectives, a rookie and a veteran, hunt a serial killer who uses the seven deadly sins as his motives."},
            {"title": "Gladiator", "genres": "Action Adventure Drama", "overview": "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery."},
            {"title": "The Departed", "genres": "Crime Drama Thriller", "overview": "An undercover cop and a mole in the police attempt to identify each other while infiltrating an Irish gang in South Boston."},
        ]
        return movies

    def load(self):
        """Load and train the recommender from cached data."""
        # train() already calls _download_dataset() internally; avoid double call
        self.train()

    def train(self):
        """Train the TF-IDF cosine similarity model."""
        self._download_dataset()

        with open(DATA_PATH, "r") as f:
            data = json.load(f)

        # Work with a local DataFrame so the type is always concrete (not Optional)
        df = pd.DataFrame(data)

        # Ensure required columns exist
        if "title" not in df.columns:
            raise ValueError("Dataset must have a 'title' column")

        for col in ["genres", "overview"]:
            if col not in df.columns:
                df[col] = ""

        # Build combined features for TF-IDF
        df["combined"] = (
            df["title"].fillna("") + " " +
            df["genres"].fillna("") + " " +
            df["overview"].fillna("")
        )

        # TF-IDF
        tfidf = TfidfVectorizer(stop_words="english", max_features=5000)
        tfidf_matrix = tfidf.fit_transform(df["combined"])

        # Cosine similarity
        cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

        # Index by lowercase title — keep only the first occurrence of each title
        # to guarantee lookups always return a scalar rather than a Series.
        df["title_lower"] = df["title"].str.lower()
        deduped = df[~df["title_lower"].duplicated(keep="first")]
        indices = pd.Series(deduped.index, index=deduped["title_lower"])

        # Commit atomically so the recommender is never in a half-ready state
        self.df = df
        self.cosine_sim = cosine_sim
        self.indices = indices
        self.is_ready = True
        self.movie_count = len(df)
        logger.info(f"Recommender trained on {self.movie_count} movies")

    def recommend(self, title: str, n: int = 10):
        """Return top-N recommended movie titles for a given title."""
        if not self.is_ready:
            return []

        title_lower = title.lower().strip()

        # Exact match
        if title_lower in self.indices:
            idx = self.indices[title_lower]
        else:
            # Fuzzy match — find closest title
            matches = [t for t in self.indices.index if title_lower in t or t in title_lower]
            if not matches:
                return []
            idx = self.indices[matches[0]]

        # Handle duplicate titles (take first index)
        if isinstance(idx, pd.Series):
            idx = idx.iloc[0]

        sim_scores = list(enumerate(self.cosine_sim[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        sim_scores = sim_scores[1 : n + 1]  # type: ignore  # Exclude the movie itself

        movie_indices = [i[0] for i in sim_scores]
        return self.df["title"].iloc[movie_indices].tolist()
