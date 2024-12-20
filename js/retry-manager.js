class RetryManager {
  static async fetchWithRetry(username, maxRetries = 3, delayMs = 2000) {
    let lastError;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const data = await CodeChefAPI.fetchUserData(username);
        if (data.rating || data.stars || data.contests) {
          return data;
        }
        
        // If we got empty data, wait before retrying
        await this.delay(delayMs);
      } catch (error) {
        lastError = error;
        await this.delay(delayMs);
      }
    }
    
    console.error(`Failed to fetch data for ${username} after ${maxRetries} attempts`);
    throw lastError || new Error('Failed to fetch user data');
  }
  
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}