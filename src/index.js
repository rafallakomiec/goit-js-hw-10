import { Notify } from 'notiflix';
import 'notiflix/dist/notiflix-3.2.6.min.css';
import './css/styles.css';
import { fetchCountries } from './fetchCountries';
const debounce = require('lodash.debounce');

const DEBOUNCE_DELAY = 300;
let retrievedCountries = [];

const input = document.querySelector('#search-box');
const list = document.querySelector('.country-list');
const info = document.querySelector('.country-info');
input.addEventListener('input', debounce(onInput, DEBOUNCE_DELAY));
list.addEventListener('click', onListClick);

function onInput() {
  list.innerHTML = '';
  info.innerHTML = '';

  if (input.value === '') {
    return;
  }

  const nameInput = input.value.trim();

  return new Promise(resolve => {
    resolve(fetchCountries(nameInput));
  })
    .then(result => {
      if (
        typeof result === 'object' &&
        result !== null &&
        Array.isArray(result)
      ) {
        if (result.length > 10) {
          throw new Error(
            'Too many matches found. Please enter a more specific name.'
          );
        }
        return result;
      } else {
        throw new Error('Try searching again...');
      }
    })
    .then(dataObjArray => {
      const fixateOnOne = dataObjArray.some(
        elem => elem.name.common.toLowerCase() === nameInput.toLowerCase()
      );
      if (dataObjArray.length === 1 || fixateOnOne === true) {
        let countryObj = {};
        if (fixateOnOne === true) {
          const index = dataObjArray.findIndex(
            elem => elem.name.common.toLowerCase() === nameInput.toLowerCase()
          );
          countryObj = dataObjArray[index];
        } else {
          countryObj = dataObjArray[0];
        }
        list.style.display = 'none';
        displayCountry(countryObj);
        return;
      }

      list.style.display = 'inline-block';

      for (const countryObj of dataObjArray) {
        list.insertAdjacentHTML(
          'beforeend',
          `<li class="country-list__item" data-countryname="${countryObj.name.official}"
          ><img class="country-list__img" src="
          ${countryObj.flags.svg}
          " alt="${countryObj.flags.alt}" data-countryname="${countryObj.name.official}"
           width="100" />${countryObj.name.official}</li>`
        );
      }
      retrievedCountries = [...dataObjArray];
    })
    .catch(notice => {
      Notify.info(notice.message);
    });
}

function onListClick(event) {
  if (!(event.target.nodeName === 'LI' || event.target.nodeName === 'IMG')) {
    return;
  }

  const selectedCountry = event.target.dataset.countryname;
  const index = retrievedCountries.findIndex(
    elem => elem.name.official.toString() === selectedCountry.toString()
  );
  displayCountry(retrievedCountries[index]);
}

function displayCountry(countryObj) {
  info.innerHTML = `<img class="country-info__img" src="${
    countryObj.flags.svg
  }" alt="${countryObj.flags.alt}" />
    <h2 class="country-info__name>${countryObj.name.official}</h2>
    <ul class="country-info__other">
    <li class="country-info__other-item"><span class="country-info__other-title">
    Capital:</span>${countryObj.capital.join(', ')}</li>
    <li class="country-info__other-item"><span class="country-info__other-title">
    Population:</span>${formatPopulation(countryObj.population.toString())}</li>
    <li class="country-info__other-item"><span class="country-info__other-title">Languages:</span>
    ${[...Object.values(countryObj.languages)].join(', ')}</li>
  </ul>`;
}

function formatPopulation(popNo) {
  let formatted = '';
  let odd = '';
  if (popNo.length % 3 !== 0) {
    odd = popNo.slice(0, popNo.length % 3);
    popNo = popNo.slice(popNo.length % 3, popNo.length);
  }
  for (let start = 0, end = 3; end <= popNo.length; start += 3, end += 3) {
    formatted += ' ' + popNo.slice(start, end);
  }

  formatted = formatted.trim();

  return (odd + ' ' + formatted).trim();
}
