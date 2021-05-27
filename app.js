const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoConnect = require('./util/database').mongoConnect;
app.set('view engine', 'ejs');
app.set('views', 'views');
const adminRoute = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorRoute = require('./controllers/error')


app.use((req, res, next) => {
    // User.findByPk(1).then(user => {
    //     req.user = user;
    //     next();
    // }).catch(err => {
    //     console.log(err);
    // });
    next();
})
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoute);
app.use(shopRoutes);

app.use(errorRoute.showErrors);
mongoConnect(()=>{
    app.listen(3000);
})


