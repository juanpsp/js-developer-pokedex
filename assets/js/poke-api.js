
const pokeApi = {}


function convertPokeApiDetailToPokemon(pokeDetail) {
  const pokemon = new Pokemon()
  pokemon.number = pokeDetail.id
  pokemon.name = pokeDetail.name

  const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name)
  const [type] = types

  pokemon.types = types
  pokemon.type = type


  const dreamWorld = pokeDetail.sprites?.other?.dream_world?.front_default
  const officialArtwork = pokeDetail.sprites?.other?.['official-artwork']?.front_default
  const frontDefault = pokeDetail.sprites?.front_default

  pokemon.photo = dreamWorld || officialArtwork || frontDefault || ''

  return pokemon
}


pokeApi.getPokemonDetail = (pokemon) => {
  return fetch(pokemon.url)
    .then((response) => {
      if (!response.ok) throw new Error('Erro ao buscar detalhe do Pokémon')
      return response.json()
    })
    .then(convertPokeApiDetailToPokemon)
}


pokeApi.getPokemons = (offset = 0, limit = 5) => {
  const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`

  return fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error('Erro ao buscar lista de pokémons')
      return response.json()
    })
    .then((jsonBody) => jsonBody.results)
    .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail))
    .then((detailRequests) => Promise.all(detailRequests))
    .then((pokemonsDetails) => pokemonsDetails)
}


pokeApi.getPokemon = (identifier) => {
  const url = (typeof identifier === 'string' && identifier.startsWith('http'))
    ? identifier
    : `https://pokeapi.co/api/v2/pokemon/${identifier}`

  return fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error('Erro ao buscar Pokémon')
      return response.json()
    })
}
