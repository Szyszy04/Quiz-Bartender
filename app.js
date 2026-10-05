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
    rums: []
};

let questions = [];
let currentQuestion = 0;
let score = 0;
let currentQuiz = null;
let selectedGroups = [];
let allGroups = true;
let questionCount = 20;
let expertMode = false;


// ======================================================
// ELEMENTY HTML
// ======================================================

const menuScreen = document.getElementById("menu");
const settingsScreen = document.getElementById("settings");
const quizScreen = document.getElementById("quiz");
const resultScreen = document.getElementById("result");
const libraryScreen = document.getElementById("library");

const libraryButton = document.getElementById("library-button");
const closeLibraryButton = document.getElementById("close-library");
const libTypeFilter = document.getElementById("lib-type-filter");
const libGroupFilter = document.getElementById("lib-group-filter");
const libraryList = document.getElementById("library-list");

const questionElement = document.getElementById("question");
const aromaElement = document.getElementById("aroma");
const barrelsElement = document.getElementById("barrels");
const countryElement = document.getElementById("country");
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
    
    [...data.distilleries, ...data.whiskies, ...data.gins, ...data.liquers, ...data.rums].forEach(item => {
        if (typeof item.group === "string" && item.group.trim() !== "") {
            groups.add(item.group.trim());
        }
    });

    return [...groups].sort((a, b) => a.localeCompare(b));
}

function getDisplayGroups() {
    const counts = new Map();

    [...data.distilleries, ...data.whiskies, ...data.gins, ...data.liquers, ...data.rums].forEach(item => {
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
                    barrels: Array.isArray(whisky.barrels) ? whisky.barrels : []
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
    else quizNameElement.textContent = "Wszystko";

    menuScreen.classList.add("hidden");
    settingsScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");
    quizScreen.classList.remove("hidden");

    totalQuestionsElement.textContent = questions.length;
    showQuestion();
}

function getProcessLabel(process) {
    switch (process) {
        case "maturation": return "dojrzewanie";
        case "part maturation": return "część dojrzewania";
        case "finish": return "finish";
        default: return process || "";
    }
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

    if ((current.category === "whisky" || current.category === "rum") && current.aroma) {
        aromaElement.textContent = current.aroma;
        aromaElement.classList.remove("hidden");
    } else {
        aromaElement.textContent = "";
        aromaElement.classList.add("hidden");
    }

    if ((current.category === "whisky" || current.category === "rum") && Array.isArray(current.barrels) && current.barrels.length > 0) {
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
            barrelsElement.appendChild(barrelElement);
        });

        barrelsElement.classList.remove("hidden");
    } else {
        barrelsElement.innerHTML = "";
        barrelsElement.classList.add("hidden");
    }

    if (current.category === "rum" && current.country) {
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
        menuScreen.classList.add("hidden");
        libraryScreen.classList.remove("hidden");
        populateLibraryGroups();
        renderLibrary();
    });
}

if (closeLibraryButton) {
    closeLibraryButton.addEventListener("click", () => {
        libraryScreen.classList.add("hidden");
        menuScreen.classList.remove("hidden");
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

function renderLibrary() {
    if (!libraryList) return;
    
    libraryList.innerHTML = "";
    
    const type = libTypeFilter.value;
    const group = libGroupFilter.value;
    let items = [];

    if (type === "all" || type === "distilleries") {
        items = items.concat(data.distilleries.map(i => ({ ...i, _category: 'Destylarnia' })));
    }
    if (type === "all" || type === "whiskies") {
        items = items.concat(data.whiskies.map(i => ({ ...i, _category: 'Whisky' })));
    }
    if (type === "all" || type === "gins") {
        items = items.concat(data.gins.map(i => ({ ...i, _category: 'Gin' })));
    }
    if (type === "all" || type === "liquers") {
        items = items.concat(data.liquers.map(i => ({ ...i, _category: 'Likier' })));
    }
    if (type === "all" || type === "rums") {
        items = items.concat(data.rums.map(i => ({ ...i, _category: 'Rum' })));
    }

    if (group !== "all") {
        items = items.filter(i => i.group === group);
    }

    items.sort((a, b) => a.name.localeCompare(b.name));

    if (items.length === 0) {
        libraryList.innerHTML = "<p style='text-align:center; color:#999; margin-top:20px;'>Brak wyników dla wybranych filtrów.</p>";
        return;
    }

    items.forEach(item => {
        const div = document.createElement("div");
        div.className = "library-item";

        let html = `<h3>${item.name} <small>(${item._category})</small></h3>`;
        html += `<div class="library-tags">`;
        if (item.group) html += `<span>🏢 ${item.group}</span>`;
        if (item.country) html += `<span>🌍 ${item.country}</span>`;
        if (item.region && item.region !== "Blended") html += `<span>📍 ${item.region}</span>`;
        if (item.type) html += `<span>🥃 ${item.type}</span>`;
        if (item.aroma && item.aroma.length > 0) {
            html += `<span class="aroma">${item.aroma.join(" ")}</span>`;
        }
        
// Zmiana: dodanie etykiety procesu (np. dojrzewanie / finish) obok nazwy beczki
        if (item.barrels && Array.isArray(item.barrels) && item.barrels.length > 0) {
            const barrelsList = item.barrels.map(b => {
                const process = getProcessLabel(b.process);
                return process ? `${b.type} (${process})` : b.type;
            }).join(" + ");
            html += `<span class="barrels">🛢️ ${barrelsList}</span>`;
        }
        
        html += `</div>`;

        html += `<ul class="library-info">`;
        
        if (item.information) {
            item.information.forEach(info => {
                html += `<li>${info}</li>`;
            });
        }
        
        if (item.additionalInfo && item.additionalInfo.length > 0) {
            item.additionalInfo.forEach(info => {
                html += `<li class="additional-info">💡 ${info}</li>`;
            });
        }
        
        html += `</ul>`;
        
        div.innerHTML = html;
        libraryList.appendChild(div);
    });
}


// ======================================================
// OBSŁUGA PRZYCISKÓW MENU I USTAWIENI
// ======================================================

document.getElementById("settings-button").addEventListener("click", () => {
    menuScreen.classList.add("hidden");
    renderGroupOptions();
    renderQuestionCountOptions();
    renderExpertMode();
    settingsScreen.classList.remove("hidden");
});

document.getElementById("close-settings").addEventListener("click", () => {
    settingsScreen.classList.add("hidden");
    menuScreen.classList.remove("hidden");
});

document.querySelectorAll(".quiz-option").forEach(button => {
    button.addEventListener("click", () => {
        const quizType = button.dataset.quiz;
        startQuiz(quizType);
    });
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
    menuScreen.classList.remove("hidden");
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
