const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();

//google auth 
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = '364345538969-9qabmktiq70ut8s39ni56firsca0fahe.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.set('view engine', 'ejs');

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


function checkAuthenticated(req, res, next){

   let token = req.cookies['session-token'];

   let user = {};
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


app.listen(PORT, () => {
   console.log(`server running on ${PORT}`);
})