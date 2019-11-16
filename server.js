require('dotenv').config()
const express = require('express')
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiney' : 'common'
const helmet = require('helmet')
const cors = require('cors')
const POKEDEX = require('./pokedex.json')

const app = express()

app.use(morgan(morganSetting))
app.use(helmet())// Removes information about express being used in the the dev tools that go public, MUST GO BEFORE cors
app.use(cors())

//This function is used to validate your API_Token Before moving forward with a GET request
app.use(function validateBearerToken(req, res, next){
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization') // Returns Value of Bearer (the actual Token)*********MENTOR QUESTION: How does this get the token value???**************
 
    //This will send an error to the user if the Token does not match
    if(!authToken || authToken.split(' ')[1] !== apiToken ){
        return res.status(401).json({error: 'Unauthorized request'})
    }


    //move to the next middleware
    next()
})

//This is creating the data that will be used when searching pokemon by type
const validTypes = ['Bug', 'Dark', 'Dragon', 'Electric', 'Fairy', 'Fighting', 'Fire', 'Flying', 'Ghost', 'Grass', `Ground`, `Ice`, `Normal`, `Poison`, `Psychic`, `Rock`, `Steel`, `Water`]

//This funtion will respond with Json of "ValidTypes" makes it easier to run
function handleGetTypes(req, res) {
    res.json(validTypes)
}
//This is the app.get for /Types with the second call being the function that returns the .json
app.get('/types', handleGetTypes)


//Same as function above but for pokemon
function handleGetPokemon(req, res){
    //Set the entire dataset equal to "response"
    let response = POKEDEX.pokemon;

    //Filter our pokemon by name if the name query param is present
    if (req.query.name){
        response = response.filter(pokemon =>
            //case insensitive searching
            pokemon.name.toLowerCase().includes(req.query.name.toLowerCase())
        )
    }
    //Filter our pokemon by type if type query param is present
    if(req.query.type){
        resonse = response.filter(pokemon => {
            pokemon.type.includes(req.query.type)
        })
    }
    res.send(response)
}
//The same as the get request for types
app.get('/pokemon', handleGetPokemon)

//4 Parameters in middleware, express knows to treat this as an erro handler, shouild always be your last middleware
app.use((error, req, res, next) => {
    let response
    if (process.env.NODE_ENV === 'production'){
        response = { error: { message: 'server error' }}
    } else {
        response = { error }
    }
    res.status(500).json(response)
})

//Respects an environmental variable for Heroku to control
const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost: ${PORT}`)
})
