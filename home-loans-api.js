var express = require("express");
const fs = require('fs').promises;

var app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

var port = process.env.PORT || 4006;

app.get("/", (req, res) => {
  res.send("Home loans API is up and running!");
});

app.get("/v1", (req, res) => {
  res.send("v1");
});

app.get("/v1/home-loans", async (req, res) => {
  try {
    const term = req.query.term;
    const response = await getResponse('home-loans.json');

    if (term) {
      const filteredResponse = response.filter((loan) => loan.term >= term);
      res.send(filteredResponse);
    } else {
      res.send(response);
    }
    res.send(response);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal server error');
  }
});

app.get("/v1/home-loans/:loanId", async (req, res) => {
  try {
    const loanId = req.params.loanId;
    const response = await getResponse('home-loans.json');

    if (filteredResponse = response.filter((loan) => loan.id === loanId)) {
      res.send(filteredResponse);
    } else {
      res.send(response);
    }
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal server error');
  }
});

app.post("/v1/home-loans/application", async (req, res) => {
  try {
    const requestBody = req.body;

    if (!requestBody || typeof requestBody !== "object") {
      throw new Error('Missing required body');
    }

    // check that all required fields are present
    if (!requestBody.customerId ||
        !requestBody.tfn ||
        !requestBody.loanId ||
        !requestBody.loanAmount) {
      throw new Error('Missing required field(s)');
    }

    const filteredBody = {};

    filteredBody.customerId = requestBody.customerId;
    filteredBody.tfn = requestBody.tfn;
    filteredBody.loanId = requestBody.loanId;
    filteredBody.loanAmount = requestBody.loanAmount;

    let applicationResponse = await getResponse('application.json');
    const rand = Math.floor(100000 + Math.random() * 900000);
    applicationResponse.applicationId = `holobank-${requestBody.loanId}-app-${rand}`

    const loanResponse = await getResponse('home-loans.json');
    const filteredLoanResponse = loanResponse.filter((loan) => loan.id === requestBody.loanId).shift();

    const updatedResponse = { ...applicationResponse, ...filteredLoanResponse, ...filteredBody };

    res.send(updatedResponse);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send(`Internal server error: ${err}`);
  }
});

app.get("/v1/home-loans/application/:applicationId", async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    const response = await getResponse(`application_${applicationId}.json`);
    res.send(response);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal server error');
  }
});

app.get("/v1/home-loans/application/:applicationId/statements", async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    const response = await getResponse(`application_${applicationId}_statements.json`);
    res.send(response);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal server error');
  }
});

app.get("/v1/home-loans/application/:applicationId/status", async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    const response = await getResponse(`application_${applicationId}_status.json`);
    res.send(response);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal server error');
  }
});

app.get("/v1/home-loans/application/:applicationId/balance", async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    const response = await getResponse(`application_${applicationId}_balance.json`);
    res.send(response);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal server error');
  }
});

app.get("/v1/home-loans/rates", async (req, res) => {
  try {
    const response = await getResponse('rates.json');
    res.send(response);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal server error');
  }
});

app.get("/v1/home-loans/rates/:loanId", async (req, res) => {
  try {
    const loanId = req.params.loanId;
    const response = await getResponse('rates.json');
    res.send(response);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal server error');
  }
});

app.listen(port, function () {
  console.log("Your app is listening on port " + port);
});

async function getResponse(filename) {
  try {
    const data = await fs.readFile(`endpoints/${filename}`, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading file or parsing JSON:', err);
    throw err;
  }
}
