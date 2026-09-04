let questions = [];
let currentQuestion = 0;
let score = 0;

distilleries.forEach(distillery => {

    distillery.informations.forEach(information => {

        questions.push({
            question: information,
            answer: distillery.name
        });

    });

});

questions.sort(() => Math.random() - 0.5);

document.getElementById("total-questions").textContent = questions.length;

showQuestion();

function showQuestion() {

    if (currentQuestion >= questions.length) {
        finishQuiz();
        return;
    }

    const question = questions[currentQuestion];

    document.getElementById("question").textContent =
        question.question;

    document.getElementById("current-question").textContent =
        currentQuestion + 1;

    createAnswers(question.answer);
}

function createAnswers(correctAnswer) {

    const answersContainer =
        document.getElementById("answers");

    answersContainer.innerHTML = "";

    // Prawidłowa odpowiedź
    let answers = [correctAnswer];

    // Wszystkie pozostałe destylarnie
    const otherDistilleries = distilleries
        .filter(distillery => distillery.name !== correctAnswer)
        .map(distillery => distillery.name);

    // Losujemy 3 błędne
    otherDistilleries.sort(() => Math.random() - 0.5);

    answers.push(...otherDistilleries.slice(0, 3));

    // Mieszamy odpowiedzi
    answers.sort(() => Math.random() - 0.5);


    answers.forEach(answer => {

        const button = document.createElement("button");

        button.textContent = answer;

        button.classList.add("answer");

        button.addEventListener("click", () => {
            checkAnswer(answer, correctAnswer, button);
        });

        answersContainer.appendChild(button);

    });
}

function checkAnswer(selected, correct, clickedButton) {

    const buttons =
        document.querySelectorAll(".answer");

    buttons.forEach(button => {
        button.disabled = true;
    });


    if (selected === correct) {

        clickedButton.classList.add("correct");

        score++;

    } else {

        clickedButton.classList.add("wrong");

        buttons.forEach(button => {

            if (button.textContent === correct) {
                button.classList.add("correct");
            }

        });

    }


    setTimeout(() => {

        currentQuestion++;

        showQuestion();

    }, 1000);
}

function finishQuiz() {

    document.querySelector(".quiz").innerHTML = `

        <div class="finish">

            <h1>Quiz zakończony!</h1>

            <p>
                Twój wynik:
            </p>

            <strong>
                ${score} / ${questions.length}
            </strong>

            <button onclick="location.reload()">
                Zagraj ponownie
            </button>

        </div>

    `;
}