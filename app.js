const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

// const createTable = async () => {
//   const sqlQuery = `
//         CREATE TABLE todo(
//             id INTEGER NOT NULL PRIMARY KEY,
//             todo VARCHAR(250),
//             priority VARCHAR(250),
//             status VARCHAR(250)
//         );
//     `;
//   await db.run(sqlQuery);
// };

const initializingDBwithServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started Listening...");
    });
  } catch (err) {
    console.log(`DB error ${err.message}`);
  }
};
initializingDBwithServer();

// createTable();
// API get
app.get("/todos/", async (req, res) => {
  const { status, priority, search_q } = req.query;
  console.log(req.query);
  let dbResponse;
  if (status && priority) {
    const sqlQuery = `
        SELECT id, todo, priority, status
        FROM todo
        WHERE 
            (status = '${status}' AND priority = '${priority}');
    `;
    dbResponse = await db.all(sqlQuery);
  } else if (status) {
    const sqlQuery = `
        SELECT *
        FROM todo
        WHERE 
            status = '${status}';
    `;
    dbResponse = await db.all(sqlQuery);
  } else if (priority) {
    const sqlQuery = `
        SELECT *
        FROM todo
        WHERE 
            priority = '${priority}';
    `;
    dbResponse = await db.all(sqlQuery);
  } else if (search_q) {
    const sqlQuery = `
        SELECT *
        FROM todo
        WHERE 
            todo LIKE '%${search_q}%';
    `;
    dbResponse = await db.all(sqlQuery);
  }

  console.log(dbResponse);
  res.send(dbResponse);
});

// Returns a specific todo based on the todo ID
app.get("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const sqlQuery = `
    SELECT id, todo, priority, status
    FROM todo
    WHERE id = ${todoId};
  `;
  const dbResponse = await db.get(sqlQuery);
  res.send(dbResponse);
});

// Create a todo in the todo table,
app.post("/todos/", async (req, res) => {
  const { id, todo, priority, status } = req.body;
  const sqlQuery = `
        INSERT INTO
            todo (id, todo, priority, status)
        VALUES (${id}, '${todo}', '${priority}', '${status}');
      `;
  await db.run(sqlQuery);
  res.send("Todo Successfully Added");
});
// Create a todo in the todo table,
app.put("/todos/:todoId/", async (req, res) => {
  const { todo, priority, status } = req.body;
  console.log(req.params);
  const { todoId } = req.params;
  const sqlQuery = `
    SELECT *
    FROM todo
    WHERE id = ${todoId};
  `;
  const dbResponse = await db.get(sqlQuery);
  if (todo) {
    const sqlQuery = `
        UPDATE
            todo 
        SET 
            id = ${dbResponse.id}, 
            todo = '${todo}', 
            priority = '${dbResponse.priority}', 
            status = '${dbResponse.status}'
        WHERE id = ${todoId};
    `;
    await db.run(sqlQuery);
    res.send("Todo Updated");
  } else if (priority) {
    const sqlQuery = `
            UPDATE
                todo 
            SET 
                id = ${dbResponse.id}, 
                todo = '${dbResponse.todo}', 
                priority = '${priority}', 
                status = '${dbResponse.status}'
            WHERE id = ${todoId};
        `;
    await db.run(sqlQuery);
    res.send("Priority Updated");
  } else if (status) {
    const sqlQuery = `
            UPDATE
                todo 
            SET 
                id = ${dbResponse.id}, 
                todo = '${dbResponse.todo}', 
                priority = '${dbResponse.priority}', 
                status = '${status}'
            WHERE id = ${todoId};
        `;
    await db.run(sqlQuery);
    res.send("Status Updated");
  }
});
// Deletes a todo from the todo table based on the todo ID
app.delete("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const sqlQuery = `
    DELETE FROM
        todo 
    WHERE id = ${todoId};
  `;
  await db.run(sqlQuery);
  res.send("Todo Deleted");
});

module.exports = app;

// CREATE TABLE todo(
//             id INTEGER,
//             todo VARCHAR(250),
//             priority VARCHAR(250),
//             status VARCHAR(250)
//         );

// const sqlQuery = `
//     SELECT *
//     FROM todo
//     WHERE status = ${status.replace(
//       " ",
//       "%20"
//     )} OR priority = ${priority} OR search_q = ${search_q}
//         OR (status = ${status.replace(" ", "%20")} AND priority = ${priority});
//   `;

// Create a todo in the todo table,
// app.post("/todos/", async (req, res) => {
//   const { id, todo, priority, status } = req.body;
//   const sqlQuery = `
//     INSERT INTO
//         todo (id, todo, priority, status)
//     VALUES (${id}, '${todo}', '${priority}', '${status}');
//   `;
//   await db.run(sqlQuery);
//   res.send("Todo Successfully Added");
// });

// CREATE TABLE todo(
//             key INTEGER NOT NULL PRIMARY KEY,
//             id INTEGER,
//             todo VARCHAR(250),
//             priority VARCHAR(250),
//             status VARCHAR(250)
//         );
