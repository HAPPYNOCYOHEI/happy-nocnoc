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
    // 防闪回：记录最新请求，并在新输入时取消上一次请求
    this.activeAbortController = null;
    this.activeRequestId = 0;

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
      this.abortActiveRequest();
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
    // 每次新请求：先取消上一次，避免旧结果覆盖新结果
    this.abortActiveRequest();
    const requestId = ++this.activeRequestId;
    this.activeAbortController = (typeof AbortController !== 'undefined') ? new AbortController() : null;

    this.predictiveSearchResults.classList.add('loading');
    // Performance/UX: 使用 Shopify 官方 predictive_search_url（更快、更稳定），由 section_id 返回可直接渲染的 HTML
    fetch(`${theme.routes.predictive_search_url}?q=${encodeURIComponent(searchTerm)}&${encodeURIComponent('resources[type]')}=product,article,query&${encodeURIComponent('resources[limit]')}=10&resources[options][fields]=title,product_type,vendor,variants.title,variants.sku&section_id=predictive-search`, {
      signal: this.activeAbortController?.signal
    })
      .then((response) => {
        // 如果已经不是最新请求，直接丢弃
        if (requestId !== this.activeRequestId) return null;
        this.predictiveSearchResults.classList.remove('loading');
        if (!response.ok) {
          var error = new Error(response.status);
          throw error;
        }

        return response.text();
      })
      .then((text) => {
        if (!text || requestId !== this.activeRequestId) return;
        const resultsMarkup = new DOMParser()
          .parseFromString(text, 'text/html')
          .querySelector('#shopify-section-predictive-search')?.innerHTML || '';
        this.renderSearchResults(resultsMarkup);
      })
      .catch((error) => {
        // 被取消的请求不算错误
        if (error?.name === 'AbortError') return;
        throw error;
      });
  }

  abortActiveRequest() {
    if (!this.activeAbortController) return;
    try {
      this.activeAbortController.abort();
    } catch (e) {}
    this.activeAbortController = null;
  }

  renderSearchResults(resultsMarkup) {
    this.predictiveSearchResults.innerHTML = resultsMarkup;

    let _this = this,
      submitButton = this.container.querySelector('#search-results-submit');


    submitButton && (submitButton.addEventListener('click', () => {
      _this.form.submit();
    }));
  }

  close() {
    this.container.classList.remove('active');
    this.abortActiveRequest();
  }
}
window.addEventListener('load', () => {
  if (typeof PredictiveSearch !== 'undefined') {
    new PredictiveSearch();
  }
});