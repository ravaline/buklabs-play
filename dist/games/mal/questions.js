(function(root){
const text=`
¿Qué animal hace miau?|El gato.|Animales
¿Qué animal hace guau?|El perro.|Animales
¿Qué animal pone los huevos que solemos comer?|La gallina.|Animales
¿Qué animal tiene una trompa muy larga?|El elefante.|Animales
¿Qué animal tiene un cuello muy largo?|La jirafa.|Animales
¿Qué insecto produce miel?|La abeja.|Animales
¿Qué animal da la leche de vaca?|La vaca.|Animales
¿Qué animal tiene rayas blancas y negras y parece un caballo?|La cebra.|Animales
¿Qué animal lleva su casa en espiral sobre la espalda?|El caracol.|Animales
¿Qué animal ladra?|El perro.|Animales
¿Qué animal maúlla?|El gato.|Animales
¿Qué animal tiene ocho brazos?|El pulpo.|Animales
¿Qué animal salta y lleva a su cría en una bolsa?|El canguro.|Animales
¿Qué insecto se transforma desde una oruga?|La mariposa.|Animales
¿Qué animal teje telarañas?|La araña.|Animales
¿Qué animal nos da lana?|La oveja.|Animales
¿Qué ave de granja dice quiquiriquí?|El gallo.|Animales
¿Qué animal es famoso por comer bambú y ser blanco y negro?|El panda.|Animales
¿Qué animal tiene una melena y ruge?|El león.|Animales
¿Qué animal vive en el agua y tiene aletas y branquias?|Un pez.|Animales
¿Con qué parte del cuerpo escuchamos?|Con los oídos.|Cotidiano
¿Con qué parte del cuerpo vemos?|Con los ojos.|Cotidiano
¿Con qué parte del cuerpo olemos?|Con la nariz.|Cotidiano
¿Con qué parte del cuerpo masticamos?|Con los dientes.|Cotidiano
¿Con qué te lavas el pelo?|Con champú y agua.|Cotidiano
¿Con qué te cepillas los dientes?|Con un cepillo de dientes y pasta.|Cotidiano
¿Qué te pones en los pies para salir a caminar?|Zapatos, zapatillas u otro calzado.|Cotidiano
¿Qué usas para protegerte de la lluvia?|Un paraguas o ropa impermeable.|Cotidiano
¿Dónde guardas la comida para mantenerla fría?|En el refrigerador.|Cotidiano
¿Dónde duermes normalmente?|En una cama.|Cotidiano
¿Qué usas para secarte después de ducharte?|Una toalla.|Cotidiano
¿Qué objeto usas para peinarte?|Un peine o cepillo.|Cotidiano
¿Qué abres con una llave?|Una puerta, candado o cerradura.|Cotidiano
¿Qué usas para cortar papel?|Tijeras u otra herramienta de corte.|Cotidiano
¿Qué usas para borrar lo escrito con lápiz grafito?|Una goma de borrar.|Cotidiano
¿Qué usas para escribir en un cuaderno?|Un lápiz o un bolígrafo.|Cotidiano
¿Qué aparato usas para llamar por teléfono?|Un teléfono.|Cotidiano
¿Qué objeto miras para ver tu reflejo?|Un espejo.|Cotidiano
¿Qué mueble usas para sentarte?|Una silla, sillón u otro asiento.|Cotidiano
¿Qué usas para lavarte las manos?|Agua y jabón.|Cotidiano
¿Qué usas para barrer el piso?|Una escoba.|Cotidiano
¿Qué objeto muestra la hora?|Un reloj.|Cotidiano
¿Qué te pones en la cabeza para protegerte del sol?|Un sombrero o gorro.|Cotidiano
¿Qué usas para ver mejor si tienes miopía?|Lentes u otra corrección visual.|Cotidiano
¿Qué usas para iluminar una pieza oscura?|Una luz, lámpara o linterna.|Cotidiano
¿Qué electrodoméstico lava la ropa?|La lavadora.|Cotidiano
¿Qué usas para abrir una lata sin abre fácil?|Un abrelatas.|Cotidiano
¿Qué aparato usas para ver programas de televisión?|Un televisor u otra pantalla.|Cotidiano
¿Qué utensilio usas normalmente para tomar sopa?|Una cuchara.|Cotidiano
¿Dónde apoyas la cabeza al dormir en la cama?|En la almohada.|Cotidiano
¿De qué color es normalmente un plátano maduro por fuera?|Amarillo.|Comida
¿De qué color es la pulpa de la sandía roja?|Roja.|Comida
¿De qué color es la leche de vaca sin agregarle nada?|Blanca.|Comida
¿Qué fruta se usa para hacer jugo de naranja?|La naranja.|Comida
¿Qué ingrediente principal lleva el pan común?|Harina.|Comida
¿De qué fruta se hace el guacamole?|De palta o aguacate.|Comida
¿Qué comida italiana suele ser redonda y llevar queso encima?|La pizza.|Comida
¿Qué bebida se prepara con granos de café?|Café.|Comida
¿Qué se obtiene al congelar agua?|Hielo.|Comida
¿Qué se derrite más rápido al sol: un helado o una piedra?|Un helado.|Comida
¿El azúcar sabe dulce o salado?|Dulce.|Comida
¿La sal sabe dulce o salada?|Salada.|Comida
¿Qué fruta amarilla tiene forma alargada y se pela?|Un plátano.|Comida
¿Qué fruta usamos para hacer limonada?|Limón.|Comida
¿Qué verdura naranja suele comer un conejo en los dibujos?|Zanahoria.|Comida
¿Qué animal pone un huevo de gallina?|Una gallina.|Comida
¿Qué alimento se hace a partir del cacao?|Chocolate.|Comida
¿Qué bebida tomamos para hidratarnos sin añadir ingredientes?|Agua.|Comida
¿Qué cubierto tiene puntas para pinchar la comida?|El tenedor.|Comida
¿Qué cubierto tiene filo para cortar?|El cuchillo.|Comida
¿Cómo se llama la primera comida de la mañana?|Desayuno.|Comida
¿En qué recipiente sirves normalmente la sopa?|Un plato hondo o un tazón.|Comida
¿Qué condimento hace que una comida quede salada?|Sal.|Comida
¿Qué ingrediente hace dulce un té sin usar edulcorante?|Azúcar o miel.|Comida
¿Qué líquido se exprime de una naranja?|Jugo de naranja.|Comida
¿Cuántos días tiene una semana?|Siete.|Muy fácil
¿Cuántos meses tiene un año?|Doce.|Muy fácil
¿Cuántas horas tiene un día completo?|Veinticuatro.|Muy fácil
¿Cuántos minutos tiene una hora?|Sesenta.|Muy fácil
¿Cuántos segundos tiene un minuto?|Sesenta.|Muy fácil
¿Qué día viene después del lunes?|Martes.|Muy fácil
¿Qué día viene después del viernes?|Sábado.|Muy fácil
¿Qué mes viene después de enero?|Febrero.|Muy fácil
¿Qué mes viene después de noviembre?|Diciembre.|Muy fácil
¿Cuál es el primer mes del año?|Enero.|Muy fácil
¿Cuál es el último mes del año?|Diciembre.|Muy fácil
¿Cuántas patas tiene normalmente un perro?|Cuatro.|Muy fácil
¿Cuántas ruedas tiene una bicicleta común?|Dos.|Muy fácil
¿Cuántos lados tiene un triángulo?|Tres.|Muy fácil
¿Cuántos lados tiene un cuadrado?|Cuatro.|Muy fácil
¿Qué figura geométrica tiene forma de rueda?|Un círculo.|Muy fácil
¿Con qué letra empieza la palabra casa?|Con C.|Muy fácil
¿Cuál es la primera letra del abecedario?|La A.|Muy fácil
¿Cuál es la última letra del abecedario?|La Z.|Muy fácil
¿Qué número viene después del nueve?|Diez.|Muy fácil
¿Qué número viene antes del cinco?|Cuatro.|Muy fácil
¿Qué es más grande: un elefante adulto o una hormiga?|Un elefante adulto.|Muy fácil
¿Qué es más frío: el hielo o el agua hirviendo?|El hielo.|Muy fácil
¿El Sol se ve normalmente de día o de noche?|De día.|Muy fácil
¿Qué luz del semáforo indica que debes detenerte?|La roja.|Muy fácil
¿Qué luz del semáforo permite avanzar si el paso está libre?|La verde.|Muy fácil
¿En qué planeta vivimos?|En la Tierra.|Muy fácil
¿Qué estrella ilumina la Tierra de día?|El Sol.|Muy fácil
¿Cómo se llama el satélite natural de la Tierra?|La Luna.|Muy fácil
¿Qué cae de las nubes cuando llueve?|Agua.|Muy fácil
¿Quién fue Michael Jackson?|Un cantante, bailarín o artista.|Personajes
¿Quién es Shakira?|Una cantante o artista.|Personajes
¿Quién es Lionel Messi?|Un futbolista.|Personajes
¿Quién es Cristiano Ronaldo?|Un futbolista.|Personajes
¿Qué clase de animal es Mickey Mouse?|Un ratón.|Personajes
¿Qué clase de animal es el Pato Donald?|Un pato.|Personajes
¿Quién vive en una piña debajo del mar?|Bob Esponja.|Personajes
¿Cómo se llama el ogro verde amigo de Burro?|Shrek.|Personajes
¿Qué superhéroe lanza telarañas?|Spider-Man o el Hombre Araña.|Personajes
¿Qué superhéroe se viste como un murciélago?|Batman.|Personajes
¿Qué personaje tiene una nariz que crece cuando miente?|Pinocho.|Personajes
¿Qué princesa pierde una zapatilla de cristal?|Cenicienta.|Personajes
¿Quién lleva regalos en Navidad según la tradición?|El Viejito Pascuero, Santa Claus o Papá Noel.|Personajes
¿Cómo se llama el vaquero de Toy Story?|Woody.|Personajes
¿Cómo se llama el león protagonista de El rey león?|Simba.|Personajes
¿Harry Potter es un mago o un cocinero?|Un mago.|Personajes
¿Qué clase de animal es Garfield?|Un gato.|Personajes
¿Qué clase de animal es Snoopy?|Un perro.|Personajes
¿De qué color es la piel de los Simpson?|Amarilla.|Personajes
¿Qué princesa tiene poderes de hielo en Frozen?|Elsa.|Personajes
¿Todos los caminos llevan a…?|Roma.|Dichos
¿Si el río suena es porque…?|Piedras trae o agua lleva, según la versión.|Dichos
¿Al mal tiempo, buena…?|Cara.|Dichos
¿Más vale tarde que…?|Nunca.|Dichos
¿A caballo regalado no se le miran los…?|Dientes.|Dichos
¿Camarón que se duerme se lo lleva la…?|Corriente.|Dichos
¿En boca cerrada no entran…?|Moscas.|Dichos
¿Perro que ladra no…?|Muerde.|Dichos
¿Ojos que no ven, corazón que no…?|Siente.|Dichos
¿No hay mal que por bien no…?|Venga.|Dichos
¿Más vale pájaro en mano que cien…?|Volando.|Dichos
¿El que mucho abarca, poco…?|Aprieta.|Dichos
¿Dime con quién andas y te diré quién…?|Eres.|Dichos
¿El que ríe último, ríe…?|Mejor.|Dichos
¿A quien madruga, Dios lo…?|Ayuda.|Dichos
`;
const questions=text.trim().split('\n').map((row,id)=>{const [question,answer,category]=row.split('|');return {id,question,answer,category};});
// Cuentas deliberadamente simples: nada de trivia difícil.
const operations=[];
for(let a=1;a<=5;a++)for(let b=1;b<=6;b++)operations.push({question:`¿Cuánto es ${a} más ${b}?`,answer:String(a+b)});
for(let a=2;a<=6;a++)for(let b=1;b<=2;b++)operations.push({question:`¿Cuánto es ${a} menos ${b}?`,answer:String(a-b)});
for(let a=1;a<=10;a++)for(let b=2;b<=3;b++)operations.push({question:`¿Cuánto es ${a} por ${b}?`,answer:String(a*b)});
operations.forEach(q=>questions.push({...q,id:questions.length,category:'Números'}));
root.RevesQuestions=questions;if(typeof module!=='undefined')module.exports=questions;
})(globalThis);
