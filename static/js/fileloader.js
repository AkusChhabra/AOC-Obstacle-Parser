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

                const container = document.getElementById("gallery");
                
                i = 0
                data.images.forEach(imgData => {
                    
                    const imgTag = document.createElement('img');

                    imgTag.src = imgData.data;
                    imgTag.alt = imgData.filename;
                    
                    console.log("imgTag.src: ", imgTag.src);
                    console.log("Fetching preview images from server...");


                    imgTag.classList.add("selectable-image");
                    imgTag.id = "img_" + i;

                    //window.location.href = "/preview-images";

                    container.appendChild(imgTag);
                    i += 1

                    console.log("Redirected to /preview-images for image selection.");
                });


            const images = document.querySelectorAll('.selectable-image');

            console.log("images: ", images);

            images.forEach(image => {
                image.addEventListener('click', () => {
                    images.forEach(img => img.classList.remove('selected'));
                    image.classList.add('selected');

                    console.log("img:", img)

                    // Call main script
                    //sendImgData(img);

                });
            });

            })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

function sendImgData(img) {
    fetch('/analyze', {
        method: 'POST',
        body: img.src
    })
        .then(response => response.json())
        .then(data => {
                
            
            })
        .catch(error => {
            console.error('Error:', error);
        });
}
