import app from "./index.js";
import { pool } from "./src/data/databaseConfig.js";


const port=process.env.port;
const hostname="127.0.0.1";

//check the database connection
pool.connect((err, client, done) => {
    if (err) {
      console.error('Error connecting to the database', err);
    } else {
      console.log('Connected to the database');
      done();
    }
  });

app.listen(port,()=>
    {
        console.log(`server started at http://${hostname}:${port}`)
    })