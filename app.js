// ======================================================
// KONFIGURACJA
// ======================================================

const DATA_FILE = "./data.json";
const SETTINGS_KEY = "whiskyQuizSettings";


// ======================================================
// DANE I STAN APLIKACJI
// ======================================================

let data = {
    distilleries: [],
    whiskies: [],
    gins: [],
    liquers: [],
    rums: [],
    tequilas: []
};

let questions = [];
let currentQuestion = 0;
let score = 0;
let currentQuiz = null;
let selectedGroups = [];
let allGroups = true;
let questionCount = 20;
let expertMode = false;
let currentMode = "quiz";
let settingsReturnScreen = null;
let flashcards = [];
let currentFlashcard = 0;


// ======================================================
// ELEMENTY HTML
// ======================================================

const menuScreen = document.getElementById("menu");
const homeScreen = document.getElementById("home");
const settingsScreen = document.getElementById("settings");
const quizScreen = document.getElementById("quiz");
const resultScreen = document.getElementById("result");
const libraryScreen = document.getElementById("library");
const flashcardsScreen = document.getElementById("flashcards");

const libraryButton = document.getElementById("library-home-button");
const closeLibraryButton = document.getElementById("close-library");
const libTypeFilter = document.getElementById("lib-type-filter");
const libGroupFilter = document.getElementById("lib-group-filter");
const libraryList = document.getElementById("library-list");
const flashcardName = document.getElementById("flashcard-name");
const flashcardDetails = document.getElementById("flashcard-details");
const flashcardToggle = document.getElementById("flashcard-toggle");
const flashcardNext = document.getElementById("flashcard-next");
const flashcardCurrentElement = document.getElementById("flashcard-current");
const flashcardTotalElement = document.getElementById("flashcard-total");

const questionElement = document.getElementById("question");
const aromaElement = document.getElementById("aroma");
const barrelsElement = document.getElementById("barrels");
const countryElement = document.getElementById("country");
const mashElement = document.getElementById("mash");
const answersElement = document.getElementById("answers");

const currentQuestionElement = document.getElementById("current-question");
const totalQuestionsElement = document.getElementById("total-questions");
const quizNameElement = document.getElementById("quiz-name");
const finalScoreElement = document.getElementById("final-score");
const groupOptionsElement = document.getElementById("group-options");
const noGroupsMessageElement = document.getElementById("no-groups-message");
const expertModeElement = document.getElementById("expert-mode");

const answersContainer = document.getElementById("answers");
const expertAnswerContainer = document.getElementById("expert-answer");
const expertForm = document.getElementById("expert-form");
const expertInput = document.getElementById("expert-input");
const expertSuggestions = document.getElementById("expert-suggestions");
const expertSubmit = document.getElementById("expert-submit");
const expertFeedback = document.getElementById("expert-feedback");


// ======================================================
// WCZYTANIE DANYCH JSON
// ======================================================

async function loadData() {
    try {
        const response = await fetch(DATA_FILE);
        if (!response.ok) {
            throw new Error(`Nie udało się pobrać ${DATA_FILE}. HTTP ${response.status}`);
        }
        data = await response.json();

        if (!Array.isArray(data.distilleries)) data.distilleries = [];
        if (!Array.isArray(data.whiskies)) data.whiskies = [];
        if (!Array.isArray(data.gins)) data.gins = [];
        if (!Array.isArray(data.liquers)) data.liquers = [];
        if (!Array.isArray(data.rums)) data.rums = [];
        if (!Array.isArray(data.tequilas)) data.tequilas = [];

        console.log("Dane załadowane:");
        console.log(data);
    } catch (error) {
        console.error("Błąd ładowania danych:", error);
        alert("Nie udało się załadować dane.json.\n\nUruchom aplikację przez Live Server.");
    }
}


// ======================================================
// WCZYTANIE USTAWIEŃ
// ======================================================

function loadSettings() {
    const saved = localStorage.getItem(SETTINGS_KEY);

    if (!saved) {
        selectedGroups = [];
        allGroups = true;
        questionCount = 20;
        expertMode = false;
        return;
    }

    try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed.groups)) {
            selectedGroups = parsed.groups;
        } else {
            selectedGroups = [];
        }
        allGroups = parsed.allGroups !== false;

        if (parsed.questionCount === "all" || [10, 20, 30, 40, 50].includes(Number(parsed.questionCount))) {
            questionCount = parsed.questionCount;
        } else {
            questionCount = 20;
        }

        expertMode = parsed.expertMode === true;
    } catch (error) {
        console.error("Błąd odczytu ustawień:", error);
        selectedGroups = [];
        allGroups = true;
        questionCount = 20;
        expertMode = false;
    }
}

function renderExpertMode() {
    expertModeElement.checked = expertMode;
}

function renderQuestionCountOptions() {
    const options = document.querySelectorAll('input[name="question-count"]');

    options.forEach(option => {
        option.checked = String(option.value) === String(questionCount);

        option.addEventListener("change", () => {
            if (!option.checked) return;

            if (option.value === "all") {
                questionCount = "all";
            } else {
                questionCount = Number(option.value);
            }
            saveSettings();
        });
    });
}


// ======================================================
// ZAPIS USTAWIEŃ
// ======================================================

function saveSettings() {
    const settings = {
        groups: selectedGroups,
        allGroups: allGroups,
        questionCount: questionCount,
        expertMode: expertMode
    };

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}


// ======================================================
// POBRANIE WSZYSTKICH GRUP
// ======================================================

function getAvailableGroups() {
    const groups = new Set();

    [...data.distilleries, ...data.whiskies, ...data.gins, ...data.liquers, ...data.rums, ...data.tequilas].forEach(item => {
        if (typeof item.group === "string" && item.group.trim() !== "") {
            groups.add(item.group.trim());
        }
    });

    return [...groups].sort((a, b) => a.localeCompare(b));
}

function getDisplayGroups() {
    const counts = new Map();

    [...data.distilleries, ...data.whiskies, ...data.gins, ...data.liquers, ...data.rums, ...data.tequilas].forEach(item => {
        if (typeof item.group === "string" && item.group.trim() !== "") {
            const group = item.group.trim();
            counts.set(group, (counts.get(group) || 0) + 1);
        }
    });

    return getAvailableGroups().filter(group => (counts.get(group) || 0) >= 7);
}


// ======================================================
// WYŚWIETLENIE USTAWIEŃ
// ======================================================

function renderGroupOptions() {
    groupOptionsElement.innerHTML = "";
    const groups = getDisplayGroups();

    if (groups.length === 0) {
        noGroupsMessageElement.classList.remove("hidden");
        return;
    }

    noGroupsMessageElement.classList.add("hidden");
    selectedGroups = selectedGroups.filter(group => groups.includes(group));

    const allGroupLabel = document.createElement("label");
    allGroupLabel.classList.add("group-option");

    const allGroupsCheckbox = document.createElement("input");
    allGroupsCheckbox.type = "checkbox";
    allGroupsCheckbox.value = "all";
    allGroupsCheckbox.checked = allGroups;

    allGroupsCheckbox.addEventListener("change", () => {
        allGroups = allGroupsCheckbox.checked;
        if (allGroups) selectedGroups = [];
        saveSettings();
        renderGroupOptions();
    });

    const allGroupsText = document.createElement("span");
    allGroupsText.textContent = "Wszystkie";
    allGroupLabel.appendChild(allGroupsCheckbox);
    allGroupLabel.appendChild(allGroupsText);
    groupOptionsElement.appendChild(allGroupLabel);

    groups.forEach(group => {
        const label = document.createElement("label");
        label.classList.add("group-option");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = group;
        checkbox.checked = !allGroups && selectedGroups.includes(group);

        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                if (allGroups) {
                    allGroups = false;
                    selectedGroups = [group];
                } else if (!selectedGroups.includes(group)) {
                    selectedGroups.push(group);
                }
            } else {
                selectedGroups = selectedGroups.filter(item => item !== group);
                if (selectedGroups.length === 0) allGroups = true;
            }
            saveSettings();
            renderGroupOptions();
        });

        const text = document.createElement("span");
        text.textContent = group;
        label.appendChild(checkbox);
        label.appendChild(text);
        groupOptionsElement.appendChild(label);
    });

    expertModeElement.addEventListener("change", () => {
        expertMode = expertModeElement.checked;
        saveSettings();
    });

    saveSettings();
}


// ======================================================
// FILTROWANIE
// ======================================================

function filterByGroups(items) {
    if (allGroups || selectedGroups.length === 0) {
        return items;
    }
    return items.filter(item => {
        return selectedGroups.includes(item.group);
    });
}


// ======================================================
// START QUIZU
// ======================================================

function startQuiz(type) {
    console.log("Uruchamianie quizu:", type);

    currentQuiz = type;
    questions = [];
    currentQuestion = 0;
    score = 0;

    if (type === "distilleries" || type === "all") {
        const distilleries = filterByGroups(data.distilleries);
        distilleries.forEach(distillery => {
            if (!Array.isArray(distillery.information)) return;
            distillery.information.forEach(info => {
                questions.push({ question: info, answer: distillery.name, category: "distillery" });
            });
        });
    }

    if (type === "whiskies" || type === "all") {
        const whiskies = filterByGroups(data.whiskies);
        whiskies.forEach(whisky => {
            if (!Array.isArray(whisky.information)) return;
            whisky.information.forEach(info => {
                questions.push({
                    question: info,
                    answer: whisky.name,
                    category: "whisky",
                    aroma: Array.isArray(whisky.aroma) ? whisky.aroma.join(" • ") : "",
                    barrels: Array.isArray(whisky.barrels) ? whisky.barrels : [],
                    mash: Array.isArray(whisky.Mash) ? whisky.Mash : []
                });
            });
        });
    }

    if (type === "gins" || type === "all") {
        const gins = filterByGroups(data.gins);
        gins.forEach(gin => {
            if (!Array.isArray(gin.information)) return;
            gin.information.forEach(info => {
                questions.push({ question: info, answer: gin.name, category: "gin" });
            });
        });
    }

    if (type === "liquers" || type === "all") {
        const liquers = filterByGroups(data.liquers);
        liquers.forEach(liquer => {
            if (!Array.isArray(liquer.information)) return;
            liquer.information.forEach(info => {
                questions.push({ question: info, answer: liquer.name, category: "liquer" });
            });
        });
    }

    if (type === "rums" || type === "all") {
        const rums = filterByGroups(data.rums);
        rums.forEach(rum => {
            if (!Array.isArray(rum.information)) return;
            rum.information.forEach(info => {
                questions.push({
                    question: info,
                    answer: rum.name,
                    category: "rum",
                    aroma: Array.isArray(rum.aroma) ? rum.aroma.join(" • ") : "",
                    barrels: Array.isArray(rum.barrels) ? rum.barrels : [],
                    country: typeof rum.country === "string" ? rum.country : ""
                });
            });
        });
    }

    if (type === "tequilas" || type === "all") {
        const tequilas = filterByGroups(data.tequilas);
        tequilas.forEach(tequila => {
            if (!Array.isArray(tequila.information)) return;
            tequila.information.forEach(info => {
                questions.push({
                    question: info,
                    answer: tequila.name,
                    category: "tequila",
                    aroma: Array.isArray(tequila.aroma) ? tequila.aroma.join(" • ") : "",
                    barrels: Array.isArray(tequila.barrels) ? tequila.barrels : [],
                    country: typeof tequila.country === "string" ? tequila.country : ""
                });
            });
        });
    }

    if (questions.length === 0) {
        alert("Nie ma żadnych pytań dla obecnych ustawień.");
        return;
    }

    shuffle(questions);

    if (questionCount !== "all") {
        questions = questions.slice(0, Math.min(Number(questionCount), questions.length));
    }

    if (type === "distilleries") quizNameElement.textContent = "Destylarnie";
    else if (type === "whiskies") quizNameElement.textContent = "Whisky";
    else if (type === "gins") quizNameElement.textContent = "Giny";
    else if (type === "liquers") quizNameElement.textContent = "Likiery";
    else if (type === "rums") quizNameElement.textContent = "Rumy";
    else if (type === "tequilas") quizNameElement.textContent = "Tequila";
    else quizNameElement.textContent = "Wszystko";

    menuScreen.classList.add("hidden");
    homeScreen.classList.add("hidden");
    settingsScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");
    quizScreen.classList.remove("hidden");

    totalQuestionsElement.textContent = questions.length;
    showQuestion();
}

function startFlashcards(type) {
    flashcards = filterByGroups(getLibraryItems(type));

    if (flashcards.length === 0) {
        alert("Nie ma żadnych fiszek dla obecnych ustawień.");
        return;
    }

    shuffle(flashcards);
    if (questionCount !== "all") {
        flashcards = flashcards.slice(0, Math.min(Number(questionCount), flashcards.length));
    }

    currentFlashcard = 0;
    homeScreen.classList.add("hidden");
    menuScreen.classList.add("hidden");
    settingsScreen.classList.add("hidden");
    flashcardsScreen.classList.remove("hidden");
    flashcardTotalElement.textContent = flashcards.length;
    renderFlashcard();
}

function renderFlashcard() {
    const item = flashcards[currentFlashcard];
    flashcardName.textContent = item.name;
    flashcardName.setAttribute("aria-expanded", "false");
    flashcardDetails.innerHTML = "";
    flashcardDetails.appendChild(createLibraryItemElement(item));
    flashcardDetails.classList.add("hidden");
    flashcardToggle.textContent = "Pokaż informacje";
    flashcardToggle.disabled = false;
    flashcardNext.disabled = false;
    flashcardCurrentElement.textContent = currentFlashcard + 1;
}

function toggleFlashcardDetails() {
    const isVisible = !flashcardDetails.classList.contains("hidden");
    flashcardDetails.classList.toggle("hidden", isVisible);
    flashcardName.setAttribute("aria-expanded", String(!isVisible));
    flashcardToggle.textContent = isVisible ? "Pokaż informacje" : "Ukryj informacje";
}

function getProcessLabel(process) {
    switch (process) {
        case "maturation": return "dojrzewanie";
        case "part maturation": return "część dojrzewania";
        case "finish": return "finisz";
        case "char": return "stopień wypalenia";
        default: return process || "";
    }
}

function getMashName(type) {
    const dictionary = {
        "Corn": "Kukurydza",
        "Rye": "Żyto",
        "Malted Barley": "Słodowany jęczmień",
        "Wheat": "Pszenica",
        "Red winter wheat": "Czerwona pszenica ozima"
    };
    return dictionary[type] || type;
}


// ======================================================
// WYŚWIETLENIE PYTANIA
// ======================================================

function showNormalMode(current) {
    answersContainer.classList.remove("hidden");
    expertAnswerContainer.classList.add("hidden");
    expertInput.value = "";
    expertFeedback.textContent = "";
    createAnswers(current);
}

function showExpertMode(current) {
    answersContainer.classList.add("hidden");
    expertAnswerContainer.classList.remove("hidden");
    expertInput.value = "";
    expertFeedback.textContent = "";
    expertInput.className = "";
    createExpertSuggestions(current);
    expertInput.focus();
}

function createExpertSuggestions(currentQuestionData) {
    expertSuggestions.innerHTML = "";
    let sourceData = [];

    if (currentQuestionData.category === "distillery") sourceData = filterByGroups(data.distilleries);
    else if (currentQuestionData.category === "whisky") sourceData = filterByGroups(data.whiskies);
    else if (currentQuestionData.category === "gin") sourceData = filterByGroups(data.gins);
    else if (currentQuestionData.category === "liquer") sourceData = filterByGroups(data.liquers);
    else if (currentQuestionData.category === "rum") sourceData = filterByGroups(data.rums);
    else if (currentQuestionData.category === "tequila") sourceData = filterByGroups(data.tequilas);

    const names = sourceData.map(item => item.name);
    names.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        expertSuggestions.appendChild(option);
    });
}

function showQuestion() {
    if (currentQuestion >= questions.length) {
        finishQuiz();
        return;
    }

    const current = questions[currentQuestion];
    questionElement.textContent = current.question;

    if ((current.category === "whisky" || current.category === "rum" || current.category === "tequila") && current.aroma) {
        aromaElement.textContent = current.aroma;
        aromaElement.classList.remove("hidden");
    } else {
        aromaElement.textContent = "";
        aromaElement.classList.add("hidden");
    }

    if ((current.category === "whisky" || current.category === "rum" || current.category === "tequila") && Array.isArray(current.barrels) && current.barrels.length > 0) {
        barrelsElement.innerHTML = "";
        const title = document.createElement("div");
        title.classList.add("barrels-title");
        title.textContent = "Beczki";
        barrelsElement.appendChild(title);

        current.barrels.forEach(barrel => {
            const barrelElement = document.createElement("div");
            barrelElement.classList.add("barrel");

            const typeElement = document.createElement("span");
            typeElement.classList.add("barrel-type");
            typeElement.textContent = barrel.type;

            const processElement = document.createElement("span");
            processElement.classList.add("barrel-process");
            processElement.textContent = getProcessLabel(barrel.process);

            barrelElement.appendChild(typeElement);
            barrelElement.appendChild(processElement);

            if (typeof barrel.time === "string" && barrel.time.trim()) {
                const timeElement = document.createElement("span");
                timeElement.classList.add("barrel-process");
                timeElement.textContent = barrel.time;
                barrelElement.appendChild(timeElement);
            }

            barrelsElement.appendChild(barrelElement);
        });

        barrelsElement.classList.remove("hidden");
    } else {
        barrelsElement.innerHTML = "";
        barrelsElement.classList.add("hidden");
    }

    // ==================================================
    // ZACIER (MASH BILL)
    // ==================================================
    if (current.category === "whisky" && Array.isArray(current.mash) && current.mash.length > 0) {
        mashElement.innerHTML = "";
        
        const title = document.createElement("div");
        title.classList.add("barrels-title"); 
        title.textContent = "Zacier (Mash bill)";
        mashElement.appendChild(title);

        current.mash.forEach(m => {
            const mashItem = document.createElement("div");
            mashItem.classList.add("barrel"); // Używamy tych samych stylów co dla beczek
            
            const typeEl = document.createElement("span");
            typeEl.classList.add("barrel-type");
            typeEl.textContent = getMashName(m.type);

            const percEl = document.createElement("span");
            percEl.classList.add("barrel-process");
            percEl.textContent = `${(m.percentage * 100).toFixed(0)}%`;

            mashItem.appendChild(typeEl);
            mashItem.appendChild(percEl);
            mashElement.appendChild(mashItem);
        });
        
        mashElement.classList.remove("hidden");
    } else {
        mashElement.innerHTML = "";
        mashElement.classList.add("hidden");
    }

    if ((current.category === "rum" || current.category === "tequila") && current.country) {
        countryElement.textContent = `Kraj: ${current.country}`;
        countryElement.classList.remove("hidden");
    } else {
        countryElement.textContent = "";
        countryElement.classList.add("hidden");
    }

    currentQuestionElement.textContent = currentQuestion + 1;

    if (expertMode) showExpertMode(current);
    else showNormalMode(current);
}


// ======================================================
// TWORZENIE ODPOWIEDZI
// ======================================================

function createAnswers(currentQuestionData) {
    answersElement.innerHTML = "";
    let sourceData = [];

    if (currentQuestionData.category === "distillery") sourceData = filterByGroups(data.distilleries);
    else if (currentQuestionData.category === "whisky") sourceData = filterByGroups(data.whiskies);
    else if (currentQuestionData.category === "gin") sourceData = filterByGroups(data.gins);
    else if (currentQuestionData.category === "liquer") sourceData = filterByGroups(data.liquers);
    else if (currentQuestionData.category === "rum") sourceData = filterByGroups(data.rums);
    else if (currentQuestionData.category === "tequila") sourceData = filterByGroups(data.tequilas);

    let possibleAnswers = sourceData.map(item => item.name);
    possibleAnswers = possibleAnswers.filter(name => name !== currentQuestionData.answer);
    shuffle(possibleAnswers);
    const wrongAnswers = possibleAnswers.slice(0, 3);
    const answers = [currentQuestionData.answer, ...wrongAnswers];
    shuffle(answers);

    answers.forEach(answer => {
        const button = document.createElement("button");
        button.type = "button";
        button.classList.add("answer");
        button.textContent = answer;

        button.addEventListener("click", () => {
            checkAnswer(answer, currentQuestionData.answer, button);
        });

        answersElement.appendChild(button);
    });
}


// ======================================================
// SPRAWDZENIE ODPOWIEDZI
// ======================================================

function checkExpertAnswer() {
    const current = questions[currentQuestion];
    const userAnswer = normalizeAnswer(expertInput.value);
    const correctAnswer = normalizeAnswer(current.answer);

    expertInput.disabled = true;
    expertSubmit.disabled = true;

    if (userAnswer === correctAnswer) {
        expertInput.classList.add("expert-correct");
        expertFeedback.textContent = "Poprawna odpowiedź!";
        expertFeedback.className = "expert-feedback correct-feedback";
        score++;

        setTimeout(() => {
            currentQuestion++;
            expertInput.disabled = false;
            expertSubmit.disabled = false;
            showQuestion();
        }, 800);
    } else {
        expertInput.classList.add("expert-wrong");
        expertFeedback.innerHTML = `Prawidłowa odpowiedź: <strong>${escapeHtml(current.answer)}</strong>`;
        expertFeedback.className = "expert-feedback wrong-feedback";

        setTimeout(() => {
            currentQuestion++;
            expertInput.disabled = false;
            expertSubmit.disabled = false;
            showQuestion();
        }, 1800);
    }
}

function normalizeAnswer(value) {
    return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}

function checkAnswer(selectedAnswer, correctAnswer, clickedButton) {
    const buttons = document.querySelectorAll(".answer");
    buttons.forEach(button => { button.disabled = true; });

    if (selectedAnswer === correctAnswer) {
        clickedButton.classList.add("correct");
        score++;
    } else {
        clickedButton.classList.add("wrong");
        buttons.forEach(button => {
            if (button.textContent === correctAnswer) button.classList.add("correct");
        });
    }

    setTimeout(() => {
        currentQuestion++;
        showQuestion();
    }, 800);
}

expertForm.addEventListener("submit", event => {
    event.preventDefault();
    checkExpertAnswer();
});


// ======================================================
// KONIEC QUIZU
// ======================================================

function finishQuiz() {
    quizScreen.classList.add("hidden");
    resultScreen.classList.remove("hidden");
    finalScoreElement.textContent = `${score} / ${questions.length}`;
}


// ======================================================
// BIBLIOTEKA - OBSŁUGA
// ======================================================

if (libraryButton) {
    libraryButton.addEventListener("click", () => {
        homeScreen.classList.add("hidden");
        libraryScreen.classList.remove("hidden");
        populateLibraryGroups();
        renderLibrary();
    });
}

if (closeLibraryButton) {
    closeLibraryButton.addEventListener("click", () => {
        libraryScreen.classList.add("hidden");
        homeScreen.classList.remove("hidden");
    });
}

if (libTypeFilter) {
    libTypeFilter.addEventListener("change", renderLibrary);
}

if (libGroupFilter) {
    libGroupFilter.addEventListener("change", renderLibrary);
}

function populateLibraryGroups() {
    const groups = getAvailableGroups();
    libGroupFilter.innerHTML = '<option value="all">Wszystkie koncerny</option>';
    groups.forEach(g => {
        const opt = document.createElement("option");
        opt.value = g;
        opt.textContent = g;
        libGroupFilter.appendChild(opt);
    });
}

function getLibraryItems(type = "all") {
    const categories = [
        ["distilleries", "Destylarnia", data.distilleries],
        ["whiskies", "Whisky", data.whiskies],
        ["gins", "Gin", data.gins],
        ["liquers", "Likier", data.liquers],
        ["rums", "Rum", data.rums],
        ["tequilas", "Tequila", data.tequilas]
    ];

    return categories
        .filter(([category]) => type === "all" || type === category)
        .flatMap(([category, label, items]) => items.map(item => ({
            ...item,
            _category: label,
            _type: category
        })));
}

function createLibraryItemElement(item) {
    const element = document.createElement("div");
    element.className = "library-item";

    let html = `<h3>${item.name} <small>(${item._category})</small></h3>`;
    html += `<div class="library-tags">`;
    if (item.group) html += `<span>🏢 ${item.group}</span>`;
    if (item.country) html += `<span>🌍 ${item.country}</span>`;
    if (item.region && item.region !== "Blended") html += `<span>📍 ${item.region}</span>`;
    if (item.type) html += `<span>🥃 ${item.type}</span>`;
    if (Array.isArray(item.aroma) && item.aroma.length > 0) {
        html += `<span class="aroma"> ${item.aroma.join(" ")}</span>`;
    }
    if (Array.isArray(item.barrels) && item.barrels.length > 0) {
        const barrelsList = item.barrels.map(barrel => {
            const process = getProcessLabel(barrel.process);
            const details = [process, barrel.time].filter(Boolean).join(", ");
            return details ? `${barrel.type} (${details})` : barrel.type;
        }).join(" + ");
        html += `<span class="barrels">🛢️ ${barrelsList}</span>`;
    }
    if (Array.isArray(item.Mash) && item.Mash.length > 0) {
        const mashList = item.Mash.map(mash => `${getMashName(mash.type)}: ${(mash.percentage * 100).toFixed(0)}%`).join(" | ");
        html += `<span class="mash-tag">🌾 ${mashList}</span>`;
    }
    html += `</div><ul class="library-info">`;

    if (Array.isArray(item.information)) {
        item.information.forEach(info => { html += `<li>${info}</li>`; });
    }
    if (Array.isArray(item.additionalInfo)) {
        item.additionalInfo.forEach(info => { html += `<li class="additional-info">💡 ${info}</li>`; });
    }

    html += `</ul>`;
    element.innerHTML = html;
    return element;
}

function renderLibrary() {
    if (!libraryList) return;

    libraryList.innerHTML = "";
    const group = libGroupFilter.value;
    let items = getLibraryItems(libTypeFilter.value);

    if (group !== "all") items = items.filter(item => item.group === group);
    items.sort((a, b) => a.name.localeCompare(b.name));

    if (items.length === 0) {
        libraryList.innerHTML = "<p style='text-align:center; color:#999; margin-top:20px;'>Brak wyników dla wybranych filtrów.</p>";
        return;
    }

    items.forEach(item => libraryList.appendChild(createLibraryItemElement(item)));
}


// ======================================================
// OBSŁUGA PRZYCISKÓW MENU I USTAWIENI
// ======================================================

function openSettings(returnScreen) {
    settingsReturnScreen = returnScreen;
    returnScreen.classList.add("hidden");
    document.querySelector("#settings .settings-description").textContent = currentMode === "flashcards"
        ? "Wybierz koncerny, z których mają pochodzić fiszki."
        : "Wybierz koncerny, z których mają pochodzić pytania.";
    document.querySelector(".question-settings h3").textContent = currentMode === "flashcards"
        ? "Liczba fiszek"
        : "Liczba pytań";
    renderGroupOptions();
    renderQuestionCountOptions();
    renderExpertMode();
    document.querySelector(".expert-settings").classList.toggle("hidden", currentMode === "flashcards");
    settingsScreen.classList.remove("hidden");
}

document.getElementById("settings-button").addEventListener("click", () => {
    currentMode = "quiz";
    openSettings(homeScreen);
});

document.getElementById("mode-settings-button").addEventListener("click", () => {
    openSettings(menuScreen);
});

document.getElementById("close-settings").addEventListener("click", () => {
    settingsScreen.classList.add("hidden");
    settingsReturnScreen.classList.remove("hidden");
});

function openCategoryMenu(mode) {
    currentMode = mode;
    homeScreen.classList.add("hidden");
    menuScreen.classList.remove("hidden");
    document.getElementById("mode-subtitle").textContent = mode === "flashcards"
        ? "Wybierz kategorię fiszek"
        : "Wybierz kategorię quizu";
    document.querySelectorAll(".quiz-option").forEach(button => {
        const category = button.dataset.quiz;
        let description;

        if (mode === "flashcards") {
            description = category === "distilleries"
                ? "Odkrywaj informacje o destylarni"
                : category === "all"
                    ? "Wszystkie dostępne fiszki"
                    : "Odkrywaj informacje o butelce";
        } else if (category === "distilleries") {
            description = "Rozpoznaj destylarnię na podstawie informacji";
        } else if (category === "all") {
            description = "Wszystkie dostępne kategorie";
        } else {
            description = "Rozpoznaj butelkę na podstawie informacji";
        }

        button.querySelector("small").textContent = description;
    });
}

document.getElementById("quiz-home-button").addEventListener("click", () => openCategoryMenu("quiz"));
document.getElementById("flashcards-home-button").addEventListener("click", () => openCategoryMenu("flashcards"));

document.getElementById("close-quiz-menu").addEventListener("click", () => {
    menuScreen.classList.add("hidden");
    homeScreen.classList.remove("hidden");
});

document.querySelectorAll(".quiz-option").forEach(button => {
    button.addEventListener("click", () => {
        if (currentMode === "flashcards") startFlashcards(button.dataset.quiz);
        else startQuiz(button.dataset.quiz);
    });
});

document.getElementById("flashcards-back-button").addEventListener("click", () => {
    flashcardsScreen.classList.add("hidden");
    menuScreen.classList.remove("hidden");
});

flashcardName.addEventListener("click", toggleFlashcardDetails);
flashcardToggle.addEventListener("click", toggleFlashcardDetails);
flashcardNext.addEventListener("click", () => {
    currentFlashcard = (currentFlashcard + 1) % flashcards.length;
    renderFlashcard();
});

document.getElementById("back-button").addEventListener("click", () => {
    quizScreen.classList.add("hidden");
    menuScreen.classList.remove("hidden");
});

document.getElementById("select-all-groups").addEventListener("click", () => {
    allGroups = true;
    selectedGroups = [];
    saveSettings();
    renderGroupOptions();
});

document.getElementById("clear-groups").addEventListener("click", () => {
    allGroups = true;
    selectedGroups = [];
    saveSettings();
    renderGroupOptions();
});

document.getElementById("restart-button").addEventListener("click", () => {
    startQuiz(currentQuiz);
});

document.getElementById("menu-button").addEventListener("click", () => {
    resultScreen.classList.add("hidden");
    homeScreen.classList.remove("hidden");
});

// ======================================================
// SHUFFLE
// ======================================================

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


// ======================================================
// START APLIKACJI
// ======================================================

async function initializeApp() {
    await loadData();
    loadSettings();
    renderGroupOptions();
    renderQuestionCountOptions();
    renderExpertMode();
}

initializeApp();
