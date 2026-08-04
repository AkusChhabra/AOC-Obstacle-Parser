// ── File loading ──────────────────────────────────────────────
function loadChart(e) {
    const file = e.target.files[0];
    if (!file) return;
    loadImageFile(file);
}

function loadImageFile(file) {
    const reader = new FileReader();
    const filepath = event.target.files[0];
    console.log("file", filepath);

    // Check if the file is a PDF
    if (file.type === 'application/pdf') {
        console.log("PDF file detected. Converting to PNG...");

        const pdfReader = new FormData();
        console.log("file: ", file);

        const fileInput = document.getElementById('file-input');

        const scaleVal = 2; // temporary

        pdfReader.append("file", fileInput.files[0]);
        pdfReader.append("scale", scaleVal);

        console.log("pdfReader (payload): ", pdfReader)

        // Send POST request to the Flask server to upload the PDF file and scale value
        fetch('/api/upload-data', {
            method: 'POST',
            //headers: {
                //'Content-Type': 'application/json',
                //'Access-Control-Allow-Origin': '*'
            //},
            body: pdfReader
        })
        .then(response => response.json())  
            .then(data => {
            
            console.log("Response from server:", data);

            const imgTag = document.createElement('img');
                
            data.images.forEach(imgData => {
                imgTag.src = imgData.data;
                imgTag.alt = imgData.filename;
                
                console.log("imgTag.src: ", imgTag.src);
                    
                // 1) Showcase images in a div container and allow user to select one for processing
                    
                console.log("Fetching preview images from server...");

                window.location.href = "/preview-images";

                //const container = document.getElementById("gallery");
                //container.appendChild(imgTag);

                console.log("Redirected to /preview-images for image selection.");
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });

        // 2) Once image is selected, call readImage() with the selected image's data URL to load it into the canvas
                
        // readImage();

        }
}
