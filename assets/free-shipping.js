/**
 *  @class
 *  @function FreeShipping
 */

if (!customElements.get('free-shipping')) {
  class FreeShipping extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      let amountText = this.querySelector('.free-shipping--text span');
      let total = parseInt(this.dataset.cartTotal, 10);
      // 兼容：Shopify.currency / formatMoney 可能在 app.js 里定义，而 app.js 可能是 defer 加载
      const rate = (window.Shopify && Shopify.currency && Shopify.currency.rate) ? Shopify.currency.rate : 1;
      let minimum = Math.round(parseInt(this.dataset.minimum, 10) * rate);
      let percentage = 1;
      this.remainingText = this.querySelector('.free-shipping--text-remaining');
      this.fullText = this.querySelector('.free-shipping--text-full');

      if (total < minimum) {
        percentage = total / minimum;

        if (amountText) {
          let remaining = minimum - total;
          let format = window.theme.settings.money_with_currency_format || "${{amount}}";
          // 如果 formatMoney 未就绪，则保留 Liquid 端渲染的文案，不阻断进度条计算
          if (typeof formatMoney === 'function') {
            amountText.innerHTML = formatMoney(remaining, format);
          }
        }

        if (this.remainingText && this.fullText) {
          this.remainingText.style.display = 'block';
          this.fullText.style.display = 'none';
        }
      } else {
        if (this.remainingText && this.fullText) {
          this.remainingText.style.display = 'none';
          this.fullText.style.display = 'block';
        }
      }

      // clamp 0-1，避免异常数据撑爆
      percentage = Math.min(1, Math.max(0, percentage));

      // 用 CSS 变量驱动进度条
      this.style.setProperty('--percentage', percentage);
      // 额外兜底：直接写 transform，避免 CSS 变量继承/解析异常时不显示
      const bar = this.querySelector('.free-shipping--percentage');
      if (bar) {
        bar.style.transform = `scale(${percentage}, 1)`;
      }
    }
  }

  customElements.define('free-shipping', FreeShipping);
}
