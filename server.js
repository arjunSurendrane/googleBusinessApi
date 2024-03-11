const express = require('express')
const cors = require('cors')
const { getReviews } = require('./googleAuth')
const { GoogleAuth, OAuth2Client } = require('google-auth-library')
const { default: axios } = require('axios')
const app = express()
app.use(express.json())

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URL;

// Create Oauth2client instance using oauth client id and client_secret
const client = new OAuth2Client(clientId, clientSecret, redirectUri);

function successResponse(res, responseData) {
    res.status(200).json({
        message: 'success',
        data: responseData
    })
}


function errorResponse(res, status, error) {
    res.status(status).json({ message: 'error', error })
}

app.get('/', (req, res) => {
    res.send('Welcome to Google Business Api fetching server')
})


app.get('/oauth_google', (req, res) => {
    try {
        const authorizationUrl = client.generateAuthUrl({
            access_type: 'offline', // Request a refresh token
            scope: ['https://www.googleapis.com/auth/plus.business.manage']
        });
        console.log({ authorizationUrl })
        res.redirect(authorizationUrl);
    } catch (error) {
        console.log(error)
        errorResponse(res, 500, 'internal server error')
    }
})


app.get('/get-accounts', async (req, res) => {
    const { code } = req.query;
    try {
        const { tokens } = await client.getToken(code);
        // client.setCredentials(tokens);

        const url = 'https://mybusiness.googleapis.com/v4/mybusiness/accounts'
        const response = await axios.get(url, { headers: { Authorization: `Bearer ${tokens.access_token}` } })
        const accounts = response.data.accounts; // Assuming accounts data is in the response

        successResponse(res, accounts)
    } catch (error) {
        console.error(error);
        errorResponse(res, 500, 'internal server error')
    }
})


app.post('/set_account', (req, res) => {
    try {
        const { accountid, locationid } = req.body
        // TODO: Write the query to store accountid and location id in user object ( in database )

        successResponse(res, null)
    } catch (error) {
        errorResponse(res, 500, 'internal server error')
    }

})


app.get('/get_reviews/:userid', async (req, res) => {
    const { code } = req.header.Authorization;
    const { userid } = req.params
    try {
        const { tokens } = await client.getToken(code);

        // TODO: Write a query to fetch the accountid and locationid using userid
        let accountId = ""
        let locationId = ""

        const url = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`;
        const response = await axios.get(url, { headers: { Authorization: `Bearer ${tokens.access_token}` } });
        const reviews = response.data;

        // TODO: Write query to store reviews in database

        successResponse(res, reviews)

    } catch (error) {
        errorResponse(res, 500, 'internal server error')
    }
})