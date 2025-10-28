const pokemonName = document.querySelector('.pokemon_name');
const pokemonNumber = document.querySelector('.pokemon_number');
const pokemonImage = document.querySelector('.pokemon_image');
const pokemonImage2 = document.querySelector('.pokemon_image2');
const pokemonType = document.querySelector('.pokemon_type');
const pokemonAbilities = document.querySelector('.abilities');
const pokemonStats = document.querySelector('.stats');
const form = document.querySelector('.form');
const input = document.querySelector('.input_search');
const buttonPrev = document.querySelector('.btn-prev');
const buttonNext = document.querySelector('.btn-next');
const notFound = document.querySelector('.not-found');
const infoCard = document.querySelector('.info-card');
const pokemonInfo = document.querySelector('.pokemon-info');

const colors = {
  fire: '#ff7676',
  grass: '#6cd461',
  electric: '#ffd43b',
  water: '#69baf1',
  ground: '#d6a671',
  rock: '#b2a57c',
  fairy: '#fbb6d9',
  poison: '#ca98db',
  bug: '#a7c957',
  dragon: '#8c7aa9',
  psychic: '#ff9eb5',
  flying: '#98c0f0',
  fighting: '#d94f4f',
  normal: '#e2cfc3',
  ghost: '#846a9d',
  ice: '#99e1f2',
  dark: '#5c5c5c'
};

let searchPokemon = 1;

// Verifica se uma URL realmente existe (retorna true/false)
async function checkImage(url) {
  if (!url) return false;
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// Busca Pokémon da API
const fetchPokemon = async (pokemon) => {
  try {
    const APIResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
    if (APIResponse.ok) {
      return await APIResponse.json();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Erro ao buscar Pokémon:', error);
    return null;
  }
};

// Tenta várias URLs até achar uma imagem válida
async function getPokemonImage(data) {
  const urls = [];

  // Sprites animados (somente até o 649)
  if (data.id <= 649) {
    urls.push(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${data.id}.gif`);
  }

  // Official artwork
  urls.push(data.sprites.other?.['official-artwork']?.front_default);

  // Dream World (SVG)
  urls.push(data.sprites.other?.dream_world?.front_default);

  // Sprite padrão
  urls.push(data.sprites.front_default);

  // Sprite shiny
  urls.push(data.sprites.front_shiny);

  // Repositório direto da PokéAPI (fallback final)
  urls.push(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`);

  // Tenta cada URL até encontrar uma válida
  for (const url of urls) {
    if (await checkImage(url)) {
      return url;
    }
  }

  // Se nenhuma imagem for válida
  return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
}

// Tenta achar uma imagem de trás
async function getPokemonBackImage(data) {
  const urls = [
    data.sprites.back_default,
    data.sprites.back_shiny,
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${data.id}.png`
  ];

  for (const url of urls) {
    if (await checkImage(url)) {
      return url;
    }
  }

  // se não houver imagem de costas, retorna null
  return null;
}

// Renderiza o Pokémon na tela
const renderPokemon = async (pokemon) => {
  pokemonName.textContent = 'Loading...';
  pokemonNumber.textContent = '';
  pokemonImage.style.display = 'none';
  pokemonImage2.style.display = 'none';
  notFound.style.display = 'none';

  const data = await fetchPokemon(pokemon);

  if (!data) {
    notFound.style.display = 'block';
    pokemonName.textContent = 'Não encontrado';
    pokemonNumber.textContent = '';
    pokemonInfo.style.display = 'none';
    return;
  }

  pokemonInfo.style.display = 'block';
  pokemonName.textContent = data.name;
  pokemonNumber.textContent = data.id;
  pokemonType.textContent = data.types.map(t => t.type.name).join(', ');
  pokemonAbilities.textContent = data.abilities.map(a => a.ability.name).join(', ');
  pokemonStats.innerHTML = data.stats.map(stat => `
    <li>${stat.stat.name}: ${stat.base_stat}</li>
  `).join('');

  const mainType = data.types[0].type.name;
  infoCard.style.backgroundColor = colors[mainType] || '#fff';

  // Carregar imagens
  const frontImg = await getPokemonImage(data);
  const backImg = await getPokemonBackImage(data);

  pokemonImage.src = frontImg;
  pokemonImage.style.display = 'block';

  if (backImg) {
    pokemonImage2.src = backImg;
    pokemonImage2.style.display = 'block';
  } else {
    pokemonImage2.style.display = 'none'; // oculta se não existir
  }

  searchPokemon = data.id;
  input.value = '';
};

// Buscar por nome ou número
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = input.value.toLowerCase().trim();
  if (query) renderPokemon(query);
});

// Botões de navegação
buttonPrev.addEventListener('click', () => {
  if (searchPokemon > 1) {
    searchPokemon -= 1;
    renderPokemon(searchPokemon);
  }
});

buttonNext.addEventListener('click', () => {
  searchPokemon += 1;
  renderPokemon(searchPokemon);
});

// Render inicial
renderPokemon(searchPokemon);
