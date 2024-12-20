document.addEventListener('DOMContentLoaded', () => {
  const tableManager = new TableManager();
  
  const elements = {
    userIds: document.getElementById('userIds'),
    fetchData: document.getElementById('fetchData'),
    sortByRating: document.getElementById('sortByRating'),
    exportExcel: document.getElementById('exportExcel'),
    loading: document.getElementById('loading'),
    results: document.getElementById('results'),
    progressBar: document.getElementById('progressBar'),
    progressText: document.getElementById('progressText')
  };

  elements.fetchData.addEventListener('click', async () => {
    const usernames = elements.userIds.value
      .split('\n')
      .map(id => id.trim())
      .filter(id => id);

    if (usernames.length === 0) {
      alert('Please enter at least one username');
      return;
    }

    elements.loading.classList.remove('hidden');
    elements.results.classList.add('hidden');
    elements.fetchData.disabled = true;
    elements.progressBar.style.width = '0%';
    elements.progressText.textContent = '0%';

    try {
      const userData = [];
      const failedUsers = [];

      // First pass: try to fetch all users
      for (let i = 0; i < usernames.length; i++) {
        const username = usernames[i];
        try {
          const data = await CodeChefAPI.fetchUserData(username);
          if (data.rating || data.stars || data.contests) {
            userData.push({ username, data });
          } else {
            failedUsers.push(username);
          }
        } catch (error) {
          failedUsers.push(username);
        }

        // Update progress for first pass
        const progress = Math.round(((i + 1) / usernames.length) * 100);
        elements.progressBar.style.width = `${progress}%`;
        elements.progressText.textContent = `${progress}% (Pass 1/2)`;
      }

      // Second pass: retry failed users
      if (failedUsers.length > 0) {
        elements.progressText.textContent = 'Retrying failed requests...';
        
        for (let i = 0; i < failedUsers.length; i++) {
          const username = failedUsers[i];
          try {
            const data = await RetryManager.fetchWithRetry(username);
            userData.push({ username, data });
          } catch (error) {
            console.error(`Failed to fetch data for ${username} after retries:`, error);
          }

          // Update progress for second pass
          const progress = Math.round(((i + 1) / failedUsers.length) * 100);
          elements.progressBar.style.width = `${progress}%`;
          elements.progressText.textContent = `${progress}% (Pass 2/2)`;
        }
      }

      tableManager.updateTable(userData);
      elements.results.classList.remove('hidden');
      
      if (failedUsers.length > 0) {
        const failedCount = failedUsers.length;
        alert(`Note: Failed to fetch data for ${failedCount} user(s). They might have invalid usernames or their profiles might be inaccessible.`);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error fetching data. Please try again.');
    } finally {
      elements.loading.classList.add('hidden');
      elements.fetchData.disabled = false;
    }
  });

  elements.sortByRating.addEventListener('click', () => {
    tableManager.sortByRating();
  });

  elements.exportExcel.addEventListener('click', () => {
    tableManager.exportToExcel();
  });
});