const fs = require('fs');
require('dotenv').config();
const axios = require('axios');
const Spotify = require('node-spotify-api');
const keys = require('./keys.js');
const spotify = new Spotify(keys.spotify);
const moment = require('moment');

// global variables for user input
let queryType = process.argv[2];
let queryTerm = process.argv.slice(3).join(' ');
const divider = "\n------------------------------------------------------------\n\n";

// converts text to Title Case
let titleCase = (str) => {
    return str.toLowerCase().split(' ').map((word) => {
        return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
};

// random number generator
let randomNum = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
};

// takes user input and returns concert info from BandsInTown
let concertThis = (queryTerm) => {
  queryTerm = queryTerm || 'cardi b'
  let queryUrl = `https://rest.bandsintown.com/artists/${queryTerm}/events?app_id=codingbootcamp`;
  axios.get(queryUrl).then((response) => {
    let userData = [];
    userData.push(`${queryType}, Artist: ${titleCase(queryTerm)}`);
    console.log(`\n     LIRI concert info from BandsInTown:`);
    console.log(`   ---------------------------------------`);
    console.log(`    * ${titleCase(queryTerm)}'s next three shows:\n`);
    for (let i = 0; i < 3; i++) {
      let concert = response.data[i];
      userData.push(`Venue: ${concert.venue.name},Location: ${concert.venue.city}, ${concert.venue.region},Time: ${moment(concert.venue.datetime).format('ddd, MMM Do YYYY, h:mm a')}`);
      console.log(`     * Venue: ${concert.venue.name}`);
      console.log(`     * Location: ${concert.venue.city}, ${concert.venue.region}`);
      console.log(`     * Time: ${moment(concert.venue.datetime).format('ddd, MMM Do YYYY, h:mm a')}`);
      console.log(`                 --------`);

      if (i === 2) {
        fs.appendFile('log.txt', userData + divider, (err) => {
          if (err) throw err;
        });
      }
    }
  });
};

// takes user input and returns song info from Spotify
let spotifyThis = (queryTerm) => {
  spotify.search({ type: 'track', query: queryTerm || 'the sign ace of base'}, ((err, data) => {
    if (err) {
      return console.log(`Error occurred: ${err}`);
    }
  let song = data.tracks.items[0];
  let userData = `${queryType}, Title: ${song.name},Artist(s): ${song.album.artists[0].name},Album: ${song.album.name},Preview on Spotify: ${song.album.external_urls.spotify}`;
    console.log(`\n     LIRI song info from Spotify:`);
    console.log(`   --------------------------------`);
    console.log(`     * Title: ${song.name}`);
    console.log(`     * Artist(s): ${song.album.artists[0].name}`);
    console.log(`     * Album: ${song.album.name}`);
    console.log(`     * Preview on Spotify: ${song.album.external_urls.spotify}\n`);

    fs.appendFile('log.txt', userData + divider, (err) => {
      if (err) throw err;
    });
  }));
};

// takes user input and returns movie info from OMDB
let movieThis = (queryTerm) => {
  queryTerm = queryTerm || 'mr nobody'
  let queryUrl = `http://www.omdbapi.com/?t=${queryTerm}&y=&plot=short&apikey=trilogy`;
  axios.get(queryUrl).then((response) => {
    let userData = `${queryType}, Title: ${response.data.Title},Released: ${response.data.Year},IMDB Rating: ${response.data.Year},${response.data.Ratings[1].Source} Rating: ${response.data.Ratings[1].Value},Filmed in ${response.data.Country},Plot: ${response.data.Plot},Cast: ${response.data.Actors}`;
    console.log(`\n     LIRI movie info from OMDB:`);
    console.log(`   ------------------------------`);
    console.log(`     * Title: ${response.data.Title}`);
    console.log(`     * Released: ${response.data.Year}`);
    console.log(`     * IMDB Rating: ${response.data.Year}`);
    console.log(`     * ${response.data.Ratings[1].Source} Rating: ${response.data.Ratings[1].Value}`);
    console.log(`     * Filmed in ${response.data.Country}`);
    console.log(`     * Plot: ${response.data.Plot}`);
    console.log(`     * Cast: ${response.data.Actors}\n`);

    fs.appendFile('log.txt', userData + divider, (err) => {
      if (err) throw err;
    });
  });
};

// user let's LIRI choose for them
let liriChoice = () => {
  fs.readFile('random.txt', 'utf8', (err, data) => {
    if (err) throw err;
    fs.appendFile('log.txt', ',LIRI,', (err) => {
      if (err) throw err;
    });
    options = data.split(',');
    liri = randomNum(3);

    switch (liri) {
      case 0: queryTerm = options[1], concertThis(queryTerm);
        break;
      case 1: queryTerm = options[3], spotifyThis(queryTerm);
        break;
      case 2: queryTerm = options[5], movieThis(queryTerm);
        break;
      default: console.log('If you are seeing this message, something went horribly wrong');
    }
  });
};

// main logic loop
switch (queryType) {
  case 'concert-this': concertThis(queryTerm);
    break;
  case 'spotify-this-song': spotifyThis(queryTerm);
    break;
  case 'movie-this': movieThis(queryTerm);
    break;
  case 'do-what-it-says': liriChoice();
    break;
  default: console.log(`
              -----------------------------------------------
              |               Welcome to LIRI!              | 
              |                                             |
              |  Avalable parameters are:                   | 
              |                                             | 
              |     movie-this <movie title>                |
              |                                             |
              |     spotify-this-song <song title>          |
              |                                             |
              |     concert-this <artist/band name>         |
              |                                             |
              |     do-what-it-says                         |
              |                                             |
              -----------------------------------------------
    `);
}
