const searchBar = document.getElementById('searchBar');
const items = document.querySelectorAll('.searchable-item');

// Listen for typing events
searchBar.addEventListener('input', (event) => {
  // Convert search query to lowercase
  const query = event.target.value.toLowerCase();

  items.forEach(item => {
    // Convert item text to lowercase
    const text = item.textContent.toLowerCase();

    // Toggle visibility based on match
    if (text.includes(query)) {
      item.style.display = ''; // Show item
    } else {
      item.style.display = 'none'; // Hide item
    }
  });
});