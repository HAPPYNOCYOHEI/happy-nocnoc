/**
 *  @class
 *  @function PredictiveSearch
 */
class PredictiveSearch {
  constructor() {
    this.container = document.getElementById('Search-Drawer');
    this.form = this.container.querySelector('form.searchform');
    this.button = document.querySelectorAll('.thb-quick-search');
    this.input = this.container.querySelector('input[type="search"]');
    this.defaultTab = this.container.querySelector('.side-panel-content--initial');
    this.predictiveSearchResults = this.container.querySelector('.side-panel-content--has-tabs');

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.form.addEventListener('submit', this.onFormSubmit.bind(this));

    this.input.addEventListener('input', debounce((event) => {
      this.onChange(event);
    }, 300).bind(this));

    this.button.forEach((item, i) => {
      item.addEventListener('click', (event) => {
        var _this = this;
        event.preventDefault();
        document.getElementsByTagName("body")[0].classList.toggle('open-cc');
        this.container.classList.toggle('active');
        this.input.value = '';
        this.input.focus();
        if (this.container.classList.contains('active')) {
          setTimeout(function () {
            _this.input.focus({
              preventScroll: true
            });
          }, 100);
          dispatchCustomEvent('search:open');
        }

        return false;
      });
    });
  }

  getQuery() {
    return this.input.value.trim();
  }

  onChange() {
    const searchTerm = this.getQuery();

    this.controlSearch(searchTerm);

    if (!searchTerm.length) {
      this.predictiveSearchResults.classList.remove('active');
      return;
    }
    this.predictiveSearchResults.classList.add('active');
    this.getSearchResults(searchTerm);
  }

  onFormSubmit(event) {
    if (!this.getQuery().length) {
      event.preventDefault();
    }
  }

  onFocus() {
    const searchTerm = this.getQuery();

    this.controlSearch(searchTerm);

    if (!searchTerm.length) {
      return;
    }

    this.getSearchResults(searchTerm);
  }

  controlSearch(searchTerm) {
    if(searchTerm.length > 0) {
      document.querySelectorAll('div.popular-search-terms').forEach(item => {
        item.style.display = 'none';
      });
    }else{
      document.querySelectorAll('div.popular-search-terms').forEach(item => {
        item.style.display = 'block';
      });
    }
  }

  getSearchResults(searchTerm) {
    const queryKey = searchTerm.replace(" ", "-").toLowerCase();

    this.predictiveSearchResults.classList.add('loading');
    fetch(`${theme.routes.search_url}?q=${encodeURIComponent(searchTerm)}&limit=10&view=ajax`)
      .then((response) => {
        this.predictiveSearchResults.classList.remove('loading');
        if (!response.ok) {
          var error = new Error(response.status);
          throw error;
        }

        return response.text();
      })
      .then((text) => {
        const ulEl = document.createElement('ul');
        ulEl.classList.add('searchBarBase');
        let resultsMarkup = new DOMParser().parseFromString(text, 'text/html')?.querySelector('#product-grid')?.innerHTML || '';
        if (resultsMarkup) {
          ulEl.innerHTML = resultsMarkup;
          this.renderSearchResults(ulEl);
        } else {
          resultsMarkup = new DOMParser().parseFromString(text, 'text/html')?.querySelector('#ProductGridContainer')?.innerHTML || '';
          if(resultsMarkup){
            ulEl.innerHTML = resultsMarkup;
            this.renderSearchResults(ulEl);
          }
        }
      })
      .catch((error) => {
        throw error;
      });
  }

  renderSearchResults(resultsMarkup) {
    this.predictiveSearchResults.innerHTML = '';
    this.predictiveSearchResults.appendChild(resultsMarkup);

    let _this = this,
      submitButton = this.container.querySelector('#search-results-submit');


    submitButton && (submitButton.addEventListener('click', () => {
      _this.form.submit();
    }));
  }

  close() {
    this.container.classList.remove('active');
  }
}
window.addEventListener('load', () => {
  if (typeof PredictiveSearch !== 'undefined') {
    new PredictiveSearch();
  }
});