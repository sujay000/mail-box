const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const nodemailer = require("nodemailer");
const {google} = require("googleapis");
const CLIENT_ID = "364345538969-9qabmktiq70ut8s39ni56firsca0fahe.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN = "1//04bJp-7Lqv0PeCgYIARAAGAQSNwF-L9IrvJdFhzVHd5s8ZC-2B7k1fZo6BFWUMY0uTrwNUUtOAVSCmBbQ6Zj_79lJaXsZF54m2GI";

//google auth 
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

const PORT = process.env.PORT || 3000;

app.use('/assets',express.static('assets'))

app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

app.set('view engine', 'ejs');

const urlencodedParser = bodyParser.urlencoded({extended:false});

app.get("/", (req, res) => {
   res.render('index');
})

app.get("/login", (req,res)=>{
   res.render('login');
})

app.post("/login", (req,res) => {
  let token =  req.body.token;

   async function verify() {
         const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  
         });
         const payload = ticket.getPayload();
         const userid = payload['sub'];
        
   }
   verify()
   .then(()=>{
       res.cookie('session-token', token);
       res.send('success')
   })
   .catch(console.error);
})


app.get('/profile', checkAuthenticated, (req, res)=>{
   let user = req.user;
   res.render('profile', {user});
})

app.get('/protectedRoute', checkAuthenticated, (req,res)=>{
   res.send('This route is protected')
})

app.get('/logout', (req, res)=>{
   res.clearCookie('session-token');
   res.redirect('/login')

})

let user = {};


function checkAuthenticated(req, res, next){

   let token = req.cookies['session-token'];

   async function verify() {
       const ticket = await client.verifyIdToken({
           idToken: token,
           audience: CLIENT_ID, 
       });
       const payload = ticket.getPayload();
       user.name = payload.name;
       user.email = payload.email;
       user.picture = payload.picture;
     }
     verify()
     .then(()=>{
         req.user = user;
         next();
     })
     .catch(err=>{
         res.redirect('/login')
     })

}

app.get("/submit",(req,res)=>{
      res.render('submit');
     
})

app.post("/submit",urlencodedParser,(req,res)=>{
   const toEmail = req.body.toEmail;
   const subject = req.body.subject;
   const textmsg = req.body.textmsg;

   
   const oAuth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
   );
   oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
   
   async function sendMail() {
      try {
      const accessToken = await oAuth2Client.getAccessToken();
   
      const transport = nodemailer.createTransport({
         service: 'gmail',
         auth: {
            type: 'OAuth2',
            user: user.email,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: accessToken,
         },
      });
   
      const mailOptions = {
         from:  user.name + '<'+user.email + '>',
         to: toEmail,
         subject: subject,
         text: textmsg,
         html: '<h1>'+textmsg+'</h1>',
      };
   
      const result = await transport.sendMail(mailOptions);
      return result;
      } catch (error) {
      return error;
      }
   }
   
   sendMail()
      .then((result) => console.log('Email sent...', result))
      .catch((error) => console.log(error.message));

   console.log(subject,textmsg);
   console.log(toEmail);
   console.log(user.email);
   res.render("submit");
})



app.listen(PORT, () => {
   console.log(`server running on ${PORT}`);
})