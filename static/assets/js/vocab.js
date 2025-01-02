document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    setupEventListeners();
});
var knownWords = [];
var unknownWords = [];

let vocabData = [];  // Initialize as an array
if (getCookie('knownWords') !== null) {
    let knownWordsCookie = getCookie('knownWords');
    knownWords = knownWordsCookie ? JSON.parse(knownWordsCookie) : [];
    if (!Array.isArray(knownWords)) {
        knownWords = [];
    }
} else {
    knownWords = [];
}
console.log(knownWords);
if (getCookie('unknownWords') !== null) {
    let unknownWordsCookie = getCookie('unknownWords');
    unknownWords = unknownWordsCookie ? JSON.parse(unknownWordsCookie) : [];
    if (!Array.isArray(unknownWords)) {
        unknownWords = [];
    }
} else {
    unknownWords = [];
}
console.log(unknownWords);

function setCookie(name, value) {
    document.cookie = name + "=" + (value || "") + "; path=/";
}
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function fetchData() {
    // Fetching from Django View
    fetch('/final_data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Vocabulary Data Loaded:', data); // Debugging statement
            // Convert the dictionary to an array of objects
            for (let word in data) {
                if (data.hasOwnProperty(word)) {
                    data[word].forEach(entry => {
                        vocabData.push({
                            word: word,
                            partOfSpeech: entry[0],
                            definition: entry[1].trim()
                        });
                    });
                }
            }
            console.log('Processed Vocab Data:', vocabData); // Debugging statement
            if (vocabData.length > 0) {
                displayFlashcard(0);
            } else {
                console.warn('vocabData is empty.');
                displayFlashcard(0);
            }
        })
        .catch(error => {
            console.error('Error loading vocabulary data:', error);
            const front = document.getElementById('front');
            front.textContent = 'Error loading vocabulary data.';
        });
}

function setupEventListeners() {
    const flashcard = document.getElementById('flashcard');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const known = document.getElementById('known');
    const unknown = document.getElementById('unknown');
    const random = document.getElementById('random');
    const practiceUnknown = document.getElementById('practiceUnknown');
    const clear = document.getElementById('clear');
    let modeUnknown = practiceUnknown.checked;
    let israndom = random.checked;
    let currentIndex = 0;
    let unknownIndex = 0;

    random.addEventListener('change', () => {
        israndom = random.checked;
    });
    practiceUnknown.addEventListener('change', () => {
        modeUnknown = practiceUnknown.checked;
    });

    flashcard.addEventListener('click', () => {
        flashcard.classList.toggle('flipped');
    });

    clear.addEventListener('click', () => {
        knownWords = [];
        unknownWords = [];
        setCookie('knownWords', JSON.stringify(knownWords));
        setCookie('unknownWords', JSON.stringify(unknownWords));
    });

    prevBtn.addEventListener('click', () => {
        if (!israndom) {
            if (currentIndex > 0) {
                currentIndex--;
                displayFlashcard(currentIndex);
            } else {
                alert('This is the first flashcard.');
            }
        }
    });

    nextBtn.addEventListener('click', () => {
        if (!israndom) {
            if (!modeUnknown){
                if (currentIndex < vocabData.length - 1) {
                    currentIndex++;
                    if (knownWords !== null){
                        while(knownWords.includes(currentIndex)){
                        currentIndex++;
                        }
                    }
                    displayFlashcard(currentIndex);
                } else {
                    alert('You have reached the last flashcard.');
                }
            }else {
                if (unknownIndex < unknownWords.length - 1) {
                    unknownIndex++;
                    displayFlashcard(unknownWords[unknownIndex]);
                } else {
                    alert('You have reached the last flashcard.');
                }
            }
        }else{
            if(!modeUnknown){
                currentIndex = Math.floor(Math.random() * vocabData.length);
                if (knownWords !== null) {
                    while (knownWords.includes(currentIndex)) {
                        currentIndex = Math.floor(Math.random() * vocabData.length);
                    }
                }
                displayFlashcard(currentIndex);
            }else{
                unknownIndex = Math.floor(Math.random() * unknownWords.length);
                displayFlashcard(unknownWords[unknownIndex]);
            }
        }
    });

    known.addEventListener('click', () => {
        if(!knownWords.includes(currentIndex)){
            knownWords.push(currentIndex);
            console.log(knownWords);
            setCookie('knownWords', JSON.stringify(knownWords));
            if(unknownWords !== null && unknownWords.includes(currentIndex)){
                unknownWords = unknownWords.filter(index => index !== currentIndex);
                setCookie('unknownWords', JSON.stringify(unknownWords));
            }
        }
    });

    unknown.addEventListener('click', () => {
        if(!unknownWords.includes(currentIndex)){
            unknownWords.push(currentIndex);
            console.log(unknownWords);
            setCookie('unknownWords', JSON.stringify(unknownWords));
        }
    });

}

function displayFlashcard(index) {
    const front = document.getElementById('front');
    const back = document.getElementById('back');

    console.log(`Displaying flashcard at index: ${index}`);

    if (!vocabData || vocabData.length === 0) {
        front.textContent = 'No vocabulary data available.';
        back.textContent = '';
        return;
    }

    if (index < 0 || index >= vocabData.length) {
        front.textContent = 'Index out of bounds.';
        back.textContent = '';
        return;
    }

    const vocab = vocabData[index];
    console.log(`Current Word: ${vocab.word}, Part of Speech: ${vocab.partOfSpeech}`);
    front.textContent = `${vocab.word} (${vocab.partOfSpeech})`;
    back.textContent = vocab.definition;

    // Ensure the card is not flipped when displaying a new card
    const flashcard = document.getElementById('flashcard');
    flashcard.classList.remove('flipped');
}