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
let playerAnswers: Map<number, PlayerAnswer> = new Map(); // map from the question number to an object containing all answers provided
let currentRound: number = 0;

interface PlayerAnswer {
  [playerID: string]: number;
}
interface InGameStatusResponse {
  currentQuestionID: number;
  roundNumber: number;
  // map from a playerID to the response that they have given. If we don't have a response from a player, their answer will be -1.
  [playerID: string]: number;
}

interface AnswerMessage {
  roundNumber: number;
  answerIndex: number;
}

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
  .post("/games/:gameID/:roundID", (ctx, next) => {
    console.log("Successful post!");
    console.log(ctx.request.body);
    const answerMessage = ctx.request.body as AnswerMessage;
    const playerAnswer: PlayerAnswer = {};
    playerAnswer[answerMessage.roundNumber] = answerMessage.answerIndex;
    playerAnswers.set(currentRound, playerAnswer);
    ctx.body = "Got it!";
    ctx.status = 200;
    next();
  })
  // TODO: return who has answered what
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
