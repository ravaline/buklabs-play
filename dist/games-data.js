globalThis.BUKGames=[
{id:'ni-lo-digas',name:'Ni lo digas',category:'words',tag:'PALABRAS',color:'purple',cover:'ni lo<br>digas.',players:'2+ jugadores',time:'10–20 min',content:'1.000 cartas',description:'Haz que adivinen la palabra. Pero cuidado con las cinco que no puedes decir.',rules:['Armen equipos o jueguen de forma individual y elijan las categorías.','Quien tiene el dispositivo describe la palabra sin decir ninguna de las cinco palabras prohibidas.','Acierto: +1. Palabra prohibida: −1. Cambiar carta tiene la penalización que elijan. Gana quien sume más.']},
{id:'blockbuster',name:'Blockbuster',category:'cinema',tag:'CINE',color:'blue',cover:'BLOCKBUSTER<small>CINCO PISTAS</small>',players:'2+ jugadores',time:'5–15 min',content:'90 películas',description:'Reconoce la película con cinco pistas. Cada ayuda cuesta un punto.',rules:['Una persona lee las pistas; la otra adivina sin mirar la pantalla.','La primera pista vale 5 puntos. Cada pista nueva baja el premio, hasta 1 punto.','Un intento por pista. Al fallar, se revela la siguiente. Gana quien acumule más puntos al terminar todas las rondas.']},
{id:'mal',name:'MAL.',category:'reflex',tag:'REFLEJOS',color:'orange',cover:'MAL<em>.</em>',players:'2+ jugadores',time:'5–10 min',content:'200 preguntas',description:'La pregunta es fácil. Lo difícil es responder mal, sin pensarlo demasiado.',rules:['Una persona lee preguntas sencillas y la otra responde. El turno dura 30 segundos por defecto.','Al terminar de leer, toca «Ya leí». Hay 3 segundos para dar una respuesta incorrecta.','Respuesta incorrecta: +1 para quien responde. Respuesta verdadera, repetida o fuera de tiempo: 0. El lector marca el resultado.']}
];
const gameExtras={
  "ni-lo-digas": {
    "hook": "Di todo. Menos lo obvio.",
    "pitch": "La palabra está ahí, pero las cinco pistas más obvias están prohibidas. Describe, improvisa y haz que tu equipo adivine antes de que el reloj llegue a cero.",
    "ideal": "Para romper el hielo y armar equipos entre amigos.",
    "options": [
      "1.000 cartas originales en 20 categorías.",
      "Modalidad por equipos o por jugador.",
      "Tiempo y rondas configurables.",
      "Puedes elegir si saltar una carta resta un punto."
    ],
    "scoring": [
      [
        "Adivinar la palabra",
        "+1 punto"
      ],
      [
        "Decir una palabra prohibida",
        "−1 punto"
      ],
      [
        "Saltar la carta",
        "0 o −1, según configuración"
      ]
    ],
    "tip": "Para la primera junta: dos equipos, turnos de 60 segundos y dos rondas. Un rival controla las palabras prohibidas."
  },
  "blockbuster": {
    "hook": "Cinco pistas. Una película.",
    "pitch": "Una persona tiene la respuesta y lee las pistas. La otra debe reconocer la película sin mirar la pantalla. Cuanto antes la adivine, más puntos gana.",
    "ideal": "Para quienes se saben las películas y quienes juran habérselas visto todas.",
    "options": [
      "90 películas y 450 pistas.",
      "Niveles Fácil, Medio y Difícil, o mezclados.",
      "30, 45 o 60 segundos por película; también sin reloj.",
      "1, 3, 5 o 10 películas por jugador o equipo."
    ],
    "scoring": [
      [
        "Primera pista",
        "5 puntos"
      ],
      [
        "Segunda / tercera pista",
        "4 / 3 puntos"
      ],
      [
        "Cuarta / quinta pista",
        "2 / 1 punto"
      ],
      [
        "Se acaba el tiempo o pasas",
        "0 puntos"
      ]
    ],
    "tip": "Empieza en Fácil, con 45 segundos y tres películas por participante. Quien lee debe mantener la pantalla oculta."
  },
  "mal": {
    "hook": "Responde mal. Gana bien.",
    "pitch": "¿Cuánto es cinco más cinco? «Dos». Perfecto. La pregunta es fácil: tu desafío es dar una respuesta incorrecta antes de que tu cerebro responda lo obvio.",
    "ideal": "Para empezar rápido, reírse de respuestas absurdas y jugar por turnos cortos.",
    "options": [
      "200 preguntas simples y conocidas.",
      "Turnos de 30, 45 o 60 segundos.",
      "3 segundos para responder desde que el lector toca «Ya leí».",
      "El lector valida la respuesta y marca el resultado."
    ],
    "scoring": [
      [
        "Respuesta incorrecta a tiempo",
        "+1 para quien responde"
      ],
      [
        "Respuesta correcta",
        "0 puntos"
      ],
      [
        "Repetida o fuera de tiempo",
        "0 puntos"
      ]
    ],
    "tip": "Prueba turnos de 30 segundos. El reloj del turno incluye la lectura, así que lean ágil y roten a quien pregunta."
  }
};
for(const game of BUKGames) Object.assign(game,gameExtras[game.id],{logo:`assets/${game.id}-logo.png`,image:`assets/${game.id}-cover.png`});
