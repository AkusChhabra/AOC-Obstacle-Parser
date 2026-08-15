let searchBar = document.getElementById('icao-search');
let selectedRWY = document.getElementById('items');

console.log("searchBar found")

searchBar.addEventListener('input', (event) => {
  console.log("detected input change to searchBar")
  const rwy_inp = document.getElementById('rwy-input');
  rwy_inp.value = "";

  const selectElement = document.getElementById("items");
  selectElement.options.length = 1;

  const icao = document.getElementById('icao-search').value;

  const payload = new FormData();
  payload.append("icao", icao)

  search(payload)
});

selectedRWY.addEventListener('change', (event) => {
  const rwy_inp = document.getElementById('rwy-input');
  if (event.target.value != "Select a runway...") {
    rwy_inp.value = event.target.value;
  }
});

function search(payload) {
  fetch('/search-icao', {
      method: 'POST',
      body: payload
    })
    .then(response => response.json())
    .then(data =>  {
        console.log("data: ", data)
        console.log("data.status: ", data.status)
        if (data.status == 'success') {
          console.log("successfully entered")

          const runway_data = data.runways;
          const myLi = document.getElementById('items');

          for (const rwy of runway_data) {
            const newOptionItem = document.createElement('option');
            
            newOptionItem.text = rwy;
            newOptionItem.value = rwy;
            console.log(newOptionItem);
            myLi.append(newOptionItem);
          }
        }
      const icao_inp = document.getElementById('icao-input');
      icao_inp.value = data.icao;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Listen for typing events
/*searchBar.addEventListener('input', (event) => {
    print("listening to searchBar")
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
});*/