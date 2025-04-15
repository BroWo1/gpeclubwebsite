// Utility function to retrieve CSRF token
function getCsrfToken() {
    let cookieValue = null;
    const name = 'csrftoken';
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
function getCurrentLanguage() {
  // Extract language code from the URL path (e.g., /en/path/ -> en)
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  // If first part looks like a language code (2-5 chars), use it, otherwise default to 'en'
  const langCode = pathParts.length > 0 && /^[a-z]{2,5}$/.test(pathParts[0])
    ? pathParts[0]
    : 'en';
  return langCode;
}

async function AI(text) {
    // Show the box if it's hidden
    const responseBox = document.getElementById('response-0');
    responseBox.style.display = 'block';
    const prompt = 'You are an assistant to help the user navigate through the gpeclub website or answer any other questions that can be unrelated to the club. ' +
        'Here is some basic knowledge about the GPE club that created this website: GPE club is a club founded by Tsinghua International School students Will and Andy, ' +
        'also containing other members such as Andrew and Jeffrey, aiming to help the THIS students with their studies. The website contains AI vocab practices and PowerSchool grade viewer. GPE Club also features GPE Hub,' +
        'a desktop software that includes AI toolbox, GPE Ball, AI To-do list, etc.\n\n' +
        'If you determine the user wants to navigate to a specific part of the website, add a line at the END of your response in this EXACT format:\n' +
        'NAVIGATE: /path/to/page\n\n' +
        'For example: NAVIGATE: /vocab/list\n' +
        'Make sure there are no spaces or other characters in the URL path.';

    const anchor = document.getElementsByName('1')[0];
    anchor.scrollIntoView({ behavior: 'smooth' });

    // Show placeholder and hide the actual response text
    const placeholder = document.getElementById('loadingPlaceholder');
    const actualResponse = document.getElementById('actualResponse');
    placeholder.style.display = 'block';
    placeholder.innerHTML = '<div class="loading-spinner"></div><span class="loading-dots">Thinking</span>';
    actualResponse.style.display = 'none';

    try {

    const lang = getCurrentLanguage();
    const fetchResponse = await fetch(`/${lang}/api/get-openai-response/`, {
      method: 'POST',
    headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
            body: JSON.stringify({ prompt: prompt, input: text, model: 'gpt-4.1', max_tokens: 150 }),
        });

        console.log('Response status:', fetchResponse.status); // Debug logging

        const data = await fetchResponse.json();

        if (fetchResponse.ok) {
            // Hide placeholder and show actual response text
            placeholder.style.display = 'none';
            actualResponse.style.display = 'block';
            responseBox.style.alignItems = 'center';
            responseBox.style.justifyContent = 'center';

            // Process the response and check for navigation instructions
            let displayResponse = data.response;
            let navigateTo = null;

            // Check for NAVIGATE: instruction
            const navRegex = /NAVIGATE:\s*(\S+)$/i;
            const navMatch = data.response.match(navRegex);

            if (navMatch) {
                // Extract the URL path (without any spaces)
                navigateTo = navMatch[1].trim();
                // Remove the navigation instruction from the displayed response
                displayResponse = data.response.replace(navRegex, '').trim();
            } else if (data.navigate_to) {
                // Fallback to navigate_to from backend if it exists
                navigateTo = data.navigate_to;
            }

            // Display the cleaned response
            actualResponse.innerText = displayResponse;

            // Handle navigation if needed
            if (navigateTo) {
                console.log('Navigating to:', navigateTo); // Debug logging

                // Add navigation message
                const navMessage = document.createElement('p');
                navMessage.innerHTML = '<br><em>Taking you to the appropriate page...</em>';
                navMessage.style.fontStyle = 'italic';
                navMessage.style.marginTop = '10px';
                actualResponse.appendChild(navMessage);

                // Wait a moment then navigate
                setTimeout(() => {
                    window.location.href = navigateTo;
                }, 2000);
            }
        } else {
            placeholder.style.display = 'none';
            actualResponse.style.display = 'block';
            actualResponse.innerText = `Error: ${data.error || 'Unknown error'}`;
            console.error('Error response:', data); // Debug logging
        }
    } catch (error) {
        placeholder.style.display = 'none';
        actualResponse.style.display = 'block';
        actualResponse.innerText = 'A network error occurred. Please try again.';
        console.error('Fetch error:', error); // Debug logging
    }
}

// Attach event listener when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up event listeners'); // Debug logging

    const form = document.getElementById('textForm');
    const textInput = document.getElementById('textInput');

    if (form && textInput) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log('Form submitted'); // Debug logging

            const text = textInput.value.trim();
            if (text) {
                console.log('Calling AI with text:', text); // Debug logging
                AI(text);
            }
        });
    } else {
        console.error('Form or input element not found:');
        console.error('Form exists:', !!form);
        console.error('Input exists:', !!textInput);
    }
});