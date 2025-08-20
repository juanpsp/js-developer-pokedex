
const pokemonList = document.getElementById('pokemonList')
const loadMoreButton = document.getElementById('loadMoreButton')

const maxRecords = 151
const limit = 10
let offset = 0;


function convertPokemonToLi(pokemon) {
  const typesHtml = pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join('')
  const primaryType = Array.isArray(pokemon.types) && pokemon.types.length ? pokemon.types[0] : 'normal'

  return `
    <li class="pokemon ${primaryType}" 
        data-number="${pokemon.number}" 
        data-name="${pokemon.name}"
        data-types="${pokemon.types.join(',')}"
        data-photo="${pokemon.photo}">
        <span class="number">#${pokemon.number}</span>
        <span class="name">${pokemon.name}</span>

        <div class="detail">
            <ol class="types">
                ${typesHtml}
            </ol>

            <img src="${pokemon.photo}" alt="${pokemon.name}">
        </div>
    </li>
  `
}


function loadPokemonItens(offset, limit) {
  pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
    const newHtml = pokemons.map(convertPokemonToLi).join('')
    pokemonList.innerHTML += newHtml
  }).catch(err => {
    console.error('Erro ao carregar pokémons:', err)
    alert('Erro ao carregar pokémons. Veja o console.')
  })
}


const modal = document.getElementById('pokemon-modal')
const closeModalBtn = document.getElementById('close-modal')
const detailsContainer = document.getElementById('pokemon-details')
const contentSection = document.querySelector('.content') 


async function openPokemonModal(id, fallbackData = {}) {
  try {
    let data = null


    if (window.pokeApi && typeof pokeApi.getPokemon === 'function') {
      try {
        data = await pokeApi.getPokemon(id)
      } catch (err) {
        console.warn('pokeApi.getPokemon falhou, usando fallback do elemento.', err)
      }
    }


    if (!data) {
      data = {
        id: fallbackData.number || id,
        name: fallbackData.name || '—',
        sprites: {
          other: {
            'official-artwork': { front_default: fallbackData.photo || '' },
            dream_world: { front_default: fallbackData.photo || '' }
          },
          front_default: fallbackData.photo || ''
        },
        types: (fallbackData.types || '').split(',').filter(Boolean).map(t => ({ type: { name: t } })),
        height: fallbackData.height || 0,
        weight: fallbackData.weight || 0
      }
    }

    const mainType = (data.types && data.types[0] && data.types[0].type && data.types[0].type.name) ? data.types[0].type.name : 'normal'


    const img = data.sprites?.other?.['official-artwork']?.front_default
      || data.sprites?.other?.dream_world?.front_default
      || data.sprites?.front_default
      || ''

    const altura = data.height ? (Number(data.height) / 10) : '—'
    const peso = data.weight ? (Number(data.weight) / 10) : '—'


    detailsContainer.innerHTML = `
      <img src="${img}" alt="${data.name}">
      <h2>${data.name} <small style="font-size:.7em; color:#333">#${String(data.id).padStart(3,'0')}</small></h2>
      <div class="poke-mini">
        <div><strong>Tipo:</strong> ${data.types.map(t => t.type.name).join(', ')}</div>
        <div><strong>Altura:</strong> ${altura} m</div>
        <div><strong>Peso:</strong> ${peso} kg</div>
      </div>
    `


    const modalCard = document.querySelector('.modal-content')
    if (modalCard) {
      const typeList = ['normal','grass','fire','water','electric','ice','ground','flying','poison','fighting','psychic','dark','rock','bug','ghost','steel','dragon','fairy']
      modalCard.classList.remove(...typeList)
      modalCard.classList.add(mainType)
    }


    if (modal) {
      modal.classList.remove('hidden')
      modal.setAttribute('aria-hidden', 'false')
    }
    if (contentSection) contentSection.classList.add('blur')
  } catch (err) {
    console.error('Erro ao abrir modal do Pokémon:', err)
    alert('Erro ao abrir detalhes do Pokémon. Veja o console.')
  }
}

/* Fecha o modal */
function closeModal() {
  if (modal) {
    modal.classList.add('hidden')
    modal.setAttribute('aria-hidden', 'true')
  }
  if (contentSection) contentSection.classList.remove('blur')
}


if (closeModalBtn) {
  closeModalBtn.addEventListener('click', closeModal)
}
if (modal) {
  modal.addEventListener('click', (e) => {
    if (e.target.dataset && e.target.dataset.backdrop !== undefined) closeModal()
  })
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) closeModal()
})


pokemonList.addEventListener('click', (e) => {
  const card = e.target.closest('.pokemon')
  if (!card) return

  const number = card.dataset.number
  const name = card.dataset.name
  const types = card.dataset.types
  const photo = card.dataset.photo

  openPokemonModal(number, { number, name, types, photo })
})


loadPokemonItens(offset, limit)

loadMoreButton.addEventListener('click', () => {
  offset += limit
  const qtdRecordsWithNexPage = offset + limit

  if (qtdRecordsWithNexPage >= maxRecords) {
    const newLimit = maxRecords - offset
    loadPokemonItens(offset, newLimit)

    loadMoreButton.parentElement.removeChild(loadMoreButton)
  } else {
    loadPokemonItens(offset, limit)
  }
})
