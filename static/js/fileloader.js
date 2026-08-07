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
        fetch('/upload-data', {
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

                    console.log("img:", image.src);

                    // Call main script

                    const imgURL = new FormData();
                    imgURL.append("src", image.src)

                    //imgURL = image.src;

                    console.log("imgURL: ", imgURL);

                    sendImgData(imgURL);
                });
            });

            })
        .catch(error => {
            console.error('Error:', error);
        });
    }
    else if (file.type === 'image/png' || file.type === 'image/jpeg') {
        console.log("png/jpeg detected");
        // Add code for handling png/jpeg input
    }
}

function sendImgData(imgURL) {
    //console.log("calling /profile")
    //window.location.href = "/profile?imgURL=" + imgURL
    
    console.log("calling /analyze")
    fetch('/analyze', {
        method: 'POST',
        body: imgURL
    })
        .then(response => response.text(
        window.location.href='/analyze' 
    ))
    .then(html => {
        // Force the browser to overwrite itself with the rendered template
        /*document.open();
        document.write(html);
        document.close();*/
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
