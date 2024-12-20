// Utility functions for the extension
const utils = {
  // Debounce function to limit API calls
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Format rating change with color and sign
  formatRatingChange: (change) => {
    if (change > 0) return `<span style="color: green">+${change}</span>`;
    if (change < 0) return `<span style="color: red">${change}</span>`;
    return `<span style="color: gray">0</span>`;
  },

  // Convert star count to Unicode stars
  getStarString: (count) => '★'.repeat(count),

  // Save data to chrome storage
  saveToStorage: (data) => {
    return new Promise((resolve) => {
      chrome.storage.local.set(data, resolve);
    });
  },

  // Load data from chrome storage
  loadFromStorage: (keys) => {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, resolve);
    });
  }
};