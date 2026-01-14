/**
 * @class CartDiscounts
 * @description 在 Cart / Cart Drawer 内添加与移除折扣码（依赖 Shopify sections rendering 返回 sections HTML）
 */
if (!customElements.get('cart-discounts')) {
  class CartDiscounts extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.bindEvents();
    }

    getSectionsToRender() {
      return [
        {
          id: 'Cart',
          section: 'main-cart',
          selector: '.thb-cart-form',
        },
        {
          id: 'Cart-Drawer',
          section: 'cart-drawer',
          selector: '.cart-drawer',
        },
        {
          id: 'cart-drawer-toggle',
          section: 'cart-bubble',
          selector: '.thb-item-count',
        },
      ];
    }

    getSectionInnerHTML(html, selector) {
      return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
    }

    bindEvents() {
      const button = this.querySelector('.cart-discounts--button');
      const removeButtons = this.querySelectorAll('.cart-discounts--remove');
      const input = this.querySelector('.cart-discounts--input');

      if (!button) return;

      button.addEventListener('click', (event) => {
        event.preventDefault();
        button.classList.add('loading');
        this.updateDiscount();
      });

      // 支持回车直接应用
      input?.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        button.classList.add('loading');
        this.updateDiscount();
      });

      removeButtons.forEach((btn) => {
        btn.addEventListener('click', this.removeDiscount.bind(this));
      });
    }

    existingDiscounts() {
      const codes = [];
      const pills = this.querySelectorAll('.cart-discounts--name');
      for (const pill of pills) {
        codes.push(pill.innerHTML);
      }
      return codes;
    }

    updateDiscount() {
      const discountCode = this.querySelector('.cart-discounts--input');
      const value = discountCode?.value?.trim();
      if (!value) {
        this.querySelector('.cart-discounts--button')?.classList.remove('loading');
        return;
      }

      const existing = this.existingDiscounts();
      if (existing.includes(value)) {
        this.querySelector('.cart-discounts--button')?.classList.remove('loading');
        return;
      }

      existing.push(value);
      // 体验：提交后清空输入框
      if (discountCode) discountCode.value = '';
      this.renderDiscounts(existing, value);
    }

    removeDiscount(event) {
      // 兼容点击到 svg/path：使用 closest 定位按钮，再拿到前一个 pill
      const btn = event.target.closest('.cart-discounts--remove');
      const pill = btn?.previousElementSibling;
      const discountCode = pill?.innerHTML;
      if (!discountCode) return;

      const existing = this.existingDiscounts();
      const idx = existing.indexOf(discountCode);
      if (idx === -1) return;

      existing.splice(idx, 1);
      this.renderDiscounts(existing);
    }

    renderDiscounts(existingDiscounts, submittedCode) {
      const body = JSON.stringify({
        // NOTE: 该字段为官方 Reformation 新版实现方式；由 Shopify cart/update.js 返回 sections HTML
        discount: existingDiscounts.join(','),
        sections: this.getSectionsToRender().map((s) => s.section),
        sections_url: window.location.pathname,
      });

      this.querySelector('.cart-discounts--error')?.setAttribute('hidden', '');

      fetch(`${theme.routes.cart_update_url}.js`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body,
      })
        .then((response) => response.text())
        .then((state) => {
          const parsedState = JSON.parse(state);

          this.getSectionsToRender().forEach((section) => {
            const elementToReplace =
              document.getElementById(section.id)?.querySelector(section.selector) || document.getElementById(section.id);

            if (parsedState.sections && elementToReplace) {
              elementToReplace.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
            }
          });

          this.querySelector('.cart-discounts--button')?.classList.remove('loading');

          if (
            submittedCode &&
            parsedState.discount_codes?.find((d) => d.code === submittedCode && d.applicable === false)
          ) {
            setTimeout(() => {
              this.querySelector('.cart-discounts--error')?.removeAttribute('hidden');
            }, 300);
          }
        })
        .catch(() => {
          // 避免按钮一直 loading
          this.querySelector('.cart-discounts--button')?.classList.remove('loading');
          this.querySelector('.cart-discounts--error')?.removeAttribute('hidden');
        });
    }
  }

  customElements.define('cart-discounts', CartDiscounts);
}

