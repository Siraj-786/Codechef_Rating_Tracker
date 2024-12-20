class TableManager {
  constructor() {
    this.data = [];
    this.tableBody = document.getElementById('tableBody');
  }

  updateTable(userData) {
    this.data = userData;
    this.renderTable();
  }

  getStarColor(stars) {
    const colors = {
      1: '#666666', // gray
      2: '#1E7D22', // green
      3: '#3366CC', // blue
      4: '#684273', // purple
      5: '#FFBF00', // yellow
      6: '#FF7F00', // orange
      7: '#D0011B'  // red
    };
    return colors[stars] || '#666666';
  }

  renderTable() {
    this.tableBody.innerHTML = '';
    this.data.forEach(user => {
      const row = document.createElement('tr');
      const starColor = this.getStarColor(user.data.stars);
      row.innerHTML = `
        <td>${user.username}</td>
        <td>${user.data.rating || 'N/A'}</td>
        <td><span style="color: ${starColor}">${'★'.repeat(user.data.stars) || 'N/A'}</span></td>
        <td>${user.data.contests || 'N/A'}</td>
        <td>${user.data.ratingChange > 0 ? '+' : ''}${user.data.ratingChange || 'N/A'}</td>
      `;
      this.tableBody.appendChild(row);
    });
  }

  sortByRating() {
    this.data.sort((a, b) => (b.data.rating || 0) - (a.data.rating || 0));
    this.renderTable();
  }

  async exportToExcel() {
    try {
      // Create worksheet data
      const wsData = this.data.map(user => ({
        Username: user.username,
        'Current Rating': user.data.rating || 'N/A',
        Stars: user.data.stars || 'N/A',
        'Total Contests': user.data.contests || 'N/A',
        'Recent Rating Change': user.data.ratingChange ? 
          (user.data.ratingChange > 0 ? `+${user.data.ratingChange}` : user.data.ratingChange) : 
          'N/A'
      }));

      // Convert data to CSV format
      const headers = Object.keys(wsData[0]);
      const csvContent = [
        headers.join(','),
        ...wsData.map(row => headers.map(header => {
          const value = row[header];
          // Wrap values in quotes and escape existing quotes
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `codechef_ratings_${timestamp}.csv`;

      // Use Chrome's download API
      chrome.downloads.download({
        url: url,
        filename: fileName,
        saveAs: true
      }, (downloadId) => {
        // Cleanup
        URL.revokeObjectURL(url);
        
        if (chrome.runtime.lastError) {
          console.error('Download failed:', chrome.runtime.lastError);
          alert('Failed to start download. Please try again.');
        }
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  }
}