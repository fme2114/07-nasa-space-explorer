// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Find the button and gallery elements
const button = document.querySelector('button');
const gallery = document.getElementById('gallery');

// Find modal elements
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const closeButton = document.querySelector('.close-button');

// NASA APOD API endpoint (using demo key for educational purposes)
const NASA_API_KEY = 'DEMO_KEY';
const NASA_API_URL = 'https://api.nasa.gov/planetary/apod';

// Add click event listener to the button
button.addEventListener('click', getSpaceImages);

// Add modal event listeners
closeButton.addEventListener('click', closeModal);
modal.addEventListener('click', function(event) {
  // Close modal if user clicks on the background (not the content)
  if (event.target === modal) {
    closeModal();
  }
});

// Close modal when pressing Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape' && modal.style.display === 'block') {
    closeModal();
  }
});

// Function to fetch space images from NASA API
async function getSpaceImages() {
  // Get the selected date range
  const startDate = startInput.value;
  const endDate = endInput.value;
  
  // Check if both dates are selected
  if (!startDate || !endDate) {
    alert('Please select both start and end dates!');
    return;
  }
  
  // Show loading state
  showLoading();
  
  try {
    // Build the API URL with our parameters
    const apiUrl = `${NASA_API_URL}?api_key=${NASA_API_KEY}&start_date=${startDate}&end_date=${endDate}`;
    
    // Fetch data from NASA API
    const response = await fetch(apiUrl);
    
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    // Convert response to JSON
    const data = await response.json();
    
    // Display the images in the gallery
    displayGallery(data);
    
  } catch (error) {
    // Handle any errors that occur
    console.error('Error fetching space images:', error);
    showError('Failed to load space images. Please try again.');
  }
}

// Function to show loading state
function showLoading() {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🚀</div>
      <p>Loading amazing space images...</p>
    </div>
  `;
}

// Function to show error message
function showError(message) {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">❌</div>
      <p>${message}</p>
    </div>
  `;
}

// Function to display the gallery of space images
function displayGallery(imageData) {
  // Clear the gallery
  gallery.innerHTML = '';
  
  // Check if we have any images
  if (!imageData || imageData.length === 0) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">🔭</div>
        <p>No images found for the selected date range.</p>
      </div>
    `;
    return;
  }
  
  // Create gallery items for each image
  imageData.forEach(item => {
    // Only display items that have images (some APOD entries are videos)
    if (item.media_type === 'image') {
      const galleryItem = createGalleryItem(item);
      gallery.appendChild(galleryItem);
    }
  });
  
  // If no images were added (all were videos), show a message
  if (gallery.children.length === 0) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">🎬</div>
        <p>All entries for this date range are videos. Try a different date range to see images!</p>
      </div>
    `;
  }
}

// Function to create a single gallery item
function createGalleryItem(item) {
  // Create the main container div
  const galleryItem = document.createElement('div');
  galleryItem.className = 'gallery-item';
  
  // Format the date to be more readable
  const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Set the inner HTML with image and text content
  galleryItem.innerHTML = `
    <img src="${item.url}" alt="${item.title}" loading="lazy">
    <h3>${item.title}</h3>
    <p><strong>Date:</strong> ${formattedDate}</p>
  `;
  
  // Add click event listener to open modal
  galleryItem.addEventListener('click', function() {
    openModal(item);
  });
  
  // Add cursor pointer style to indicate it's clickable
  galleryItem.style.cursor = 'pointer';
  
  return galleryItem;
}

// Function to open the modal with image details
function openModal(item) {
  // Format the date for display in modal
  const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Set modal content
  modalImage.src = item.url;
  modalImage.alt = item.title;
  modalTitle.textContent = item.title;
  modalDate.textContent = formattedDate;
  modalExplanation.textContent = item.explanation;
  
  // Show the modal
  modal.style.display = 'block';
  
  // Prevent body scrolling when modal is open
  document.body.style.overflow = 'hidden';
}

// Function to close the modal
function closeModal() {
  modal.style.display = 'none';
  // Restore body scrolling
  document.body.style.overflow = 'auto';
}
