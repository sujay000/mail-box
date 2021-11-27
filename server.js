const express = require("express");
const app = express();


const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.get("/", (req,res)=>{
   res.send("hellp new characters added");
})



app.listen(PORT, () => {
   console.log(`server running on ${PORT}`);
})