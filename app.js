const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const db = require('./util/database');
const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');
const adminRoute = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorRoute = require('./controllers/error')

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });
db
    .sync()
    // .sync({force:true})
    .then(result => {
        return User.findByPk(1);
        // console.log(result);
    })
    .then(user => {
        if (!user) {
            return User.create({name: 'Max', email: 'test@test.com'});
        }
        return user;
    }).then(user => {
    return user.createCart();

}).then(res => {
    app.listen(3000);
}).catch(err => {
    console.log(err)
});
app.use((req, res, next) => {
    User.findByPk(1).then(user => {
        req.user = user;
        next();
    }).catch(err => {
        console.log(err);
    });
})
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoute);
app.use(shopRoutes);

app.use(errorRoute.showErrors);


