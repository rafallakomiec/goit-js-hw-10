export { fetchCountries };
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import 'notiflix/dist/notiflix-3.2.6.min.css';

function fetchCountries(name) {
  const searchParams = new URLSearchParams({
    fields: 'name,capital,population,flags,languages',
  });

  return new Promise(resolve => {
    fetch(
      `https://restcountries.com/v3.1/name/${name.toString()}?${searchParams.toString()}`
    )
      .then(response => {
        if (!response.ok) {
          throw new Error(response.status);
        }
        resolve(response.json());
      })
      .catch(error => {
        if (response.status === 404) {
          Notify.failure('Oops, there is no country with that name');
          return null;
        }
        Notify.failure(error);
        return null;
      });
  }).then(response => {
    return response;
  });
}
