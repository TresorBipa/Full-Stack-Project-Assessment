const express = require("express");
const app = express();
app.use(express.json());
const { Pool } = require("pg");
const cors = require("cors");
app.use(cors());


const port = process.env.PORT || 5000;
// const path = require("path");
// const bodyParser = require("body-parser");
// import { v4 as uuids4 } from "uuid";



// app.use(express.static(path.resolve(__dirname, "../client/build")));

// app.use(bodyParser.json());


// Store and retrieve your videos from here
// If you want, you can copy "exampleresponse.json" into here to have some data to work with
// let videos = [];
// const videos = require("./exampleresponse.json");
// const { response } = require("express");

// const videoId = Math.floor(Math.random() * 1000000);
//     let rating = Math.floor(Math.random() * 10000);

const pool = new Pool({
    user: 'tresor_user',
    host: 'dpg-cf8l13un6mplr42ano10-a.oregon-postgres.render.com',
    database: 'fullstackprojectassessmentdb_mk0v',
    password: '5BRBupjlHGcNgaWhN9zvqLJxyAzZHCFu',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
});


// // GET "/"
// app.get("/", (req, res) => {
//   // Delete this line after you've confirmed your server is running
//   res.send({ express: "Your Backend Service is Running" });
// });


// Get//
app.get("/", (req, res) => {
  pool.query('SELECT * FROM video')
  .then((result) => res.send(result.rows).json)
  .catch((error) => {
      console.error(error);
      res.status(500).json(error);
  });
});


// SEARCH //
app.get("/videos/search", (req, res) => {
  const pool = new Pool();
  const videoSearch = req.query.term;
  pool.query(`SELECT * FROM videos WHERE title ILIKE '%${videoSearch}%'`, (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(result.rows);
    }
    pool.end();
  });
});


// POST //
// app.post('/', (req, res) => {
//   let title = req.body.title;
//   let url = req.body.url;
//   let rating = req.body.rating
// pool
// .query("INSERT INTO video (title, url, rating) VALUES ($1, $2, $3);", [title, url, rating])
// .then((result) => {
//   if (result.rows.length > 0) {
//     return res
//       .status(400)
//       .send("Video exists!");
//   } else {
//     const query =
//     "INSERT INTO video (title, url, rating) VALUES ($1, $2, $3)";
//     pool
//       .query(query,  [title, url, rating])
//       .then(() => res.send("Video created!"))
//       .catch((error) => {
//         console.error(error);
//         res.status(500).json(error);
//       });
//   }
// });
// });

app.post('/', (req, res) => {
  const { title, url, rating } = req.body;

  pool
    .query("SELECT * FROM video WHERE title = $1", [title])
    .then((result) => {
      if (result.rows.length > 0) {
        return res.status(400).send("Video already exists!");
      } else {
        pool
          .query("INSERT INTO video (title, url, rating) VALUES ($1, $2, $3)", [title, url, rating])
          .then(() => res.send("Video created!"))
          .catch((error) => {
            console.error(error);
            res.status(500).json(error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });
});




//`GET` by "/{id}"
// app.get("/:id", (req, res) =>{
//   let videoId = req.params.id;
// pool.query('SELECT * FROM video WHERE id=$1', [videoId])
// .then((result) =>  
// res.json(result.rows))
// .catch((error) => {
//     console.error(error);
//     res.status(500).json(error);
//   });
// });

app.get("/:id", (req, res) => {
  const videoId = req.params.id;
  pool.query('SELECT * FROM video WHERE id=$1', [videoId])
    .then((result) => {
      if (result.rows.length === 0) {
        return res.status(404).send("Video not found!");
      } else {
        res.json(result.rows[0]);
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({error: "Internal server error"});
    });
});



// DELETE //
// app.delete('/:id', (req, res)=> {
//   let vidId = req.params.id;
// pool
// .query("DELETE FROM video WHERE id=$1", [vidId])
// .then(() => res.send(`Video ${vidId} deleted!`))
// .catch((error) => {
//   console.error(error);
//   res.status(500).json(error);
// });
// })

app.delete('/:id', (req, res) => {
  let vidId = req.params.id;
  
  pool.query("DELETE FROM video WHERE id=$1", [vidId])
    .then(result => {
      if(result.rowCount === 0) {
        return res.status(404).send(`Video with id ${vidId} not found`);
      }
      res.send(`Video ${vidId} deleted!`);
    })
    .catch(error => {
      console.error(error);
      res.status(500).json(error);
    });
});



 


app.listen(port, () => console.log(`Listening on port ${PORT}`));