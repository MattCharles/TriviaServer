import Koa from "koa";
const app = new Koa();
const bodyParser = require("koa-bodyparser");
app.use(bodyParser());
import Router from "koa-router";
import * as csv from "csv-string";
import * as fs from "fs";

const router = new Router();

let possibleQuestions: string[][] = [];

// TODO: make this a map of number -> Set<number>
let questionsAskedThisGame: Set<number> = new Set();

// router.use("/", async (ctx, next) => {
//   await next().then(function () {
//     console.log("Middleware done");
//   });
// });

// Get current question possible answers
router
  .get("/", async function (ctx, next) {
    // ctx.router available
    let randomIndex;
    do {
      randomIndex = Math.max(
        1,
        Math.floor(Math.random() * possibleQuestions.length)
      );
      console.log(`trying question ${randomIndex}`);
    } while (questionsAskedThisGame.has(randomIndex));
    questionsAskedThisGame.add(randomIndex);
    // ctx.body = questions[randomIndex];
    const question = possibleQuestions[randomIndex];
    const responses: string[] = question.slice(1, 5).sort();
    ctx.body = responses;
    await next();
  })
  .post("/createLobby", function (ctx, next) {
    ctx.body = {
      gameID: 1,
      playerID: 1,
    };
  })
  // TODO: return who has answered what
  .post("/games/:gameID/:questionID/:userID", (ctx, next) => {
    console.log("Successful post!");
    console.log(ctx.request.body);
    ctx.body = "Got it!";
    ctx.status = 200;
    next();
  })
  .get("/games/:gameID/status", (ctx, next) => {})
  .post("/joinGame/:gameID", (ctx, next) => {});

app
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(3000, () => {
    const filename = "TriviaTraitor2.csv";
    const fileContents = fs.readFileSync(filename).toString();
    possibleQuestions = csv.parse(fileContents);
    // console.log(questions);
    // console.log("Starting up");
  });
