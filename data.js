const distilleries = [
    {
        name: "Lagavulin",
        informations: [
            "Jej nazwa pochodzi od gaelickiego i oznaczającego dolinę młyna.",
            "Destylarnia słynie z bardzo powolnej destylacji – jednego z najdłuższych procesów w całej Szkocji. Dzięki temu whisky zyskuje wyjątkowo oleistą strukturę i głębię smaku.",
            "Jest jednym z sześciu klasycznych słodów reprezentujących region Islay w serii Classic Malts of Scotland."
        ]
    },

    {
        name: "Singleton",
        informations: [
            "Marka stworzona z myślą o osobach rozpoczynających przygodę ze szkocką whisky.",
            "Produkcja skupia się na uzyskaniu wyjątkowo łagodnego i owocowego charakteru poprzez stosunkowo długą fermentację oraz spokojną destylację.",
            "Od wielu lat jest najlepiej sprzedającym się single maltem w Polsce."
        ]
    },

    {
        name: "Mortlach",
        informations: [
            "Została założona w 1823 roku i była pierwszą legalną destylarnią w Dufftown.",
            "Słynie z jednego z najbardziej skomplikowanych systemów destylacji w całej Szkocji. Produkuje destylat określany jako 2,81-krotna destylacja. Efektem jest wyjątkowo ciężka, mięsista whisky o bogatej strukturze.",
        ]
    },

    {
        name: "Talisker",
        informations: [
            "Destylarnia znajduje się na wyspie Skye.",
            "Stosuje nietypowe dla szkockiej whisky skraplacze typu worm tub (spirale chłodzące zanurzone w zimnej wodzie), które pozwalają zachować cięższy i bardziej oleisty charakter destylatu.",
            "Powstała w 1830 roku i od tego czasu produkuje whisky o niezwykle charakterystycznym morskim charakterze."
        ]
    },

    {
        name: "Johnnie Walker",
        informations: [
            "Jest najlepiej sprzedającą się szkocką whisky na świecie.",
            "Wykorzystuje destylaty z ponad 30 destylarni należących do Diageo. Dzięki temu Master Blender ma ogromną swobodę tworzenia poszczególnych edycji.",
            "Jednym z najważniejszych składników wielu wersji jest whisky z destylarni Cardhu, która odpowiada za owocowy charakter blendów."
        ]
    },

    {
        name: "Aberlour",
        informations: [
            "Nazwa oznacza ujście głośnego strumienia (mouth of the chattering burn)",
            "Destylarnia słynie z dojrzewania whisky w połączeniu beczek po bourbonie i sherry, dzięki czemu uzyskuje charakterystyczny profil pełen suszonych owoców i czekolady."
        ]
    },

    {
        name: "Aberfeldy",
        informations: [
            "Nazwa oznacza ujście (lub złączenie) rzeki Paldy.",
            "Destylarnia została zbudowana przez rodzinę Dewar specjalnie po to, aby zapewnić wysokiej jakości whisky do ich słynnego blendu Dewars. Do dziś jest jego sercem."
        ]
    },

    {
        name: "Ardbeg",
        informations: [
            "Nazwa oznacza mały cypel (Small Headland)",
            "Jest jedną z najbardziej torfowych destylarni na świecie, jednak jej whisky słyną bardziej z owocowości i cytrusów niż medycznych nut."
        ]
    },

    {
        name: "Auchentoshan",
        informations: [
            "Nazwa oznacza zakątek pola (Corner of the Field).",
            "To jedna z nielicznych szkockich destylarni stosujących potrójną destylację, bardziej charakterystyczną dla Irlandii. Dzięki temu whisky jest wyjątkowo lekka, delikatna i owocowa."
        ]
    },

    {
        name: "Aultmore",
        informations: [
            "Nazwa oznacza duży strumień (Big Stream).",
            "Przez większość swojej historii produkowała whisky niemal wyłącznie do blendów Dewars."
        ]
    },

    {
        name: "Benriach",
        informations: [
            "Nazwa oznacza szarą górę (Hill of Heather – w zależności od tłumaczenia).",
            "Destylarnia wykorzystuje bardzo szeroki wachlarz beczek – bourbon, sherry, rum, porto, madeira czy virgin oak.",
            "Należy do nielicznych destylarni Speyside produkujących zarówno whisky nietorfowe, jak i mocno torfowe."
        ]
    },

    {
        name: "Craigellachie",
        informations: [
            "Nazwa oznacza oznacza skaliste wzgórze",
            "Destylarnia do dziś korzysta z chłodnic typu worm tub, dzięki czemu whisky ma cięższy, bardziej mięsisty charakter."
        ]
    },

    {
        name: "GlenDronach",
        informations: [
            "Destylarnia słynie z dojrzewania whisky w beczkach po sherry.",
            "Była jedną z ostatnich szkockich destylarni ogrzewających alembiki bezpośrednio ogniem, zanim przeszła na ogrzewanie parowe.",
            "Nazwa oznacza Dolinę Jeżyn (Valley of the Brambles)."
        ]
    },

    {
        name: "Glenfiddich",
        informations: [
            "Była jedną z pierwszych destylarni, która zaczęła promować single malty na rynku międzynarodowym, gdy większość szkockiej whisky trafiała do blendów.",
            "To najczęściej sprzedawana whisky single malt na świecie.",
            "Nazwa oznacza Dolinę Jeleni."
        ]
    },

    {
        name: "Glenglassaugh",
        informations: [
            "Destylarnia leży tuż przy wybrzeżu Morza Północnego, dlatego często podkreśla wpływ morskiego klimatu na dojrzewanie whisky.",
            "Nazwa oznacza Dolinę Zieleni (Valley of the Grey-Green)"
        ]
    },

    {
        name: "Glenlivet",
        informations: [
            "Była pierwszą legalną destylarnią w regionie Speyside po zmianie prawa w 1824 roku.",
            "Przez wiele lat te whisky było tak cenioną nazwą, że inne destylarnie dopisywały ją do swoich etykiet."
        ]
    },

    {
        name: "Glenmorangie",
        informations: [
            "Alembiki w tej destylarni należą do najwyższych w całej Szkocji (ponad 5 metrów). Dzięki temu do skraplaczy trafiają głównie najlżejsze pary alkoholu, co daje wyjątkowo elegancki i owocowy destylat.",
            "Jako jedni z nielicznych stosują beczki z wolno rosnącego dębu z Missouri, które są wykorzystywane do maturacji tylko dwa razy, aby zachować pełnię waniliowych aromatów.",
            "Nazwa oznacza Dolinę Spokoju (lub Dolinę Dużego Wzgórza)"
        ]
    },

    {
        name: "Laphroaig",
        informations: [
            "Każdy właściciel butelki może symbolicznie posiadać stopę kwadratową ziemi przy destylarni dzięki specjalnemu programowi",
            "To jedna z najbardziej charakterystycznych whisky na świecie, znana z nut jodu, bandaży i dymu.",
            "Nazwa oznacza piękną zatokę przy szerokiej dolinie"
        ]
    },

    {
        name: "Macallan",
        informations: [
            "Słynie z wyjątkowo małych alembików, które nadają destylatowi bogaty i oleisty charakter.",
            "Produkcja jednej beczki przeznaczonej dla tej destylarni jest szczegółowo kontrolowana – od wyboru dębu, przez sezonowanie, aż po dojrzewanie sherry w Hiszpanii.",
        ]
    },

    {
        name: "Royal Brackla",
        informations: [
            "Była pierwszą szkocką destylarnią, która otrzymała królewski przywilej używania słowa Royal w nazwie. Tytuł nadał w 1833 roku król William IV po wizycie w destylarni."
        ]
    },

    {
        name: "The Balvenie",
        informations: [
            "Jest jedną z niewielu destylarni, która nadal uprawia część własnego jęczmienia.",
            "Destylarnia zachowała również własną słodownię podłogową (traditional floor maltings), mimo że większość szkockich destylarni zrezygnowała z tego procesu wiele lat temu.",
        ]
    },
];
