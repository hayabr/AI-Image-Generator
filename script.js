const API_KEY = 'vk-H0g3O24jHBhsDNLWGFKRFdgUlxuKFxeBF2RQb8No2m6zS'; // Replace if invalid
const API_URL = 'https://api.vyro.ai/v2/image/generations';

const imageContainer = document.getElementById('imageContainer');
const imageResultElement = document.getElementById('imageResult');
const loadingContainer = document.querySelector('.image-container__loading-container');

function setLoadingState(isLoading) {
    if (isLoading) {
        loadingContainer.style.display = 'flex';
        imageResultElement.style.display = 'none';
    } else {
        loadingContainer.style.display = 'none';
        imageResultElement.style.display = 'block';
    }
}

async function generateImage() {
    const promptValue = document.getElementById('prompt').value;
    const styleValue = document.getElementById('dropdownStyles').value;
    const ratioValue = document.getElementById('dropdownRatio').value;

    if (!promptValue) {
        alert('Please enter a prompt.');
        return;
    }

    setLoadingState(true);

    try {
        const formData = new FormData();
        formData.append('prompt', promptValue);
        formData.append('style', styleValue);
        formData.append('aspect_ratio', ratioValue);

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                // Content-Type is set automatically by FormData
            },
            body: formData,
        });

        // Log response headers for debugging
        console.log('Response Status:', response.status);
        console.log('Response Content-Type:', response.headers.get('Content-Type'));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response (Raw):', errorText);
            throw new Error(`API request failed with status ${response.status}: ${errorText || 'Unknown error'}`);
        }

        // Check if response is an image
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.startsWith('image/')) {
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            imageResultElement.src = imageUrl;
            // Store the blob URL for download
            imageResultElement.dataset.blobUrl = imageUrl;
        } else {
            // Try parsing as JSON for other cases
            const data = await response.json();
            if (data.image_url) {
                imageResultElement.src = data.image_url;
                imageResultElement.dataset.blobUrl = null; // Clear blob URL if using image_url
            } else {
                throw new Error('No image URL returned from API');
            }
        }
    } catch (error) {
        console.error('Error generating image:', error);
        alert(`Failed to generate image: ${error.message}. Please check the console for details.`);
        imageResultElement.src = 'https://via.placeholder.com/512';
        imageResultElement.dataset.blobUrl = null;
    } finally {
        setLoadingState(false);
    }
}

function downloadImage() {
    const imageUrl = imageResultElement.src;
    const blobUrl = imageResultElement.dataset.blobUrl;

    if (imageUrl && !imageUrl.includes('placeholder')) {
        const link = document.createElement('a');
        link.href = blobUrl || imageUrl; // Use blob URL if available, else image URL
        link.download = 'generated-image.jpg'; // Changed to .jpg based on JFIF header
        link.click();
        // Revoke blob URL if it was used
        if (blobUrl) {
            URL.revokeObjectURL(blobUrl);
            imageResultElement.dataset.blobUrl = null;
        }
    } else {
        alert('No image available to download.');
    }
}