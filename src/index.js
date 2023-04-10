import { Notify } from 'notiflix';
import 'notiflix/dist/notiflix-3.2.6.min.css';
import './css/styles.css';
import { fetchCountries } from './fetchCountries';
const debounce = require('lodash.debounce');

const DEBOUNCE_DELAY = 300;
let retrievedCountries = {};

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

  return new Promise((resolve, reject) => {
    const result = fetchCountries(nameInput);
    if (
      typeof result === 'object' &&
      result !== null &&
      Array.isArray(result)
    ) {
      if (result.length > 10) {
        reject('Too many matches found. Please enter a more specific name.');
      }
      resolve(result);
    } else {
      reject('Try searching again...');
    }
  })
    .then(dataObjArray => {
      const fixateOnOne = dataObjArray.some(
        elem => elem.name.official === nameInput
      );
      if (dataObjArray.length === 1 || fixateOnOne === true) {
        let countryObj = {};
        if (fixateOnOne === true) {
          const index = dataObjArray.findIndex(
            elem => elem.name.official === nameInput
          );
          countryObj = dataObjArray[index];
        } else {
          countryObj = dataObjArray[0];
        }
        list.style.display = 'none';
        displayCountry(countryObj);
        return;
      }

      list.style.display = 'flex';

      for (const countryObj of dataObjArray) {
        list.insertAdjacentHTML(
          'beforeend',
          `<li class="country-list__item" data-countryName="
          ${countryObj.name.official}
          "><img class="country-list_img" src="
          ${countryObj.flags}
          " alt="Country flag" data-countryName="
          ${countryObj.name.official}
          " />${countryObj.name.official}</li>`
        );
      }
      retrievedCountries = dataObjArray;
    })
    .catch(notice => {
      Notify.info(notice);
    });
}

function onListClick(event) {
  if (event.target.nodeName !== 'LI' || event.target.nodeName !== 'IMG') {
    return;
  }

  const selectedCountry = event.target.dataset.countryName;
  const index = retrievedCountries.findIndex(
    elem => elem.name.official === selectedCountry
  );
  displayCountry(retrievedCountries[index]);
}

function displayCountry(countryObj) {
  info.innerHTML = `<img class="country-info__img" src="${
    countryObj.flags
  }" alt="Country flag" />
    <h2 class="country-info__name>${countryObj.name.official}</h2>
    <ul class="country-info__other">
    <li class="country-info__other-item"><span class="country-info__other-title">Capital:</span>${
      countryObj.capital
    }</li>
    <li class="country-info__other-item"><span class="country-info__other-title">Population:</span>${
      countryObj.population
    }</li>
    <li class="country-info__other-item"><span class="country-info__other-title">Languages:</span>
    ${countryObj.languages.join(', ')}</li>
  </ul>`;
}
