const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// GET ALL MOVIE NAMES

app.get("/movies/", async (request, response) => {
  const getAllMoviesQuery = `
    SELECT 
    movie_name AS movieName
    FROM
    movie
    `;
  const getAllMoviesArray = await db.all(getAllMoviesQuery);
  response.send(getAllMoviesArray);
});

// ADD NEW MOVIE

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO
      movie (director_id,movie_name,lead_actor)
    VALUES
      (
        ${directorId},
        '${movieName}',
        '${leadActor}'
      );`;

  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

// GET A SINGLE MOVIE

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
        *
    FROM
        movie
    WHERE
        movie_id = ${movieId}
    `;
  const getSingleMovieArray = await db.get(getMovieQuery);
  response.send(getSingleMovieArray);
});

// UPDATE THE MOVIE DETAILS

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
  UPDATE
    movie
  SET
    director_id = ${directorId},
    movie_name  = ${movieName},
    lead_actor = ${leadActor}
  WHERE
    movie_id = ${movieId}
  `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// DELETE A MOVIE

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
        movie
    WHERE
        movie_id = ${movieId}
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

// GET LIST OF ALL DIRECTORS

app.get("/directors/", async (request, response) => {
  const getAllDirectorsQuery = `
    SELECT
    director_id AS directorId,
    director_name AS directorName
    FROM 
    director
    `;
  const getAllDirectorsArray = await db.all(getAllDirectorsQuery);
  response.send(getAllDirectorsArray);
});

// GET ALL MOVIE NAMES DIRECTED BY SPECIFIC DIRECTOR

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT
     movie_name AS movieName
    FROM
     movie
    WHERE
      director_id = ${directorId};`;
  const moviesArray = await db.all(getDirectorMoviesQuery);
  response.send(moviesArray);
});

module.exports = app;
