//Las consultas
Para saber si un jugador está en un equipo, la primera consulta que queremos resolver es 
//qué jugadores pertenecen a un equipo. El query en MongoDB es

db.equipos.find({ equipo: 'Boca' })


//Como nosotros queremos que nos devuelva la 
//de jugadores, utilizaremos la técnica aggregate:

db.equipos.aggregate([ 
  { $unwind: "$jugadores" }, 
  { $match: { "equipo" : "Boca"}},
  { $project: { "nombre" : "$jugadores.nombre", "posicion" : "$jugadores.posicion"}}, 
  { $sort: { nombre: 1 } }
]);

//Aggregate recibe como parámetro un pipeline o una serie de transformaciones que debemos aplicar:

//unwind permite deconstruir la jerarquía equipo > jugadores, como resultado obtenemos una lista “aplanada” de jugadores
//match permite filtrar los elementos, en este caso seleccionando el equipo de fútbol
//project define la lista de atributos que vamos a mostrar, parado desde jugador podemos ir hacia arriba 
//o abajo en nuestra jerarquía. Por ejemplo
//si queremos traer el nombre del equipo solo basta con agregarlo al final:

db.equipos.aggregate([ 
  
  { $project: { "nombre" : "$jugadores.nombre", "posicion" : "$jugadores.posicion", "equipo": "$equipo" }},
  
  //Eso producirá
  
  { 
  "_id" : ObjectId("60232692edaabd1d5dddeae0"), 
  "nombre" : "Blandi, Nicolás", 
  "posicion" : "Delantero", 
  "equipo" : "Boca"
}

//Si queremos modificar el nombre de la columna de output debemos hacer este pequeño cambio:

db.equipos.aggregate([ 
  ...
  { $project: { "nombre" : "$jugadores.nombre", "posicion" : "$jugadores.posicion", "nombre_equipo": "$equipo
  
  
  { 
    "_id" : ObjectId("60232692edaabd1d5dddeae0"), 
    "nombre" : "Blandi, Nicolás", 
    "posicion" : "Delantero", 
    "nombre_equipo" : "Boca"
    
}


//Ahora que sabemos cómo ejecutar la consulta en Mongo, el controller
//llamará a una clase repositorio que implementaremos nosotros, ya que la anotación @Query 
//todavía no tiene soporte completo para operaciones de agregación.

def jugadoresDelEquipo(String nombreEquipo) {
	val matchOperation = Aggregation.match(Criteria.where("equipo").regex(nombreEquipo, "i")) // "i" es por case insensitive
	Aggregation.newAggregation(matchOperation, unwindJugadores, projectJugadores).query
}

def unwindJugadores() {
	Aggregation.unwind("jugadores")
}

def projectJugadores() {
	Aggregation.project("$jugadores.nombre", "$jugadores.posicion")
}

// extension method para ejecutar la consulta	
def query(Aggregation aggregation) {
	val AggregationResults<Jugador> result = mongoTemplate.aggregate(aggregation, "equipos", Jugador)
	return result.mappedResults
}
// Búsqueda de jugadores por nombre 
db.equipos.aggregate([ 
  { $unwind: "$jugadores" }, 
  { $match: { "jugadores.nombre": { $regex: "riq.*", $options: "i" }}},
  { $project: { "nombre" : "$jugadores.nombre", "posicion" : "$jugadores.posicion"}}, 
  { $sort: { nombre: 1 } }
]);