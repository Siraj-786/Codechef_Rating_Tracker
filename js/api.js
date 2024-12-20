class CodeChefAPI {
  static async fetchUserData(username) {
    try {
      const response = await fetch(`https://www.codechef.com/users/${username}`, {
        method: 'GET',
        headers: {
          'Accept': 'text/html',
          'Cache-Control': 'no-cache'
        },
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const html = await response.text();
      const data = this.parseUserData(html);
      
      if (!data.rating && !data.stars && !data.contests) {
        throw new Error('Failed to parse user data');
      }
      
      return data;
    } catch (error) {
      console.error(`Error fetching data for ${username}:`, error);
      return {
        rating: 0,
        stars: 0,
        contests: 0,
        ratingChange: 0,
        error: error.message
      };
    }
  }

  static parseUserData(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    return {
      rating: this.extractRating(doc),
      stars: this.extractStars(doc),
      contests: this.extractContests(html),
      ratingChange: this.extractRatingChange(html)
    };
  }

  static extractRating(doc) {
    const ratingElement = doc.querySelector('.rating-number');
    return ratingElement ? parseInt(ratingElement.textContent, 10) : 0;
  }

  static extractStars(doc) {
    const starsElement = doc.querySelector('.rating-star');
    if (!starsElement) return 0;
    
    // First try to match Unicode stars
    const unicodeStars = (starsElement.textContent.match(/★/g) || []).length;
    if (unicodeStars > 0) return unicodeStars;
    
    // Then try to match HTML encoded stars
    const htmlStars = starsElement.innerHTML.match(/&#9733;/g);
    if (htmlStars) return htmlStars.length;
    
    // Finally, try to determine stars from rating
    const rating = this.extractRating(doc);
    if (rating >= 2500) return 7;
    if (rating >= 2200) return 6;
    if (rating >= 2000) return 5;
    if (rating >= 1800) return 4;
    if (rating >= 1600) return 3;
    if (rating >= 1400) return 2;
    if (rating > 0) return 1;
    return 0;
  }

  static extractContests(html) {
    const contestsMatch = html.match(/var all_rating = (\[.*?\]);/s);
    if (!contestsMatch) return 0;
    try {
      const contests = JSON.parse(contestsMatch[1]);
      return Array.isArray(contests) ? contests.length : 0;
    } catch {
      return 0;
    }
  }

  static extractRatingChange(html) {
    const contestsMatch = html.match(/var all_rating = (\[.*?\]);/s);
    if (!contestsMatch) return 0;
    try {
      const contests = JSON.parse(contestsMatch[1]);
      if (Array.isArray(contests) && contests.length >= 2) {
        return contests[contests.length - 1].rating - contests[contests.length - 2].rating;
      }
      return 0;
    } catch {
      return 0;
    }
  }
}