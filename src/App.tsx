import { useEffect, useState, useMemo, useCallback } from "react";

interface Pokemon {
  name: string;
  url: string;
}

interface CarouselPokemonImage {
  id: number;
  src: string;
  alt: string;
}

interface PokemonDetails {
  name: string;
  id: number;
  height: number;
  weight: number;
  abilities: { ability: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  types: { type: { name: string } }[];
}

export default function App() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [carouselImages, setCarouselImages] = useState<CarouselPokemonImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pokemonsPerPage = 12;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetails | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    console.log("Notification permission:", permission);
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);


  const showPokemonNotification = (name: string, id: number) => {
    if (Notification.permission !== "granted") return;

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) {
        reg.showNotification(`Has abierto a ${name}`, {
          body: `ID: ${id} — ¡Descubre sus estadísticas!`,
          icon: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
          badge: "/icon-192.png",
          tag: `pokemon-${id}`,
          renotify: true,
          vibrate: [120, 60, 120],
        } as NotificationOptions);
      }
    });
  };
  useEffect(() => {
    setLoading(true);

    fetch("https://pokeapi.co/api/v2/pokemon?limit=151")
      .then((res) => res.json())
      .then((data) => {
        setPokemons(data.results);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const ids = [25, 6, 143, 150, 249];
    setCarouselImages(
      ids.map((id) => ({
        id,
        src: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
        alt: `Pokemon ${id}`,
      }))
    );
  }, []);

  useEffect(() => {
    if (carouselImages.length > 0) {
      const timer = setInterval(
        () => setCurrentSlide((prev) => (prev + 1) % carouselImages.length),
        5000
      );
      return () => clearInterval(timer);
    }
  }, [carouselImages]);

  const filteredPokemons = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return pokemons.filter((p) => p.name.includes(q));
  }, [pokemons, searchTerm]);

  const totalPages = Math.ceil(filteredPokemons.length / pokemonsPerPage);

  const currentPokemons = useMemo(() => {
    const start = (currentPage - 1) * pokemonsPerPage;
    return filteredPokemons.slice(start, start + pokemonsPerPage);
  }, [filteredPokemons, currentPage, pokemonsPerPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };
  const fetchPokemonDetails = useCallback(async (url: string) => {
    setIsDetailLoading(true);
    setIsModalOpen(true);

    try {
      const request = await fetch(url);
      const data: PokemonDetails = await request.json();
      setSelectedPokemon(data);
    } catch {
      setSelectedPokemon(null);
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPokemon(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 flex flex-col items-center">

      <header className="relative w-full h-[400px] md:h-[550px] overflow-hidden shadow-xl mb-12">
        <div className="absolute inset-0 bg-gradient-to-br bg-black opacity-80 z-0"></div>

        {carouselImages.map((image, idx) => (
          <img
            key={image.id}
            src={image.src}
            alt={image.alt}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              idx === currentSlide ? "opacity-100 scale-105" : "opacity-0"
            }`}
            style={{ filter: "brightness(0.6)" }}
          />
        ))}

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white p-4 text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-4">
            <span className="  bg-clip-text text-transparent">
              Accion de Mejora
            </span>
          </h1>
          <p className="text-lg md:text-2xl max-w-2xl">
            Pasenme profesores, no sean malos. Esta es mi mejor obra.
          </p>

          <button
            onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })}
            className="mt-8 px-8 py-3 bg-yellow-400 text-gray-900 rounded-full font-bold hover:scale-105 transition"
          >
            Ver la Galería
          </button>
        </div>
      </header>

      <div className="w-full max-w-7xl px-4 md:px-8 pb-10">

        <h2 className="text-4xl font-extrabold text-center mb-6">
          <span className="border-b-4 pb-2">Nuestros Pokémon</span>
        </h2>

        <div className="flex justify-center mb-10">
          <input
            type="text"
            placeholder="Este es un mensaje subliminal para que me pasen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-xl p-3 border-2  rounded-full shadow-lg"
          />
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64 text-xl text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mr-3"></div>
            Cargando Pokémon...
          </div>
        )}

        {!loading && filteredPokemons.length === 0 && (
          <div className="text-center text-xl h-64 flex items-center justify-center">
            No se encontraron Pokémon.
          </div>
        )}

        {!loading && filteredPokemons.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
            {currentPokemons.map((p) => {
              const id = parseInt(p.url.split("/").slice(-2)[0]);
              const img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

              return (
                <div
                  key={p.name}
                  onClick={() => {
                    fetchPokemonDetails(p.url);
                    showPokemonNotification(p.name, id);
                  }}
                  className="group bg-white border rounded-3xl p-5 text-center shadow-xl cursor-pointer hover:scale-[1.03] transition"
                >
                  <div className="w-32 h-32 mx-auto mb-3">
                    <img src={img} alt={p.name} className="w-full h-full object-contain" />
                  </div>

                  <p className="capitalize text-xl font-bold">{p.name}</p>
                  <p className="text-sm font-mono text-red-500">
                    No. {id.toString().padStart(3, "0")}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredPokemons.length > pokemonsPerPage && (
          <div className="flex justify-center items-center mt-10 space-x-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-red-500 text-white rounded-full disabled:opacity-50"
            >
              Anterior
            </button>

            <span className="font-semibold">
              Página {currentPage} de {totalPages}
            </span>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-red-500 text-white rounded-full disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-3xl"
            >
              ×
            </button>

            {isDetailLoading || !selectedPokemon ? (
              <div className="flex flex-col items-center justify-center p-8 h-64">
                <div className="animate-spin h-12 w-12 border-b-4 border-red-500 rounded-full mb-3"></div>
                Cargando detalles...
              </div>
            ) : (
              <div className="p-6">

                <div className="text-center bg-red-50 p-4 rounded-t-xl mb-4">
                  <h3 className="capitalize text-4xl font-black">{selectedPokemon.name}</h3>
                  <p className="text-lg font-mono text-red-600">
                    No. {selectedPokemon.id.toString().padStart(3, "0")}
                  </p>
                </div>

                <div className="text-center mb-4">
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${selectedPokemon.id}.png`}
                    className="mx-auto w-40 h-40"
                  />
                </div>

                <div className="flex justify-center space-x-2 mb-4">
                  {selectedPokemon.types.map((t) => (
                    <span
                      key={t.type.name}
                      className="px-4 py-1 rounded-full text-white font-semibold shadow-md capitalize"
                      style={{ backgroundColor: getTypeColor(t.type.name) }}
                    >
                      {t.type.name}
                    </span>
                  ))}
                </div>

                <div className="flex justify-around text-center mb-6 border-b pb-4">
                  <div>
                    <p className="text-2xl font-bold">{(selectedPokemon.height / 10).toFixed(1)} m</p>
                    <p className="text-xs text-gray-500">Altura</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{(selectedPokemon.weight / 10).toFixed(1)} kg</p>
                    <p className="text-xs text-gray-500">Peso</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold capitalize">
                      {selectedPokemon.abilities[0]?.ability.name}
                    </p>
                    <p className="text-xs text-gray-500">Habilidad principal</p>
                  </div>
                </div>

                <h4 className="text-center text-xl font-bold mb-3">Estadísticas base</h4>

                <div className="space-y-2">
                  {selectedPokemon.stats.map((s) => (
                    <div key={s.stat.name} className="flex items-center">
                      <span className="w-24 capitalize text-sm">{getStatName(s.stat.name)}:</span>
                      <div className="flex-grow h-2.5 bg-gray-200 rounded-full mx-2">
                        <div
                          className="h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(s.base_stat / 2.55, 100)}%`,
                            backgroundColor: getStatColor(s.stat.name),
                          }}
                        ></div>
                      </div>
                      <span className="w-8 text-right text-sm font-bold">{s.base_stat}</span>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

const getTypeColor = (type: string): string => {
  switch (type) {
    case "fire": return "#F08030";
    case "water": return "#6890F0";
    case "grass": return "#78C850";
    case "electric": return "#F8D030";
    case "ice": return "#98D8D8";
    case "fighting": return "#C03028";
    case "poison": return "#A040A0";
    case "ground": return "#E0C068";
    case "flying": return "#A890F0";
    case "psychic": return "#F85888";
    case "bug": return "#A8B820";
    case "rock": return "#B8A038";
    case "ghost": return "#705898";
    case "dragon": return "#7038F8";
    case "steel": return "#B8B8D0";
    case "fairy": return "#EE99AC";
    default: return "#A8A878";
  }
};

const getStatColor = (stat: string): string => {
  switch (stat) {
    case "hp": return "#FE0000";
    case "attack": return "#FF7F2F";
    case "defense": return "#F8D030";
    case "special-attack": return "#6890F0";
    case "special-defense": return "#78C850";
    case "speed": return "#F85888";
    default: return "#444444";
  }
};

const getStatName = (stat: string): string => {
  switch (stat) {
    case "hp": return "HP";
    case "attack": return "Ataque";
    case "defense": return "Defensa";
    case "special-attack": return "Ataque Esp.";
    case "special-defense": return "Defensa Esp.";
    case "speed": return "Velocidad";
    default: return stat;
  }
};