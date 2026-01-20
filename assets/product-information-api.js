class ProductInformationAPI {
  constructor() {
    this.apiUrl = 'https://uark70-9y.myshopify.com/api/unstable/graphql.json';
    this.accessToken = 'cd9e4ba7b347659b0bd1cc6693256c14';
    this.allMetaobjects = [];
  }

  async getAllMetaobjects() {
    let hasNextPage = true;
    let cursor = null;
    const allObjects = [];

    while (hasNextPage) {
      const query = `
        query getProductInformation${cursor ? '($cursor: String!)' : ''} {
          metaobjects(type: "product_information", first: 50${cursor ? ', after: $cursor' : ''}) {
            edges {
              node {
                id
                fields {
                  key
                  value
                  reference {
                    ... on Page {
                      id
                    }
                  }
                }
              }
              cursor
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `;

      const variables = cursor ? { cursor } : {};
      
      try {
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': this.accessToken
          },
          body: JSON.stringify({ query, variables })
        });

        const data = await response.json();
        
        if (data.errors) {
          console.error('GraphQL errors:', data.errors);
          break;
        }

        const metaobjects = data.data.metaobjects;
        allObjects.push(...metaobjects.edges.map(edge => edge.node));
        
        hasNextPage = metaobjects.pageInfo.hasNextPage;
        cursor = metaobjects.pageInfo.endCursor;
      } catch (error) {
        console.error('API request failed:', error);
        break;
      }
    }

    this.allMetaobjects = allObjects;
    return allObjects;
  }

  async getPageContent(pageId) {
    let convertedId = pageId;
    
    if (pageId.includes('gid://shopify/OnlineStorePage/')) {
      convertedId = pageId.replace('gid://shopify/OnlineStorePage/', 'gid://shopify/Page/');
    }
    
    const query = `
      query getPage($id: ID!) {
        page(id: $id) {
          id
          title
          body
        }
      }
    `;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': this.accessToken
        },
        body: JSON.stringify({ 
          query, 
          variables: { id: convertedId } 
        })
      });

      const data = await response.json();
      
      if (data.errors) {
        console.error('Page query errors:', data.errors);
        return null;
      }

      return data.data.page;
    } catch (error) {
      console.error('Page request failed:', error);
      return null;
    }
  }

  findProductInformation(productHandle) {
    return this.allMetaobjects.find(obj => {
      const nameField = obj.fields.find(field => field.key === 'name');
      return nameField && nameField.value === productHandle;
    });
  }

  parseProductInformation(metaobject) {
    if (!metaobject) return null;

    const result = {};
    metaobject.fields.forEach(field => {
      if (field.key.startsWith('tag')) {
        result[field.key] = field.value;
      } else if (field.key === 'page' && field.reference) {
        result.pageId = field.reference.id;
      } else {
        result[field.key] = field.value;
      }
    });

    return result;
  }

  async loadProductInformation(productHandle, { includePageContent = true } = {}) {
    if (this.allMetaobjects.length === 0) {
      await this.getAllMetaobjects();
    }

    const productInfo = this.findProductInformation(productHandle);
    if (!productInfo) return null;

    const parsed = this.parseProductInformation(productInfo);

    if (includePageContent && parsed.pageId) {
      const pageContent = await this.getPageContent(parsed.pageId);
      if (pageContent) {
        parsed.pageContent = pageContent.body;
        parsed.pageTitle = pageContent.title;
      }
    }

    return parsed;
  }
}

async function initProductInformation() {
  const containers = document.querySelectorAll('.product-badge-container');
  const productHandle = window.productHandle;
  if (containers.length === 0) return;

  const api = new ProductInformationAPI();

  const tasks = Array.from(containers).map(async (container) => {
    const handle = container.dataset.productHandle || productHandle;
    if (!handle) return;

    const includePageContent = !container.dataset.productHandle && !!productHandle;
    const productInfo = await api.loadProductInformation(handle, { includePageContent });
    if (!productInfo) return;

    updateProductBadges(container, productInfo);

    if (includePageContent) {
      updateSizingGuide(productInfo);
      showSizingGuideButton();
    }
  });

  await Promise.all(tasks);
}

function updateProductBadges(container, productInfo) {
  if (!container) return;

  let badgeHtml = '';
  for (let i = 1; i <= 6; i++) {
    const tagKey = `tag${i}`;
    if (productInfo[tagKey]) {
      badgeHtml += `<div class="product-badge product-badge-${i}">${productInfo[tagKey]}</div>`;
    }
  }
  
  container.innerHTML = badgeHtml;
}

function updateSizingGuide(productInfo) {
  if (productInfo.pageContent) {
    const contentElement = document.querySelector('.product-popup-modal__content-info');
    if (contentElement) {
      contentElement.innerHTML = productInfo.pageContent;
    }
  }
}

function showSizingGuideButton() {
  const buttons = document.querySelectorAll('.size-guide-button');
  buttons.forEach(button => {
    button.classList.remove('btn-hidden');
  });
}

document.addEventListener('DOMContentLoaded', initProductInformation);
