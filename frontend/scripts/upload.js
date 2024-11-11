document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(document.getElementById('uploadForm'));

    try {
        const response = await fetch('/api/models/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (response.ok) {
            alert('Model uploaded successfully!');
            document.getElementById('uploadForm').reset(); // Clear the form after successful upload
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Upload failed:', error);
        alert('An error occurred while uploading the model.');
    }
});
