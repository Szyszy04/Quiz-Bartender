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
    wyjazd: []
};

let questions = [];
let currentQuestion = 0;
let score = 0;
let currentQuiz = null;
let selectedGroups = [];
let questionCount = 20;


// ======================================================
// ELEMENTY HTML
// ======================================================

const menuScreen = document.getElementById("menu");
const settingsScreen = document.getElementById("settings");
const quizScreen = document.getElementById("quiz");
const resultScreen = document.getElementById("result");

const questionElement = document.getElementById("question");
const aromaElement = document.getElementById("aroma");
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

        if (!Array.isArray(data.wyjazd)) {
            data.wyjazd = [];
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

    } catch (error) {

        console.error(
            "Błąd odczytu ustawień:",
            error
        );

        selectedGroups = [];

        questionCount = 20;

    }

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

        questionCount: questionCount

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


    return [...groups].sort((a, b) =>
        a.localeCompare(b)
    );

}


// ======================================================
// WYŚWIETLENIE USTAWIEŃ
// ======================================================

function renderGroupOptions() {

    groupOptionsElement.innerHTML = "";


    const groups =
        getAvailableGroups();


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
                        : ""

                });

            });

        });

    }


    // ==================================================
    // WYJAZD
    // ==================================================

    if (
        type === "wyjazd" ||
        type === "all"
    ) {

        const wyjazd =
            filterByGroups(
                data.wyjazd
            );


        wyjazd.forEach(item => {

            if (
                !Array.isArray(
                    item.information
                )
            ) {

                return;

            }


            item.information.forEach(info => {

                questions.push({

                    question: info,

                    answer:
                        item.name,

                    category:
                        "wyjazd"

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

    else if (type === "wyjazd") {

        quizNameElement.textContent =
            "Wyjazd";

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
// WYŚWIETLENIE PYTANIA
// ======================================================

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


    currentQuestionElement.textContent =
        currentQuestion + 1;


    createAnswers(current);

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
    // Wyjazd
    // ----------------------------------------------

    else if (
        currentQuestionData.category ===
        "wyjazd"
    ) {

        sourceData =
            filterByGroups(
                data.wyjazd
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

}


initializeApp();
