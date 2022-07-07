import Koa from "koa";
const app = new Koa();
const bodyParser = require("koa-bodyparser");
app.use(bodyParser());
import Router from "koa-router";
import * as csv from "csv-string";
import * as fs from "fs";
import { Timer } from "./timer";

const router = new Router();

interface ScoredAnswer {
  answer: number;
  score: number;
}

interface PenciledReponse {
  currentAnswer: number;
  currentScore: number;
}

interface QuestionState {
  questionID: number;
  playerAnswers: Map<number, number>;
}

interface GameState {
  hostID: string;
  gameID: string;
  currentQuestionID: number;
  questionHistory: Map<number, QuestionState>;
  timer: Timer;
}

const currentGames: Map<string, GameState> = new Map();
const secondsPerQuestion = 90;

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
  questionHistory: {
    [roundNumber: number]: QuestionState;
  };
  // map from a playerID to the response that they have given. If we don't have a response from a player, their answer will be -1.
  playerStatuses: {
    [playerID: string]: PenciledReponse;
  };
  secondsLeftInRound: number;
}

interface AnswerMessage {
  roundNumber: number;
  answerIndex: number;
}

interface CreateMessage {
  name: string;
}

interface QuestionRow {
  question: string;
  answers: {
    1: string;
    2: string;
    3: string;
    4: string;
  };
  category: string;
  explanation: string;
}

// TODO: Allow user to choose category once there are enough questions in each category
const getRandomQuestion = (alreadyAsked: Set<number>) => {
  let randomIndex;
  do {
    randomIndex = Math.max(
      1,
      Math.floor(Math.random() * possibleQuestions.length)
    );
    console.log(`trying question ${randomIndex}`);
  } while (alreadyAsked.has(randomIndex));

  const question = possibleQuestions[randomIndex];
  // const responses: string[] = question.slice(1, 5).sort();
  const result: QuestionRow = {
    question: question[0],
    answers: {
      1: question[1],
      2: question[2],
      3: question[3],
      4: question[4],
    },
    category: question[5],
    explanation: question[6],
  };
  return result;
};

router
  .get("/", async function (ctx, next) {
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
    const createMessage = ctx.request.body as CreateMessage;
    const hostName = createMessage.name;
    const response: InGameStatusResponse = {
      currentQuestionID: 0,
      roundNumber: 0,
      playerStatuses: {},
      secondsLeftInRound: secondsPerQuestion,
      questionHistory: {},
    };
    ctx.body = response;
  })
  .post("/games/:gameID/start", (ctx, next) => {})
  .post("/games/:gameID/:roundID", (ctx, next) => {
    console.log("Successful post!");
    console.log(ctx.request.body);
    const answerMessage = ctx.request.body as AnswerMessage;
    // TODO: right now people can modify past answers. Instead, just don't let them write if there's a round number mismatch
    const playerAnswer: PlayerAnswer = {};
    playerAnswer[answerMessage.roundNumber] = answerMessage.answerIndex;
    playerAnswers.set(currentRound, playerAnswer);
    ctx.body = "Got it!";
    ctx.status = 200;
    next();
  })
  // TODO: return who has answered what
  .get("/games/:gameID/status", (ctx, next) => {})
  .post("/games/:gameID/join", (ctx, next) => {});

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
