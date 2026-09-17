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
    gins: []
};

let questions = [];
let currentQuestion = 0;
let score = 0;
let currentQuiz = null;
let selectedGroups = [];
let questionCount = 20;
let expertMode = false;


// ======================================================
// ELEMENTY HTML
// ======================================================

const menuScreen = document.getElementById("menu");
const settingsScreen = document.getElementById("settings");
const quizScreen = document.getElementById("quiz");
const resultScreen = document.getElementById("result");

const questionElement = document.getElementById("question");
const aromaElement = document.getElementById("aroma");
const barrelsElement = document.getElementById("barrels");
const answersElement = document.getElementById("answers");

const currentQuestionElement =
    document.getElementById("current-question");

const totalQuestionsElement =
    document.getElementById("total-questions");

const quizNameElement =
    document.getElementById("quiz-name");

const finalScoreElement =
    document.getElementById("final-score");

const groupOptionsElement =
    document.getElementById("group-options");

const noGroupsMessageElement =
    document.getElementById("no-groups-message");

const expertModeElement =
    document.getElementById("expert-mode");

const answersContainer =
    document.getElementById("answers");

const expertAnswerContainer =
    document.getElementById("expert-answer");

const expertForm =
    document.getElementById("expert-form");

const expertInput =
    document.getElementById("expert-input");

const expertSuggestions =
    document.getElementById("expert-suggestions");

const expertSubmit =
    document.getElementById("expert-submit");

const expertFeedback =
    document.getElementById("expert-feedback");


// ======================================================
// WCZYTANIE DANYCH JSON
// ======================================================

async function loadData() {

    try {

        const response = await fetch(DATA_FILE);

        if (!response.ok) {

            throw new Error(
                `Nie udało się pobrać ${DATA_FILE}. HTTP ${response.status}`
            );

        }

        data = await response.json();


        // Zabezpieczenie

        if (!Array.isArray(data.distilleries)) {
            data.distilleries = [];
        }

        if (!Array.isArray(data.whiskies)) {
            data.whiskies = [];
        }

        if (!Array.isArray(data.gins)) {
            data.gins = [];
        }


        console.log("Dane załadowane:");
        console.log(data);


    } catch (error) {

        console.error("Błąd ładowania danych:", error);

        alert(
            "Nie udało się załadować dane.json.\n\n" +
            "Uruchom aplikację przez Live Server."
        );

    }

}


// ======================================================
// WCZYTANIE USTAWIEŃ
// ======================================================

function loadSettings() {

    const saved =
        localStorage.getItem(SETTINGS_KEY);


    if (!saved) {

        selectedGroups = [];

        questionCount = 20;

        expertMode = false;

        return;

    }


    try {

        const parsed =
            JSON.parse(saved);


        // Grupy

        if (Array.isArray(parsed.groups)) {

            selectedGroups =
                parsed.groups;

        } else {

            selectedGroups = [];

        }


        // Liczba pytań

        if (
            parsed.questionCount === "all" ||
            [10, 20, 30, 40, 50].includes(
                Number(parsed.questionCount)
            )
        ) {

            questionCount =
                parsed.questionCount;

        } else {

            questionCount = 20;

        }


        // Tryb Expert

        expertMode =
            parsed.expertMode === true;


    } catch (error) {

        console.error(
            "Błąd odczytu ustawień:",
            error
        );

        selectedGroups = [];

        questionCount = 20;

        expertMode = false;

    }

}

function renderExpertMode() {

    expertModeElement.checked =
        expertMode;

}

function renderQuestionCountOptions() {

    const options =
        document.querySelectorAll(
            'input[name="question-count"]'
        );


    options.forEach(option => {

        option.checked =
            String(option.value) ===
            String(questionCount);


        option.addEventListener(
            "change",
            () => {

                if (!option.checked) {
                    return;
                }


                if (option.value === "all") {

                    questionCount = "all";

                } else {

                    questionCount =
                        Number(option.value);

                }


                saveSettings();

            }
        );

    });

}


// ======================================================
// ZAPIS USTAWIEŃ
// ======================================================

function saveSettings() {

    const settings = {

        groups: selectedGroups,

        questionCount: questionCount,

        expertMode: expertMode

    };


    localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
    );

}


// ======================================================
// POBRANIE WSZYSTKICH GRUP
// ======================================================

function getAvailableGroups() {

    const groups = new Set();


    data.distilleries.forEach(item => {

        if (
            typeof item.group === "string" &&
            item.group.trim() !== ""
        ) {

            groups.add(item.group.trim());

        }

    });

    data.whiskies.forEach(item => {

        if (
            typeof item.group === "string" &&
            item.group.trim() !== ""
        ) {

            groups.add(item.group.trim());

        }

    });

    data.gins.forEach(item => {

        if (
            typeof item.group === "string" &&
            item.group.trim() !== ""
        ) {

            groups.add(item.group.trim());

        }

    });

    return [...groups].sort((a, b) =>
        a.localeCompare(b)
    );

}


// ======================================================
// WYŚWIETLENIE USTAWIEŃ
// ======================================================

function renderGroupOptions() {

    groupOptionsElement.innerHTML = "";

    const groups = [
        "Bacardi-Martini",
        "Brown-Forman",
        "Campari Group",
        "Diageo",
        "Edrington",
        "LVMH",
        "Pernod Ricard",
        "Suntory Global Spirits",
        "William Grant & Sons"
    ];

    // Brak grup

    if (groups.length === 0) {

        noGroupsMessageElement.classList.remove(
            "hidden"
        );

        return;

    }


    noGroupsMessageElement.classList.add(
        "hidden"
    );


    // Usuwamy nieistniejące grupy

    selectedGroups =
        selectedGroups.filter(group =>
            groups.includes(group)
        );


    groups.forEach(group => {

        const label =
            document.createElement("label");

        label.classList.add(
            "group-option"
        );


        const checkbox =
            document.createElement("input");

        checkbox.type = "checkbox";

        checkbox.value = group;

        checkbox.checked =
            selectedGroups.includes(group);


        checkbox.addEventListener(
            "change",
            () => {

                if (checkbox.checked) {

                    if (!selectedGroups.includes(group)) {

                        selectedGroups.push(group);

                    }

                } else {

                    selectedGroups =
                        selectedGroups.filter(
                            item => item !== group
                        );

                }


                saveSettings();

            }
        );

        expertModeElement.addEventListener(
            "change",
            () => {

                expertMode =
                    expertModeElement.checked;


                saveSettings();

            }
        );


        const text =
            document.createElement("span");

        text.textContent = group;


        label.appendChild(checkbox);
        label.appendChild(text);

        groupOptionsElement.appendChild(label);

    });


    saveSettings();

}


// ======================================================
// FILTROWANIE
// ======================================================

function filterByGroups(items) {

    // Jeżeli nic nie zaznaczono,
    // używamy wszystkich danych.

    if (selectedGroups.length === 0) {

        return items;

    }


    return items.filter(item => {

        return selectedGroups.includes(
            item.group
        );

    });

}


// ======================================================
// START QUIZU
// ======================================================

function startQuiz(type) {

    console.log(
        "Uruchamianie quizu:",
        type
    );


    currentQuiz = type;

    questions = [];

    currentQuestion = 0;

    score = 0;


    // ==================================================
    // DESTYLARNIE
    // ==================================================

    if (
        type === "distilleries" ||
        type === "all"
    ) {

        const distilleries =
            filterByGroups(
                data.distilleries
            );


        console.log(
            "Destylarnie dostępne w quizie:",
            distilleries
        );


        distilleries.forEach(distillery => {

            if (
                !Array.isArray(
                    distillery.information
                )
            ) {

                return;

            }


            distillery.information.forEach(info => {

                questions.push({

                    question: info,

                    answer:
                        distillery.name,

                    category:
                        "distillery"

                });

            });

        });

    }


    // ==================================================
    // WHISKY
    // ==================================================

    if (
        type === "whiskies" ||
        type === "all"
    ) {

        const whiskies =
            filterByGroups(
                data.whiskies
            );


        whiskies.forEach(whisky => {

            if (
                !Array.isArray(
                    whisky.information
                )
            ) {

                return;

            }


            whisky.information.forEach(info => {

                questions.push({

                    question: info,

                    answer: whisky.name,

                    category: "whisky",

                    aroma: Array.isArray(whisky.aroma)
                        ? whisky.aroma.join(" • ")
                        : "",

                    barrels: Array.isArray(whisky.barrels)
                        ? whisky.barrels
                        : []

                });

            });

        });

    }


        // ==================================================
    // WHISKY
    // ==================================================

    if (
        type === "gins" ||
        type === "all"
    ) {

        const gins =
            filterByGroups(
                data.gins
            );


        gins.forEach(gin => {

            if (
                !Array.isArray(
                    gin.information
                )
            ) {

                return;

            }


            gin.information.forEach(info => {

                questions.push({

                    question: info,

                    answer: gin.name,

                    category: "gin",

                });

            });

        });

    }


    // ==================================================
    // SPRAWDZENIE PYTAŃ
    // ==================================================

    console.log(
        "Liczba pytań:",
        questions.length
    );


    if (questions.length === 0) {

        alert(
            "Nie ma żadnych pytań dla obecnych ustawień."
        );

        return;

    }


    // ==================================================
    // LOSOWANIE
    // ==================================================

    shuffle(questions);

    // ==================================================
    // WYBÓR LICZBY PYTAŃ
    // ==================================================

    if (questionCount !== "all") {

        questions =
            questions.slice(
                0,
                Math.min(
                    Number(questionCount),
                    questions.length
                )
            );

    }


    // ==================================================
    // NAZWA QUIZU
    // ==================================================

    if (type === "distilleries") {

        quizNameElement.textContent =
            "Destylarnie";

    }

    else if (type === "whiskies") {

        quizNameElement.textContent =
            "Whisky";

    }

    else if (type === "gins") {

        quizNameElement.textContent =
            "Giny";

    }

    else {

        quizNameElement.textContent =
            "Wszystko";

    }


    // ==================================================
    // ZMIANA EKRANU
    // ==================================================

    menuScreen.classList.add("hidden");

    settingsScreen.classList.add("hidden");

    resultScreen.classList.add("hidden");

    quizScreen.classList.remove("hidden");


    totalQuestionsElement.textContent =
        questions.length;


    showQuestion();

}

// ======================================================
// Tlumaczenie rodzaju procesu beczek
// ======================================================

function getProcessLabel(process) {

    switch (process) {

        case "maturation":
            return "dojrzewanie";

        case "part maturation":
            return "część dojrzewania";

        case "finish":
            return "finish";

        default:
            return process || "";

    }

}

// ======================================================
// WYŚWIETLENIE PYTANIA
// ======================================================

function showNormalMode(current) {

    answersContainer.classList.remove(
        "hidden"
    );

    expertAnswerContainer.classList.add(
        "hidden"
    );


    expertInput.value = "";

    expertFeedback.textContent = "";


    createAnswers(current);

}

function showExpertMode(current) {

    answersContainer.classList.add(
        "hidden"
    );

    expertAnswerContainer.classList.remove(
        "hidden"
    );


    expertInput.value = "";

    expertFeedback.textContent = "";


    expertInput.className = "";


    createExpertSuggestions(
        current
    );


    expertInput.focus();

}

function createExpertSuggestions(
    currentQuestionData
) {

    expertSuggestions.innerHTML = "";


    let sourceData = [];


    // Destylarnie

    if (
        currentQuestionData.category ===
        "distillery"
    ) {

        sourceData =
            filterByGroups(
                data.distilleries
            );

    }


    // Whisky

    else if (
        currentQuestionData.category ===
        "whisky"
    ) {

        sourceData =
            filterByGroups(
                data.whiskies
            );

    }

    // Giny

    else if (
        currentQuestionData.category ===
        "gin"
    ) {

        sourceData =
            filterByGroups(
                data.gins
            );
    }


    const names =
        sourceData.map(
            item => item.name
        );


    names.forEach(name => {

        const option =
            document.createElement(
                "option"
            );

        option.value = name;

        expertSuggestions.appendChild(
            option
        );

    });

}

function showQuestion() {

    if (
        currentQuestion >=
        questions.length
    ) {

        finishQuiz();

        return;

    }


    const current =
        questions[currentQuestion];


    questionElement.textContent =
        current.question;


    // ==================================================
    // AROMATY WHISKY
    // ==================================================

    if (
        current.category === "whisky" &&
        current.aroma
    ) {

        aromaElement.textContent =
            current.aroma;

        aromaElement.classList.remove(
            "hidden"
        );

    } else {

        aromaElement.textContent = "";

        aromaElement.classList.add(
            "hidden"
        );

    }


    // ==================================================
    // BECZKI WHISKY
    // ==================================================

    if (
        current.category === "whisky" &&
        Array.isArray(current.barrels) &&
        current.barrels.length > 0
    ) {

        barrelsElement.innerHTML = "";

        const title =
            document.createElement("div");

        title.classList.add(
            "barrels-title"
        );

        title.textContent =
            "Beczki";

        barrelsElement.appendChild(
            title
        );


        current.barrels.forEach(barrel => {

            const barrelElement =
                document.createElement("div");

            barrelElement.classList.add(
                "barrel"
            );


            const typeElement =
                document.createElement("span");

            typeElement.classList.add(
                "barrel-type"
            );

            typeElement.textContent =
                barrel.type;


            const processElement =
                document.createElement("span");

            processElement.classList.add(
                "barrel-process"
            );

            processElement.textContent =
                getProcessLabel(
                    barrel.process
                );


            barrelElement.appendChild(
                typeElement
            );

            barrelElement.appendChild(
                processElement
            );


            barrelsElement.appendChild(
                barrelElement
            );

        });


        barrelsElement.classList.remove(
            "hidden"
        );

    } else {

        barrelsElement.innerHTML = "";

        barrelsElement.classList.add(
            "hidden"
        );

    }


    currentQuestionElement.textContent =
        currentQuestion + 1;


    // ==================================================
    // TRYB ODPOWIEDZI
    // ==================================================

    if (expertMode) {

        showExpertMode(
            current
        );

    } else {

        showNormalMode(
            current
        );

    }

}


// ======================================================
// TWORZENIE ODPOWIEDZI
// ======================================================

function createAnswers(
    currentQuestionData
) {

    answersElement.innerHTML = "";


    let sourceData = [];


    // ----------------------------------------------
    // DESTYLARNIE
    // ----------------------------------------------

    if (
        currentQuestionData.category ===
        "distillery"
    ) {

        sourceData =
            filterByGroups(
                data.distilleries
            );

    }


    // ----------------------------------------------
    // WHISKY
    // ----------------------------------------------

    else if (
        currentQuestionData.category ===
        "whisky"
    ) {

        sourceData =
            filterByGroups(
                data.whiskies
            );

    }

    // ----------------------------------------------
    // GINY
    // ----------------------------------------------

    else if (
        currentQuestionData.category ===
        "gin"
    ) {

        sourceData =
            filterByGroups(
                data.gins
            );

    }


    // ----------------------------------------------
    // LISTA ODPOWIEDZI
    // ----------------------------------------------

    let possibleAnswers =
        sourceData.map(
            item => item.name
        );


    // Usuwamy prawidłową odpowiedź

    possibleAnswers =
        possibleAnswers.filter(
            name =>
                name !==
                currentQuestionData.answer
        );


    shuffle(possibleAnswers);


    // Maksymalnie 3 błędne

    const wrongAnswers =
        possibleAnswers.slice(0, 3);


    const answers = [

        currentQuestionData.answer,

        ...wrongAnswers

    ];


    shuffle(answers);


    // ----------------------------------------------
    // PRZYCISKI
    // ----------------------------------------------

    answers.forEach(answer => {

        const button =
            document.createElement("button");


        button.type = "button";

        button.classList.add(
            "answer"
        );

        button.textContent =
            answer;


        button.addEventListener(
            "click",
            () => {

                checkAnswer(
                    answer,
                    currentQuestionData.answer,
                    button
                );

            }
        );


        answersElement.appendChild(
            button
        );

    });

}


// ======================================================
// SPRAWDZENIE ODPOWIEDZI
// ======================================================

function checkExpertAnswer() {

    const current =
        questions[currentQuestion];


    const userAnswer =
        normalizeAnswer(
            expertInput.value
        );


    const correctAnswer =
        normalizeAnswer(
            current.answer
        );


    // Blokujemy formularz

    expertInput.disabled = true;

    expertSubmit.disabled = true;


    // ==================================================
    // DOBRA ODPOWIEDŹ
    // ==================================================

    if (
        userAnswer ===
        correctAnswer
    ) {

        expertInput.classList.add(
            "expert-correct"
        );


        expertFeedback.textContent =
            "Poprawna odpowiedź!";


        expertFeedback.className =
            "expert-feedback correct-feedback";


        score++;


        setTimeout(() => {

            currentQuestion++;

            expertInput.disabled = false;

            expertSubmit.disabled = false;

            showQuestion();

        }, 800);

    }


    // ==================================================
    // ZŁA ODPOWIEDŹ
    // ==================================================

    else {

        expertInput.classList.add(
            "expert-wrong"
        );


        expertFeedback.innerHTML =
            `Prawidłowa odpowiedź: <strong>${escapeHtml(current.answer)}</strong>`;


        expertFeedback.className =
            "expert-feedback wrong-feedback";


        setTimeout(() => {

            currentQuestion++;

            expertInput.disabled = false;

            expertSubmit.disabled = false;

            showQuestion();

        }, 1800);

    }

}

function normalizeAnswer(value) {

    return value
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();

}

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;

}

function checkAnswer(
    selectedAnswer,
    correctAnswer,
    clickedButton
) {

    const buttons =
        document.querySelectorAll(
            ".answer"
        );


    buttons.forEach(button => {

        button.disabled = true;

    });


    if (
        selectedAnswer ===
        correctAnswer
    ) {

        clickedButton.classList.add(
            "correct"
        );

        score++;

    }

    else {

        clickedButton.classList.add(
            "wrong"
        );


        buttons.forEach(button => {

            if (
                button.textContent ===
                correctAnswer
            ) {

                button.classList.add(
                    "correct"
                );

            }

        });

    }


    setTimeout(() => {

        currentQuestion++;

        showQuestion();

    }, 800);

}

expertForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        checkExpertAnswer();

    }
);


// ======================================================
// KONIEC QUIZU
// ======================================================

function finishQuiz() {

    quizScreen.classList.add(
        "hidden"
    );


    resultScreen.classList.remove(
        "hidden"
    );


    finalScoreElement.textContent =
        `${score} / ${questions.length}`;

}


// ======================================================
// USTAWIENIA — OTWARCIE
// ======================================================

document
    .getElementById("settings-button")
    .addEventListener(
        "click",
        () => {

            menuScreen.classList.add(
                "hidden"
            );


            renderGroupOptions();

            renderQuestionCountOptions();

            renderExpertMode();


            settingsScreen.classList.remove(
                "hidden"
            );

        }
    );


// ======================================================
// USTAWIENIA — ZAMKNIĘCIE
// ======================================================

document
    .getElementById("close-settings")
    .addEventListener(
        "click",
        () => {

            settingsScreen.classList.add(
                "hidden"
            );

            menuScreen.classList.remove(
                "hidden"
            );

        }
    );


// ======================================================
// PRZYCISKI QUIZU
// ======================================================

document
    .querySelectorAll(".quiz-option")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const quizType =
                    button.dataset.quiz;


                console.log(
                    "Kliknięto:",
                    quizType
                );


                startQuiz(
                    quizType
                );

            }
        );

    });


// ======================================================
// POWRÓT Z QUIZU
// ======================================================

document
    .getElementById("back-button")
    .addEventListener(
        "click",
        () => {

            quizScreen.classList.add(
                "hidden"
            );

            menuScreen.classList.remove(
                "hidden"
            );

        }
    );


// ======================================================
// ZAZNACZ WSZYSTKIE
// ======================================================

document
    .getElementById("select-all-groups")
    .addEventListener(
        "click",
        () => {

            selectedGroups =
                getAvailableGroups();


            saveSettings();


            renderGroupOptions();

        }
    );


// ======================================================
// WYCZYŚĆ
// ======================================================

document
    .getElementById("clear-groups")
    .addEventListener(
        "click",
        () => {

            // Pusta lista =
            // wszystkie grupy

            selectedGroups = [];

            saveSettings();

            renderGroupOptions();

        }
    );


// ======================================================
// RESTART
// ======================================================

document
    .getElementById("restart-button")
    .addEventListener(
        "click",
        () => {

            startQuiz(
                currentQuiz
            );

        }
    );


// ======================================================
// MENU Z EKRANU WYNIKU
// ======================================================

document
    .getElementById("menu-button")
    .addEventListener(
        "click",
        () => {

            resultScreen.classList.add(
                "hidden"
            );

            menuScreen.classList.remove(
                "hidden"
            );

        }
    );


// ======================================================
// SHUFFLE
// ======================================================

function shuffle(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );


        [
            array[i],
            array[j]
        ] = [
                array[j],
                array[i]
            ];

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
