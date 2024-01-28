const pokemonURLAPI = "https://pokeapi.co/api/v2/type/";
const selectTab = document.getElementById("pokemonTypeSelect");
const searchTypeBtn = document.querySelector(".searchType");
const searchInput = document.getElementById("pokemonSearch");

const typeColors = {
  normal: "#8E8E8E",
  fire: "#E57373",
  water: "#64B5F6",
  electric: "#FFD54F",
  grass: "#81C784",
  ice: "#B3E5FC",
  fighting: "#FF8A65",
  poison: "#9FA8DA",
  ground: "#D4E157",
  flying: "#90A4AE",
  psychic: "#F06292",
  bug: "#AED581",
  rock: "#FFD54F",
  ghost: "#7986CB",
  dragon: "#FF8A65",
  dark: "#4F4F4F",
  steel: "#B0BEC5",
  fairy: "#FFCDD2",
};

searchTypeBtn.addEventListener("click", displayFilteredPokemon);
searchInput.addEventListener("input", debounce(displayFilteredPokemon, 300));

let cardNumber = 1;

async function fetchAllPokemonTypes() {
  try {
    const response = await fetch(pokemonURLAPI);
    const data = await response.json();
    const pokemonTypes = data.results;
    const pokemonTypesNames = pokemonTypes.map((type) => type.name);
    const pokemonTypesURL = pokemonTypes.map((type) => type.url);

    pokemonTypesNames.forEach((typeName, index) => {
      const option = document.createElement("option");
      option.value = pokemonTypesURL[index];
      option.text = typeName;
      selectTab.appendChild(option);
    });

    // Fetch all types and display them on load
    for (const typeURL of pokemonTypesURL) {
      const typeResponse = await fetch(typeURL);
      const typeData = await typeResponse.json();
      displayAllPokemonCards(typeData);
    }
  } catch (error) {
    console.log("Error occurred while fetching:", error);
  }
}

async function displayAllPokemonCards(typeData) {
  try {
    const cardContainer = document.querySelector(".pokemonDisplay");
    const bgColor = typeColors[typeData.name] || "#CCCCCC";

    // Limit the number of displayed Pokémon to 15
    const limitedPokemonList = typeData.pokemon.slice(0, 15);

    for (const pokemon of limitedPokemonList) {
      const pokemonDetails = await fetch(pokemon.pokemon.url);
      const pokemonData = await pokemonDetails.json();
      createPokemonCard(cardContainer, pokemonData, bgColor);
    }
  } catch (error) {
    console.log("Error occurred while displaying Pokemon cards:", error);
  }
}

function resetPage() {
  const cardContainer = document.querySelector(".pokemonDisplay");
  cardContainer.innerHTML = "";
  cardNumber = 1;
  fetchAllPokemonTypes();
}

async function displayFilteredPokemon() {
  const selectedTypeURL = selectTab.value;
  const searchQuery = searchInput.value.trim().toLowerCase();

  try {
    const response = await fetch(selectedTypeURL);
    const typeData = await response.json();
    const pokemonList = typeData.pokemon.slice(0, 20);

    const cardContainer = document.querySelector(".pokemonDisplay");
    cardContainer.innerHTML = "";

    let matchingPokemonCount = 0;

    for (const pokemon of pokemonList) {
      const pokemonDetails = await fetch(pokemon.pokemon.url);
      const pokemonData = await pokemonDetails.json();

      const bgColor = typeColors[typeData.name] || "#CCCCCC";

      if (pokemonData.name.toLowerCase().includes(searchQuery)) {
        createPokemonCard(cardContainer, pokemonData, bgColor);
        matchingPokemonCount++;
      }
    }

    if (matchingPokemonCount === 0) {
      showNoResultsFeedback();
    } else {
      hideNoResultsFeedback();
    }
  } catch (error) {
    console.log("Error occurred while fetching Pokemon data:", error);
  }
}


function createPokemonCard(container, pokemonData, bgColor) {
  const card = document.createElement("div");
  card.classList.add("pokemonCard");
  card.style.backgroundColor = bgColor;

  const cardFront = document.createElement("div");
  cardFront.classList.add("card-front");
  cardFront.innerHTML = `
    <div class="card-number card-info">${cardNumber}</div>
    <h3 class="card-name">${pokemonData.name}</h3>
    <img class="card-image" src="${pokemonData.sprites && pokemonData.sprites.front_default ? pokemonData.sprites.front_default : 'https://example.com/placeholder_image.png'}" alt="${pokemonData.name}">
  `;
  
  const cardBack = document.createElement("div");
  cardBack.classList.add("card-back");
  cardBack.innerHTML = `
    <div class="card-number card-info">${cardNumber}</div>
    <h3 class="card-name">${pokemonData.name}</h3>
    <p class="card-abilities">Abilities: ${pokemonData.abilities.map(ability => ability.ability.name).join(", ")}</p>
    <!-- Add more details as needed -->
  `;

  card.appendChild(cardFront);
  card.appendChild(cardBack);

  container.appendChild(card);
  cardNumber++;
}

function showNoResultsFeedback() {
  const feedbackElement = document.getElementById("noResultsFeedback");
  feedbackElement.style.display = "block";
}

function hideNoResultsFeedback() {
  const feedbackElement = document.getElementById("noResultsFeedback");
  feedbackElement.style.display = "none";
}

function debounce(func, delay) {
  let timeout;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      func.apply(context, args);
    }, delay);
  };
}

window.onload = fetchAllPokemonTypes;
